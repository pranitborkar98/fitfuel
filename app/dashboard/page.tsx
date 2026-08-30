// app/dashboard/page.tsx
// Today. The auth guard, the active plan, and the recent orders.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { screen } from "@/app/_app/theme";
import DashboardClient from "./DashboardClient";
import { menuDayNumber, todayISTDate } from "@/lib/production";
import { remainingServiceDays } from "@/lib/plan-service-dates";
import s from "./dashboard.module.css";

export const metadata: Metadata = { title: "Today" };
export const dynamic = "force-dynamic";

export type ActivePlanView = {
  id: string;
  currentDay: number;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isDigital: boolean;
  status: string;
  calorieTarget: number | null;
  proteinTarget: number | null;
  mealPlan: {
    id: string; name: string; displayName: string; slug: string; tier: string;
    category: string; dietaryVariant: string; avgCaloriesPerDay: number;
    cycleLengthDays: number;
  } | null;
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard");

  const userId = session.user.id;
  const today = todayISTDate();

  const [orders, rawActivePlan] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    }),
    prisma.userActivePlan.findFirst({
      where: { userId, status: "active", startDate: { lte: today }, endDate: { gte: today } },
      orderBy: [{ isDigital: "asc" }, { createdAt: "desc" }],
      include: {
        mealPlan: {
          select: {
            id: true, name: true, displayName: true, slug: true, tier: true,
            category: true, dietaryVariant: true, avgCaloriesPerDay: true, cycleLengthDays: true,
          },
        },
      },
    }),
  ]);

  let activePlan: ActivePlanView | null = null;
  if (rawActivePlan) {
    const startDate = new Date(rawActivePlan.startDate);
    const endDate = new Date(rawActivePlan.endDate);

    activePlan = {
      id: rawActivePlan.id,
      currentDay: menuDayNumber(startDate, today, rawActivePlan.mealPlan.cycleLengthDays, rawActivePlan.duration),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      daysRemaining: remainingServiceDays(today, endDate, rawActivePlan.duration),
      isDigital: rawActivePlan.isDigital,
      status: rawActivePlan.status,
      calorieTarget: rawActivePlan.calorieTarget,
      proteinTarget: rawActivePlan.proteinTarget,
      mealPlan: rawActivePlan.mealPlan,
    };
  }

  const hasActivationIssue =
    !activePlan &&
    orders.some(
      (order) =>
        order.status === "CONFIRMED" &&
        order.items.some((item) => item.kind === "PLAN") &&
        !(() => {
          try { return JSON.parse(order.notes ?? "{}").isDigital === true; }
          catch { return false; }
        })(),
    );

  return (
    <div className={s.page}>
      <header className={s.pageHeader}>
        <div>
          <h1 style={screen()}>Today</h1>
          <p className={s.pageIntro}>
            {activePlan
              ? `Day ${activePlan.currentDay} of your ${activePlan.mealPlan?.displayName || activePlan.mealPlan?.name || "meal plan"}.`
              : "Your meals, movement and coaching in one place."}
          </p>
        </div>
        <time className={s.date} dateTime={todayISTDate().toISOString()}>
          {todayISTDate().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </time>
      </header>

      <DashboardClient
        orders={JSON.parse(JSON.stringify(orders))}
        activePlan={activePlan}
        hasActivationIssue={hasActivationIssue}
      />
    </div>
  );
}
