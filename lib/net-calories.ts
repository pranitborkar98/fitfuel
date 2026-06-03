// lib/net-calories.ts
// 9L — Net Calorie Engine
// Computes daily calorie balance: meals in - workout out vs target

import { prisma } from "@/lib/prisma";

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

  // 1. Get active plan for targets
  const activePlan = await prisma.userActivePlan.findFirst({
    where: { userId, status: "active" },
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
  });

  const calorieTarget =
    activePlan?.calorieTarget ??
    activePlan?.mealPlan?.avgCaloriesPerDay ??
    1600;

  const proteinTarget =
    activePlan?.proteinTarget ??
    activePlan?.mealPlan?.avgProteinGrams ??
    120;

  // 2. Calories IN — confirmed MealLogs for today
  const mealLogs = await prisma.mealLog.findMany({
    where: {
      userId,
      logDate: day,
      confirmedAt: { not: null },
      skipped: false,
    },
    select: {
      recipe: {
        select: {
          caloriesPerServing: true,
          proteinGrams: true,
        },
      },
    },
  });

  const caloriesIn = mealLogs.reduce(
    (sum, log) => sum + (log.recipe?.caloriesPerServing ?? 0),
    0
  );

  const proteinIn = mealLogs.reduce(
    (sum, log) => sum + Number(log.recipe?.proteinGrams ?? 0),
    0
  );

  // 3. Calories OUT — workout sessions today
  const workouts = await prisma.workoutSession.findMany({
    where: { userId, date: day },
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
