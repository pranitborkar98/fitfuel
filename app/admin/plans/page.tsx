// app/admin/plans/page.tsx
// Phase 15E-1 — plans + pricing management.

import { requireSurface } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import PlansClient from "./PlansClient";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  await requireSurface("plans");
  const db = prisma as any;

  const plans = await db.mealPlan.findMany({
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { displayName: "asc" }],
    include: {
      planPrices: {
        orderBy: [{ bundle: "asc" }, { duration: "asc" }, { mealsPerDay: "asc" }],
      },
    },
  });

  const plain = JSON.parse(JSON.stringify(plans));
  return <PlansClient initial={plain} />;
}
