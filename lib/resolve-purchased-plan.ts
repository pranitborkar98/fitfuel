import "server-only";

import { DietVariant } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const DIET_TO_VARIANT: Record<string, DietVariant> = {
  veg: DietVariant.VEG,
  egg: DietVariant.EGG,
  nonveg: DietVariant.NON_VEG,
  jain: DietVariant.JAIN,
  vegan: DietVariant.VEGAN,
};

/**
 * Resolve the exact plan stored on a validated order. A paid order must never
 * silently activate a different plan because a slug is missing or mistyped.
 */
export async function resolvePurchasedPlan(opts: {
  planSlug?: string | null;
  diet?: string | null;
}) {
  if (!opts.planSlug) {
    console.error("[resolvePurchasedPlan] paid order has no planSlug");
    return null;
  }

  const plan = await prisma.mealPlan.findUnique({ where: { slug: opts.planSlug } });
  if (!plan) {
    console.error("[resolvePurchasedPlan] paid order plan no longer exists", {
      planSlug: opts.planSlug,
    });
    return null;
  }

  const expectedDiet = opts.diet ? DIET_TO_VARIANT[opts.diet] : undefined;
  if (expectedDiet && plan.dietaryVariant !== expectedDiet) {
    console.error("[resolvePurchasedPlan] paid order diet does not match plan", {
      planSlug: opts.planSlug,
      purchasedDiet: opts.diet,
      planDiet: plan.dietaryVariant,
    });
    return null;
  }

  return plan;
}
