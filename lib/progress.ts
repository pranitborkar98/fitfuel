// lib/progress.ts
// Phase 11 — Progress Tracking data layer.
// Aggregates everything the /dashboard/progress page needs, server-side, in one call.
// No new schema. All field names verified against schema.prisma.
//
// Charts fed by this:
//   1. Weight + body-composition trend  (BodyMetric)
//   2. Daily calories in / out / target (MealLog + FoodEntry + WorkoutSession)
//   3. Macro adherence (avg vs target)
//   4. Adherence + streak stats
//   5. Current-week consistency breakdown (reuses lib/consistency-score)

import { prisma } from "@/lib/prisma";
import { getWeeklyConsistency } from "@/lib/consistency-score";

// ── window config ──────────────────────────────────────────────
const CAL_WINDOW_DAYS = 30; // calorie / macro / adherence window
const WEIGHT_WINDOW_DAYS = 120; // weigh-ins are weekly — look back further

// ── shapes ─────────────────────────────────────────────────────
export interface WeightPoint {
  date: string; // YYYY-MM-DD
  weightKg: number | null;
  bodyFatPct: number | null;
  muscleMassKg: number | null;
}
export interface CaloriePoint {
  date: string;
  in: number;
  out: number;
  net: number;
}
export interface MacroPoint {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
}
export interface ConsistencyComponent {
  label: string;
  points: number;
  max: number;
}
export interface ProgressData {
  hasPlan: boolean;
  planName: string | null;
  accentColor: string | null;

  weight: {
    series: WeightPoint[];
    startWeight: number | null;
    currentWeight: number | null;
    targetWeight: number | null;
    deltaKg: number | null; // current - start  (negative = lost)
    latestBodyFat: number | null;
    latestMuscle: number | null;
  };

  calories: {
    days: CaloriePoint[];
    target: number;
    avgIn: number;
    avgOut: number;
    avgNet: number;
    daysWithData: number;
  };

  macros: {
    days: MacroPoint[];
    target: { protein: number; carbs: number; fat: number };
    avg: { protein: number; carbs: number; fat: number };
  };

  adherence: {
    mealsLogged: number;
    mealsScheduled: number;
    workoutsCompleted: number;
    streakDays: number; // consecutive days ending today with >=1 confirmed meal
    daysActive: number; // days the plan has been active within the window
  };

  consistency: {
    score: number;
    label: string;
    components: ConsistencyComponent[];
  } | null;
}

// ── helpers ────────────────────────────────────────────────────
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
function startOfUTCDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}
function round(n: number): number {
  return Math.round(n);
}
function num(v: unknown): number {
  // Prisma Decimal | number | null -> number
  if (v === null || v === undefined) return 0;
  return typeof v === "number" ? v : Number(v as never);
}

