// ============================================================
// FITFUEL — PRISMA SEED v1
// Seeds: 17 meal plan products + full price matrix + MealPlan rows
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
// MEAL PLANS — Phase 9 (required for onboarding route)
// ============================================================

type MealPlanSeed = {
  slug: string
  name: string
  displayName: string
  subCategory: string
  dietaryVariant: 'VEG' | 'EGG' | 'NON_VEG' | 'JAIN' | 'VEGAN'
  avgCaloriesPerDay: number
  avgProteinGrams: number
  avgCarbsGrams: number
  avgFatGrams: number
  sortOrder: number
}

const MEAL_PLANS: MealPlanSeed[] = [
  // ── Weight Loss ──────────────────────────────────────────
  { slug: 'weight-loss-veg',     name: 'Weight Loss — Veg',     displayName: 'Weight Loss — Vegetarian',     subCategory: 'weight_loss', dietaryVariant: 'VEG',     avgCaloriesPerDay: 1500, avgProteinGrams: 90,  avgCarbsGrams: 170, avgFatGrams: 45, sortOrder: 1  },
  { slug: 'weight-loss-egg',     name: 'Weight Loss — Egg',     displayName: 'Weight Loss — Eggetarian',     subCategory: 'weight_loss', dietaryVariant: 'EGG',     avgCaloriesPerDay: 1500, avgProteinGrams: 95,  avgCarbsGrams: 165, avgFatGrams: 45, sortOrder: 2  },
  { slug: 'weight-loss-non-veg', name: 'Weight Loss — Non-Veg', displayName: 'Weight Loss — Non Vegetarian', subCategory: 'weight_loss', dietaryVariant: 'NON_VEG', avgCaloriesPerDay: 1500, avgProteinGrams: 110, avgCarbsGrams: 150, avgFatGrams: 45, sortOrder: 3  },
  { slug: 'weight-loss-jain',    name: 'Weight Loss — Jain',    displayName: 'Weight Loss — Jain',           subCategory: 'weight_loss', dietaryVariant: 'JAIN',    avgCaloriesPerDay: 1500, avgProteinGrams: 80,  avgCarbsGrams: 175, avgFatGrams: 45, sortOrder: 4  },
  { slug: 'weight-loss-vegan',   name: 'Weight Loss — Vegan',   displayName: 'Weight Loss — Vegan',          subCategory: 'weight_loss', dietaryVariant: 'VEGAN',   avgCaloriesPerDay: 1500, avgProteinGrams: 85,  avgCarbsGrams: 175, avgFatGrams: 42, sortOrder: 5  },
  // ── Muscle Gain ──────────────────────────────────────────
  { slug: 'muscle-gain-veg',     name: 'Muscle Gain — Veg',     displayName: 'Muscle Gain — Vegetarian',     subCategory: 'muscle_gain', dietaryVariant: 'VEG',     avgCaloriesPerDay: 2600, avgProteinGrams: 150, avgCarbsGrams: 310, avgFatGrams: 72, sortOrder: 10 },
  { slug: 'muscle-gain-egg',     name: 'Muscle Gain — Egg',     displayName: 'Muscle Gain — Eggetarian',     subCategory: 'muscle_gain', dietaryVariant: 'EGG',     avgCaloriesPerDay: 2600, avgProteinGrams: 165, avgCarbsGrams: 300, avgFatGrams: 72, sortOrder: 11 },
  { slug: 'muscle-gain-non-veg', name: 'Muscle Gain — Non-Veg', displayName: 'Muscle Gain — Non Vegetarian', subCategory: 'muscle_gain', dietaryVariant: 'NON_VEG', avgCaloriesPerDay: 2600, avgProteinGrams: 180, avgCarbsGrams: 290, avgFatGrams: 72, sortOrder: 12 },
  { slug: 'muscle-gain-jain',    name: 'Muscle Gain — Jain',    displayName: 'Muscle Gain — Jain',           subCategory: 'muscle_gain', dietaryVariant: 'JAIN',    avgCaloriesPerDay: 2600, avgProteinGrams: 140, avgCarbsGrams: 315, avgFatGrams: 72, sortOrder: 13 },
  { slug: 'muscle-gain-vegan',   name: 'Muscle Gain — Vegan',   displayName: 'Muscle Gain — Vegan',          subCategory: 'muscle_gain', dietaryVariant: 'VEGAN',   avgCaloriesPerDay: 2600, avgProteinGrams: 145, avgCarbsGrams: 315, avgFatGrams: 70, sortOrder: 14 },
  // ── Balanced Diet ────────────────────────────────────────
  { slug: 'balanced-diet-veg',     name: 'Balanced — Veg',     displayName: 'Balanced Diet — Vegetarian',     subCategory: 'balanced', dietaryVariant: 'VEG',     avgCaloriesPerDay: 2000, avgProteinGrams: 100, avgCarbsGrams: 250, avgFatGrams: 56, sortOrder: 20 },
  { slug: 'balanced-diet-egg',     name: 'Balanced — Egg',     displayName: 'Balanced Diet — Eggetarian',     subCategory: 'balanced', dietaryVariant: 'EGG',     avgCaloriesPerDay: 2000, avgProteinGrams: 110, avgCarbsGrams: 245, avgFatGrams: 56, sortOrder: 21 },
  { slug: 'balanced-diet-non-veg', name: 'Balanced — Non-Veg', displayName: 'Balanced Diet — Non Vegetarian', subCategory: 'balanced', dietaryVariant: 'NON_VEG', avgCaloriesPerDay: 2000, avgProteinGrams: 120, avgCarbsGrams: 235, avgFatGrams: 56, sortOrder: 22 },
  { slug: 'balanced-diet-jain',    name: 'Balanced — Jain',    displayName: 'Balanced Diet — Jain',           subCategory: 'balanced', dietaryVariant: 'JAIN',    avgCaloriesPerDay: 2000, avgProteinGrams: 90,  avgCarbsGrams: 255, avgFatGrams: 56, sortOrder: 23 },
  { slug: 'balanced-diet-vegan',   name: 'Balanced — Vegan',   displayName: 'Balanced Diet — Vegan',          subCategory: 'balanced', dietaryVariant: 'VEGAN',   avgCaloriesPerDay: 2000, avgProteinGrams: 95,  avgCarbsGrams: 255, avgFatGrams: 54, sortOrder: 24 },
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

  console.log(`\n   Products: ${PRODUCTS.length}`)
  console.log(`   Price rows: ${totalPrices}`)
  console.log(`   Live now: ${PRODUCTS.filter(p => p.isLive).length} plans`)
  console.log(`   Coming soon: ${PRODUCTS.filter(p => !p.isLive).length} plans`)

  // ── Seed MealPlan rows (Phase 9) ──────────────────────────
  console.log('\n🌿 Seeding MealPlan rows...')
  for (const p of MEAL_PLANS) {
    await prisma.mealPlan.upsert({
      where: { slug: p.slug },
      create: {
        slug:             p.slug,
        name:             p.name,
        displayName:      p.displayName,
        category:         'STANDARD',
        subCategory:      p.subCategory,
        tagline:          `${p.displayName} — 30-day rotating menu`,
        description:      `Personalised ${p.subCategory.replace('_', ' ')} plan for ${p.dietaryVariant.toLowerCase()} diet.`,
        longDescription:  `A 30-day no-repeat rotating meal plan tailored for ${p.subCategory.replace('_', ' ')}.`,
        whoIsItFor:       `Anyone on a ${p.dietaryVariant.toLowerCase()} diet looking to ${p.subCategory.replace('_', ' ')}.`,
        keyPrinciples:    ['Balanced macros', 'Indian ingredients', '30-day rotation'],
        whatIsAvoided:    ['Processed food', 'Refined sugar'],
        dietaryVariant:   p.dietaryVariant,
        tier:             'STANDARD',
        avgCaloriesPerDay: p.avgCaloriesPerDay,
        avgProteinGrams:   p.avgProteinGrams,
        avgCarbsGrams:     p.avgCarbsGrams,
        avgFatGrams:       p.avgFatGrams,
        isActive:         p.slug === 'weight-loss-veg', // only WL-Veg is live
        sortOrder:        p.sortOrder,
      },
      update: {
        displayName:       p.displayName,
        avgCaloriesPerDay: p.avgCaloriesPerDay,
        avgProteinGrams:   p.avgProteinGrams,
        avgCarbsGrams:     p.avgCarbsGrams,
        avgFatGrams:       p.avgFatGrams,
        isActive:          p.slug === 'weight-loss-veg',
      },
    })
    console.log(`  ✓ ${p.displayName}`)
  }
  console.log(`✅ MealPlan rows: ${MEAL_PLANS.length}`)

  console.log(`\n✅ Seed complete!`)
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })