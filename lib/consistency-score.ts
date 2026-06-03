// lib/consistency-score.ts
// 9R — Consistency Score Engine
// One weekly 0-100 score computed from existing tables. Resets Sunday.
// No new schema. Result cached to UserProfile.weeklyConsistencyScore.
//
// Formula (from master tracker):
//   meals logged / meals delivered        × 40
//   workouts completed / workouts scheduled × 30
//   water logged                          × 2  (max 10)
//   weekly weigh-in done                  × 10
//   zero skipped meals                    × 10
//                                   TOTAL = 100

import { prisma } from "@/lib/prisma";

export interface ConsistencyBreakdown {
  score: number; // 0-100
  label: string; // Excellent / Good / Fair / Needs work
  meals: { logged: number; delivered: number; points: number; max: number };
  workouts: { completed: number; scheduled: number; points: number; max: number };
  water: { days: number; points: number; max: number };
  weighIn: { done: boolean; points: number; max: number };
  noSkips: { skipped: number; points: number; max: number };
  weekStart: string; // ISO date (YYYY-MM-DD) of the Sunday the week began
}

function labelFor(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs work";
}

// MealsPerDay enum → number of meals/day
function mealsPerDayCount(
  enumVal: string | null | undefined,
  fallback: number
): number {
  if (enumVal === "ALL_FOUR") return 4;
  if (enumVal === "BREAKFAST_LUNCH" || enumVal === "SNACK_DINNER") return 2;
  return fallback;
}

export async function getWeeklyConsistency(
  userId: string,
  now: Date = new Date()
): Promise<ConsistencyBreakdown> {
  // Week boundary — most recent Sunday 00:00 UTC (getUTCDay: 0 = Sunday)
  const weekStart = new Date(now);
  weekStart.setUTCHours(0, 0, 0, 0);
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());

  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);

  // Active plan drives the denominators (meals delivered, workouts scheduled)
  const activePlan = await prisma.userActivePlan.findFirst({
    where: { userId, status: "active" },
    select: {
      startDate: true,
      mealsPerDay: true,
      mealPlan: { select: { mealsPerDay: true, subCategory: true, tier: true } },
    },
  });

  // active days this week = max(weekStart, plan.startDate) .. today, inclusive (0..7)
  let activeDays = 0;
  if (activePlan) {
    const planStart = new Date(activePlan.startDate);
    planStart.setUTCHours(0, 0, 0, 0);
    const effectiveStart = planStart > weekStart ? planStart : weekStart;
    if (today >= effectiveStart) {
      activeDays =
        Math.floor((today.getTime() - effectiveStart.getTime()) / 86_400_000) + 1;
    }
  }
  activeDays = Math.min(7, Math.max(0, activeDays));

  // ── Meals (40) ──
  const mpd = mealsPerDayCount(
    activePlan?.mealsPerDay ?? null,
    activePlan?.mealPlan?.mealsPerDay ?? 4
  );
  const mealsDelivered = mpd * activeDays;
  const mealsLogged = await prisma.mealLog.count({
    where: {
      userId,
      logDate: { gte: weekStart },
      confirmedAt: { not: null },
      skipped: false,
    },
  });
  const mealsPoints =
    mealsDelivered > 0
      ? Math.min(40, Math.round((mealsLogged / mealsDelivered) * 40))
      : 0;

  // ── Workouts (30) ──
  let scheduledThisWeek = 0;
  if (activePlan?.mealPlan) {
    const sched = await prisma.exerciseSchedule.findFirst({
      where: {
        mealPlanCategory: activePlan.mealPlan.subCategory,
        tier: activePlan.mealPlan.tier,
      },
      select: { daysPerWeek: true },
    });
    if (sched) {
      scheduledThisWeek = Math.round((sched.daysPerWeek * activeDays) / 7);
    }
  }
  const workoutsCompleted = await prisma.workoutSession.count({
    where: { userId, date: { gte: weekStart }, completedAt: { not: null } },
  });
  const workoutsPoints =
    scheduledThisWeek > 0
      ? Math.min(30, Math.round((workoutsCompleted / scheduledThisWeek) * 30))
      : 0;

  // ── Water (10) — unique constraint means 1 row per user per day ──
  const waterDays = await prisma.waterLog.count({
    where: { userId, entryDate: { gte: weekStart } },
  });
  const waterPoints = Math.min(10, waterDays * 2);

  // ── Weekly weigh-in (10) ──
  const weighIns = await prisma.bodyMetric.count({
    where: { userId, measuredAt: { gte: weekStart } },
  });
  const weighInDone = weighIns > 0;
  const weighInPoints = weighInDone ? 10 : 0;

  // ── Zero skipped meals (10) ──
  const skippedCount = await prisma.mealLog.count({
    where: { userId, logDate: { gte: weekStart }, skipped: true },
  });
  const noSkipPoints = skippedCount === 0 ? 10 : 0;

  const score = Math.min(
    100,
    mealsPoints + workoutsPoints + waterPoints + weighInPoints + noSkipPoints
  );

  // Cache for AI-trainer context (best-effort; profile exists post-onboarding)
  await prisma.userProfile
    .update({ where: { userId }, data: { weeklyConsistencyScore: score } })
    .catch(() => {
      /* profile may not exist yet — non-blocking */
    });

  return {
    score,
    label: labelFor(score),
    meals: { logged: mealsLogged, delivered: mealsDelivered, points: mealsPoints, max: 40 },
    workouts: { completed: workoutsCompleted, scheduled: scheduledThisWeek, points: workoutsPoints, max: 30 },
    water: { days: waterDays, points: waterPoints, max: 10 },
    weighIn: { done: weighInDone, points: weighInPoints, max: 10 },
    noSkips: { skipped: skippedCount, points: noSkipPoints, max: 10 },
    weekStart: weekStart.toISOString().slice(0, 10),
  };
}
