// lib/calorie-target-server.ts
// Server-only companion to lib/calorie-target.ts: fetches the stored inputs
// for a user (profile target and gender, active-plan target, NutritionGoal,
// plan average) and runs them through the shared resolver. Do not import
// this from client components; import the constants and the pure resolver
// from lib/calorie-target.ts instead.
//
// The active-plan lookup mirrors lib/net-calories.ts and lib/progress.ts:
// status "active", covering the given day, physical plans first, newest first.

import { prisma } from "@/lib/prisma";
import {
  resolveCalorieTarget,
  type ResolvedCalorieTarget,
} from "@/lib/calorie-target";

export async function getCalorieTarget(
  userId: string,
  asOf: Date = new Date(),
): Promise<ResolvedCalorieTarget> {
  const day = new Date(asOf);
  day.setUTCHours(0, 0, 0, 0);

  const [profile, activePlan, goal] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId },
      select: { calorieTarget: true, gender: true },
    }),
    prisma.userActivePlan.findFirst({
      where: { userId, status: "active", startDate: { lte: day }, endDate: { gte: day } },
      orderBy: [{ isDigital: "asc" }, { createdAt: "desc" }],
      select: {
        calorieTarget: true,
        mealPlan: { select: { avgCaloriesPerDay: true } },
      },
    }),
    prisma.nutritionGoal.findUnique({
      where: { userId },
      select: { calories: true },
    }),
  ]);

  return resolveCalorieTarget({
    profileCalorieTarget: profile?.calorieTarget ?? null,
    activePlanCalorieTarget: activePlan?.calorieTarget ?? null,
    nutritionGoalCalories: goal?.calories ?? null,
    planAvgCaloriesPerDay: activePlan?.mealPlan?.avgCaloriesPerDay ?? null,
    sex: profile?.gender ?? null,
  });
}
