// lib/net-calories.ts
// 9L — Net Calorie Engine
// Computes daily calorie balance: meals in - workout out vs target

import { prisma } from "@/lib/prisma";
import { resolveCalorieTarget } from "@/lib/calorie-target";

export interface DailyCalorieBalance {
  caloriesIn: number;       // from confirmed plan meals today
  caloriesOut: number;      // from workout sessions today
  net: number;              // caloriesIn - caloriesOut
  target: number;           // personalised or plan default
  remaining: number;        // target - net (can be negative = over)
  status: "under" | "over" | "on_track";
  mealsLogged: number;      // how many meals confirmed today
  mealsTotal: number;       // total meals scheduled today (always 4)
  proteinIn: number;        // grams protein from confirmed meals
  proteinTarget: number;    // personalised or plan default
}

export async function getDailyCalorieBalance(
  userId: string,
  date: Date
): Promise<DailyCalorieBalance> {
  // Normalise to midnight UTC — matches @db.Date storage
  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0);

  // 1. Get the daily calorie target — one shared precedence for every
  // surface (see lib/calorie-target.ts): stored NutritionGoal, profile
  // override, active-plan target, plan average, then the safe default.
  // The active-plan lookup keeps its existing date window and ordering.
  const [activePlan, profile, goal] = await Promise.all([
    prisma.userActivePlan.findFirst({
      where: { userId, status: "active", startDate: { lte: day }, endDate: { gte: day } },
      orderBy: [{ isDigital: "asc" }, { createdAt: "desc" }],
      select: {
        calorieTarget: true,
        proteinTarget: true,
        mealPlan: {
          select: {
            avgCaloriesPerDay: true,
            avgProteinGrams: true,
          },
        },
      },
    }),
    prisma.userProfile.findUnique({
      where: { userId },
      select: { calorieTarget: true, gender: true },
    }),
    prisma.nutritionGoal.findUnique({
      where: { userId },
      select: { calories: true },
    }),
  ]);

  const { calories: calorieTarget } = resolveCalorieTarget({
    profileCalorieTarget: profile?.calorieTarget ?? null,
    activePlanCalorieTarget: activePlan?.calorieTarget ?? null,
    nutritionGoalCalories: goal?.calories ?? null,
    planAvgCaloriesPerDay: activePlan?.mealPlan?.avgCaloriesPerDay ?? null,
    sex: profile?.gender ?? null,
  });

  const proteinTarget =
    activePlan?.proteinTarget ??
    activePlan?.mealPlan?.avgProteinGrams ??
    120;

  // 2. Calories IN — UNIFIED LEDGER (LOOP-4)
  //    plan meals (MealLog, scaled by grams eaten) + manual foods
  //    (FoodEntry where mealLogId IS NULL). FoodEntries auto-created from a
  //    MealLog carry mealLogId and are EXCLUDED here to avoid double-counting —
  //    they exist only to surface plan meals in the nutrition diary.
  //    Mirrors lib/progress.ts so the dashboard ring and the trend chart agree.
  const mealLogs = await prisma.mealLog.findMany({
    where: {
      userId,
      logDate: day,
      confirmedAt: { not: null },
      skipped: false,
    },
    select: {
      actualGrams: true,
      plannedGrams: true,
      recipe: {
        select: {
          servingSizeGrams: true,
          caloriesPerServing: true,
          proteinGrams: true,
        },
      },
    },
  });

  let caloriesIn = 0;
  let proteinIn = 0;

  // plan meals — scale recipe macros by grams actually eaten / serving size
  for (const log of mealLogs) {
    const r = log.recipe;
    if (!r) continue;
    const serving = r.servingSizeGrams > 0 ? r.servingSizeGrams : 1;
    const grams = log.actualGrams ?? log.plannedGrams ?? serving;
    const factor = grams / serving;
    caloriesIn += (r.caloriesPerServing ?? 0) * factor;
    proteinIn += Number(r.proteinGrams ?? 0) * factor;
  }

  // manual food entries — absolute macros; exclude plan-meal mirrors (mealLogId set)
  const manual = await prisma.foodEntry.aggregate({
    where: { userId, entryDate: day, mealLogId: null },
    _sum: { calories: true, protein: true },
  });
  caloriesIn += manual._sum.calories ?? 0;
  proteinIn += Number(manual._sum.protein ?? 0);

  caloriesIn = Math.round(caloriesIn);

  // 3. Calories OUT — workout sessions today
  // WorkoutSession uses `date` (@db.Date) — same pattern as MealLog.logDate.
  // The index @@index([userId, date]) confirms this is the correct query field.
  const workouts = await prisma.workoutSession.findMany({
    where: {
      userId,
      date: day,
    },
    select: { caloriesBurned: true },
  });

  const caloriesOut = workouts.reduce(
    (sum, w) => sum + (w.caloriesBurned ?? 0),
    0
  );

  // 4. Compute balance
  const net = caloriesIn - caloriesOut;
  const remaining = calorieTarget - net;

  const status: DailyCalorieBalance["status"] =
    net >= calorieTarget * 0.95 && net <= calorieTarget * 1.05
      ? "on_track"
      : net < calorieTarget
      ? "under"
      : "over";

  return {
    caloriesIn,
    caloriesOut,
    net,
    target: calorieTarget,
    remaining,
    status,
    mealsLogged: mealLogs.length,
    mealsTotal: 4,
    proteinIn: Math.round(proteinIn),
    proteinTarget,
  };
}
