// prisma/seed-products.ts  (Prisma 7 — imports the app's configured client, not a bare new PrismaClient)
// Run with env loaded:
//   node --env-file=.env --env-file=.env.local --import tsx prisma/seed-products.ts
import { prisma } from "../lib/prisma";                 // your adapter-configured client
import { DietType, PlanDuration, MealsPerDay } from "@prisma/client";

const PLAN_SLUG = "weight-loss-veg";

async function main() {
  const plan = await prisma.mealPlan.findUnique({ where: { slug: PLAN_SLUG } });
  if (!plan) throw new Error(`MealPlan ${PLAN_SLUG} not found`);

  // PlanDuration has no annual value — launch with 1M + 3M. <-- TWEAK prices (rupees)
  const rows = [
    { duration: PlanDuration.ONE_MONTH,   priceRs: 299, mrpRs: 999 },
    { duration: PlanDuration.THREE_MONTH, priceRs: 699, mrpRs: 2499 },
  ];

  for (const row of rows) {
    await prisma.planPrice.upsert({
      where: { mealPlanId_duration_mealsPerDay: { mealPlanId: plan.id, duration: row.duration, mealsPerDay: MealsPerDay.ALL_FOUR } },
      update: { priceRs: row.priceRs, mrpRs: row.mrpRs, gstPercent: 18, priceIsTaxInclusive: true, isDigital: true, isActive: true, diet: DietType.VEGETARIAN },
      create: { mealPlanId: plan.id, diet: DietType.VEGETARIAN, duration: row.duration, mealsPerDay: MealsPerDay.ALL_FOUR, priceRs: row.priceRs, mrpRs: row.mrpRs, gstPercent: 18, priceIsTaxInclusive: true, isDigital: true, isActive: true },
    });
  }

  await prisma.coupon.upsert({
    where: { code: "FITFUEL50" },
    update: {},
    create: { code: "FITFUEL50", discountType: "FLAT", value: 50, minOrderRs: 299, appliesTo: "DIGITAL", firstOrderOnly: true, usageLimitPerUser: 1, stackable: false, source: "MANUAL", isActive: true },
  });

  console.log(`Seeded ${rows.length} digital price rows + FITFUEL50 for ${PLAN_SLUG}.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });