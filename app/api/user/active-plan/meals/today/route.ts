import { auth } from "@/lib/auth";
import { servingScaleForTarget } from "@/lib/portion-personalization";
import { prisma } from "@/lib/prisma";
import {
  menuDayNumber,
  mealSlotsForMealsPerDay,
  SLOT_ORDER,
  todayISTDate,
  ymd,
} from "@/lib/production";
import { NextResponse } from "next/server";
import { isPlanServiceDate } from "@/lib/plan-service-dates";

const SLOT_CONFIG: Record<
  string,
  { label: string; time: string; emoji: string; order: number }
> = {
  BREAKFAST: { label: "Breakfast", time: "7:00–9:00 AM", emoji: "", order: 1 },
  LUNCH: { label: "Lunch", time: "12:30–2:00 PM", emoji: "", order: 2 },
  SNACK: { label: "Snack", time: "4:00–5:00 PM", emoji: "", order: 3 },
  DINNER: { label: "Dinner", time: "7:00–8:30 PM", emoji: "", order: 4 },
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = todayISTDate();
  const activePlan = await prisma.userActivePlan.findFirst({
    where: {
      userId: session.user.id,
      status: "active",
      isDigital: false,
      startDate: { lte: today },
      endDate: { gte: today },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      mealPlanId: true,
      mealsPerDay: true,
      calorieTarget: true,
      startDate: true,
      duration: true,
      skipDates: true,
      mealPlan: {
        select: { cycleLengthDays: true, avgCaloriesPerDay: true },
      },
    },
  });

  if (!activePlan) return NextResponse.json({ meals: [] });
  if (!isPlanServiceDate(activePlan.duration, today)) {
    return NextResponse.json({ meals: [], offDay: true });
  }
  if (activePlan.skipDates.some((date) => ymd(date) === ymd(today))) {
    return NextResponse.json({ meals: [], skipped: true });
  }

  const currentDay = menuDayNumber(
    activePlan.startDate,
    today,
    activePlan.mealPlan.cycleLengthDays,
    activePlan.duration,
  );
  const allowedSlots = mealSlotsForMealsPerDay(activePlan.mealsPerDay);
  const personalScale = servingScaleForTarget({
    calorieTarget: activePlan.calorieTarget,
    planCalories: activePlan.mealPlan.avgCaloriesPerDay,
  }).factor;

  const [slots, mealLogs] = await Promise.all([
    prisma.planScheduleSlot.findMany({
      where: {
        mealPlanId: activePlan.mealPlanId,
        dayNumber: currentDay,
        mealSlot: { in: allowedSlots },
      },
      select: {
        id: true,
        mealSlot: true,
        servingMultiplier: true,
        recipe: {
          select: {
            id: true,
            name: true,
            slug: true,
            caloriesPerServing: true,
            proteinGrams: true,
            carbsGrams: true,
            fatGrams: true,
            servingSizeGrams: true,
            prepTimeMins: true,
            cookTimeMins: true,
            cuisineType: true,
            imageUrl: true,
          },
        },
      },
    }),
    prisma.mealLog.findMany({
      where: {
        userId: session.user.id,
        userActivePlanId: activePlan.id,
        logDate: today,
      },
      select: { mealSlot: true, skipped: true },
    }),
  ]);

  const loggedSlots = new Map(mealLogs.map((log) => [log.mealSlot, log]));
  const r1 = (value: number) => Math.round(value * 10) / 10;
  const meals = slots
    .map((slot) => {
      const log = loggedSlots.get(slot.mealSlot);
      const scale = Number(slot.servingMultiplier) * personalScale;
      const config = SLOT_CONFIG[slot.mealSlot] ?? {
        label: slot.mealSlot,
        time: "",
        emoji: "",
        order: SLOT_ORDER[slot.mealSlot],
      };
      return {
        slotId: slot.id,
        mealSlot: slot.mealSlot,
        ...config,
        recipe: {
          ...slot.recipe,
          caloriesPerServing: Math.round(slot.recipe.caloriesPerServing * scale),
          proteinGrams: r1(Number(slot.recipe.proteinGrams) * scale),
          carbsGrams: r1(Number(slot.recipe.carbsGrams) * scale),
          fatGrams: r1(Number(slot.recipe.fatGrams) * scale),
          servingSizeGrams: Math.round(slot.recipe.servingSizeGrams * scale),
        },
        isLogged: !!log && !log.skipped,
        isSkipped: log?.skipped ?? false,
        dayNumber: currentDay,
      };
    })
    .sort((a, b) => a.order - b.order);

  return NextResponse.json({ meals, currentDay, date: ymd(today) });
}
