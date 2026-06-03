// app/api/user/active-plan/meals/log/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/user/active-plan/meals/log
// Body: { planScheduleSlotId: string, dayNumber: number, actualGrams?: number }

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { planScheduleSlotId, dayNumber, actualGrams } = await req.json();

  if (!planScheduleSlotId || !dayNumber) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // 1. Resolve slot → mealSlot + recipeId + servingMultiplier
  const slot = await prisma.planScheduleSlot.findUnique({
    where: { id: planScheduleSlotId },
    include: {
      recipe: {
        select: {
          id: true,
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

  // 2. Get user's active plan
  const activePlan = await prisma.userActivePlan.findFirst({
    where: { userId, status: "active" },
    select: { id: true },
  });

  if (!activePlan) {
    return NextResponse.json({ error: "No active plan" }, { status: 404 });
  }

  // logDate = today at midnight UTC (matches @db.Date)
  const logDate = new Date();
  logDate.setUTCHours(0, 0, 0, 0);

  // 3. Idempotency check
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

  // plannedGrams = recipe serving × slot multiplier
  const plannedGrams = Math.round(
    (slot.recipe.servingSizeGrams ?? 300) * Number(slot.servingMultiplier)
  );

  // 4. Create MealLog
  const mealLog = await prisma.mealLog.create({
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

  return NextResponse.json({ success: true, mealLogId: mealLog.id });
}