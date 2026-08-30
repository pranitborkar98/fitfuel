// app/admin/plans/page.tsx
// Phase 15E-1 — plans + pricing management.

import { requireSurface } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import PlansClient from "./PlansClient";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  await requireSurface("plans");
  const plans = await prisma.mealPlan.findMany({
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { displayName: "asc" }],
    select: {
      id: true,
      slug: true,
      displayName: true,
      tagline: true,
      description: true,
      longDescription: true,
      whoIsItFor: true,
      keyPrinciples: true,
      whatIsAvoided: true,
      avgCaloriesPerDay: true,
      avgProteinGrams: true,
      avgCarbsGrams: true,
      avgFatGrams: true,
      nutritionistName: true,
      nutritionistCred: true,
      nutritionistBio: true,
      medicalDisclaimer: true,
      isActive: true,
      isFeatured: true,
      sortOrder: true,
      imageUrl: true,
      accentColor: true,
      category: true,
      tier: true,
      dietaryVariant: true,
      cycleLengthDays: true,
      mealsPerDay: true,
      _count: { select: { scheduleSlots: true } },
      planPrices: {
        orderBy: [{ bundle: "asc" }, { duration: "asc" }, { mealsPerDay: "asc" }],
        select: {
          id: true,
          bundle: true,
          isDigital: true,
          diet: true,
          duration: true,
          mealsPerDay: true,
          priceRs: true,
          mrpRs: true,
          gstPercent: true,
          isActive: true,
        },
      },
    },
  });
  return <PlansClient initial={plans} />;
}
