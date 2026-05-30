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

  // Calculate current day (1-30, cycling) — IST date-only comparison
  const toISTDateOnly = (date: Date) => {
    const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    ist.setUTCHours(0, 0, 0, 0);
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
          proteinGrams: true,
          carbsGrams: true,
          fatGrams: true,
          prepTimeMins: true,
          cookTimeMins: true,
          cuisineType: true,
        },
      },
    },
    orderBy: { mealSlot: "asc" },
  });

  // Check which meals have been logged today
  // MealLog uses logDate (@db.Date) + mealSlot — no planScheduleSlotId
  const todayDate = new Date(todayIST); // IST date-only for logDate comparison

  const mealLogs = await (prisma as any).mealLog.findMany({
    where: {
      userId: session.user.id,
      userActivePlanId: activePlan.id,
      logDate: todayDate,
    },
    select: { mealSlot: true, skipped: true },
  });

  // Key by mealSlot since that's what links log → slot
  const loggedSlots = new Map(
    mealLogs.map((l: any) => [l.mealSlot, l])
  );

  // Meal slot display config
  const SLOT_CONFIG: Record<
    string,
    { label: string; time: string; emoji: string; order: number }
  > = {
    BREAKFAST: { label: "Breakfast", time: "7:00 – 9:00 am",  emoji: "🌅", order: 1 },
    LUNCH:     { label: "Lunch",     time: "12:30 – 2:00 pm", emoji: "☀️", order: 2 },
    SNACK:     { label: "Snack",     time: "4:00 – 5:00 pm",  emoji: "🍎", order: 3 },
    DINNER:    { label: "Dinner",    time: "7:00 – 8:30 pm",  emoji: "🌙", order: 4 },
  };

  const meals = slots
    .map((slot: any) => ({
      slotId: slot.id,
      mealSlot: slot.mealSlot,
      ...SLOT_CONFIG[slot.mealSlot],
      recipe: slot.recipe,
      isLogged: loggedSlots.has(slot.mealSlot) && !loggedSlots.get(slot.mealSlot)?.skipped,
      isSkipped: loggedSlots.get(slot.mealSlot)?.skipped ?? false,
      dayNumber: currentDay,
    }))
    .sort((a: any, b: any) => a.order - b.order);

  return NextResponse.json({ meals, currentDay });
}