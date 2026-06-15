import 'dotenv/config'
import { PrismaClient, DietType, PlanDuration, MealsPerDay, DietVariant } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Map MealPlan.dietaryVariant → PlanPrice.diet
// Jain & Vegan both use VEGETARIAN pricing rows (matches legacy seed treatment)
const DIET_MAP: Record<DietVariant, DietType> = {
  VEG:     'VEGETARIAN',
  EGG:     'EGGETARIAN',
  NON_VEG: 'NON_VEGETARIAN',
  JAIN:    'VEGETARIAN',
  VEGAN:   'VEGETARIAN',
}

// Matrix: { diet, duration, mealsPerDay, priceRs } — mirrors prisma/seed.ts PRICE_MATRIX exactly
type Row = { diet: DietType; duration: PlanDuration; mealsPerDay: MealsPerDay; priceRs: number }

const PRICE_MATRIX: Row[] = [
  // TRIAL_DAY
  { diet: 'VEGETARIAN',     duration: 'TRIAL_DAY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 400 },
  { diet: 'VEGETARIAN',     duration: 'TRIAL_DAY', mealsPerDay: 'SNACK_DINNER',    priceRs: 400 },
  { diet: 'VEGETARIAN',     duration: 'TRIAL_DAY', mealsPerDay: 'ALL_FOUR',        priceRs: 750 },
  { diet: 'EGGETARIAN',     duration: 'TRIAL_DAY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 400 },
  { diet: 'EGGETARIAN',     duration: 'TRIAL_DAY', mealsPerDay: 'SNACK_DINNER',    priceRs: 400 },
  { diet: 'EGGETARIAN',     duration: 'TRIAL_DAY', mealsPerDay: 'ALL_FOUR',        priceRs: 750 },
  { diet: 'NON_VEGETARIAN', duration: 'TRIAL_DAY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 400 },
  { diet: 'NON_VEGETARIAN', duration: 'TRIAL_DAY', mealsPerDay: 'SNACK_DINNER',    priceRs: 400 },
  { diet: 'NON_VEGETARIAN', duration: 'TRIAL_DAY', mealsPerDay: 'ALL_FOUR',        priceRs: 750 },
  // WEEKLY
  { diet: 'VEGETARIAN',     duration: 'WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 2700 },
  { diet: 'VEGETARIAN',     duration: 'WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 2700 },
  { diet: 'VEGETARIAN',     duration: 'WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 4900 },
  { diet: 'EGGETARIAN',     duration: 'WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 2700 },
  { diet: 'EGGETARIAN',     duration: 'WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 2700 },
  { diet: 'EGGETARIAN',     duration: 'WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 4900 },
  { diet: 'NON_VEGETARIAN', duration: 'WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 2700 },
  { diet: 'NON_VEGETARIAN', duration: 'WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 2700 },
  { diet: 'NON_VEGETARIAN', duration: 'WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 4900 },
  // BI_WEEKLY
  { diet: 'VEGETARIAN',     duration: 'BI_WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 5775 },
  { diet: 'VEGETARIAN',     duration: 'BI_WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 5775 },
  { diet: 'VEGETARIAN',     duration: 'BI_WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 9720 },
  { diet: 'EGGETARIAN',     duration: 'BI_WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 5775 },
  { diet: 'EGGETARIAN',     duration: 'BI_WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 5775 },
  { diet: 'EGGETARIAN',     duration: 'BI_WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 9720 },
  { diet: 'NON_VEGETARIAN', duration: 'BI_WEEKLY', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 5775 },
  { diet: 'NON_VEGETARIAN', duration: 'BI_WEEKLY', mealsPerDay: 'SNACK_DINNER',    priceRs: 5775 },
  { diet: 'NON_VEGETARIAN', duration: 'BI_WEEKLY', mealsPerDay: 'ALL_FOUR',        priceRs: 9720 },
  // MONTHLY_EXCL_WEEKENDS (note: nonveg B+L / S+D = 7600, not 7560)
  { diet: 'VEGETARIAN',     duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 7560 },
  { diet: 'VEGETARIAN',     duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'SNACK_DINNER',    priceRs: 7560 },
  { diet: 'VEGETARIAN',     duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'ALL_FOUR',        priceRs: 13860 },
  { diet: 'EGGETARIAN',     duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 7560 },
  { diet: 'EGGETARIAN',     duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'SNACK_DINNER',    priceRs: 7560 },
  { diet: 'EGGETARIAN',     duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'ALL_FOUR',        priceRs: 13860 },
  { diet: 'NON_VEGETARIAN', duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 7600 },
  { diet: 'NON_VEGETARIAN', duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'SNACK_DINNER',    priceRs: 7600 },
  { diet: 'NON_VEGETARIAN', duration: 'MONTHLY_EXCL_WEEKENDS', mealsPerDay: 'ALL_FOUR',        priceRs: 13860 },
  // ONE_MONTH
  { diet: 'VEGETARIAN',     duration: 'ONE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 9500 },
  { diet: 'VEGETARIAN',     duration: 'ONE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 9500 },
  { diet: 'VEGETARIAN',     duration: 'ONE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 16999 },
  { diet: 'EGGETARIAN',     duration: 'ONE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 9500 },
  { diet: 'EGGETARIAN',     duration: 'ONE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 9500 },
  { diet: 'EGGETARIAN',     duration: 'ONE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 16999 },
  { diet: 'NON_VEGETARIAN', duration: 'ONE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 9500 },
  { diet: 'NON_VEGETARIAN', duration: 'ONE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 9500 },
  { diet: 'NON_VEGETARIAN', duration: 'ONE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 16999 },
  // TWO_MONTH
  { diet: 'VEGETARIAN',     duration: 'TWO_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 18900 },
  { diet: 'VEGETARIAN',     duration: 'TWO_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 18900 },
  { diet: 'VEGETARIAN',     duration: 'TWO_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 33000 },
  { diet: 'EGGETARIAN',     duration: 'TWO_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 18900 },
  { diet: 'EGGETARIAN',     duration: 'TWO_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 18900 },
  { diet: 'EGGETARIAN',     duration: 'TWO_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 33000 },
  { diet: 'NON_VEGETARIAN', duration: 'TWO_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 18900 },
  { diet: 'NON_VEGETARIAN', duration: 'TWO_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 18900 },
  { diet: 'NON_VEGETARIAN', duration: 'TWO_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 33000 },
  // THREE_MONTH
  { diet: 'VEGETARIAN',     duration: 'THREE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 27450 },
  { diet: 'VEGETARIAN',     duration: 'THREE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 27450 },
  { diet: 'VEGETARIAN',     duration: 'THREE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 47250 },
  { diet: 'EGGETARIAN',     duration: 'THREE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 27450 },
  { diet: 'EGGETARIAN',     duration: 'THREE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 27450 },
  { diet: 'EGGETARIAN',     duration: 'THREE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 47250 },
  { diet: 'NON_VEGETARIAN', duration: 'THREE_MONTH', mealsPerDay: 'BREAKFAST_LUNCH', priceRs: 27450 },
  { diet: 'NON_VEGETARIAN', duration: 'THREE_MONTH', mealsPerDay: 'SNACK_DINNER',    priceRs: 27450 },
  { diet: 'NON_VEGETARIAN', duration: 'THREE_MONTH', mealsPerDay: 'ALL_FOUR',        priceRs: 47250 },
]

async function main() {
  const db = prisma as any

  const plans = await db.mealPlan.findMany({
    select: { id: true, slug: true, dietaryVariant: true },
  })
  console.log(`Found ${plans.length} MealPlans`)

  // Wipe existing physical PlanPrice rows linked by mealPlanId (safe — leaves productId-linked
  // and digital rows untouched)
  const deleted = await db.planPrice.deleteMany({
    where: { mealPlanId: { not: null }, isDigital: false },
  })
  console.log(`Cleared ${deleted.count} existing mealPlanId-linked physical price rows`)

  let totalCreated = 0
  for (const plan of plans) {
    const planDiet = DIET_MAP[plan.dietaryVariant as DietVariant]
    const rows = PRICE_MATRIX.filter(r => r.diet === planDiet)
    if (rows.length === 0) {
      console.warn(`  ⚠ ${plan.slug}: no matrix rows for diet ${plan.dietaryVariant}`)
      continue
    }
    await db.planPrice.createMany({
      data: rows.map(r => ({
        mealPlanId:  plan.id,
        diet:        r.diet,
        duration:    r.duration,
        mealsPerDay: r.mealsPerDay,
        priceRs:     r.priceRs,
        gstPercent:  5,
        isActive:    true,
        isDigital:   false,
      })),
    })
    totalCreated += rows.length
  }

  console.log(`\n✓ Created ${totalCreated} PlanPrice rows across ${plans.length} plans`)

  // Verify
  const verify = await prisma.$queryRaw<any[]>`
    SELECT mp.tier::text AS tier, mp.category::text AS category,
           COUNT(DISTINCT mp.id)::int AS plans,
           COUNT(pp.id)::int AS price_rows
    FROM meal_plans mp
    LEFT JOIN plan_prices pp ON pp."mealPlanId" = mp.id AND pp."isDigital" = false
    GROUP BY mp.tier, mp.category
    ORDER BY mp.tier, mp.category;
  `
  console.table(verify)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())