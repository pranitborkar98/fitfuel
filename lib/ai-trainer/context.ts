// lib/ai-trainer/context.ts
// Phase 12A — Context Engine. buildTrainerContext(userId) assembles everything the
// trainer knows about one user into a single structured snapshot.
//
// The quality of the trainer is the quality of this object, so the interpretation
// lives here in TypeScript — plateau, momentum, biggest gap — not in a prompt asking
// the model to do arithmetic on raw rows.
//
// The 30-day aggregates come from getProgressData, the same call /dashboard/progress
// renders, so the coach can never quote a number the user's charts disagree with.

import { prisma } from "@/lib/prisma";
import { getProgressData, type ProgressData } from "@/lib/progress";
import { getRecommendedSupplements } from "@/lib/supplement-recommender";
import type {
  ConsistencyComponentKey,
  Momentum,
  RatedMeal,
  TrainerContext,
  TrainerGoal,
} from "./types";

const NUTRITION_WINDOW_DAYS = 7;
const RATED_MEAL_WINDOW_DAYS = 30;
const RATED_MEALS_PER_BUCKET = 3;

// A plateau needs a flat stretch long enough to mean something: at least two
// weigh-ins spanning a fortnight, moving less than half a kilo between them.
const PLATEAU_MIN_SPAN_DAYS = 14;
const PLATEAU_MAX_DELTA_KG = 0.5;

// Week-over-week consistency swing that counts as a real direction change.
const MOMENTUM_THRESHOLD = 5;

const VALID_GOALS: TrainerGoal[] = [
  "LOSE_WEIGHT",
  "GAIN_MUSCLE",
  "MAINTAIN",
  "IMPROVE_FITNESS",
  "MANAGE_CONDITION",
];

// getProgressData returns consistency components as a labelled array; this maps
// them back to stable keys the prompt layer can branch on.
const COMPONENT_BY_LABEL: Record<string, ConsistencyComponentKey> = {
  Meals: "meals",
  Workouts: "workouts",
  Water: "water",
  "Weigh-in": "weighIn",
  "No skips": "noSkips",
};

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

function round(n: number, dp = 0): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

function ageFrom(dateOfBirth: Date | null | undefined, stored: number | null | undefined): number | null {
  if (typeof stored === "number") return stored;
  if (!dateOfBirth) return null;
  const ms = Date.now() - dateOfBirth.getTime();
  return Math.floor(ms / (365.25 * 86_400_000));
}

type WeighIn = { t: number; w: number };

// Weigh-ins inside a window, oldest first. progress.ts hands back a 120-day series,
// so anything asking "what changed this month" has to narrow it here first.
function weighInsWithin(series: ProgressData["weight"]["series"], days: number): WeighIn[] {
  const cutoff = Date.now() - days * 86_400_000;
  return series
    .filter((p) => p.weightKg !== null)
    .map((p) => ({ t: Date.parse(p.date), w: p.weightKg as number }))
    .filter((p) => !Number.isNaN(p.t) && p.t >= cutoff)
    .sort((a, b) => a.t - b.t);
}

// Weight has held for at least a fortnight while the goal expects it to move.
function detectPlateau(series: ProgressData["weight"]["series"], goal: TrainerGoal | null): boolean {
  if (goal !== "LOSE_WEIGHT" && goal !== "GAIN_MUSCLE") return false;

  const pts = weighInsWithin(series, 30);
  if (pts.length < 2) return false;

  const first = pts[0];
  const last = pts[pts.length - 1];
  const spanDays = (last.t - first.t) / 86_400_000;
  if (spanDays < PLATEAU_MIN_SPAN_DAYS) return false;

  return Math.abs(last.w - first.w) < PLATEAU_MAX_DELTA_KG;
}

function readMomentum(trend: number[]): Momentum {
  if (trend.length < 2) return "flat";
  const latest = trend[trend.length - 1];
  const prior = trend.slice(0, -1);
  const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length;
  if (latest - priorAvg >= MOMENTUM_THRESHOLD) return "improving";
  if (priorAvg - latest >= MOMENTUM_THRESHOLD) return "declining";
  return "flat";
}

// The component furthest from its own ceiling — what to fix first.
function findBiggestGap(
  components: Record<ConsistencyComponentKey, number>,
  maxes: Record<ConsistencyComponentKey, number>
): ConsistencyComponentKey | null {
  let worst: ConsistencyComponentKey | null = null;
  let worstRatio = Infinity;
  for (const key of Object.keys(components) as ConsistencyComponentKey[]) {
    const max = maxes[key] || 1;
    const ratio = components[key] / max;
    if (ratio < worstRatio) {
      worstRatio = ratio;
      worst = key;
    }
  }
  return worstRatio >= 1 ? null : worst;
}

