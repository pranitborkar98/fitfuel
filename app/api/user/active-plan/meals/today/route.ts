// app/api/user/active-plan/meals/today/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activePlan = await (prisma as any).userActivePlan.findFirst({
    where: {
      userId: session.user.id,
      status: "active",
    },
  });

  if (!activePlan) {
    return NextResponse.json({ meals: [] });
  }

  // Calculate current day (1-30, cycling) — using IST date-only comparison
  // startDate is stored as UTC midnight in DB; today() is also UTC — both must be
  // normalised to IST date-only so the diff is always whole days regardless of time-of-day
  const toISTDateOnly = (date: Date) => {
    const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000); // shift to IST
    ist.setUTCHours(0, 0, 0, 0); // strip time component
    return ist;
  };

  const startIST = toISTDateOnly(new Date(activePlan.startDate));
  const todayIST = toISTDateOnly(new Date());
  const diffDays = Math.floor(
    (todayIST.getTime() - startIST.getTime()) / (1000 * 60 * 60 * 24)
  );
  const currentDay = (diffDays % 30) + 1;

  // Get today's schedule slots with recipe details
  const slots = await (prisma as any).planScheduleSlot.findMany({
    where: {
      mealPlanId: activePlan.mealPlanId,
      dayNumber: currentDay,
    },
    include: {
      recipe: {
        select: {
          id: true,
          name: true,
          slug: true,
          caloriesPerServing: true,
          proteinPerServing: true,
          carbsPerServing: true,
          fatPerServing: true,
          prepTimeMinutes: true,
          cookTimeMinutes: true,
          cuisineType: true,
        },
      },
    },
    orderBy: { mealSlot: "asc" },
  });

  // Check which meals have been logged today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const mealLogs = await (prisma as any).mealLog.findMany({
    where: {
      userId: session.user.id,
      scheduledDate: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
    select: { planScheduleSlotId: true, status: true },
  });

  const loggedSlotIds = new Set(mealLogs.map((l: any) => l.planScheduleSlotId));

  // Meal slot display config
  const SLOT_CONFIG: Record<
    string,
    { label: string; time: string; emoji: string; order: number }
  > = {
    BREAKFAST: { label: "Breakfast", time: "7:00 – 9:00 am",   emoji: "🌅", order: 1 },
    LUNCH:     { label: "Lunch",     time: "12:30 – 2:00 pm",  emoji: "☀️", order: 2 },
    SNACK:     { label: "Snack",     time: "4:00 – 5:00 pm",   emoji: "🍎", order: 3 },
    DINNER:    { label: "Dinner",    time: "7:00 – 8:30 pm",   emoji: "🌙", order: 4 },
  };

  const meals = slots
    .map((slot: any) => ({
      slotId: slot.id,
      mealSlot: slot.mealSlot,
      ...SLOT_CONFIG[slot.mealSlot],
      recipe: slot.recipe,
      isLogged: loggedSlotIds.has(slot.id),
      dayNumber: currentDay,
    }))
    .sort((a: any, b: any) => a.order - b.order);

  return NextResponse.json({ meals, currentDay });
}