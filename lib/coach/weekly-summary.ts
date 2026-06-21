// lib/coach/weekly-summary.ts
// AI Coach — Summarise layer. Rolls the user's loop data into one compact
// WeeklySummary. Reuses getProgressData (weight/calorie/macro/adherence/consistency)
// and adds the goal + a measured weight-trend rate (kg/week from weigh-ins).

import { prisma } from "@/lib/prisma";
import { getProgressData, type WeightPoint } from "@/lib/progress";
import type { Goal, WeeklySummary } from "./types";

const RATE_WINDOW_DAYS = 28; // prefer the recent trend; widen if too few points
const RATE_WIDE_DAYS = 56;
const MIN_SPAN_DAYS = 10; // need at least this span between first/last weigh-in

// Least-squares slope (kg/day) of weight vs day-offset → kg/week. null if unreliable.
function weeklyRate(series: WeightPoint[]): { rate: number | null; count: number } {
  const pts = series
    .filter((p) => p.weightKg !== null)
    .map((p) => ({ t: Date.parse(p.date), w: p.weightKg as number }))
    .filter((p) => !Number.isNaN(p.t))
    .sort((a, b) => a.t - b.t);

  const withinWindow = (days: number) => {
    const cutoff = Date.now() - days * 86400000;
    return pts.filter((p) => p.t >= cutoff);
  };

  let used = withinWindow(RATE_WINDOW_DAYS);
  if (used.length < 2) used = withinWindow(RATE_WIDE_DAYS);
  if (used.length < 2) used = pts; // fall back to everything we have
  if (used.length < 2) return { rate: null, count: pts.length };

  const spanDays = (used[used.length - 1].t - used[0].t) / 86400000;
  if (spanDays < MIN_SPAN_DAYS) return { rate: null, count: used.length };

  // regress w on dayOffset
  const x0 = used[0].t;
  const xs = used.map((p) => (p.t - x0) / 86400000);
  const ys = used.map((p) => p.w);
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  if (den === 0) return { rate: null, count: n };
  const perDay = num / den;
  return { rate: Math.round(perDay * 7 * 100) / 100, count: n };
}

const VALID_GOALS: Goal[] = ["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN", "IMPROVE_FITNESS", "MANAGE_CONDITION"];

export async function buildWeeklySummary(userId: string): Promise<WeeklySummary> {
  const data = await getProgressData(userId);

  const profile = await (prisma as any).userProfile.findUnique({
    where: { userId },
    select: { fitnessGoal: true },
  });
  const rawGoal = profile?.fitnessGoal as string | null | undefined;
  const goal: Goal | null = rawGoal && VALID_GOALS.includes(rawGoal as Goal) ? (rawGoal as Goal) : null;

  const { rate, count } = weeklyRate(data.weight.series);

  return {
    hasPlan: data.hasPlan,
    goal,

    currentWeightKg: data.weight.currentWeight,
    targetWeightKg: data.weight.targetWeight,
    weightRateKgPerWeek: rate,
    weighInsInWindow: count,

    calorieTarget: data.calories.target,
    avgCaloriesIn: data.calories.avgIn,
    avgCaloriesOut: data.calories.avgOut,
    avgNet: data.calories.avgNet,
    calorieDaysWithData: data.calories.daysWithData,

    proteinTarget: data.macros.target.protein,
    avgProtein: data.macros.avg.protein,

    mealsLogged: data.adherence.mealsLogged,
    mealsScheduled: data.adherence.mealsScheduled,
    workoutsCompleted: data.adherence.workoutsCompleted,
    streakDays: data.adherence.streakDays,
    daysActive: data.adherence.daysActive,

    consistencyScore: data.consistency?.score ?? null,
    consistencyLabel: data.consistency?.label ?? null,
  };
}
