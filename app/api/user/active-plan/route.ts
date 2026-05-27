// app/api/user/active-plan/route.ts
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
    include: {
      mealPlan: {
        select: {
          id: true,
          name: true,
          slug: true,
          tier: true,
          category: true,
          dietVariant: true,
          caloriesPerDay: true,
          description: true,
        },
      },
    },
  });

  if (!activePlan) {
    return NextResponse.json({ activePlan: null });
  }

  // Calculate current day (1-based, cycles through 30)
  const startDate = new Date(activePlan.startDate);
  const today = new Date();
  const diffMs = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const currentDay = (diffDays % 30) + 1;

  // Calculate end date (30 days from start)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 30);
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  return NextResponse.json({
    activePlan: {
      id: activePlan.id,
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
