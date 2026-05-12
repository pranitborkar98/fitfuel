// ============================================================
// FITFUEL — PRISMA SEED v1
// Seeds: 17 meal plan products + full price matrix
// Run: npx prisma db seed
// ============================================================

import 'dotenv/config'
import { PrismaClient, DietType, PlanDuration, MealsPerDay } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ============================================================
// PRICE MATRIX — extracted from WooCommerce DB (authoritative)
// Same pricing applies across all plans (diet-agnostic)
// ============================================================

const PRICE_MATRIX: {
  diet: DietType
  duration: PlanDuration
  mealsPerDay: MealsPerDay
  priceRs: number
}[] = [
  // Trial Day
  { diet: 'VEGETARIAN',    duration: 'TRIAL_DAY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 400 },
  { diet: 'VEGETARIAN',    duration: 'TRIAL_DAY', mealsPerDay: 'SNACK_DINNER',    priceRs: 400 },
  { diet: 'VEGETARIAN',    duration: 'TRIAL_DAY', mealsPerDay: 'ALL_FOUR',        priceRs: 750 },
  { diet: 'EGGETARIAN',    duration: 'TRIAL_DAY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 400 },
  { diet: 'EGGETARIAN',    duration: 'TRIAL_DAY', mealsPerDay: 'SNACK_DINNER',    priceRs: 400 },
  { diet: 'EGGETARIAN',    duration: 'TRIAL_DAY', mealsPerDay: 'ALL_FOUR',        priceRs: 750 },
  { diet: 'NON_VEGETARIAN',duration: 'TRIAL_DAY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 400 },
  { diet: 'NON_VEGETARIAN',duration: 'TRIAL_DAY', mealsPerDay: 'SNACK_DINNER',    priceRs: 400 },
  { diet: 'NON_VEGETARIAN',duration: 'TRIAL_DAY', mealsPerDay: 'ALL_FOUR',        priceRs: 750 },

  // Weekly (7 days)
  { diet: 'VEGETARIAN',    duration: 'WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 2700 },
  { diet: 'VEGETARIAN',    duration: 'WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 2700 },
  { diet: 'VEGETARIAN',    duration: 'WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 4900 },
  { diet: 'EGGETARIAN',    duration: 'WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 2700 },
  { diet: 'EGGETARIAN',    duration: 'WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 2700 },
  { diet: 'EGGETARIAN',    duration: 'WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 4900 },
  { diet: 'NON_VEGETARIAN',duration: 'WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 2700 },
  { diet: 'NON_VEGETARIAN',duration: 'WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 2700 },
  { diet: 'NON_VEGETARIAN',duration: 'WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 4900 },

  // Bi-Weekly (15 days)
  { diet: 'VEGETARIAN',    duration: 'BI_WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 5775 },
  { diet: 'VEGETARIAN',    duration: 'BI_WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 5775 },
  { diet: 'VEGETARIAN',    duration: 'BI_WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 9720 },
  { diet: 'EGGETARIAN',    duration: 'BI_WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 5775 },
  { diet: 'EGGETARIAN',    duration: 'BI_WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 5775 },
  { diet: 'EGGETARIAN',    duration: 'BI_WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 9720 },
  { diet: 'NON_VEGETARIAN',duration: 'BI_WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 5775 },
  { diet: 'NON_VEGETARIAN',duration: 'BI_WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 5775 },
  { diet: 'NON_VEGETARIAN',duration: 'BI_WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 9720 },

  // Monthly excl. Sat-Sun (~22 days)
  { diet: 'VEGETARIAN',    duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 7560 },
  { diet: 'VEGETARIAN',    duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'SNACK_DINNER',    priceRs: 7560 },
  { diet: 'VEGETARIAN',    duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'ALL_FOUR',        priceRs: 13860 },
  { diet: 'EGGETARIAN',    duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 7560 },
  { diet: 'EGGETARIAN',    duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'SNACK_DINNER',    priceRs: 7560 },
  { diet: 'EGGETARIAN',    duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'ALL_FOUR',        priceRs: 13860 },
  { diet: 'NON_VEGETARIAN',duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 7600 },
  { diet: 'NON_VEGETARIAN',duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'SNACK_DINNER',    priceRs: 7600 },
  { diet: 'NON_VEGETARIAN',duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'ALL_FOUR',        priceRs: 13860 },

  // 1 Month (full)
  { diet: 'VEGETARIAN',    duration: 'ONE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 9500 },
  { diet: 'VEGETARIAN',    duration: 'ONE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 9500 },
  { diet: 'VEGETARIAN',    duration: 'ONE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 16999 },
  { diet: 'EGGETARIAN',    duration: 'ONE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 9500 },
  { diet: 'EGGETARIAN',    duration: 'ONE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 9500 },
  { diet: 'EGGETARIAN',    duration: 'ONE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 16999 },
  { diet: 'NON_VEGETARIAN',duration: 'ONE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 9500 },
  { diet: 'NON_VEGETARIAN',duration: 'ONE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 9500 },
  { diet: 'NON_VEGETARIAN',duration: 'ONE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 16999 },

  // 2 Month
  { diet: 'VEGETARIAN',    duration: 'TWO_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 18900 },
  { diet: 'VEGETARIAN',    duration: 'TWO_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 18900 },
  { diet: 'VEGETARIAN',    duration: 'TWO_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 33000 },
  { diet: 'EGGETARIAN',    duration: 'TWO_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 18900 },
  { diet: 'EGGETARIAN',    duration: 'TWO_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 18900 },
  { diet: 'EGGETARIAN',    duration: 'TWO_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 33000 },
  { diet: 'NON_VEGETARIAN',duration: 'TWO_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 18900 },
  { diet: 'NON_VEGETARIAN',duration: 'TWO_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 18900 },
  { diet: 'NON_VEGETARIAN',duration: 'TWO_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 33000 },

  // 3 Month
  { diet: 'VEGETARIAN',    duration: 'THREE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 27450 },
  { diet: 'VEGETARIAN',    duration: 'THREE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 27450 },
  { diet: 'VEGETARIAN',    duration: 'THREE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 47250 },
  { diet: 'EGGETARIAN',    duration: 'THREE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 27450 },
  { diet: 'EGGETARIAN',    duration: 'THREE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 27450 },
  { diet: 'EGGETARIAN',    duration: 'THREE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 47250 },
  { diet: 'NON_VEGETARIAN',duration: 'THREE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 27450 },
  { diet: 'NON_VEGETARIAN',duration: 'THREE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 27450 },
  { diet: 'NON_VEGETARIAN',duration: 'THREE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 47250 },
]

// ============================================================
// ALL MEAL PLAN PRODUCTS
// isLive = true → orderable now (Phase 3)
// isLive = false → coming soon (Phase 9)
// ============================================================

const PRODUCTS = [
  // ── Phase 3 — Core plans (live at launch) ──────────────────
  {
    slug: 'muscle-gain',
    name: 'Muscle Gain Meal Plan',
    planType: 'MUSCLE_GAIN' as const,
    description: 'High-protein meals tailored to fuel strength, recovery, and muscle growth. 1800–2800 kcal/day.',
    isLive: true,
    phase: 3,
    sortOrder: 1,
  },
  {
    slug: 'weight-loss',
    name: 'Weight Loss Meal Plan',
    planType: 'WEIGHT_LOSS' as const,
    description: 'Low-calorie, high-satiety meals designed for sustainable fat loss. 1200–1800 kcal/day.',
    isLive: true,
    phase: 3,
    sortOrder: 2,
  },
  {
    slug: 'balanced-diet',
    name: 'Balanced Diet Meal Plan',
    planType: 'BALANCED_DIET' as const,
    description: 'Well-rounded nutrition for a healthy lifestyle. Optimal macro balance, 1800–2800 kcal/day.',
    isLive: true,
    phase: 3,
    sortOrder: 3,
  },
  {
    slug: 'office-employee',
    name: 'Office Employee Meal Plan',
    planType: 'OFFICE_EMPLOYEE' as const,
    description: 'Balanced meals designed for desk workers. Mon–Fri option available. 1200–2800 kcal/day.',
    isLive: true,
    phase: 3,
    sortOrder: 4,
  },
  {
    slug: 'jain-diet',
    name: 'Jain Diet Meal Plan',
    planType: 'JAIN_DIET' as const,
    description: 'Pure vegetarian meals crafted to align with Jain dietary principles. 1800–2400 kcal/day.',
    isLive: true,
    phase: 3,
    sortOrder: 5,
  },

  // ── Phase 9 — Lifestyle & Medical plans (coming soon) ──────
  {
    slug: 'healthy-sex-lifestyle',
    name: 'Healthy Sex Lifestyle Plan',
    planType: 'HEALTHY_SEX_LIFESTYLE' as const,
    description: 'Hormone-supporting, libido-boosting foods for a healthy sexual lifestyle.',
    isLive: false,
    phase: 9,
    sortOrder: 10,
  },
  {
    slug: 'alcohol-recovery',
    name: 'Alcohol Recovery Diet',
    planType: 'ALCOHOL_RECOVERY' as const,
    description: 'Liver-supportive, B-vitamin rich, hydration-focused meals for alcohol recovery.',
    isLive: false,
    phase: 9,
    sortOrder: 11,
  },
  {
    slug: 'smoking-recovery',
    name: 'Smoking Recovery Diet',
    planType: 'SMOKING_RECOVERY' as const,
    description: 'Lung-health focused, antioxidant-rich, high Vitamin C meals for smoking recovery.',
    isLive: false,
    phase: 9,
    sortOrder: 12,
  },
  {
    slug: 'diabetes-management',
    name: 'Diabetes Management Plan',
    planType: 'DIABETES_MANAGEMENT' as const,
    description: 'Low GI, insulin-friendly meals to help manage blood sugar effectively.',
    isLive: false,
    phase: 9,
    sortOrder: 13,
  },
  {
    slug: 'pcos-hormonal-balance',
    name: 'PCOS & Hormonal Balance Plan',
    planType: 'PCOS_HORMONAL_BALANCE' as const,
    description: 'Anti-inflammatory, hormone-balancing meals designed for PCOS management.',
    isLive: false,
    phase: 9,
    sortOrder: 14,
  },
  {
    slug: 'thyroid-support',
    name: 'Thyroid Support Plan',
    planType: 'THYROID_SUPPORT' as const,
    description: 'Iodine and selenium-rich meals to support thyroid function and metabolism.',
    isLive: false,
    phase: 9,
    sortOrder: 15,
  },
  {
    slug: 'hypertension-dash',
    name: 'Hypertension (DASH) Diet Plan',
    planType: 'HYPERTENSION_DASH' as const,
    description: 'Low-sodium, DASH-protocol meals to help manage high blood pressure.',
    isLive: false,
    phase: 9,
    sortOrder: 16,
  },
  {
    slug: 'post-surgery-recovery',
    name: 'Post-Surgery Recovery Plan',
    planType: 'POST_SURGERY_RECOVERY' as const,
    description: 'High-protein, soft, easy-to-digest meals to support healing after surgery.',
    isLive: false,
    phase: 9,
    sortOrder: 17,
  },
  {
    slug: 'mental-health-stress',
    name: 'Mental Health & Stress Plan',
    planType: 'MENTAL_HEALTH_STRESS' as const,
    description: 'Gut-brain axis focused meals rich in omega-3, magnesium, and adaptogens.',
    isLive: false,
    phase: 9,
    sortOrder: 18,
  },
  {
    slug: 'gut-health-ibs',
    name: 'Gut Health & IBS Plan',
    planType: 'GUT_HEALTH_IBS' as const,
    description: 'Low-FODMAP, probiotic-rich meals for gut health and IBS management.',
    isLive: false,
    phase: 9,
    sortOrder: 19,
  },
  {
    slug: 'anti-aging-longevity',
    name: 'Anti-Aging & Longevity Plan',
    planType: 'ANTI_AGING_LONGEVITY' as const,
    description: 'Antioxidant-rich, inflammation-fighting meals for longevity and healthy aging.',
    isLive: false,
    phase: 9,
    sortOrder: 20,
  },
  {
    slug: 'custom-personalized',
    name: 'Custom Personalized Plan',
    planType: 'CUSTOM_PERSONALIZED' as const,
    description: 'Fully personalized meal plan assigned directly by your nutritionist/trainer.',
    isLive: false,
    phase: 9,
    sortOrder: 99,
  },
]

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('🌱 Starting FitFuel seed...\n')

  // Clear existing data (safe for re-runs)
  await prisma.planPrice.deleteMany()
  await prisma.mealPlanProduct.deleteMany()
  console.log('✓ Cleared existing products and prices\n')

  let totalPrices = 0

  for (const product of PRODUCTS) {
    const created = await prisma.mealPlanProduct.create({
      data: {
        slug: product.slug,
        name: product.name,
        planType: product.planType,
        description: product.description,
        isLive: product.isLive,
        phase: product.phase,
        sortOrder: product.sortOrder,
        isActive: true,
      },
    })

    // Jain Diet — vegetarian only (no egg/non-veg)
    // Custom — no price matrix (trainer assigns)
    const skipPricing = ['CUSTOM_PERSONALIZED'].includes(product.planType)
    const jainOnly = product.planType === 'JAIN_DIET'

    if (!skipPricing) {
      const applicablePrices = jainOnly
        ? PRICE_MATRIX.filter(p => p.diet === 'VEGETARIAN')
        : PRICE_MATRIX

      await prisma.planPrice.createMany({
        data: applicablePrices.map(p => ({
          productId: created.id,
          diet: p.diet,
          duration: p.duration,
          mealsPerDay: p.mealsPerDay,
          priceRs: p.priceRs,
          gstPercent: 5,
          isActive: true,
        })),
      })

      totalPrices += applicablePrices.length
      console.log(
        `✓ ${product.name} — ${applicablePrices.length} price rows | ${product.isLive ? '🟢 Live' : '🔵 Coming Soon (Phase ' + product.phase + ')'}`
      )
    } else {
      console.log(`✓ ${product.name} — no price matrix (trainer-assigned) | 🔵 Coming Soon`)
    }
  }

  console.log(`\n✅ Seed complete!`)
  console.log(`   Products: ${PRODUCTS.length}`)
  console.log(`   Price rows: ${totalPrices}`)
  console.log(`   Live now: ${PRODUCTS.filter(p => p.isLive).length} plans`)
  console.log(`   Coming soon: ${PRODUCTS.filter(p => !p.isLive).length} plans`)
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })