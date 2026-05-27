// prisma/seed-schedule-weight-loss-nv.ts
// Run: npx tsx prisma/seed-schedule-weight-loss-nv.ts
// Seeds: 30-day schedule for Weight Loss — Non Vegetarian
// 30 days × 4 meals = 120 slots
// Depends on: seed-meal-plans.ts + seed-recipes.ts already run

import 'dotenv/config'
import { PrismaClient, MealSlot } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// IDs — hardcoded from YOUR Neon DB (verified May 20 2026)
// ---------------------------------------------------------------------------

const PLAN_ID = 'cmpd5328t0002y8ugtxjxqypc' // weight-loss-non-veg

// BREAKFASTS (8 recipes)
const B1 = 'cmpd6ey6m000uzcuggiimvt5x' // murgh-hariyali-chilla
const B2 = 'cmpd6f1w9001bzcugpo7dsnlt' // masala-egg-bhurji-jowar-roti
const B3 = 'cmpd6f5rs001tzcug51skmxpm' // ajwaini-rohu-poha
const B4 = 'cmpd6f9i6002azcuguggwfgiy' // savoury-oats-upma-chicken-keema
const B5 = 'cmpd6fd6f002rzcug6xw731yf' // sprout-moong-egg-white-chaat-bowl
const B6 = 'cmpd6fggy0036zcugzvrhg4q8' // methi-egg-paratha
const B7 = 'cmpd6fjxk003mzcugsr7dn7u6' // chicken-idli-sambhar
const B8 = 'cmpd6fn080040zcug09es92xq' // high-protein-dalia-egg-vegetables

// LUNCHES (7 recipes)
const L1 = 'cmpd6fqgp004gzcugsv7jnfpg' // murgh-hariyali-tikka-brown-rice-kachumber
const L2 = 'cmpd6funa004zzcugsx8rxypk' // ajwaini-rohu-fish-curry-brown-rice
const L3 = 'cmpd6fyq1005izcugng83wcda' // methi-chicken-jowar-bhakri
const L4 = 'cmpd6g2wq0061zcugxcgjqej4' // tandoori-egg-rajma-bowl
const L5 = 'cmpd6g6rm006jzcugssdo6kzv' // lemon-coriander-chicken-spinach-dal
const L6 = 'cmpd6gan20071zcug08a28buj' // chicken-tikka-masala-light-brown-rice
const L7 = 'cmpd6gei2007jzcugjpxg7ebq' // grilled-rohu-palak-rice

// DINNERS (6 recipes)
const D1 = 'cmpd6gi5j0080zcugtiyufcsb' // murgh-shorba-jowar-roti
const D2 = 'cmpd6gm7z008jzcug0k1i89f3' // fish-tikka-cucumber-raita-roti
const D3 = 'cmpd6gqhu0093zcug6q8cgoso' // egg-curry-brown-rice
const D4 = 'cmpd6guke009mzcugprcgadql' // palak-chicken-roti
const D5 = 'cmpd6gymm00a5zcugdl9klu3m' // macher-jhol-fish-stew-brown-rice
const D6 = 'cmpd6h1vs00akzcug5qi88di9' // chicken-vegetable-soup-roti
const D7 = 'cmpd6h5ji00b1zcugix2zcl4v' // tandoori-chicken-leg-mint-chutney-salad

// SNACKS (6 recipes)
const S1 = 'cmpd6ha0h00bmzcugvljgwyl1' // masala-roasted-chana-egg
const S2 = 'cmpd6hcnk00byzcugms5xjosx' // chicken-tikka-bites-snack-box
const S3 = 'cmpd6hgb300cfzcugcaw44xug' // sprout-chaat-egg
const S4 = 'cmpd6hjt900cvzcug8tbvzdik' // grilled-fish-satay-peanut-dip
const S5 = 'cmpd6hnad00dbzcugb4nrrod5' // boiled-egg-cucumber-chaat
const S6 = 'cmpd6hq4l00dozcugnczsj69z' // masala-oats-chicken-keema-snack

// ---------------------------------------------------------------------------
// 30-DAY SCHEDULE
// Rules:
// - No same breakfast on consecutive days
// - No same lunch on consecutive days
// - No same dinner on consecutive days
// - No same snack on consecutive days
// - Variety of protein sources across the day (fish/chicken/egg rotated)
// ---------------------------------------------------------------------------

type Slot = {
  dayNumber: number
  mealSlot: MealSlot
  recipeId: string
  servingMultiplier: number
}

const schedule: Slot[] = [
  // DAY 1
  { dayNumber: 1,  mealSlot: MealSlot.BREAKFAST, recipeId: B1, servingMultiplier: 1.0 },
  { dayNumber: 1,  mealSlot: MealSlot.LUNCH,     recipeId: L1, servingMultiplier: 1.0 },
  { dayNumber: 1,  mealSlot: MealSlot.DINNER,    recipeId: D1, servingMultiplier: 1.0 },
  { dayNumber: 1,  mealSlot: MealSlot.SNACK,     recipeId: S1, servingMultiplier: 1.0 },

  // DAY 2
  { dayNumber: 2,  mealSlot: MealSlot.BREAKFAST, recipeId: B2, servingMultiplier: 1.0 },
  { dayNumber: 2,  mealSlot: MealSlot.LUNCH,     recipeId: L2, servingMultiplier: 1.0 },
  { dayNumber: 2,  mealSlot: MealSlot.DINNER,    recipeId: D2, servingMultiplier: 1.0 },
  { dayNumber: 2,  mealSlot: MealSlot.SNACK,     recipeId: S2, servingMultiplier: 1.0 },

  // DAY 3
  { dayNumber: 3,  mealSlot: MealSlot.BREAKFAST, recipeId: B3, servingMultiplier: 1.0 },
  { dayNumber: 3,  mealSlot: MealSlot.LUNCH,     recipeId: L3, servingMultiplier: 1.0 },
  { dayNumber: 3,  mealSlot: MealSlot.DINNER,    recipeId: D3, servingMultiplier: 1.0 },
  { dayNumber: 3,  mealSlot: MealSlot.SNACK,     recipeId: S3, servingMultiplier: 1.0 },

  // DAY 4
  { dayNumber: 4,  mealSlot: MealSlot.BREAKFAST, recipeId: B4, servingMultiplier: 1.0 },
  { dayNumber: 4,  mealSlot: MealSlot.LUNCH,     recipeId: L4, servingMultiplier: 1.0 },
  { dayNumber: 4,  mealSlot: MealSlot.DINNER,    recipeId: D4, servingMultiplier: 1.0 },
  { dayNumber: 4,  mealSlot: MealSlot.SNACK,     recipeId: S4, servingMultiplier: 1.0 },

  // DAY 5
  { dayNumber: 5,  mealSlot: MealSlot.BREAKFAST, recipeId: B5, servingMultiplier: 1.0 },
  { dayNumber: 5,  mealSlot: MealSlot.LUNCH,     recipeId: L5, servingMultiplier: 1.0 },
  { dayNumber: 5,  mealSlot: MealSlot.DINNER,    recipeId: D5, servingMultiplier: 1.0 },
  { dayNumber: 5,  mealSlot: MealSlot.SNACK,     recipeId: S5, servingMultiplier: 1.0 },

  // DAY 6
  { dayNumber: 6,  mealSlot: MealSlot.BREAKFAST, recipeId: B6, servingMultiplier: 1.0 },
  { dayNumber: 6,  mealSlot: MealSlot.LUNCH,     recipeId: L6, servingMultiplier: 1.0 },
  { dayNumber: 6,  mealSlot: MealSlot.DINNER,    recipeId: D6, servingMultiplier: 1.0 },
  { dayNumber: 6,  mealSlot: MealSlot.SNACK,     recipeId: S6, servingMultiplier: 1.0 },

  // DAY 7
  { dayNumber: 7,  mealSlot: MealSlot.BREAKFAST, recipeId: B7, servingMultiplier: 1.0 },
  { dayNumber: 7,  mealSlot: MealSlot.LUNCH,     recipeId: L7, servingMultiplier: 1.0 },
  { dayNumber: 7,  mealSlot: MealSlot.DINNER,    recipeId: D7, servingMultiplier: 1.0 },
  { dayNumber: 7,  mealSlot: MealSlot.SNACK,     recipeId: S1, servingMultiplier: 1.0 },

  // DAY 8
  { dayNumber: 8,  mealSlot: MealSlot.BREAKFAST, recipeId: B8, servingMultiplier: 1.0 },
  { dayNumber: 8,  mealSlot: MealSlot.LUNCH,     recipeId: L1, servingMultiplier: 1.0 },
  { dayNumber: 8,  mealSlot: MealSlot.DINNER,    recipeId: D1, servingMultiplier: 1.0 },
  { dayNumber: 8,  mealSlot: MealSlot.SNACK,     recipeId: S2, servingMultiplier: 1.0 },

  // DAY 9
  { dayNumber: 9,  mealSlot: MealSlot.BREAKFAST, recipeId: B1, servingMultiplier: 1.0 },
  { dayNumber: 9,  mealSlot: MealSlot.LUNCH,     recipeId: L2, servingMultiplier: 1.0 },
  { dayNumber: 9,  mealSlot: MealSlot.DINNER,    recipeId: D2, servingMultiplier: 1.0 },
  { dayNumber: 9,  mealSlot: MealSlot.SNACK,     recipeId: S3, servingMultiplier: 1.0 },

  // DAY 10
  { dayNumber: 10, mealSlot: MealSlot.BREAKFAST, recipeId: B2, servingMultiplier: 1.0 },
  { dayNumber: 10, mealSlot: MealSlot.LUNCH,     recipeId: L3, servingMultiplier: 1.0 },
  { dayNumber: 10, mealSlot: MealSlot.DINNER,    recipeId: D3, servingMultiplier: 1.0 },
  { dayNumber: 10, mealSlot: MealSlot.SNACK,     recipeId: S4, servingMultiplier: 1.0 },

  // DAY 11
  { dayNumber: 11, mealSlot: MealSlot.BREAKFAST, recipeId: B3, servingMultiplier: 1.0 },
  { dayNumber: 11, mealSlot: MealSlot.LUNCH,     recipeId: L4, servingMultiplier: 1.0 },
  { dayNumber: 11, mealSlot: MealSlot.DINNER,    recipeId: D4, servingMultiplier: 1.0 },
  { dayNumber: 11, mealSlot: MealSlot.SNACK,     recipeId: S5, servingMultiplier: 1.0 },

  // DAY 12
  { dayNumber: 12, mealSlot: MealSlot.BREAKFAST, recipeId: B4, servingMultiplier: 1.0 },
  { dayNumber: 12, mealSlot: MealSlot.LUNCH,     recipeId: L5, servingMultiplier: 1.0 },
  { dayNumber: 12, mealSlot: MealSlot.DINNER,    recipeId: D5, servingMultiplier: 1.0 },
  { dayNumber: 12, mealSlot: MealSlot.SNACK,     recipeId: S6, servingMultiplier: 1.0 },

  // DAY 13
  { dayNumber: 13, mealSlot: MealSlot.BREAKFAST, recipeId: B5, servingMultiplier: 1.0 },
  { dayNumber: 13, mealSlot: MealSlot.LUNCH,     recipeId: L6, servingMultiplier: 1.0 },
  { dayNumber: 13, mealSlot: MealSlot.DINNER,    recipeId: D6, servingMultiplier: 1.0 },
  { dayNumber: 13, mealSlot: MealSlot.SNACK,     recipeId: S1, servingMultiplier: 1.0 },

  // DAY 14
  { dayNumber: 14, mealSlot: MealSlot.BREAKFAST, recipeId: B6, servingMultiplier: 1.0 },
  { dayNumber: 14, mealSlot: MealSlot.LUNCH,     recipeId: L7, servingMultiplier: 1.0 },
  { dayNumber: 14, mealSlot: MealSlot.DINNER,    recipeId: D7, servingMultiplier: 1.0 },
  { dayNumber: 14, mealSlot: MealSlot.SNACK,     recipeId: S2, servingMultiplier: 1.0 },

  // DAY 15
  { dayNumber: 15, mealSlot: MealSlot.BREAKFAST, recipeId: B7, servingMultiplier: 1.0 },
  { dayNumber: 15, mealSlot: MealSlot.LUNCH,     recipeId: L1, servingMultiplier: 1.0 },
  { dayNumber: 15, mealSlot: MealSlot.DINNER,    recipeId: D1, servingMultiplier: 1.0 },
  { dayNumber: 15, mealSlot: MealSlot.SNACK,     recipeId: S3, servingMultiplier: 1.0 },

  // DAY 16
  { dayNumber: 16, mealSlot: MealSlot.BREAKFAST, recipeId: B8, servingMultiplier: 1.0 },
  { dayNumber: 16, mealSlot: MealSlot.LUNCH,     recipeId: L2, servingMultiplier: 1.0 },
  { dayNumber: 16, mealSlot: MealSlot.DINNER,    recipeId: D2, servingMultiplier: 1.0 },
  { dayNumber: 16, mealSlot: MealSlot.SNACK,     recipeId: S4, servingMultiplier: 1.0 },

  // DAY 17
  { dayNumber: 17, mealSlot: MealSlot.BREAKFAST, recipeId: B1, servingMultiplier: 1.0 },
  { dayNumber: 17, mealSlot: MealSlot.LUNCH,     recipeId: L3, servingMultiplier: 1.0 },
  { dayNumber: 17, mealSlot: MealSlot.DINNER,    recipeId: D3, servingMultiplier: 1.0 },
  { dayNumber: 17, mealSlot: MealSlot.SNACK,     recipeId: S5, servingMultiplier: 1.0 },

  // DAY 18
  { dayNumber: 18, mealSlot: MealSlot.BREAKFAST, recipeId: B2, servingMultiplier: 1.0 },
  { dayNumber: 18, mealSlot: MealSlot.LUNCH,     recipeId: L4, servingMultiplier: 1.0 },
  { dayNumber: 18, mealSlot: MealSlot.DINNER,    recipeId: D4, servingMultiplier: 1.0 },
  { dayNumber: 18, mealSlot: MealSlot.SNACK,     recipeId: S6, servingMultiplier: 1.0 },

  // DAY 19
  { dayNumber: 19, mealSlot: MealSlot.BREAKFAST, recipeId: B3, servingMultiplier: 1.0 },
  { dayNumber: 19, mealSlot: MealSlot.LUNCH,     recipeId: L5, servingMultiplier: 1.0 },
  { dayNumber: 19, mealSlot: MealSlot.DINNER,    recipeId: D5, servingMultiplier: 1.0 },
  { dayNumber: 19, mealSlot: MealSlot.SNACK,     recipeId: S1, servingMultiplier: 1.0 },

  // DAY 20
  { dayNumber: 20, mealSlot: MealSlot.BREAKFAST, recipeId: B4, servingMultiplier: 1.0 },
  { dayNumber: 20, mealSlot: MealSlot.LUNCH,     recipeId: L6, servingMultiplier: 1.0 },
  { dayNumber: 20, mealSlot: MealSlot.DINNER,    recipeId: D6, servingMultiplier: 1.0 },
  { dayNumber: 20, mealSlot: MealSlot.SNACK,     recipeId: S2, servingMultiplier: 1.0 },

  // DAY 21
  { dayNumber: 21, mealSlot: MealSlot.BREAKFAST, recipeId: B5, servingMultiplier: 1.0 },
  { dayNumber: 21, mealSlot: MealSlot.LUNCH,     recipeId: L7, servingMultiplier: 1.0 },
  { dayNumber: 21, mealSlot: MealSlot.DINNER,    recipeId: D7, servingMultiplier: 1.0 },
  { dayNumber: 21, mealSlot: MealSlot.SNACK,     recipeId: S3, servingMultiplier: 1.0 },

  // DAY 22
  { dayNumber: 22, mealSlot: MealSlot.BREAKFAST, recipeId: B6, servingMultiplier: 1.0 },
  { dayNumber: 22, mealSlot: MealSlot.LUNCH,     recipeId: L1, servingMultiplier: 1.0 },
  { dayNumber: 22, mealSlot: MealSlot.DINNER,    recipeId: D1, servingMultiplier: 1.0 },
  { dayNumber: 22, mealSlot: MealSlot.SNACK,     recipeId: S4, servingMultiplier: 1.0 },

  // DAY 23
  { dayNumber: 23, mealSlot: MealSlot.BREAKFAST, recipeId: B7, servingMultiplier: 1.0 },
  { dayNumber: 23, mealSlot: MealSlot.LUNCH,     recipeId: L2, servingMultiplier: 1.0 },
  { dayNumber: 23, mealSlot: MealSlot.DINNER,    recipeId: D2, servingMultiplier: 1.0 },
  { dayNumber: 23, mealSlot: MealSlot.SNACK,     recipeId: S5, servingMultiplier: 1.0 },

  // DAY 24
  { dayNumber: 24, mealSlot: MealSlot.BREAKFAST, recipeId: B8, servingMultiplier: 1.0 },
  { dayNumber: 24, mealSlot: MealSlot.LUNCH,     recipeId: L3, servingMultiplier: 1.0 },
  { dayNumber: 24, mealSlot: MealSlot.DINNER,    recipeId: D3, servingMultiplier: 1.0 },
  { dayNumber: 24, mealSlot: MealSlot.SNACK,     recipeId: S6, servingMultiplier: 1.0 },

  // DAY 25
  { dayNumber: 25, mealSlot: MealSlot.BREAKFAST, recipeId: B1, servingMultiplier: 1.0 },
  { dayNumber: 25, mealSlot: MealSlot.LUNCH,     recipeId: L4, servingMultiplier: 1.0 },
  { dayNumber: 25, mealSlot: MealSlot.DINNER,    recipeId: D4, servingMultiplier: 1.0 },
  { dayNumber: 25, mealSlot: MealSlot.SNACK,     recipeId: S1, servingMultiplier: 1.0 },

  // DAY 26
  { dayNumber: 26, mealSlot: MealSlot.BREAKFAST, recipeId: B2, servingMultiplier: 1.0 },
  { dayNumber: 26, mealSlot: MealSlot.LUNCH,     recipeId: L5, servingMultiplier: 1.0 },
  { dayNumber: 26, mealSlot: MealSlot.DINNER,    recipeId: D5, servingMultiplier: 1.0 },
  { dayNumber: 26, mealSlot: MealSlot.SNACK,     recipeId: S2, servingMultiplier: 1.0 },

  // DAY 27
  { dayNumber: 27, mealSlot: MealSlot.BREAKFAST, recipeId: B3, servingMultiplier: 1.0 },
  { dayNumber: 27, mealSlot: MealSlot.LUNCH,     recipeId: L6, servingMultiplier: 1.0 },
  { dayNumber: 27, mealSlot: MealSlot.DINNER,    recipeId: D6, servingMultiplier: 1.0 },
  { dayNumber: 27, mealSlot: MealSlot.SNACK,     recipeId: S3, servingMultiplier: 1.0 },

  // DAY 28
  { dayNumber: 28, mealSlot: MealSlot.BREAKFAST, recipeId: B4, servingMultiplier: 1.0 },
  { dayNumber: 28, mealSlot: MealSlot.LUNCH,     recipeId: L7, servingMultiplier: 1.0 },
  { dayNumber: 28, mealSlot: MealSlot.DINNER,    recipeId: D7, servingMultiplier: 1.0 },
  { dayNumber: 28, mealSlot: MealSlot.SNACK,     recipeId: S4, servingMultiplier: 1.0 },

  // DAY 29
  { dayNumber: 29, mealSlot: MealSlot.BREAKFAST, recipeId: B5, servingMultiplier: 1.0 },
  { dayNumber: 29, mealSlot: MealSlot.LUNCH,     recipeId: L1, servingMultiplier: 1.0 },
  { dayNumber: 29, mealSlot: MealSlot.DINNER,    recipeId: D1, servingMultiplier: 1.0 },
  { dayNumber: 29, mealSlot: MealSlot.SNACK,     recipeId: S5, servingMultiplier: 1.0 },

  // DAY 30
  { dayNumber: 30, mealSlot: MealSlot.BREAKFAST, recipeId: B6, servingMultiplier: 1.0 },
  { dayNumber: 30, mealSlot: MealSlot.LUNCH,     recipeId: L2, servingMultiplier: 1.0 },
  { dayNumber: 30, mealSlot: MealSlot.DINNER,    recipeId: D2, servingMultiplier: 1.0 },
  { dayNumber: 30, mealSlot: MealSlot.SNACK,     recipeId: S6, servingMultiplier: 1.0 },
]

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------

