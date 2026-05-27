// app/api/user/active-plan/meals/log/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planScheduleSlotId, dayNumber, actualGrams } = await req.json();

  if (!planScheduleSlotId || !dayNumber) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Get the slot to find recipe details
  const slot = await (prisma as any).planScheduleSlot.findUnique({
    where: { id: planScheduleSlotId },
    include: {
      recipe: {
        select: { id: true, caloriesPerServing: true, proteinPerServing: true, carbsPerServing: true, fatPerServing: true },
      },
    },
  });

  if (!slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  // Check if already logged today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const existing = await (prisma as any).mealLog.findFirst({
    where: {
      userId: session.user.id,
      planScheduleSlotId,
      scheduledDate: { gte: todayStart, lte: todayEnd },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "Already logged" }, { status: 409 });
  }

  // Create meal log
  const mealLog = await (prisma as any).mealLog.create({
    data: {
      userId: session.user.id,
      planScheduleSlotId,
      recipeId: slot.recipeId,
      dayNumber,
      scheduledDate: new Date(),
      status: "EATEN",
      actualGrams: actualGrams ?? null,
      confirmedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, mealLogId: mealLog.id });
}