export async function getProgressData(userId: string): Promise<ProgressData> {
  const today = startOfUTCDay(new Date());
  const calWindowStart = addDays(today, -(CAL_WINDOW_DAYS - 1));
  const weightWindowStart = addDays(today, -(WEIGHT_WINDOW_DAYS - 1));

  // ── parallel fetch ──
  const [activePlan, profile, bodyMetrics, mealLogs, foodEntries, workouts] =
    await Promise.all([
      prisma.userActivePlan.findFirst({
        where: { userId, status: "active" },
        select: {
          startDate: true,
          skipDates: true,
          calorieTarget: true,
          proteinTarget: true,
          carbTarget: true,
          fatTarget: true,
          mealPlan: {
            select: {
              name: true,
              accentColor: true,
              mealsPerDay: true,
              avgCaloriesPerDay: true,
              avgProteinGrams: true,
              avgCarbsGrams: true,
              avgFatGrams: true,
            },
          },
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: { targetWeightKg: true, weightKg: true, calorieTarget: true, tdee: true },
      }),
      prisma.bodyMetric.findMany({
        where: { userId, measuredAt: { gte: weightWindowStart } },
        orderBy: { measuredAt: "asc" },
        select: { measuredAt: true, weightKg: true, bodyFatPct: true, muscleMassKg: true },
      }),
      prisma.mealLog.findMany({
        where: {
          userId,
          logDate: { gte: calWindowStart },
          skipped: false,
          confirmedAt: { not: null },
        },
        select: {
          logDate: true,
          actualGrams: true,
          plannedGrams: true,
          recipe: {
            select: {
              caloriesPerServing: true,
              proteinGrams: true,
              carbsGrams: true,
              fatGrams: true,
              servingSizeGrams: true,
            },
          },
        },
      }),
      prisma.foodEntry.findMany({
        where: { userId, entryDate: { gte: calWindowStart }, mealLogId: null },
        select: { entryDate: true, calories: true, protein: true, carbs: true, fat: true },
      }),
      prisma.workoutSession.findMany({
        where: { userId, date: { gte: calWindowStart }, completedAt: { not: null } },
        select: { date: true, caloriesBurned: true },
      }),
    ]);

  const mp = activePlan?.mealPlan ?? null;

  // ── targets ──
  const calTarget =
    activePlan?.calorieTarget ??
    mp?.avgCaloriesPerDay ??
    profile?.calorieTarget ??
    profile?.tdee ??
    2000;
  const proteinTarget = activePlan?.proteinTarget ?? mp?.avgProteinGrams ?? 0;
  const carbTarget = activePlan?.carbTarget ?? mp?.avgCarbsGrams ?? 0;
  const fatTarget = activePlan?.fatTarget ?? mp?.avgFatGrams ?? 0;

  // ── build day buckets for cal/macro window ──
  const calIn = new Map<string, number>();
  const calOut = new Map<string, number>();
  const pPro = new Map<string, number>();
  const pCarb = new Map<string, number>();
  const pFat = new Map<string, number>();

  // meal logs -> calories + macros (scaled by grams eaten / serving size)
  for (const log of mealLogs) {
    const r = log.recipe;
    if (!r) continue;
    const serving = r.servingSizeGrams > 0 ? r.servingSizeGrams : 1;
    const grams = log.actualGrams ?? log.plannedGrams ?? serving;
    const factor = grams / serving;
    const k = dayKey(log.logDate);
    calIn.set(k, (calIn.get(k) ?? 0) + r.caloriesPerServing * factor);
    pPro.set(k, (pPro.get(k) ?? 0) + num(r.proteinGrams) * factor);
    pCarb.set(k, (pCarb.get(k) ?? 0) + num(r.carbsGrams) * factor);
    pFat.set(k, (pFat.get(k) ?? 0) + num(r.fatGrams) * factor);
  }
  // manual food entries -> calories + macros (already absolute)
  for (const e of foodEntries) {
    const k = dayKey(e.entryDate);
    calIn.set(k, (calIn.get(k) ?? 0) + e.calories);
    pPro.set(k, (pPro.get(k) ?? 0) + e.protein);
    pCarb.set(k, (pCarb.get(k) ?? 0) + e.carbs);
    pFat.set(k, (pFat.get(k) ?? 0) + e.fat);
  }
  // workouts -> calories out
  for (const w of workouts) {
    const k = dayKey(w.date);
    calOut.set(k, (calOut.get(k) ?? 0) + (w.caloriesBurned ?? 0));
  }

  // ── assemble ordered day arrays ──
  const calDays: CaloriePoint[] = [];
  const macroDays: MacroPoint[] = [];
  let sumIn = 0,
    sumOut = 0,
    daysWithData = 0;
  let sumPro = 0,
    sumCarb = 0,
    sumFat = 0;
  for (let i = 0; i < CAL_WINDOW_DAYS; i++) {
    const d = addDays(calWindowStart, i);
    const k = dayKey(d);
    const cin = round(calIn.get(k) ?? 0);
    const cout = round(calOut.get(k) ?? 0);
    calDays.push({ date: k, in: cin, out: cout, net: cin - cout });
    macroDays.push({
      date: k,
      protein: round(pPro.get(k) ?? 0),
      carbs: round(pCarb.get(k) ?? 0),
      fat: round(pFat.get(k) ?? 0),
    });
    if (cin > 0 || cout > 0) {
      daysWithData++;
      sumIn += cin;
      sumOut += cout;
      sumPro += pPro.get(k) ?? 0;
      sumCarb += pCarb.get(k) ?? 0;
      sumFat += pFat.get(k) ?? 0;
    }
  }
  const denom = daysWithData || 1;

  // ── weight series ──
  const weightSeries: WeightPoint[] = bodyMetrics.map((m) => ({
    date: dayKey(m.measuredAt),
    weightKg: m.weightKg ?? null,
    bodyFatPct: m.bodyFatPct ?? null,
    muscleMassKg: m.muscleMassKg ?? null,
  }));
  const weighed = weightSeries.filter((p) => p.weightKg !== null);
  const startWeight = weighed.length ? weighed[0].weightKg : profile?.weightKg ?? null;
  const currentWeight = weighed.length ? weighed[weighed.length - 1].weightKg : null;
  const latestFat = [...weightSeries].reverse().find((p) => p.bodyFatPct !== null)?.bodyFatPct ?? null;
  const latestMuscle =
    [...weightSeries].reverse().find((p) => p.muscleMassKg !== null)?.muscleMassKg ?? null;

  // ── adherence ──
  const planStart = activePlan ? startOfUTCDay(activePlan.startDate) : null;
  const effStart = planStart && planStart > calWindowStart ? planStart : calWindowStart;
  const rawActiveDays =
    Math.floor((today.getTime() - effStart.getTime()) / 86400000) + 1;
  const skipSet = new Set((activePlan?.skipDates ?? []).map((d) => dayKey(startOfUTCDay(d))));
  let daysActive = 0;
  for (let i = 0; i < rawActiveDays; i++) {
    if (!skipSet.has(dayKey(addDays(effStart, i)))) daysActive++;
  }
  daysActive = Math.max(0, daysActive);
  const mealsPerDay = mp?.mealsPerDay ?? 4;
  const mealsScheduled = activePlan ? daysActive * mealsPerDay : 0;

  const mealsLogged = mealLogs.length; // already filtered to confirmed + not skipped
  const workoutsCompleted = workouts.length;

  // streak — consecutive days ending today with >=1 confirmed meal
  const loggedDayKeys = new Set(mealLogs.map((l) => dayKey(l.logDate)));
  let streakDays = 0;
  for (let i = 0; i < CAL_WINDOW_DAYS; i++) {
    const k = dayKey(addDays(today, -i));
    if (loggedDayKeys.has(k)) streakDays++;
    else break;
  }

  // ── consistency (current week) — reuse existing engine ──
  let consistency: ProgressData["consistency"] = null;
  try {
    const c = await getWeeklyConsistency(userId, new Date());
    consistency = {
      score: c.score,
      label: c.label,
      components: [
        { label: "Meals", points: c.meals?.points ?? 0, max: c.meals?.max ?? 40 },
        { label: "Workouts", points: c.workouts?.points ?? 0, max: c.workouts?.max ?? 30 },
        { label: "Water", points: c.water?.points ?? 0, max: c.water?.max ?? 10 },
        { label: "Weigh-in", points: c.weighIn?.points ?? 0, max: c.weighIn?.max ?? 10 },
        { label: "No skips", points: c.noSkips?.points ?? 0, max: c.noSkips?.max ?? 10 },
      ],
    };
  } catch {
    consistency = null; // non-blocking — page still renders charts
  }

  return {
    hasPlan: !!activePlan,
    planName: mp?.name ?? null,
    accentColor: mp?.accentColor ?? null,
    weight: {
      series: weightSeries,
      startWeight,
      currentWeight,
      targetWeight: profile?.targetWeightKg ?? null,
      deltaKg:
        startWeight !== null && currentWeight !== null
          ? Math.round((currentWeight - startWeight) * 10) / 10
          : null,
      latestBodyFat: latestFat,
      latestMuscle,
    },
    calories: {
      days: calDays,
      target: calTarget,
      avgIn: round(sumIn / denom),
      avgOut: round(sumOut / denom),
      avgNet: round((sumIn - sumOut) / denom),
      daysWithData,
    },
    macros: {
      days: macroDays,
      target: { protein: proteinTarget, carbs: carbTarget, fat: fatTarget },
      avg: {
        protein: round(sumPro / denom),
        carbs: round(sumCarb / denom),
        fat: round(sumFat / denom),
      },
    },
    adherence: {
      mealsLogged,
      mealsScheduled,
      workoutsCompleted,
      streakDays,
      daysActive,
    },
    consistency,
  };
}
