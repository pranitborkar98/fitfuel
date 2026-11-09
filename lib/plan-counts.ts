// lib/plan-counts.ts
//
// ONE SOURCE OF TRUTH for how many meal plans there are.
//
// Three numbers circulated at once, and none of them was read from the
// database the customers actually see:
//
// - The site printed "126" everywhere, as a literal.
// - prisma/seed-meal-plans.ts's own header claimed "113 variants across
//   8 categories".
// - That seed file actually contains 119 rows in 3 categories
//   (STANDARD 27, LIFESTYLE_MEDICAL 70, SPORTS 22), counted 2026-11-09.
//
// The "126" does reconcile — it is not invented. prisma/seed.ts carries a
// second, 15-row MEAL_PLANS list: 8 of its slugs already exist in
// seed-meal-plans.ts, and the other 7 are new (the five balanced-diet-*
// slugs, plus weight-loss-vegan and muscle-gain-vegan), all STANDARD, and
// one new subCategory ('balanced'). So a database seeded with BOTH files
// holds 119 + 7 = 126 rows, 70 LIFESTYLE_MEDICAL + 34 STANDARD + 22 SPORTS,
// in 58 + 1 = 59 concepts — which is exactly where the old
// "126 = 70+34+22" comment came from. A database seeded with
// seed-meal-plans.ts alone holds 119 rows in 58 concepts. Which state the
// live database is in cannot be read from here, and it also decides which
// plans are active: seed-meal-plans.ts seeds every row isActive: false, and
// seed.ts activates only weight-loss-veg — and seed-meal-plans.ts upserts
// the whole row, so running it after seed.ts deactivates weight-loss-veg
// again. The live count therefore comes from the database, through here,
// and every live surface reads through here instead of a literal.
//
// WHAT EACH COUNT MEANS
// - total: every MealPlan row in the database, whatever its category or
//   isActive flag.
// - byCategory: rows per PlanCategory.
// - active: rows with isActive true — the only ones a customer can buy.
// - orderableActive: active rows in STANDARD / LIFESTYLE_MEDICAL / SPORTS,
//   the set /plans lists and sells. CORPORATE and DIGITAL have their own
//   routes and their own checkout, so they never land in a count the
//   customer-facing catalogue states out loud.
// - concepts: distinct subCategory values across ALL rows, including
//   inactive ones. The homepage catalogue lists every concept whether or
//   not it is live yet (getPlans in app/page.tsx deliberately does not
//   filter on isActive), so the homepage's "N plans" is concepts, not
//   total rows — the numerator on that page counts concepts too. It is
//   not 126, and it is not the number of plans a customer can buy: that
//   is orderableActive, the count /plans metadata states. The bands below
//   the homepage catalogue state this same concepts number (getBandData
//   in app/page.tsx counts distinct subCategory values too), so no band
//   on the homepage can print the row total next to a catalogue of
//   concept cards.
//
// FALLBACK. Every function here fails SOFT and returns null when the
// database cannot be reached (the same rule as lib/site-counts.ts), and
// the counts are all-or-nothing: if any one query fails the whole result
// is null, because a partial set could disagree with itself. A missing
// count must never become a fabricated number. Callers render WITHOUT a
// number when they get null — the homepage's planCount prop is
// `number | null` and drops the chip, and the /plans metadata falls back
// to a number-free sentence (plansMetadataDescription). There is exactly
// one such fallback string, and it carries no number at all.

import { prisma } from "./prisma";

/** The categories a customer can actually order from the /plans page. */
export const ORDERABLE_PLAN_CATEGORIES = ["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS"] as const;

/** Every plan count a live surface can state, counted in one round trip. */
export interface PlanCounts {
  total: number;
  byCategory: Record<string, number>;
  active: number;
  orderableActive: number;
  concepts: number;
}

export async function countPlans(): Promise<PlanCounts | null> {
  try {
    const [total, byCategoryRows, active, orderableActive, conceptRows] = await Promise.all([
      prisma.mealPlan.count(),
      prisma.mealPlan.groupBy({ by: ["category"], _count: { _all: true } }),
      prisma.mealPlan.count({ where: { isActive: true } }),
      prisma.mealPlan.count({
        where: { category: { in: [...ORDERABLE_PLAN_CATEGORIES] }, isActive: true },
      }),
      prisma.mealPlan.groupBy({ by: ["subCategory"] }),
    ]);
    const byCategory: Record<string, number> = {};
    for (const row of byCategoryRows) byCategory[String(row.category)] = row._count._all;
    return {
      total,
      byCategory,
      active,
      orderableActive,
      concepts: conceptRows.length,
    };
  } catch {
    return null;
  }
}

/** Active, orderable plans — the number /plans metadata states. Null when
 *  the database cannot be read. */
export async function countActiveOrderablePlans(): Promise<number | null> {
  try {
    return await prisma.mealPlan.count({
      where: { category: { in: [...ORDERABLE_PLAN_CATEGORIES] }, isActive: true },
    });
  } catch {
    return null;
  }
}

/** The /plans metadata description. The count is active orderable ROWS,
 *  not concepts: /plans lists one card per active row (one per diet
 *  variant), so the number states rows — a different number from the
 *  homepage's concepts count by design. With live active plans it states
 *  the count; with zero active, or with the database unreachable, it states no
 *  number at all rather than "explore 0 plan concepts" — the page lists
 *  only active plans, so 0 would be the one thing the sentence asserts
 *  that is not a count of anything a customer can see. */
export function plansMetadataDescription(activeOrderable: number | null): string {
  const lead =
    "Set diet, length and meals a day, see the whole price with delivery, packaging and GST in it, then ";
  const tail =
    "Published kitchen menus are clearly marked before checkout, across weight loss, muscle gain, Jain, sports and condition-support nutrition.";
  if (activeOrderable !== null && activeOrderable > 0) {
    return `${lead}explore ${activeOrderable} plan concept${activeOrderable === 1 ? "" : "s"}. ${tail}`;
  }
  return `${lead}explore plan concepts. ${tail}`;
}
