// prisma/patch-wl-veg.ts
// Run: npx tsx prisma/patch-wl-veg.ts
//
// Fixes 3 issues from the first seed run:
//   1. SALT was never in MISSING_FOOD_ITEMS — all 29 recipes have a broken SALT ingredient link
//   2. JAGGERY was never in MISSING_FOOD_ITEMS — 2 recipes (Makhana Chaat, Bharli Vangi) broken
//   3. Adds the missing 10th lunch recipe (Continental_Indian Paneer Bhurji Bowl)
//
// Safe to re-run — all operations are upsert/findOrCreate.

import 'dotenv/config'
import { PrismaClient, MealSlot, PlanTier } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// STEP 1: Create SALT and JAGGERY food items
// ---------------------------------------------------------------------------
const ITEMS_TO_CREATE = [
  { name: 'Salt', category: 'Condiments', per100Calories: 0, per100Protein: 0, per100Carbs: 0, per100Fat: 0, per100Fiber: 0 },
  { name: 'Jaggery', category: 'Sweeteners', per100Calories: 383, per100Protein: 0.4, per100Carbs: 98.0, per100Fat: 0.1, per100Fiber: 0.0 },
]

// ---------------------------------------------------------------------------
// STEP 2: The missing 10th lunch — Continental_Indian Paneer Bhurji Bowl
// ---------------------------------------------------------------------------
const MISSING_LUNCH = {
  recipe: {
    name: 'Continental Indian Paneer Bhurji with Brown Rice & Capsicum Salad',
    slug: 'continental-paneer-bhurji-brown-rice-wl-veg',
    description: 'Paneer scrambled in a spiced onion-tomato-capsicum base with black pepper, kasuri methi, and a finishing squeeze of lemon — the Indian cloud kitchen answer to scrambled eggs. Pan-seared paneer crumbles soak up the sharp masala while staying dry enough to hold their texture in delivery boxes. Served over brown rice and a crisp capsicum-cucumber salad. 36g protein, 8g fibre, 460 kcal. The highest-protein lunch on the weight-loss-veg plan.',
    shortDescription: 'Spiced paneer bhurji, brown rice, capsicum-cucumber salad',
    cuisineType: 'Continental_Indian',
    mealType: MealSlot.LUNCH,
    dietaryTags: ['VEGETARIAN'],
    planCategories: ['weight_loss'],
    tierAvailability: [PlanTier.STANDARD, PlanTier.PREMIUM, PlanTier.LUXURY],
    servingSizeGrams: 470,
    prepTimeMins: 8,
    cookTimeMins: 18,
    difficulty: 'easy' as const,
    equipmentNeeded: ['kadai'],
    allergens: ['dairy'],
    shelfLifeHours: 4,
    packagingType: 'compartment_box',
    kitchenStation: 'hot_kitchen',
    seasonTags: ['all_year'],
    rotationGroup: 10,
    caloriesPerServing: 462,
    proteinGrams: 32.4,
    carbsGrams: 48.6,
    fatGrams: 15.2,
    fibreGrams: 8.4,
    caloriesPer100g: 98,
    proteinPer100g: 6.9,
    carbsPer100g: 10.3,
    fatPer100g: 3.2,
    fibrePer100g: 1.8,
    isActive: true,
    isFeatured: false,
  },
  ingredients: [
    { foodItemKey: 'PANEER', quantityGrams: 180, cookedWeightFactor: 0.95, prepNote: 'crumbled — not cubed', isOptional: false, orderInRecipe: 1 },
    { foodItemKey: 'ONION', quantityGrams: 80, cookedWeightFactor: 0.7, prepNote: 'finely diced', isOptional: false, orderInRecipe: 2 },
    { foodItemKey: 'TOMATO', quantityGrams: 100, cookedWeightFactor: 0.8, prepNote: 'finely diced, deseeded', isOptional: false, orderInRecipe: 3 },
    { foodItemKey: 'CAPSICUM', quantityGrams: 60, cookedWeightFactor: 0.9, prepNote: 'diced — adds crunch and colour', isOptional: false, orderInRecipe: 4 },
    { foodItemKey: 'GARLIC', quantityGrams: 8, cookedWeightFactor: 1.0, prepNote: '4 cloves, minced', isOptional: false, orderInRecipe: 5 },
    { foodItemKey: 'GINGER', quantityGrams: 5, cookedWeightFactor: 1.0, prepNote: 'grated', isOptional: false, orderInRecipe: 6 },
    { foodItemKey: 'GREEN_CHILLI', quantityGrams: 5, cookedWeightFactor: 1.0, prepNote: 'minced', isOptional: false, orderInRecipe: 7 },
    { foodItemKey: 'TURMERIC_POWDER', quantityGrams: 1, cookedWeightFactor: 1.0, prepNote: '', isOptional: false, orderInRecipe: 8 },
    { foodItemKey: 'RED_CHILLI_POWDER', quantityGrams: 2, cookedWeightFactor: 1.0, prepNote: '', isOptional: false, orderInRecipe: 9 },
    { foodItemKey: 'CORIANDER_POWDER', quantityGrams: 3, cookedWeightFactor: 1.0, prepNote: '', isOptional: false, orderInRecipe: 10 },
    { foodItemKey: 'GARAM_MASALA', quantityGrams: 1, cookedWeightFactor: 1.0, prepNote: 'at the end', isOptional: false, orderInRecipe: 11 },
    { foodItemKey: 'KASURI_METHI', quantityGrams: 3, cookedWeightFactor: 1.0, prepNote: 'crushed — the Continental_Indian finishing note', isOptional: false, orderInRecipe: 12 },
    { foodItemKey: 'BLACK_PEPPER', quantityGrams: 2, cookedWeightFactor: 1.0, prepNote: 'freshly cracked — generous amount', isOptional: false, orderInRecipe: 13 },
    { foodItemKey: 'GROUNDNUT_OIL', quantityGrams: 8, cookedWeightFactor: 1.0, prepNote: '', isOptional: false, orderInRecipe: 14 },
    { foodItemKey: 'SALT', quantityGrams: 3, cookedWeightFactor: 1.0, prepNote: '', isOptional: false, orderInRecipe: 15 },
    { foodItemKey: 'LEMON_JUICE', quantityGrams: 10, cookedWeightFactor: 1.0, prepNote: 'at the end', isOptional: false, orderInRecipe: 16 },
    { foodItemKey: 'BROWN_RICE_COOKED', quantityGrams: 150, cookedWeightFactor: 1.0, prepNote: '', isOptional: false, orderInRecipe: 17 },
    { foodItemKey: 'CAPSICUM', quantityGrams: 50, cookedWeightFactor: 1.0, prepNote: 'raw, julienned — for salad', isOptional: false, orderInRecipe: 18 },
    { foodItemKey: 'CUCUMBER', quantityGrams: 60, cookedWeightFactor: 1.0, prepNote: 'sliced — for salad', isOptional: false, orderInRecipe: 19 },
    { foodItemKey: 'FRESH_CORIANDER', quantityGrams: 8, cookedWeightFactor: 1.0, prepNote: 'garnish', isOptional: false, orderInRecipe: 20 },
  ],
  steps: [
    {
      stepNumber: 1, title: 'Sauté the aromatics',
      instruction: 'Heat oil in a kadai over medium-high heat. Add finely diced onion and cook 4 minutes until soft and beginning to colour. Add minced garlic, grated ginger, and green chilli — cook 2 minutes. Add diced capsicum and toss 2 minutes until slightly softened but still with crunch. Add diced tomato and cook 3 minutes until soft and most moisture is gone. The base should be dry — paneer bhurji with a wet base goes soggy and watery.',
      durationMins: 12, technique: 'saute',
      kitchenNote: 'Bhurji must be dry. If the tomato releases too much water, increase heat and cook off moisture before adding paneer.'
    },
    {
      stepNumber: 2, title: 'Add spices and bloom',
      instruction: 'Reduce heat to medium. Add turmeric, red chilli powder, and coriander powder. Stir continuously for 60 seconds until the spices are fragrant and darken slightly. The spices must be bloomed in the oil — adding them after the paneer produces a raw, gritty spice flavour.',
      durationMins: 2, technique: 'saute',
      kitchenNote: 'This 60-second spice bloom is the difference between restaurant bhurji and home bhurji. Do not skip.'
    },
    {
      stepNumber: 3, title: 'Add paneer and scramble',
      instruction: 'Add crumbled paneer to the masala base. Fold gently using a spatula — do not stir aggressively or the paneer becomes paste. Cook on medium heat 3 minutes, folding every minute, until the paneer is coated in the masala and heated through. Add garam masala, crushed kasuri methi, freshly cracked black pepper, and lemon juice. Fold once more. The bhurji should look like golden scrambled eggs with red and green flecks. Taste — bold, slightly tangy, peppery.',
      durationMins: 5, technique: 'saute',
      kitchenNote: 'Paneer bhurji holds well at 65°C for 30 min. Beyond that, the paneer continues cooking and goes chalky. Batch-cook in 20-min windows.'
    },
    {
      stepNumber: 4, title: 'Pack with brown rice and salad',
      instruction: 'Pack paneer bhurji in main compartment. Brown rice in second compartment. Julienned raw capsicum and sliced cucumber tossed with lemon juice and a pinch of salt in side compartment. Garnish bhurji with fresh coriander.',
      durationMins: 2, technique: 'assemble',
      kitchenNote: 'This box has the highest protein of all lunches — mark it prominently for customers tracking macros.'
    },
  ],
}

