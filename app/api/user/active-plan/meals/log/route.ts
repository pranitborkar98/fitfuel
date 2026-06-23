// app/api/user/active-plan/meals/log/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { mealLogSchema } from "@/lib/validation/schemas";

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
  void dayNumber;

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

  const activePlan = await prisma.userActivePlan.findFirst({
    where: { userId, status: "active" },
    select: { id: true },
  });

  if (!activePlan) {
    return NextResponse.json({ error: "No active plan" }, { status: 404 });
  }

  const logDate = new Date();
  logDate.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.mealLog.findFirst({
    where: {
      userId,
      userActivePlanId: activePlan.id,
      mealSlot: slot.mealSlot,
      logDate,
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { success: true, mealLogId: existing.id, alreadyLogged: true },
      { status: 409 }
    );
  }

  const plannedGrams = Math.round(
    (slot.recipe.servingSizeGrams ?? 300) * Number(slot.servingMultiplier)
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

  const mealLog = await prisma.$transaction(async (tx: any) => {
    const ml = await tx.mealLog.create({
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
        foodItemId: foodItem!.id,
        mealTypeId: mealType.id,
        entryDate: logDate,
        quantity: gramsEaten,
        calories: eatenCalories,
        protein: eatenProtein,
        carbs: eatenCarbs,
        fat: eatenFat,
        mealLogId: ml.id,
        notes: `From plan: ${slot.recipe.name}`,
      },
    });

    return ml;
  });

  return NextResponse.json({ success: true, mealLogId: mealLog.id });
}
