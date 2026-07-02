// app/plans/page.tsx, Phase 19A (rev.)
// Server fetch: all 126 plans + their full physical PlanPrice rows.
// Passes pricesByPlan to PlansCatalog for in-card tier × variation matrix.
import { prisma } from "@/lib/prisma";
import PlansCatalog from "./PlansCatalog";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Meal Plans | FitFuel",
    description:
      "Browse 100+ meal plans with daily delivery in Pune. Three tiers: Standard, Premium, Luxury. Weight loss, PCOS, diabetic, athletic, and more.",
  };
}

const VALID_CATEGORIES = ["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS", "CORPORATE", "DIGITAL"] as const;
type CategoryParam = (typeof VALID_CATEGORIES)[number];

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; trial?: string }>;
}) {
  const { category, trial } = await searchParams;
  const initialCategory: CategoryParam | undefined = VALID_CATEGORIES.includes(
    (category ?? "") as CategoryParam
  )
    ? (category as CategoryParam)
    : undefined;
  const startTrial = trial === "true";

  const db = prisma as any;

  const plans = await db.mealPlan.findMany({
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    select: {
      id: true, slug: true, name: true, displayName: true, tagline: true, description: true,
      category: true, subCategory: true, dietaryVariant: true, tier: true,
      avgCaloriesPerDay: true, avgProteinGrams: true, avgCarbsGrams: true, avgFatGrams: true,
      cycleLengthDays: true, mealsPerDay: true, isActive: true,
      imageUrl: true, accentColor: true,
    },
  });

  const planIds = plans.map((p: any) => p.id);
  const allPrices = await db.planPrice.findMany({
    where: { mealPlanId: { in: planIds }, isDigital: false, isActive: true },
    select: { id: true, mealPlanId: true, diet: true, duration: true, mealsPerDay: true, priceRs: true, mrpRs: true },
  });

  // Group prices by mealPlanId so the client can compute tier × variation prices per card
  const pricesByPlan: Record<string, any[]> = {};
  for (const row of allPrices) {
    if (!pricesByPlan[row.mealPlanId]) pricesByPlan[row.mealPlanId] = [];
    pricesByPlan[row.mealPlanId].push({
      id: row.id,
      diet: row.diet,
      duration: row.duration,
      mealsPerDay: row.mealsPerDay,
      priceRs: row.priceRs,
      mrpRs: row.mrpRs,
    });
  }

  return (
    <PlansCatalog
      plans={plans as any}
      pricesByPlan={pricesByPlan}
      initialCategory={initialCategory}
      startTrial={startTrial}
    />
  );
}
