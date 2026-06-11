// app/admin/subscribers/page.tsx
// Phase 15F — subscribers / active plans admin view (read-only).

import { requireSurface } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import SubscribersView from "./SubscribersView";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  await requireSurface("subscribers");
  const db = prisma as any;

  const subs = await db.userActivePlan.findMany({
    orderBy: [{ status: "asc" }, { endDate: "desc" }],
    take: 500,
    select: {
      id: true, status: true, startDate: true, endDate: true, currentDay: true,
      isDigital: true, mealsPerDay: true, duration: true, bundle: true, deliveryWindow: true,
      calorieTarget: true, proteinTarget: true, carbTarget: true, fatTarget: true,
      orderId: true, createdAt: true,
      user: { select: { name: true, email: true, phone: true } },
      mealPlan: { select: { displayName: true, slug: true } },
    },
  });

  return <SubscribersView subs={JSON.parse(JSON.stringify(subs))} />;
}
