// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

type ActivePlan = {
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
    id: string;
    name: string;
    slug: string;
    tier: string;
    category: string;
    dietaryVariant: string;
    avgCaloriesPerDay: number;
  } | null;
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard");

  const userId = session.user.id;

  const [orders, user, rawActivePlan, partnerOwnership] = await Promise.all([
    (prisma as any).order.findMany({
      where:   { userId },
      orderBy: { createdAt: "desc" },
      take:    10,
      include: { items: true },
    }),
    (prisma as any).user.findUnique({
      where:  { id: userId },
      select: { name: true, email: true, phone: true, image: true, role: true },
    }),
    (prisma as any).userActivePlan.findFirst({
      where: { userId, status: "active" },
      include: {
        mealPlan: {
          select: {
            id: true, name: true, slug: true,
            tier: true, category: true, dietaryVariant: true,
            avgCaloriesPerDay: true,
          },
        },
      },
    }),
    // Phase 17B — partner dashboard tile visibility (hide for non-partners and P2P customers)
    (prisma as any).partner.findUnique({
      where: { ownerUserId: userId },
      select: { type: true },
    }),
  ]);

  const isPartnerOwner = !!partnerOwnership && partnerOwnership.type !== "CUSTOMER";

  // Enrich active plan with calculated fields
  let activePlan: ActivePlan | null = null;
  if (rawActivePlan) {
    const startDate = new Date(rawActivePlan.startDate);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const currentDay = (diffDays % 30) + 1;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 30);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

    activePlan = {
      id: rawActivePlan.id,
      currentDay,
      startDate: rawActivePlan.startDate,
      endDate: endDate.toISOString(),
      daysRemaining,
      status: rawActivePlan.status,
      calorieTarget: rawActivePlan.calorieTarget,
      proteinTarget: rawActivePlan.proteinTarget,
      mealPlan: rawActivePlan.mealPlan,


      isDigital: rawActivePlan.isDigital,
    };
  }

  // User has a confirmed order but no active plan — they need to complete onboarding
  // to personalise targets and activate their meals.
  const hasPendingOrder = !activePlan && orders.some(
    (o: any) => o.status === "CONFIRMED"
  );

  return (
    <DashboardClient
      session={session}
      orders={orders}
      user={user}
      activePlan={activePlan}
      hasPendingOrder={hasPendingOrder}
      isPartnerOwner={isPartnerOwner}
    />
  );
}