// ---------------------------------------------------------------------------
// FI MAP — needed to look up food item IDs
// ---------------------------------------------------------------------------
const STATIC_FI: Record<string, string> = {
  BASMATI_RICE_COOKED: 'cmpa7mnoq000420ugxi69878u',
  ROTI:                'cmpa7mo3p000520ug80thl0j1',
  POHA:                'cmpa7mowz000720ugt8luwuwl',
  UPMA:                'cmpa7mpbl000820ug0fkxm9hi',
  IDLI:                'cmpa7mpq7000920ugn8criyqu',
  OATS_DRY:            'cmpa7mrcl000d20ug44sudfy1',
  TOOR_DAL:            'cmpa7mrr5000e20ugylkmb052',
  MASOOR_DAL:          'cmpa7ms5z000f20ugxi4zujc7',
  RAJMA:               'cmpa7msz1000h20ugho8x65z4',
  CHICKPEAS:           'cmpa7mtdr000i20ugbveydv96',
  MOONG_DAL:           'cmpa7mts7000j20ugwrxdvixk',
  SPINACH:             'cmpa7mul3000l20ugu6394ti0',
  TOMATO:              'cmpa7mve4000n20ugo3xfeg9c',
  ONION:               'cmpa7mvsm000o20ugl9gw7jsg',
  CAULIFLOWER:         'cmpa7mw74000p20ugbom3l88u',
  CARROT:              'cmpa7mwlm000q20ug4y1k1x9h',
  CURD_LOWFAT:         'cmpa7mxt5000t20ugxr5f2cwd',
  GHEE:                'cmpa7mz0i000w20ug62y9fvdi',
  EGG_WHOLE:           'cmpa7mztp000y20ugwqtde2oy',
  EGG_WHITE:           'cmpa7n088000z20ug4m7mrhol',
  CHICKEN_BREAST:      'cmpa7n0ms001020ugudjs4vcu',
  CHICKEN_THIGH:       'cmpa7n1fw001220ugyx5p9ias',
  ROHU_FISH:           'cmpa7n28z001420ugk1606cpz',
  SALMON:              'cmpa7n1ue001320ug9jm92i8w',
  ALMONDS:             'cmpa7n2np001520ugwzq8nd8t',
  PEANUTS:             'cmpa7n3gl001720ug266ps0ie',
  CHIA_SEEDS:          'cmpa7n3v3001820ugx6y99v73',
  BANANA:              'cmpa7n49q001920ugxfm9uzdh',
  PANEER:              'cmpa7mx03000r20ug1ccnyy5o',
  CURD_FULLFAT:        'cmpa7mxeo000s20ugrqe6zkvr',
}

