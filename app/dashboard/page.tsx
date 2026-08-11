// app/dashboard/page.tsx
// Today. The auth guard, the active plan, and the recent orders.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { screen, label, APP_MAX } from "@/app/_app/theme";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = { title: "Today" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: APP_MAX, margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

const PLAN_DAYS = 30;

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
    id: string; name: string; slug: string; tier: string;
    category: string; dietaryVariant: string; avgCaloriesPerDay: number;
  } | null;
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard");

  const userId = session.user.id;

  const [orders, rawActivePlan] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    }),
    prisma.userActivePlan.findFirst({
      where: { userId, status: "active" },
      include: {
        mealPlan: {
          select: {
            id: true, name: true, slug: true, tier: true,
            category: true, dietaryVariant: true, avgCaloriesPerDay: true,
          },
        },
      },
    }),
  ]);

  let activePlan: ActivePlanView | null = null;
  if (rawActivePlan) {
    const startDate = new Date(rawActivePlan.startDate);
    const today = new Date();
    const elapsed = Math.floor((today.getTime() - startDate.getTime()) / 86_400_000);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + PLAN_DAYS);

    activePlan = {
      id: rawActivePlan.id,
      currentDay: (elapsed % PLAN_DAYS) + 1,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      daysRemaining: Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86_400_000)),
      isDigital: rawActivePlan.isDigital,
      status: rawActivePlan.status,
      calorieTarget: rawActivePlan.calorieTarget,
      proteinTarget: rawActivePlan.proteinTarget,
      mealPlan: rawActivePlan.mealPlan,
    };
  }

  const hasPendingOrder = !activePlan && orders.some((o) => o.status === "CONFIRMED");

  return (
    <div style={{ ...WRAP, paddingTop: 26 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={screen()}>Today</h1>
        <span style={label(12)}>
          {activePlan
            ? `Day ${activePlan.currentDay} of ${PLAN_DAYS}, ${activePlan.mealPlan?.dietaryVariant ?? ""}`.trim()
            : "Your day, your meals, your targets"}
        </span>
      </header>

      <DashboardClient
        orders={JSON.parse(JSON.stringify(orders))}
        activePlan={activePlan}
        hasPendingOrder={hasPendingOrder}
      />
    </div>
  );
}
