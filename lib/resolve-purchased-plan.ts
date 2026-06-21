/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/resolve-purchased-plan.ts
// LOOP-3 (Decision #164): resolve the ACTUAL purchased MealPlan from the
// order's planSlug, with a diet-aware fallback. Replaces the hardcoded
// `weight-loss-veg` lookup that activated the wrong plan for EVERY physical
// order regardless of what the customer actually bought.
//
// Used identically by the COD route and the PayU success route so the two
// flows can never drift apart.

import { prisma } from "@/lib/prisma";

// checkout `diet` param (veg/egg/nonveg/jain/vegan) → MealPlan.dietaryVariant
// enum (DietVariant: VEG/EGG/NON_VEG/JAIN/VEGAN). NOTE: this is a DIFFERENT
// enum from OrderItem.diet (DietType: VEGETARIAN/EGGETARIAN/NON_VEGETARIAN).
const DIET_TO_VARIANT: Record<string, string> = {
  veg: "VEG",
  egg: "EGG",
  nonveg: "NON_VEG",
  jain: "JAIN",
  vegan: "VEGAN",
};

/**
 * Resolve the MealPlan a customer actually purchased.
 *  1. exact slug they bought (the truth)
 *  2. diet-aware fallback — an active plan matching the purchased diet
 *  3. last resort — any active plan, then any plan
 * Never returns a blind weight-loss-veg default.
 */
export async function resolvePurchasedPlan(opts: {
  planSlug?: string | null;
  diet?: string | null;
}): Promise<any | null> {
  const db = prisma as any;

  // 1. Primary path: the exact plan the customer chose.
  if (opts.planSlug) {
    const bySlug = await db.mealPlan.findUnique({ where: { slug: opts.planSlug } });
    if (bySlug) return bySlug;
    console.error("[resolvePurchasedPlan] planSlug not found — falling back", {
      planSlug: opts.planSlug,
    });
  } else {
    console.error("[resolvePurchasedPlan] no planSlug on order — falling back", {
      diet: opts.diet,
    });
  }

  // 2. Diet-aware fallback: keep the customer on the RIGHT diet at minimum.
  const variant = opts.diet ? DIET_TO_VARIANT[opts.diet] : undefined;
  if (variant) {
    const byDiet =
      (await db.mealPlan.findFirst({ where: { dietaryVariant: variant, isActive: true } })) ??
      (await db.mealPlan.findFirst({ where: { dietaryVariant: variant } }));
    if (byDiet) return byDiet;
  }

  // 3. Last resort — never crash the activation.
  return (
    (await db.mealPlan.findFirst({ where: { isActive: true } })) ??
    (await db.mealPlan.findFirst())
  );
}
