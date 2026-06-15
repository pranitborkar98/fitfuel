// app/plans/page.tsx — Phase 19A
// Server-side catalog of all 126 MealPlans. Pulls entry pricing from PlanPrice via mealPlanId.
// Hands off to PlansCatalog (client) for filter UI.
import { prisma } from "@/lib/prisma";
import PlansCatalog from "./PlansCatalog";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return {
    title: "Meal Plans — FitFuel",
    description:
      "Browse 100+ meal plans with daily delivery in Pune. Weight loss, PCOS, diabetic, athletic, and more — built around your goal and diet.",
  };
}

export default async function PlansPage() {
  const db = prisma as any;

  const plans = await db.mealPlan.findMany({
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      displayName: true,
      tagline: true,
      description: true,
      category: true,
      subCategory: true,
      dietaryVariant: true,
      tier: true,
      avgCaloriesPerDay: true,
      avgProteinGrams: true,
      avgCarbsGrams: true,
      avgFatGrams: true,
      cycleLengthDays: true,
      mealsPerDay: true,
      isActive: true,
      imageUrl: true,
      accentColor: true,
    },
  });

  const planIds = plans.map((p: any) => p.id);
  const prices = await db.planPrice.findMany({
    where: { mealPlanId: { in: planIds }, isDigital: false, isActive: true },
    select: { mealPlanId: true, duration: true, mealsPerDay: true, priceRs: true },
  });

  // Anchor "from" price per plan: prefer ONE_MONTH × ALL_FOUR (most common purchase),
  // fall back to ONE_MONTH × BREAKFAST_LUNCH, then cheapest available.
  const entryPriceByPlan: Record<string, { priceRs: number; combo: string }> = {};
  for (const plan of plans) {
    const planPrices = prices.filter((p: any) => p.mealPlanId === plan.id);
    if (planPrices.length === 0) continue;
    const monthlyAll = planPrices.find(
      (p: any) => p.duration === "ONE_MONTH" && p.mealsPerDay === "ALL_FOUR"
    );
    const monthlyBL = planPrices.find(
      (p: any) => p.duration === "ONE_MONTH" && p.mealsPerDay === "BREAKFAST_LUNCH"
    );
    const cheapest = [...planPrices].sort((a: any, b: any) => a.priceRs - b.priceRs)[0];
    const pick = monthlyAll ?? monthlyBL ?? cheapest;
    if (pick) {
      const comboLabel =
        pick.mealsPerDay === "ALL_FOUR"
          ? "all 4 meals · 1 mo"
          : pick.mealsPerDay === "BREAKFAST_LUNCH"
            ? "B+L · 1 mo"
            : pick.mealsPerDay === "SNACK_DINNER"
              ? "S+D · 1 mo"
              : `${pick.duration.toLowerCase()}`;
      entryPriceByPlan[plan.id] = { priceRs: pick.priceRs, combo: comboLabel };
    }
  }

  return <PlansCatalog plans={plans as any} entryPriceByPlan={entryPriceByPlan} />;
}
