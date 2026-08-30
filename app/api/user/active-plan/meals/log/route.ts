// app/api/user/active-plan/meals/log/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { mealLogSchema } from "@/lib/validation/schemas";
import { menuDayNumber, mealSlotsForMealsPerDay, todayISTDate, ymd } from "@/lib/production";
import { servingScaleForTarget } from "@/lib/portion-personalization";
import { isPlanServiceDate } from "@/lib/plan-service-dates";
import type { Prisma } from "@prisma/client";

// LOOP-4 (Decision #165): logging a plan meal also writes a linked FoodEntry.

const MEAL_TYPE_NAME: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snacks",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const rl = await enforceRateLimit(req, "mutation", userId);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, mealLogSchema);
  if (!parsed.ok) return parsed.response;
  const { planScheduleSlotId, dayNumber, actualGrams } = parsed.data;

  const logDate = todayISTDate();

  const activePlan = await prisma.userActivePlan.findFirst({
    where: {
      userId,
      status: "active",
      isDigital: false,
      startDate: { lte: logDate },
      endDate: { gte: logDate },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      mealPlanId: true,
      mealsPerDay: true,
      startDate: true,
      duration: true,
      skipDates: true,
      calorieTarget: true,
      mealPlan: { select: { cycleLengthDays: true, avgCaloriesPerDay: true } },
    },
  });

  if (!activePlan) {
    return NextResponse.json({ error: "No active physical plan for today" }, { status: 404 });
  }
  if (!isPlanServiceDate(activePlan.duration, logDate)) {
    return NextResponse.json({ error: "This plan does not deliver today" }, { status: 409 });
  }
  if (activePlan.skipDates.some((date) => ymd(date) === ymd(logDate))) {
    return NextResponse.json({ error: "This delivery day was skipped" }, { status: 409 });
  }

  const expectedDay = menuDayNumber(
    activePlan.startDate,
    logDate,
    activePlan.mealPlan.cycleLengthDays,
    activePlan.duration,
  );
  if (dayNumber !== expectedDay) {
    return NextResponse.json(
      { error: "Your plan day changed. Refresh before confirming this meal." },
      { status: 409 }
    );
  }

  const slot = await prisma.planScheduleSlot.findUnique({
    where: { id: planScheduleSlotId },
    include: {
      recipe: {
        select: {
          id: true,
          name: true,
          servingSizeGrams: true,
          caloriesPerServing: true,
          proteinGrams: true,
          carbsGrams: true,
          fatGrams: true,
        },
      },
    },
  });

  if (!slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  const allowedSlots = mealSlotsForMealsPerDay(activePlan.mealsPerDay);
  if (
    slot.mealPlanId !== activePlan.mealPlanId ||
    slot.dayNumber !== expectedDay ||
    !allowedSlots.includes(slot.mealSlot)
  ) {
    return NextResponse.json({ error: "That meal is not in today's plan" }, { status: 403 });
  }

  const personalScale = servingScaleForTarget({
    calorieTarget: activePlan.calorieTarget,
    planCalories: activePlan.mealPlan.avgCaloriesPerDay,
  }).factor;
  const plannedGrams = Math.round(
    (slot.recipe.servingSizeGrams ?? 300) * Number(slot.servingMultiplier) * personalScale
  );

  const serving = slot.recipe.servingSizeGrams > 0 ? slot.recipe.servingSizeGrams : 1;
  const gramsEaten = (actualGrams ?? plannedGrams) || serving;
  const factor = gramsEaten / serving;
  const r1 = (v: number) => Math.round(v * 10) / 10;
  const eatenCalories = Math.round((slot.recipe.caloriesPerServing ?? 0) * factor);
  const eatenProtein = r1(Number(slot.recipe.proteinGrams ?? 0) * factor);
  const eatenCarbs = r1(Number(slot.recipe.carbsGrams ?? 0) * factor);
  const eatenFat = r1(Number(slot.recipe.fatGrams ?? 0) * factor);

  const mtName = MEAL_TYPE_NAME[slot.mealSlot] ?? "Snacks";
  const mealType = await prisma.mealType.upsert({
    where: { name: mtName },
    update: {},
    create: { name: mtName, sortOrder: 99 },
    select: { id: true },
  });

  let foodItem = await prisma.foodItem.findFirst({
    where: { name: slot.recipe.name, category: "PLAN_RECIPE" },
    select: { id: true },
  });
  if (!foodItem) {
    const ssg = slot.recipe.servingSizeGrams > 0 ? slot.recipe.servingSizeGrams : 0;
    const per100 = (v: number) => (ssg > 0 ? Math.round((v / ssg) * 100 * 10) / 10 : 0);
    foodItem = await prisma.foodItem.create({
      data: {
        name: slot.recipe.name,
        category: "PLAN_RECIPE",
        per100Calories: per100(slot.recipe.caloriesPerServing ?? 0),
        per100Protein: per100(Number(slot.recipe.proteinGrams ?? 0)),
        per100Carbs: per100(Number(slot.recipe.carbsGrams ?? 0)),
        per100Fat: per100(Number(slot.recipe.fatGrams ?? 0)),
        isCustom: false,
      },
      select: { id: true },
    });
  }
  const foodItemId = foodItem.id;

  let result: { id: string; alreadyLogged: boolean } | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const existing = await tx.mealLog.findFirst({
          where: {
            userId,
            userActivePlanId: activePlan.id,
            mealSlot: slot.mealSlot,
            logDate,
          },
          select: { id: true },
        });
        if (existing) return { id: existing.id, alreadyLogged: true };

        const mealLog = await tx.mealLog.create({
          data: {
            userId,
            userActivePlanId: activePlan.id,
            recipeId: slot.recipeId,
            mealSlot: slot.mealSlot,
            logDate,
            plannedGrams,
            actualGrams: actualGrams ?? null,
            confirmedAt: new Date(),
          },
        });

        await tx.foodEntry.create({
          data: {
            userId,
            foodItemId,
            mealTypeId: mealType.id,
            entryDate: logDate,
            quantity: gramsEaten,
            calories: eatenCalories,
            protein: eatenProtein,
            carbs: eatenCarbs,
            fat: eatenFat,
            mealLogId: mealLog.id,
            notes: `From plan: ${slot.recipe.name}`,
          },
        });
        return { id: mealLog.id, alreadyLogged: false };
      }, { isolationLevel: "Serializable" });
      break;
    } catch (error: unknown) {
      const code = typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : null;
      if (code === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
  if (!result) throw new Error("Meal log could not be saved");

  return NextResponse.json(
    { success: true, mealLogId: result.id, alreadyLogged: result.alreadyLogged },
    { status: result.alreadyLogged ? 409 : 200 },
  );
}