async function seedSchedule() {
  console.log('🌱 Seeding 30-day schedule for Weight Loss — Non Vegetarian...')
  console.log(`📋 Total slots to create: ${schedule.length}`)

  // Verify plan exists
  const plan = await prisma.mealPlan.findUnique({
    where: { id: PLAN_ID },
    select: { id: true, displayName: true }
  })

  if (!plan) {
    console.error('❌ Plan not found! Run seed-meal-plans.ts first.')
    process.exit(1)
  }

  console.log(`✅ Plan found: ${plan.displayName}`)

  let created = 0
  let skipped = 0
  let failed = 0

  for (const slot of schedule) {
    try {
      // Use upsert — safe to re-run
      await prisma.planScheduleSlot.upsert({
        where: {
          mealPlanId_dayNumber_mealSlot: {
            mealPlanId: PLAN_ID,
            dayNumber: slot.dayNumber,
            mealSlot: slot.mealSlot,
          }
        },
        update: {
          recipeId: slot.recipeId,
          servingMultiplier: slot.servingMultiplier,
        },
        create: {
          mealPlanId: PLAN_ID,
          dayNumber: slot.dayNumber,
          mealSlot: slot.mealSlot,
          recipeId: slot.recipeId,
          servingMultiplier: slot.servingMultiplier,
        }
      })
      console.log(`✅ Day ${String(slot.dayNumber).padStart(2, '0')} ${slot.mealSlot}`)
      created++
    } catch (err) {
      console.error(`❌ Day ${slot.dayNumber} ${slot.mealSlot}:`, err)
      failed++
    }
  }

  console.log('\n─────────────────────────────────────────────────')
  console.log(`✅ Created/Updated : ${created} slots`)
  console.log(`❌ Failed          : ${failed} slots`)
  console.log(`📋 Total           : ${schedule.length} slots`)
  console.log('─────────────────────────────────────────────────')

  if (failed === 0) {
    console.log('\n🎉 Schedule seed complete!')
    console.log('📌 Weight Loss Non-Veg: 30 days × 4 meals = 120 slots in DB')
    console.log('📌 Next: build the Today\'s Meals dashboard card (Phase 9J)')
  }
}

// ---------------------------------------------------------------------------
// RUN
// ---------------------------------------------------------------------------

seedSchedule()
  .catch((e) => {
    console.error('💥 Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })