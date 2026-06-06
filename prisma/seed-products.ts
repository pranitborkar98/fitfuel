// prisma/seed-products.ts  (CORRECTED — digital SKUs = PlanPrice rows on the existing MealPlan)
// Run after merging pricing-models.prisma + `npx prisma db push`:
//   npx tsx prisma/seed-products.ts
//
// Prices in WHOLE RUPEES. You're GST-registered -> digital rows use gstPercent: 18, inclusive.
// >>> TWEAK the numbers marked <-- TWEAK <<<

import { PrismaClient, DietType, PlanDuration, MealsPerDay } from "@prisma/client";
const prisma = new PrismaClient();

const PLAN_SLUG = "weight-loss-veg"; // the existing MealPlan sold as a digital SKU

async function main() {
  const plan = await prisma.mealPlan.findUnique({ where: { slug: PLAN_SLUG } });
  if (!plan) throw new Error(`MealPlan ${PLAN_SLUG} not found`);

  // ── Digital price rows (unique key: [mealPlanId, duration, mealsPerDay]) ──
  // NOTE: PlanDuration has no annual value — launch with 1M + 3M, or add TWELVE_MONTH to the enum.
  const rows = [
    { duration: PlanDuration.ONE_MONTH,   priceRs: 299, mrpRs: 999 },  // <-- TWEAK
    { duration: PlanDuration.THREE_MONTH, priceRs: 699, mrpRs: 2499 }, // <-- TWEAK
  ];

  for (const row of rows) {
    await prisma.planPrice.upsert({
      where: {
        mealPlanId_duration_mealsPerDay: {
          mealPlanId: plan.id,
          duration: row.duration,
          mealsPerDay: MealsPerDay.ALL_FOUR,
        },
      },
      update: {
        priceRs: row.priceRs, mrpRs: row.mrpRs, gstPercent: 18,
        priceIsTaxInclusive: true, isDigital: true, isActive: true,
        diet: DietType.VEGETARIAN,
      },
      create: {
        mealPlanId: plan.id,
        diet: DietType.VEGETARIAN,
        duration: row.duration,
        mealsPerDay: MealsPerDay.ALL_FOUR,
        priceRs: row.priceRs, mrpRs: row.mrpRs, gstPercent: 18,
        priceIsTaxInclusive: true, isDigital: true, isActive: true,
      },
    });
  }

  // ── Launch coupon ──
  await prisma.coupon.upsert({
    where: { code: "FITFUEL50" },
    update: {},
    create: {
      code: "FITFUEL50",
      discountType: "FLAT",
      value: 50,            // ₹50 off  <-- TWEAK
      minOrderRs: 299,
      appliesTo: "DIGITAL",
      firstOrderOnly: true,
      usageLimitPerUser: 1,
      stackable: false,
      source: "MANUAL",
      isActive: true,
    },
  });

  console.log(`Seeded ${rows.length} digital price rows + FITFUEL50 for ${PLAN_SLUG}.`);
}

main().catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