export async function buildTrainerContext(userId: string): Promise<TrainerContext> {
  const today = startOfUTCDay(new Date());
  const weekStart = addDays(today, -(NUTRITION_WINDOW_DAYS - 1));
  const ratedWindowStart = addDays(today, -(RATED_MEAL_WINDOW_DAYS - 1));

  const progress = await getProgressData(userId);

  const [user, profile, activePlan, ratedLogs, workouts, snapshots, supplements] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
      prisma.userProfile.findUnique({
        where: { userId },
        select: {
          age: true,
          dateOfBirth: true,
          gender: true,
          heightCm: true,
          targetWeightKg: true,
          fitnessGoal: true,
          activityLevel: true,
          dietPreference: true,
          healthConditions: true,
          allergies: true,
          dietaryRestrictions: true,
          tdee: true,
          calorieTarget: true,
        },
      }),
      prisma.userActivePlan.findFirst({
        where: { userId, status: "active" },
        select: {
          currentDay: true,
          startDate: true,
          deliveryWindow: true,
          calorieTarget: true,
          mealPlan: {
            select: {
              slug: true,
              displayName: true,
              name: true,
              tier: true,
              cycleLengthDays: true,
              subCategory: true,
              avgCaloriesPerDay: true,
            },
          },
        },
      }),
      prisma.mealLog.findMany({
        where: {
          userId,
          logDate: { gte: ratedWindowStart },
          rating: { not: null },
          skipped: false,
        },
        select: {
          rating: true,
          ratingNote: true,
          mealSlot: true,
          recipe: { select: { name: true } },
        },
        orderBy: { logDate: "desc" },
      }),
      prisma.workoutSession.findMany({
        where: { userId, date: { gte: weekStart }, completedAt: { not: null } },
        select: { date: true, caloriesBurned: true },
        orderBy: { date: "desc" },
      }),
      prisma.consistencySnapshot.findMany({
        where: { userId },
        orderBy: { weekStart: "desc" },
        take: 4,
        select: { score: true },
      }),
      getRecommendedSupplements(userId).catch(() => null),
    ]);

  const mp = activePlan?.mealPlan ?? null;

  // ── nutrition, last 7 days (sliced from the 30-day series — no second query) ──
  const last7Cal = progress.calories.days.slice(-NUTRITION_WINDOW_DAYS);
  const last7Macro = progress.macros.days.slice(-NUTRITION_WINDOW_DAYS);
  const tracked = last7Cal.filter((d) => d.in > 0 || d.out > 0);
  const daysTracked = tracked.length;
  const denom = daysTracked || 1;

  const avgKcalIn = round(tracked.reduce((a, d) => a + d.in, 0) / denom);
  const avgKcalOut = round(tracked.reduce((a, d) => a + d.out, 0) / denom);
  const trackedKeys = new Set(tracked.map((d) => d.date));
  const avgProtein = round(
    last7Macro.filter((d) => trackedKeys.has(d.date)).reduce((a, d) => a + d.protein, 0) / denom
  );

  const targetKcal = progress.calories.target;
  const adherencePct =
    daysTracked > 0 && targetKcal > 0
      ? round(Math.min(100, (avgKcalIn / targetKcal) * 100))
      : null;

  const toRatedMeal = (l: (typeof ratedLogs)[number]): RatedMeal => ({
    name: l.recipe?.name ?? "Unknown meal",
    slot: l.mealSlot,
    rating: l.rating as number,
    note: l.ratingNote ?? null,
  });
  const topRatedMeals = ratedLogs
    .filter((l) => (l.rating ?? 0) >= 4)
    .slice(0, RATED_MEALS_PER_BUCKET)
    .map(toRatedMeal);
  const lowRatedMeals = ratedLogs
    .filter((l) => (l.rating ?? 5) <= 2)
    .slice(0, RATED_MEALS_PER_BUCKET)
    .map(toRatedMeal);

  // ── workouts, last 7 days ──
  let scheduled = 0;
  let programType: string | null = null;
  if (mp) {
    const sched = await prisma.exerciseSchedule.findFirst({
      where: { mealPlanCategory: mp.subCategory, tier: mp.tier },
      select: { name: true, daysPerWeek: true },
    });
    if (sched) {
      scheduled = sched.daysPerWeek;
      programType = sched.name;
    }
  }

  // ── consistency ──
  const components: Record<ConsistencyComponentKey, number> = {
    meals: 0,
    workouts: 0,
    water: 0,
    weighIn: 0,
    noSkips: 0,
  };
  const maxes: Record<ConsistencyComponentKey, number> = {
    meals: 40,
    workouts: 30,
    water: 10,
    weighIn: 10,
    noSkips: 10,
  };
  for (const c of progress.consistency?.components ?? []) {
    const key = COMPONENT_BY_LABEL[c.label];
    if (key) {
      components[key] = c.points;
      maxes[key] = c.max || maxes[key];
    }
  }
  const trend4w = snapshots.map((s) => s.score).reverse();

  const goal: TrainerGoal | null =
    profile?.fitnessGoal && VALID_GOALS.includes(profile.fitnessGoal as TrainerGoal)
      ? (profile.fitnessGoal as TrainerGoal)
      : null;

  const latestWeightKg = progress.weight.currentWeight;
  const heightCm = profile?.heightCm ?? null;
  const bmi =
    latestWeightKg !== null && heightCm
      ? round(latestWeightKg / (heightCm / 100) ** 2, 1)
      : null;

  // Age of the latest weigh-in, and the change across the last 30 days only —
  // progress.weight.deltaKg spans 120 days and would read as a monthly figure.
  const allWeighIns = weighInsWithin(progress.weight.series, 3650);
  const latestWeightAgeDays = allWeighIns.length
    ? Math.floor((Date.now() - allWeighIns[allWeighIns.length - 1].t) / 86_400_000)
    : null;
  const last30 = weighInsWithin(progress.weight.series, 30);
  const trend30dKg =
    last30.length >= 2 ? round(last30[last30.length - 1].w - last30[0].w, 1) : null;

  // Which rung of progress.ts's fallback chain produced the calorie target.
  const planKcal = activePlan?.calorieTarget ?? mp?.avgCaloriesPerDay ?? null;
  const profileKcal = profile?.calorieTarget ?? profile?.tdee ?? null;
  const calorieTargetSource: "plan" | "profile" | "default" =
    planKcal !== null ? "plan" : profileKcal !== null ? "profile" : "default";

  // A 0g macro target means "never set", not "eat no protein".
  const orNull = (n: number) => (n > 0 ? n : null);
  const proteinTarget = orNull(progress.macros.target.protein);

  return {
    generatedAt: new Date().toISOString(),

    profile: {
      name: user?.name ?? null,
      age: ageFrom(profile?.dateOfBirth, profile?.age),
      sex: profile?.gender ?? null,
      heightCm,
      currentWeightKg: latestWeightKg,
      targetWeightKg: progress.weight.targetWeight,
      goal,
      activityLevel: profile?.activityLevel ?? null,
      diet: profile?.dietPreference ?? null,
      healthConditions: profile?.healthConditions ?? [],
      allergies: profile?.allergies ?? [],
      dietaryRestrictions: profile?.dietaryRestrictions ?? [],
      tdee: profile?.tdee ?? null,
      calorieTarget: targetKcal,
      calorieTargetSource,
      proteinTarget,
      carbTarget: orNull(progress.macros.target.carbs),
      fatTarget: orNull(progress.macros.target.fat),
    },

    plan: mp
      ? {
          slug: mp.slug,
          name: mp.displayName || mp.name,
          tier: mp.tier,
          currentDay: activePlan?.currentDay ?? 1,
          cycleLengthDays: mp.cycleLengthDays,
          startDate: startOfUTCDay(activePlan!.startDate).toISOString().slice(0, 10),
          deliveryWindow: activePlan?.deliveryWindow ?? "MORNING",
        }
      : null,

    nutrition7d: {
      daysTracked,
      avgKcalIn,
      avgKcalOut,
      avgNet: avgKcalIn - avgKcalOut,
      targetKcal,
      adherencePct,
      avgProtein,
      proteinTarget,
      topRatedMeals,
      lowRatedMeals,
    },

    workouts7d: {
      scheduled,
      completed: workouts.length,
      totalKcalBurned: workouts.reduce((a, w) => a + (w.caloriesBurned ?? 0), 0),
      lastSessionDate: workouts[0] ? workouts[0].date.toISOString().slice(0, 10) : null,
      programType,
    },

    body: {
      latestWeightKg,
      latestWeightAgeDays,
      weighInsLast30d: last30.length,
      trend30dKg,
      bodyFatPct: progress.weight.latestBodyFat,
      muscleMassKg: progress.weight.latestMuscle,
      bmi,
    },

    consistency: {
      thisWeekScore: progress.consistency?.score ?? null,
      label: progress.consistency?.label ?? null,
      components,
      trend4w,
    },

    supplements: {
      goalLabel: supplements?.goalLabel ?? null,
      recommendedStack: supplements?.items.map((i) => i.name) ?? [],
    },

    derived: {
      plateauDetected: detectPlateau(progress.weight.series, goal),
      streakDays: progress.adherence.streakDays,
      biggestGap: findBiggestGap(components, maxes),
      momentum: readMomentum(trend4w),
    },
  };
}
