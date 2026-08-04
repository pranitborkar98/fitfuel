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

export const dynamic = "force-dynamic";

/** The categories a customer can actually order from this page. */
const ORDERABLE = ["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS"] as const;

export async function generateMetadata() {
  const n = await (prisma as any).mealPlan.count({ where: { category: { in: ORDERABLE } } });
  return {
    title: "Meal Plans in Pune",
    description:
      `Set diet, length and meals a day, see the whole price with delivery, packaging and GST in it, ` +
      `then pick from ${n} chef-cooked plans delivered daily in Pune. Weight loss, muscle gain, PCOS, ` +
      `diabetic, Jain and sports nutrition, cooked to your macros.`,
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

  const db = prisma as any;

  const rows = await db.mealPlan.findMany({
    where: { category: { in: ORDERABLE } },
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
    select: {
      id: true, slug: true, name: true, displayName: true, tagline: true,
      category: true, subCategory: true, dietaryVariant: true,
      avgCaloriesPerDay: true, avgProteinGrams: true, avgCarbsGrams: true, avgFatGrams: true,
      cycleLengthDays: true,
    },
  });

  const plans: PlanRow[] = rows.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    displayName: p.displayName,
    tagline: p.tagline ?? null,
    category: p.category,
    subCategory: p.subCategory ?? "",
    diet: p.dietaryVariant,
    kcal: p.avgCaloriesPerDay,
    protein: p.avgProteinGrams,
    carbs: p.avgCarbsGrams,
    fat: p.avgFatGrams,
    cycleDays: p.cycleLengthDays,
  }));

  const prices = await db.planPrice.findMany({
    where: { mealPlanId: { in: rows.map((p: any) => p.id) }, isDigital: false, isActive: true },
    select: { mealPlanId: true, duration: true, mealsPerDay: true, priceRs: true },
  });

  /* (diet, duration, meals) → the real GST-exclusive subtotal. The plan's own
     dietaryVariant keys the row, because PlanPrice.diet folds JAIN and VEGAN
     into VEGETARIAN and the chips have to stay five. First row wins: they are
     seeded identical across the plans of a diet, and if that ever drifts the
     page would rather quote one number consistently than a different one per
     column. */
  const dietOf = new Map<string, DietKey>(rows.map((p: any) => [p.id, p.dietaryVariant as DietKey]));
  const priceByCombo: Record<string, number> = {};
  for (const row of prices) {
    const d = dietOf.get(row.mealPlanId);
    if (!d) continue;
    const key = `${d}|${row.duration}|${row.mealsPerDay}`;
    if (priceByCombo[key] === undefined) priceByCombo[key] = row.priceRs;
  }

  return (
    <PlansNarrowed
      plans={plans}
      priceByCombo={priceByCombo}
      initialDiet={initialDiet}
      initialDuration={DURATIONS.some((d) => d.key === initialDuration) ? initialDuration : "ONE_MONTH"}
      cutoff={cutoffLabel()}
    />
  );
}
