// lib/personalization.ts — builds the personalised stats block for the digital plan PDF.
// Sources, in priority order: checkout overrides → saved UserProfile/BodyMetric → plan defaults.
// Field names verified against schema.prisma (Decision #61).
import { prisma } from "@/lib/prisma";
import type { DigitalPlanData } from "./digital-plan-types";

const KCAL_PER_KG = 7700; // ~kcal to shift 1 kg of body mass

export interface PersonalOverrides {
  heightCm?: number; weightKg?: number; goalWeightKg?: number; age?: number;
}

export interface ProjectionPoint { week: number; kg: number; }
export interface PersonalStats {
  source: "checkout" | "saved" | "default";
  hasBodyData: boolean;            // do we have real height + weight?
  firstName?: string;
  heightCm?: number;
  currentWeightKg?: number;
  goalWeightKg?: number;
  age?: number;
  bmi?: number;
  bmiCategory?: string;
  bodyFatPct?: number;
  calorieTarget: number;           // always present (falls back to plan)
  maintenanceCalories?: number;    // TDEE
  dailyDeficit?: number;           // maintenance − target (can be negative for gain)
  macros: { proteinG: number; carbsG: number; fatG: number }; // avg/day from the plan
  projection?: { weeklyKg: number; weeks: number; assumed: boolean; points: ProjectionPoint[] };
}

function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

// average daily macros across the plan (real targets, not guesses)
function avgMacros(data: DigitalPlanData) {
  const n = data.days.length || 1;
  const sum = data.days.reduce(
    (t, d) => ({ p: t.p + d.totals.proteinG, c: t.c + d.totals.carbsG, f: t.f + d.totals.fatG }),
    { p: 0, c: 0, f: 0 },
  );
  return { proteinG: Math.round(sum.p / n), carbsG: Math.round(sum.c / n), fatG: Math.round(sum.f / n) };
}

export async function getPersonalization(
  data: DigitalPlanData,
  opts: { userId?: string; overrides?: PersonalOverrides | null } = {},
): Promise<PersonalStats> {
  const macros = avgMacros(data);
  const planCalories = data.targetCalories ?? (macros.proteinG * 4 + macros.carbsG * 4 + macros.fatG * 9);

  let firstName: string | undefined;
  let profile: any = null;
  let metric: any = null;
  if (opts.userId) {
    const user = await (prisma as any).user.findUnique({
      where: { id: opts.userId },
      select: { name: true },
    }).catch(() => null);
    firstName = user?.name ? String(user.name).split(/\s+/)[0] : undefined;
    profile = await (prisma as any).userProfile.findUnique({ where: { userId: opts.userId } }).catch(() => null);
    metric = await (prisma as any).bodyMetric.findFirst({
      where: { userId: opts.userId }, orderBy: { measuredAt: "desc" },
    }).catch(() => null);
  }

  const o = opts.overrides ?? {};
  const heightCm = o.heightCm ?? profile?.heightCm ?? undefined;
  const currentWeightKg = o.weightKg ?? metric?.weightKg ?? profile?.weightKg ?? undefined;
  const goalWeightKg = o.goalWeightKg ?? profile?.targetWeightKg ?? undefined;
  const age = o.age ?? profile?.age ?? undefined;

  let bmi = metric?.bmi ?? undefined;
  if (!bmi && heightCm && currentWeightKg) bmi = currentWeightKg / Math.pow(heightCm / 100, 2);
  bmi = bmi ? Math.round(bmi * 10) / 10 : undefined;

  const calorieTarget = profile?.calorieTarget ?? planCalories;
  const maintenanceCalories = profile?.tdee ?? undefined;
  const dailyDeficit = maintenanceCalories ? maintenanceCalories - calorieTarget : undefined;

  const hasBodyData = Boolean(heightCm && currentWeightKg);
  const source: PersonalStats["source"] = opts.overrides ? "checkout" : profile || metric ? "saved" : "default";

  // weight projection — only when we have current + goal and they differ in the loss direction
  let projection: PersonalStats["projection"] | undefined;
  if (currentWeightKg && goalWeightKg && Math.abs(currentWeightKg - goalWeightKg) >= 1) {
    const losing = goalWeightKg < currentWeightKg;
    let weeklyKg: number;
    let assumed = false;
    if (dailyDeficit && Math.abs(dailyDeficit) > 50) {
      weeklyKg = (Math.abs(dailyDeficit) * 7) / KCAL_PER_KG;
    } else {
      weeklyKg = 0.5; assumed = true; // safe typical rate
    }
    weeklyKg = Math.min(Math.max(weeklyKg, 0.25), 1); // clamp 0.25–1 kg/wk
    const totalDelta = Math.abs(currentWeightKg - goalWeightKg);
    const weeks = Math.min(Math.ceil(totalDelta / weeklyKg), 26); // cap chart at 26 weeks
    const points: ProjectionPoint[] = [];
    for (let w = 0; w <= weeks; w++) {
      const delta = Math.min(weeklyKg * w, totalDelta);
      const kg = losing ? currentWeightKg - delta : currentWeightKg + delta;
      points.push({ week: w, kg: Math.round(kg * 10) / 10 });
    }
    projection = { weeklyKg: Math.round(weeklyKg * 100) / 100, weeks, assumed, points };
  }

  return {
    source, hasBodyData, firstName,
    heightCm: heightCm ? Math.round(heightCm) : undefined,
    currentWeightKg: currentWeightKg ? Math.round(currentWeightKg * 10) / 10 : undefined,
    goalWeightKg: goalWeightKg ? Math.round(goalWeightKg * 10) / 10 : undefined,
    age,
    bmi, bmiCategory: bmi ? bmiCategory(bmi) : undefined,
    bodyFatPct: metric?.bodyFatPct ? Math.round(metric.bodyFatPct * 10) / 10 : undefined,
    calorieTarget, maintenanceCalories, dailyDeficit, macros, projection,
  };
}
