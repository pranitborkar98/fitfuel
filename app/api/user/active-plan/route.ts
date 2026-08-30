// app/api/user/active-plan/route.ts
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { menuDayNumber, todayISTDate } from "@/lib/production";
import { remainingServiceDays } from "@/lib/plan-service-dates";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const limit = await enforceRateLimit(req, "read", session.user.id);
  if (!limit.ok) return limit.response;
  const today = todayISTDate();

  const activePlan = await prisma.userActivePlan.findFirst({
    where: {
      userId: session.user.id,
      status: "active",
      startDate: { lte: today },
      endDate: { gte: today },
    },
    orderBy: [{ isDigital: "asc" }, { createdAt: "desc" }],
    include: {
      mealPlan: {
        select: {
          id: true,
          name: true,
          slug: true,
          tier: true,
          category: true,
          dietaryVariant: true,
          avgCaloriesPerDay: true,
          cycleLengthDays: true,
          description: true,
        },
      },
    },
  });

  if (!activePlan) {
    return NextResponse.json({ activePlan: null });
  }

  const startDate = new Date(activePlan.startDate);
  const endDate = new Date(activePlan.endDate);
  const currentDay = menuDayNumber(startDate, today, activePlan.mealPlan.cycleLengthDays, activePlan.duration);
  const daysRemaining = remainingServiceDays(today, endDate, activePlan.duration);

  return NextResponse.json({
    activePlan: {
      id: activePlan.id,
      isDigital: activePlan.isDigital,
      currentDay,
      startDate: activePlan.startDate,
      endDate: endDate.toISOString(),
      daysRemaining,
      status: activePlan.status,
      calorieTarget: activePlan.calorieTarget,
      proteinTarget: activePlan.proteinTarget,
      mealPlan: activePlan.mealPlan,
    },
  });
}