const DYNAMIC_FI: Record<string, string> = {}

function getFoodItemId(key: string): string | null {
  if (STATIC_FI[key]) return STATIC_FI[key]
  if (DYNAMIC_FI[key]) return DYNAMIC_FI[key]
  return null
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------
async function patch() {
  console.log('\n🔧 FitFuel patch-wl-veg starting...\n')

  // ── Step 1: Create SALT and JAGGERY ──────────────────────────────────────
  console.log('📦 Step 1: Creating missing SALT and JAGGERY food items...\n')

  for (const item of ITEMS_TO_CREATE) {
    const key = item.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    const existing = await prisma.foodItem.findFirst({ where: { name: item.name } })
    if (existing) {
      DYNAMIC_FI[key] = existing.id
      console.log(`⏭️  Exists: ${item.name} → ${existing.id}`)
    } else {
      const created = await prisma.foodItem.create({
        data: {
          name: item.name, category: item.category,
          per100Calories: item.per100Calories, per100Protein: item.per100Protein,
          per100Carbs: item.per100Carbs, per100Fat: item.per100Fat,
          per100Fiber: item.per100Fiber, isCustom: false,
        },
      })
      DYNAMIC_FI[key] = created.id
      console.log(`✅ Created: ${item.name} → ${created.id}`)
    }
  }

  // Also load all other dynamic FI from DB (the ones created in run 1)
  const dynamicNames = [
    'Garlic','Ginger','Green Chilli','Fresh Coriander','Fresh Mint','Curry Leaves',
    'Mustard Oil','Olive Oil','Groundnut Oil','Cumin Seeds','Mustard Seeds',
    'Turmeric Powder','Coriander Powder','Red Chilli Powder','Garam Masala',
    'Kashmiri Red Chilli Powder','Hing','Black Pepper','Fenugreek Seeds',
    'Kasuri Methi','Amchur Powder','Cinnamon','Cardamom','Fennel Seeds','Cloves',
    'Bay Leaves','Lemon Juice','Tamarind','Hung Curd','Paneer Low Fat',
    'Capsicum','Broccoli','Methi Leaves','Sweet Potato','Cucumber','Lauki',
    'Bhindi','Green Peas','Beetroot','Eggplant','Drumstick','Ridge Gourd',
    'Pumpkin','Pomegranate Arils','Brown Rice Cooked','Ragi Flour','Jowar Flour',
    'Bajra Flour','Dalia','Chickpea Flour','Makhana','Tofu','Soya Chunks',
    'Sesame Seeds','Flaxseeds','Pumpkin Seeds','Walnuts','Matki','Kala Chana',
  ]
  for (const name of dynamicNames) {
    const fi = await prisma.foodItem.findFirst({ where: { name } })
    if (fi) {
      const key = name.toUpperCase().replace(/[^A-Z0-9]/g, '_')
      DYNAMIC_FI[key] = fi.id
    }
  }

  // ── Step 2: Fix SALT ingredient links on all 29 existing recipes ─────────
  console.log('\n🔗 Step 2: Adding missing SALT ingredient to all 29 recipes...\n')

  const saltId = DYNAMIC_FI['SALT']
  const jaggeryId = DYNAMIC_FI['JAGGERY']

  if (!saltId) { console.error('❌ SALT not found in DB — aborting'); process.exit(1) }
  if (!jaggeryId) { console.error('❌ JAGGERY not found in DB — aborting'); process.exit(1) }

  // Recipes that need SALT added (all 29)
  const allRecipes = await prisma.recipe.findMany({
    where: { planCategories: { has: 'weight_loss' }, dietaryTags: { has: 'VEGETARIAN' } },
    include: { ingredients: true },
  })

  let saltFixed = 0
  let jaggeryFixed = 0

  for (const recipe of allRecipes) {
    const hasSalt = recipe.ingredients.some(i => i.foodItemId === saltId)
    if (!hasSalt) {
      // Find the max orderInRecipe and append salt at the end
      const maxOrder = recipe.ingredients.reduce((max, i) => Math.max(max, i.orderInRecipe), 0)
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          foodItemId: saltId,
          quantityGrams: 2,
          cookedWeightFactor: 1.0,
          prepNote: null,
          isOptional: false,
          orderInRecipe: maxOrder + 1,
        },
      })
      saltFixed++
      console.log(`✅ SALT added → ${recipe.name}`)
    }

    // Makhana Chaat and Bharli Vangi need JAGGERY
    if (
      recipe.slug === 'rajasthani-makhana-chaat-tamarind-wl-veg' ||
      recipe.slug === 'maharashtrian-bharli-vangi-bhakri-wl-veg'
    ) {
      const hasJaggery = recipe.ingredients.some(i => i.foodItemId === jaggeryId)
      if (!hasJaggery) {
        const maxOrder = recipe.ingredients.reduce((max, i) => Math.max(max, i.orderInRecipe), 0)
        await prisma.recipeIngredient.create({
          data: {
            recipeId: recipe.id,
            foodItemId: jaggeryId,
            quantityGrams: recipe.slug === 'rajasthani-makhana-chaat-tamarind-wl-veg' ? 5 : 5,
            cookedWeightFactor: 1.0,
            prepNote: null,
            isOptional: false,
            orderInRecipe: maxOrder + 1,
          },
        })
        jaggeryFixed++
        console.log(`✅ JAGGERY added → ${recipe.name}`)
      }
    }
  }

  console.log(`\n✅ SALT fixed on ${saltFixed} recipes`)
  console.log(`✅ JAGGERY fixed on ${jaggeryFixed} recipes`)

  // ── Step 3: Add the missing 10th lunch recipe ─────────────────────────────
  console.log('\n🍽️  Step 3: Seeding missing 10th lunch recipe...\n')

  const existingLunch = await prisma.recipe.findUnique({
    where: { slug: MISSING_LUNCH.recipe.slug },
    include: { ingredients: true },
  })

  let newRecipeId: string

  if (existingLunch && existingLunch.ingredients.length > 0) {
    console.log(`⏭️  Already exists with ingredients: ${MISSING_LUNCH.recipe.name}`)
    newRecipeId = existingLunch.id
  } else {
    let recipe: { id: string }
    if (existingLunch) {
      recipe = existingLunch
      console.log(`♻️  Re-seeding orphaned: ${MISSING_LUNCH.recipe.name}`)
    } else {
      recipe = await prisma.recipe.create({ data: MISSING_LUNCH.recipe })
      console.log(`✅ Created recipe: ${MISSING_LUNCH.recipe.name}`)
    }
    newRecipeId = recipe.id

    let errs = 0
    for (const ing of MISSING_LUNCH.ingredients) {
      const id = getFoodItemId(ing.foodItemKey)
      if (!id) { console.log(`  ⚠️  Missing key: ${ing.foodItemKey}`); errs++; continue }
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id, foodItemId: id,
          quantityGrams: ing.quantityGrams, cookedWeightFactor: ing.cookedWeightFactor,
          prepNote: ing.prepNote ?? null, isOptional: ing.isOptional, orderInRecipe: ing.orderInRecipe,
        },
      })
    }
    for (const step of MISSING_LUNCH.steps) {
      await prisma.recipeStep.create({
        data: {
          recipeId: recipe.id, stepNumber: step.stepNumber,
          title: step.title, instruction: step.instruction,
          durationMins: step.durationMins ?? null,
          technique: step.technique ?? null,
          kitchenNote: step.kitchenNote ?? null,
          imageUrl: null,
        },
      })
    }
    console.log(`✅ Continental_Indian | LUNCH | ${MISSING_LUNCH.recipe.name} (${MISSING_LUNCH.ingredients.length} ing, ${MISSING_LUNCH.steps.length} steps) ${errs > 0 ? `⚠️ ${errs} missing keys` : ''}`)
  }

  // ── Step 4: Rebuild the 30-day schedule with 30 recipes ──────────────────
  console.log('\n📅 Step 4: Rebuilding 30-day schedule with all 30 recipes...\n')

  const mealPlan = await prisma.mealPlan.findUnique({ where: { slug: 'weight-loss-veg' } })
  if (!mealPlan) {
    console.log('⚠️  MealPlan "weight-loss-veg" not found')
  } else {
    const deleted = await prisma.planScheduleSlot.deleteMany({ where: { mealPlanId: mealPlan.id } })
    console.log(`🗑️  Cleared ${deleted.count} existing schedule slots`)

    const recipes = await prisma.recipe.findMany({
      where: { planCategories: { has: 'weight_loss' }, dietaryTags: { has: 'VEGETARIAN' } },
    })

    const bySlot: Record<string, typeof recipes> = {
      BREAKFAST: recipes.filter(r => r.mealType === 'BREAKFAST'),
      LUNCH:     recipes.filter(r => r.mealType === 'LUNCH'),
      SNACK:     recipes.filter(r => r.mealType === 'SNACK'),
      DINNER:    recipes.filter(r => r.mealType === 'DINNER'),
    }

    let slotsCreated = 0
    const SLOTS = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as const

    for (let day = 1; day <= 30; day++) {
      for (const slot of SLOTS) {
        const slotRecipes = bySlot[slot]
        if (!slotRecipes || slotRecipes.length === 0) continue
        const recipe = slotRecipes[(day - 1) % slotRecipes.length]
        await prisma.planScheduleSlot.create({
          data: {
            mealPlanId: mealPlan.id,
            dayNumber: day,
            mealSlot: slot as any,
            recipeId: recipe.id,
            servingMultiplier: 1.0,
          },
        })
        slotsCreated++
      }
    }

    console.log(`✅ Schedule rebuilt: ${slotsCreated} slots across 30 days`)
    console.log(`   BREAKFAST: ${bySlot.BREAKFAST.length} unique recipes`)
    console.log(`   LUNCH:     ${bySlot.LUNCH.length} unique recipes`)
    console.log(`   SNACK:     ${bySlot.SNACK.length} unique recipes`)
    console.log(`   DINNER:    ${bySlot.DINNER.length} unique recipes`)
  }

  // ── Step 5: Final verification counts ────────────────────────────────────
  const recipeCount   = await prisma.recipe.count({ where: { planCategories: { has: 'weight_loss' }, dietaryTags: { has: 'VEGETARIAN' } } })
  const ingCount      = await prisma.recipeIngredient.count()
  const slotCount     = await prisma.planScheduleSlot.count({ where: { mealPlan: { slug: 'weight-loss-veg' } } })
  const nullIngCount  = await prisma.recipeIngredient.count({ where: { foodItemId: '' } })

  console.log('\n─────────────────────────────────────────────────')
  console.log(`📊 Final verification:`)
  console.log(`   Recipes (wl-veg):     ${recipeCount}  (expected: 30)`)
  console.log(`   RecipeIngredients:    ${ingCount}`)
  console.log(`   ScheduleSlots:        ${slotCount}  (expected: 120)`)
  console.log(`   Null ingredient IDs:  ${nullIngCount} (expected: 0)`)
  console.log('─────────────────────────────────────────────────')

  if (recipeCount === 30 && slotCount === 120) {
    console.log('✅ weight-loss-veg plan is COMPLETE and verified.')
    console.log('\nNEXT: npx tsx prisma/seed-recipes-weight-loss-egg.ts')
  } else {
    console.log('⚠️  Counts do not match expected. Check Prisma Studio.')
  }
}

patch()
  .catch(e => { console.error('💥 Patch failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); pool.end() })