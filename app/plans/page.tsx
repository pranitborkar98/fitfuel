// app/plans/page.tsx
//
// Server half of the narrowed catalogue. Two queries, same as before: every
// orderable plan, and every physical PlanPrice row behind them.
//
// WHAT CHANGED. The client used to receive prices grouped BY PLAN, because the
// old card grid printed a price on each of 114 cards. It never needed to: the
// seeded matrix is keyed on (diet, duration, meals) alone and every plan of a
// given diet carries an identical set of rows, which is exactly the fact the
// narrowed page is built to state out loud. So the rows are folded into one
// (diet, duration, meals) → priceRs map here, on the server, and the client
// does a single lookup instead of a per-card one.
//
// CORPORATE and DIGITAL are excluded, though today that filter changes nothing:
// all 126 seeded rows are STANDARD, LIFESTYLE_MEDICAL or SPORTS. It is here so
// that a digital or corporate row seeded later cannot land in a count the page
// states out loud, or behind a "Start this" CTA that goes to a checkout which
// cannot sell it. Digital plans have their own route and their own checkout;
// corporate is a quote.
import { prisma } from "@/lib/prisma";
import { cutoffLabel } from "@/lib/order-cutoff";
import PlansNarrowed, { type PlanRow } from "./PlansNarrowed";
import { DIETS, DURATIONS, type DietKey, type DurationKey } from "@/lib/plan-tier-pricing";
import { hasCompletePlanSchedule } from "@/lib/plan-readiness";
import { publicPlanDescription } from "@/lib/plan-public-copy";

export const dynamic = "force-dynamic";

/** The categories a customer can actually order from this page. */
const ORDERABLE = ["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS"] as const;

export async function generateMetadata() {
  const n = await prisma.mealPlan.count({ where: { category: { in: [...ORDERABLE] } } });
  return {
    title: "Meal Plans in Pune",
    description:
      `Set diet, length and meals a day, see the whole price with delivery, packaging and GST in it, ` +
      `then explore ${n} plan concepts. Published kitchen menus are clearly marked before checkout, across ` +
      `weight loss, muscle gain, Jain, sports and condition-support nutrition.`,
    // Canonical points at the bare path so the ?diet= and ?trial= variants
    // consolidate here instead of competing as separate URLs.
    alternates: { canonical: "/plans" },
  };
}

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ diet?: string; trial?: string; category?: string; goal?: string }>;
}) {
  /* `trial=true` still opens on the one-day column, which is what the homepage
     and the navbar's trial CTAs link to. `diet` seeds the first chip.
     `category` and `goal` are no longer read: the narrowed page has no
     category filter and no search box, and the three goals those links pointed
     at are the first three columns on it, above the fold. */
  const { diet, trial } = await searchParams;

  const initialDiet = DIETS.some((d) => d.key === diet) ? (diet as DietKey) : "VEG";
  const initialDuration: DurationKey = trial === "true" ? "TRIAL_DAY" : "ONE_MONTH";

  const rows = await prisma.mealPlan.findMany({
    where: { category: { in: [...ORDERABLE] } },
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    select: {
      id: true, slug: true, name: true, displayName: true, tagline: true,
      category: true, subCategory: true, dietaryVariant: true,
      avgCaloriesPerDay: true, avgProteinGrams: true, avgCarbsGrams: true, avgFatGrams: true,
      cycleLengthDays: true, mealsPerDay: true,
      _count: { select: { scheduleSlots: true } },
    },
  });

  const prices = await prisma.planPrice.findMany({
    where: { mealPlanId: { in: rows.map((plan) => plan.id) }, isDigital: false, isActive: true },
    select: { mealPlanId: true, duration: true, mealsPerDay: true, priceRs: true },
  });
  const pricedPlanIds = new Set(prices.flatMap((price) => price.mealPlanId ? [price.mealPlanId] : []));
  const priceCombosByPlan = new Map<string, string[]>();
  for (const price of prices) {
    if (!price.mealPlanId) continue;
    const combos = priceCombosByPlan.get(price.mealPlanId) ?? [];
    combos.push(`${price.duration}|${price.mealsPerDay}`);
    priceCombosByPlan.set(price.mealPlanId, combos);
  }
  const plans: PlanRow[] = rows.map((plan) => ({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    displayName: plan.displayName,
    tagline: publicPlanDescription(plan),
    category: plan.category as PlanRow["category"],
    subCategory: plan.subCategory ?? "",
    diet: plan.dietaryVariant,
    kcal: plan.avgCaloriesPerDay,
    protein: plan.avgProteinGrams,
    carbs: plan.avgCarbsGrams,
    fat: plan.avgFatGrams,
    cycleDays: plan.cycleLengthDays,
    ready:
      pricedPlanIds.has(plan.id) &&
      hasCompletePlanSchedule({
        scheduleCount: plan._count.scheduleSlots,
        cycleLengthDays: plan.cycleLengthDays,
        mealsPerDay: plan.mealsPerDay,
      }),
    pricedCombos: priceCombosByPlan.get(plan.id) ?? [],
  }));

  // Exact plan + duration + meals → stored GST-exclusive subtotal. A goal can
  // carry different pricing later without the catalogue quoting another plan.
  const priceByPlanCombo: Record<string, number> = {};
  for (const row of prices) {
    if (!row.mealPlanId) continue;
    const key = `${row.mealPlanId}|${row.duration}|${row.mealsPerDay}`;
    priceByPlanCombo[key] = row.priceRs;
  }

  return (
    <PlansNarrowed
      plans={plans}
      priceByPlanCombo={priceByPlanCombo}
      initialDiet={initialDiet}
      initialDuration={DURATIONS.some((d) => d.key === initialDuration) ? initialDuration : "ONE_MONTH"}
      cutoff={cutoffLabel()}
    />
  );
}
