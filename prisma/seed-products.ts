// prisma/seed-products.ts — Starter (₹299) + Pro (₹699) digital tiers, both 30-day.
// Run: node --env-file=.env --env-file=.env.local --import tsx prisma/seed-products.ts
import { prisma } from "../lib/prisma";
import { DietType, PlanDuration, MealsPerDay } from "@prisma/client";

const PLAN_SLUG = "weight-loss-veg";

async function main() {
  const plan = await prisma.mealPlan.findUnique({ where: { slug: PLAN_SLUG } });
  if (!plan) throw new Error(`MealPlan ${PLAN_SLUG} not found`);

  const tiers = [
    { bundle: "STARTER", priceRs: 299, mrpRs: 999 },   // <-- TWEAK
    { bundle: "PRO",     priceRs: 699, mrpRs: 2499 },  // <-- TWEAK
  ] as const;

  for (const t of tiers) {
    await prisma.planPrice.upsert({
      where: { mealPlanId_duration_mealsPerDay_bundle: { mealPlanId: plan.id, duration: PlanDuration.ONE_MONTH, mealsPerDay: MealsPerDay.ALL_FOUR, bundle: t.bundle } },
      update: { priceRs: t.priceRs, mrpRs: t.mrpRs, gstPercent: 18, priceIsTaxInclusive: true, isDigital: true, isActive: true, diet: DietType.VEGETARIAN },
      create: { mealPlanId: plan.id, diet: DietType.VEGETARIAN, duration: PlanDuration.ONE_MONTH, mealsPerDay: MealsPerDay.ALL_FOUR, bundle: t.bundle, priceRs: t.priceRs, mrpRs: t.mrpRs, gstPercent: 18, priceIsTaxInclusive: true, isDigital: true, isActive: true },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "FITFUEL50" },
    update: {},
    create: { code: "FITFUEL50", discountType: "FLAT", value: 50, minOrderRs: 299, appliesTo: "DIGITAL", firstOrderOnly: true, usageLimitPerUser: 1, stackable: false, source: "MANUAL", isActive: true },
  });

  console.log(`Seeded STARTER + PRO digital tiers for ${PLAN_SLUG}.`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
