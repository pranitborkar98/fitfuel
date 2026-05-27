#!/usr/bin/env ts-node
/**
 * FitFuel Seed Generator v5.0 — CLAUDE API + INDIA-FIRST EDITION
 *
 * CHANGES vs v4.1:
 *  1. OpenAI → Claude API (claude-sonnet-4-5 via @anthropic-ai/sdk)
 *  2. CUISINE_MATRIX rewritten — 80% Indian regional, 20% Indian fusion
 *  3. Pune cloud kitchen sourcing mandate added to every prompt
 *  4. NEW_ID_* items removed from FI_MAP — they get created at seed time
 *     via missingFoodItems (no separate seed-food-items-core.ts needed)
 *  5. Cuisine diversity prompt updated to enforce India-first ordering
 *
 * WHAT'S UNCHANGED vs v4.1:
 *  - All 113 plan definitions
 *  - All plan-specific mandates (diabetic, PCOS, keto, heart, Jain, etc.)
 *  - Macro calculation engine (FI_MACROS + FALLBACK_MACROS ~400 ingredients)
 *  - Zod schemas, retry logic, batch size management
 *  - writeSeedFile() output format
 *  - File assembler format
 */

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import * as prettier from 'prettier';

console.log('🔍 [v5.0] FitFuel Seed Generator starting...');
console.log('🔍 [v5.0] CWD:', process.cwd());
console.log('🔍 [v5.0] ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
console.log('🔍 [v5.0] argv:', process.argv.slice(2));

// ─────────────────────────────────────────────────────────────────────────────
// 1. DB FOOD ITEM IDs — ONLY the 30 verified items with real DB IDs
//    All other ingredients (garlic, ginger, oils, spices etc.) will be
//    declared in missingFoodItems by the LLM and created at seed time.
//    This eliminates the NEW_ID_* problem entirely.
// ─────────────────────────────────────────────────────────────────────────────
const FI_MAP: Record<string, string> = {
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
};

const FI_MACROS: Record<string, { cal: number; pro: number; carb: number; fat: number; fib: number }> = {
  BASMATI_RICE_COOKED: { cal: 130,  pro: 2.7,  carb: 28.2, fat: 0.3,   fib: 0.4  },
  ROTI:                { cal: 264,  pro: 8.0,  carb: 52.0, fat: 3.7,   fib: 3.5  },
  POHA:                { cal: 130,  pro: 2.1,  carb: 28.0, fat: 0.5,   fib: 1.1  },
  UPMA:                { cal: 160,  pro: 3.5,  carb: 28.0, fat: 4.0,   fib: 1.5  },
  IDLI:                { cal: 58,   pro: 2.0,  carb: 11.0, fat: 0.3,   fib: 0.5  },
  OATS_DRY:            { cal: 389,  pro: 16.9, carb: 66.3, fat: 6.9,   fib: 10.6 },
  TOOR_DAL:            { cal: 343,  pro: 22.3, carb: 60.5, fat: 1.1,   fib: 15.0 },
  MASOOR_DAL:          { cal: 353,  pro: 24.6, carb: 62.5, fat: 1.1,   fib: 10.7 },
  RAJMA:               { cal: 333,  pro: 23.5, carb: 59.9, fat: 0.8,   fib: 15.4 },
  CHICKPEAS:           { cal: 364,  pro: 19.3, carb: 60.6, fat: 6.0,   fib: 17.4 },
  MOONG_DAL:           { cal: 347,  pro: 24.0, carb: 59.9, fat: 1.2,   fib: 16.3 },
  SPINACH:             { cal: 23,   pro: 2.9,  carb: 3.6,  fat: 0.4,   fib: 2.2  },
  TOMATO:              { cal: 18,   pro: 0.9,  carb: 3.9,  fat: 0.2,   fib: 1.2  },
  ONION:               { cal: 40,   pro: 1.1,  carb: 9.3,  fat: 0.1,   fib: 1.7  },
  CAULIFLOWER:         { cal: 25,   pro: 1.9,  carb: 5.0,  fat: 0.3,   fib: 2.0  },
  CARROT:              { cal: 41,   pro: 0.9,  carb: 9.6,  fat: 0.2,   fib: 2.8  },
  CURD_LOWFAT:         { cal: 63,   pro: 5.3,  carb: 7.0,  fat: 1.5,   fib: 0.0  },
  GHEE:                { cal: 900,  pro: 0.0,  carb: 0.0,  fat: 99.9,  fib: 0.0  },
  EGG_WHOLE:           { cal: 155,  pro: 13.0, carb: 1.1,  fat: 11.0,  fib: 0.0  },
  EGG_WHITE:           { cal: 52,   pro: 11.0, carb: 0.7,  fat: 0.2,   fib: 0.0  },
  CHICKEN_BREAST:      { cal: 120,  pro: 22.5, carb: 0.0,  fat: 2.6,   fib: 0.0  },
  CHICKEN_THIGH:       { cal: 177,  pro: 18.0, carb: 0.0,  fat: 11.0,  fib: 0.0  },
  ROHU_FISH:           { cal: 111,  pro: 18.2, carb: 0.0,  fat: 3.8,   fib: 0.0  },
  SALMON:              { cal: 208,  pro: 20.0, carb: 0.0,  fat: 13.4,  fib: 0.0  },
  ALMONDS:             { cal: 579,  pro: 21.2, carb: 21.6, fat: 49.9,  fib: 12.5 },
  PEANUTS:             { cal: 567,  pro: 25.8, carb: 16.1, fat: 49.2,  fib: 8.5  },
  CHIA_SEEDS:          { cal: 486,  pro: 16.5, carb: 42.1, fat: 30.7,  fib: 34.4 },
  BANANA:              { cal: 89,   pro: 1.1,  carb: 22.8, fat: 0.3,   fib: 2.6  },
  PANEER:              { cal: 265,  pro: 18.3, carb: 1.2,  fat: 20.8,  fib: 0.0  },
  CURD_FULLFAT:        { cal: 98,   pro: 3.5,  carb: 4.7,  fat: 7.0,   fib: 0.0  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. ZOD SCHEMAS (unchanged from v4.1)
// ─────────────────────────────────────────────────────────────────────────────
const MissingFoodItemSchema = z.object({
  name:           z.string(),
  key:            z.string(),
  category:       z.string(),
  per100Calories: z.number().min(0),
  per100Protein:  z.number().min(0),
  per100Carbs:    z.number().min(0),
  per100Fat:      z.number().min(0),
  per100Fiber:    z.number().min(0),
});

const IngredientSchema = z.object({
  foodItemKey:        z.string().min(3),
  quantityGrams:      z.number().positive(),
  cookedWeightFactor: z.number().optional().default(1.0),
  prepNote:           z.string().optional(),
  isOptional:         z.boolean().optional().default(false),
  orderInRecipe:      z.number().optional(),
});

const StepSchema = z.object({
  stepNumber:   z.number(),
  title:        z.string(),
  instruction:  z.string().min(20),
  durationMins: z.number().optional(),
  temperatureC: z.number().optional(),
  technique:    z.string().optional(),
  kitchenNote:  z.string().optional(),
});

const RecipeInputSchema = z.object({
  name:             z.string(),
  slug:             z.string(),
  description:      z.string().min(80),
  shortDescription: z.string().max(80),
  cuisineType:      z.string(),
  mealType:         z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  dietaryTags:      z.array(z.string()),
  planCategories:   z.array(z.string()),
  servingSizeGrams: z.number().positive(),
  prepTimeMins:     z.number(),
  cookTimeMins:     z.number(),
  difficulty:       z.enum(['easy', 'medium', 'hard']),
  equipmentNeeded:  z.array(z.string()),
  allergens:        z.array(z.string()),
  shelfLifeHours:   z.number(),
  packagingType:    z.string(),
  kitchenStation:   z.string(),
  seasonTags:       z.array(z.string()),
  rotationGroup:    z.number().min(1).max(10),
  isFeatured:       z.boolean(),
  platingSummary:   z.string().optional(),
  ingredients:      z.array(IngredientSchema),
  steps:            z.array(StepSchema),
});

const BatchSchema = z.object({
  missingFoodItems: z.array(MissingFoodItemSchema).default([]),
  recipes:          z.array(RecipeInputSchema),
});

type MissingFoodItem = z.infer<typeof MissingFoodItemSchema>;
type RecipeInput     = z.infer<typeof RecipeInputSchema>;
type Ingredient      = z.infer<typeof IngredientSchema>;
type Step            = z.infer<typeof StepSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 3. CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) throw new Error('❌ Missing ANTHROPIC_API_KEY in .env');
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const OUTPUT_DIR    = path.join(process.cwd(), 'output');
const PROGRESS_FILE = path.join(process.cwd(), 'seed-progress.json');
const BATCH_SIZE    = 3;
const DELAY_BATCH   = 2500;
const DELAY_PLAN    = 4000;
const MAX_RETRIES   = 4;

// ─────────────────────────────────────────────────────────────────────────────
// 4. PLAN LIST (113 plans — unchanged from v4.1)
// ─────────────────────────────────────────────────────────────────────────────
type PlanConfig = {
  slug: string; file: string; planCategory: string; dietVariant: string;
  recipeCount: number; cal: number; protein: number; description: string;
};

const PLAN_LIST: PlanConfig[] = [
  // ── STANDARD (21) ─────────────────────────────────────────────────────────
  { slug:'weight-loss-veg',              file:'seed-recipes-weight-loss-veg.ts',              planCategory:'weight_loss',           dietVariant:'VEG',     recipeCount:30, cal:1600, protein:100, description:'High-protein calorie-deficit vegetarian. 400-500 kcal deficit. High fibre, low GI. No refined sugar, no maida, no fried food.' },
  { slug:'weight-loss-egg',              file:'seed-recipes-weight-loss-egg.ts',              planCategory:'weight_loss',           dietVariant:'EGG',     recipeCount:30, cal:1600, protein:110, description:'Weight loss eggetarian. Eggs as primary protein anchor. High satiety. Controlled carbs. Low GI.' },
  { slug:'weight-loss-non-veg',          file:'seed-recipes-weight-loss-non-veg.ts',          planCategory:'weight_loss',           dietVariant:'NON_VEG', recipeCount:28, cal:1650, protein:130, description:'Weight loss non-veg. Lean chicken and fish. Very high protein (2.0g/kg). 500 kcal deficit. Grilled, steamed, baked only.' },
  { slug:'muscle-gain-veg',              file:'seed-recipes-muscle-gain-veg.ts',              planCategory:'muscle_gain',           dietVariant:'VEG',     recipeCount:30, cal:2200, protein:150, description:'Muscle gain vegetarian. 300-400 kcal surplus. Very high protein from paneer, soy, legumes, dairy. Complete amino acid combining.' },
  { slug:'muscle-gain-egg',              file:'seed-recipes-muscle-gain-egg.ts',              planCategory:'muscle_gain',           dietVariant:'EGG',     recipeCount:30, cal:2200, protein:155, description:'Muscle gain eggetarian. Eggs as primary protein. 350 kcal surplus. High leucine meals. Carb cycling on training days.' },
  { slug:'muscle-gain-non-veg',          file:'seed-recipes-muscle-gain-non-veg.ts',          planCategory:'muscle_gain',           dietVariant:'NON_VEG', recipeCount:30, cal:2300, protein:170, description:'Muscle gain non-veg. Clean 350 kcal surplus. Very high protein from chicken, fish, eggs. Carb cycling. Post-workout meals timed for anabolic response.' },
  { slug:'balanced-veg',                 file:'seed-recipes-balanced-veg.ts',                 planCategory:'balanced',              dietVariant:'VEG',     recipeCount:30, cal:1900, protein:110, description:'Balanced maintenance vegetarian. 40/30/30 macros. Full micronutrient coverage. Seasonal Indian food. Gut health focus.' },
  { slug:'balanced-egg',                 file:'seed-recipes-balanced-egg.ts',                 planCategory:'balanced',              dietVariant:'EGG',     recipeCount:30, cal:1900, protein:115, description:'Balanced eggetarian maintenance. Eggs as protein anchor. Wide variety. Full micronutrient coverage. No processed foods.' },
  { slug:'balanced-non-veg',             file:'seed-recipes-balanced-non-veg.ts',             planCategory:'balanced',              dietVariant:'NON_VEG', recipeCount:30, cal:1950, protein:125, description:'Balanced non-veg maintenance. Chicken, fish, eggs rotated. Full micronutrient coverage. Anti-inflammatory. Wide variety.' },
  { slug:'balanced-jain',                file:'seed-recipes-balanced-jain.ts',                planCategory:'jain',                  dietVariant:'JAIN',    recipeCount:30, cal:1800, protein:100, description:'Jain balanced plan. NO root vegetables (potato, carrot, onion, garlic, beetroot, radish, turnip). No non-veg. High protein via dal, paneer, soy, dairy.' },
  { slug:'intermittent-fasting-veg',     file:'seed-recipes-intermittent-fasting-veg.ts',     planCategory:'intermittent_fasting',  dietVariant:'VEG',     recipeCount:25, cal:1650, protein:105, description:'16:8 IF vegetarian. 3 meals only (no SNACK). First meal at 12pm breaks fast (protein+fat). Largest meal at lunch. Light dinner.' },
  { slug:'intermittent-fasting-non-veg', file:'seed-recipes-intermittent-fasting-non-veg.ts', planCategory:'intermittent_fasting',  dietVariant:'NON_VEG', recipeCount:25, cal:1700, protein:130, description:'16:8 IF non-veg. 3 meals only. Dense protein from lean meats in compressed eating window. Break-fast: protein+fat first.' },
  { slug:'vegan-muscle',                 file:'seed-recipes-vegan-muscle.ts',                 planCategory:'vegan_muscle',          dietVariant:'VEGAN',   recipeCount:30, cal:2100, protein:140, description:'Vegan muscle gain. NO animal products. Tofu, tempeh, soy milk, legumes, seeds. Complete protein combining at every meal. 300 kcal surplus.' },
  { slug:'keto-indian-veg',              file:'seed-recipes-keto-indian-veg.ts',              planCategory:'keto',                  dietVariant:'VEG',     recipeCount:25, cal:1650, protein:95,  description:'Indian keto vegetarian. UNDER 50g net carbs/day. NO grains (rice, roti, oats, bread). High fat (ghee, coconut, nuts, cream). Paneer-heavy. Indian spices.' },
  { slug:'keto-indian-non-veg',          file:'seed-recipes-keto-indian-non-veg.ts',          planCategory:'keto',                  dietVariant:'NON_VEG', recipeCount:25, cal:1700, protein:130, description:'Indian keto non-veg. UNDER 50g net carbs. NO grains. Chicken, fish, eggs as protein. Ghee, coconut oil as fats. Indian flavours without carbs.' },
  { slug:'body-recomp-veg',              file:'seed-recipes-body-recomp-veg.ts',              planCategory:'body_recomp',           dietVariant:'VEG',     recipeCount:25, cal:1850, protein:135, description:'Body recomposition vegetarian. Very high protein (2.0g/kg). Carb cycling: high on training days, low on rest days. Mild deficit on rest days.' },
  { slug:'body-recomp-non-veg',          file:'seed-recipes-body-recomp-non-veg.ts',          planCategory:'body_recomp',           dietVariant:'NON_VEG', recipeCount:25, cal:1950, protein:155, description:'Body recomposition non-veg. Very high protein (2.2g/kg) from lean meats. Training day slight surplus with high carbs. Rest day 200-300 kcal deficit.' },
  { slug:'lean-bulk-veg',                file:'seed-recipes-lean-bulk-veg.ts',                planCategory:'lean_bulk',             dietVariant:'VEG',     recipeCount:25, cal:2100, protein:145, description:'Lean bulk vegetarian. TIGHT 200-300 kcal surplus only. High protein. Clean food sources. Carb timing. No dirty bulk.' },
  { slug:'lean-bulk-non-veg',            file:'seed-recipes-lean-bulk-non-veg.ts',            planCategory:'lean_bulk',             dietVariant:'NON_VEG', recipeCount:25, cal:2150, protein:165, description:'Lean bulk non-veg. Tight 200-300 kcal surplus. Very high protein from lean chicken and fish. Controlled fat. Minimal fat gain.' },
  { slug:'cutting-veg',                  file:'seed-recipes-cutting-veg.ts',                  planCategory:'cutting',               dietVariant:'VEG',     recipeCount:25, cal:1400, protein:120, description:'Cutting phase vegetarian. 500-600 kcal deficit. Maximum protein to preserve muscle. Very low carbs on rest days. High volume low calorie density.' },
  { slug:'cutting-non-veg',              file:'seed-recipes-cutting-non-veg.ts',              planCategory:'cutting',               dietVariant:'NON_VEG', recipeCount:25, cal:1400, protein:145, description:'Cutting phase non-veg. 500-600 kcal deficit. Highest protein (2.4-2.5g/kg) from lean meats. Minimal fat. Near zero carbs except around workouts.' },
  // ── MEDICAL (37) ──────────────────────────────────────────────────────────
  { slug:'pcos-veg',                     file:'seed-recipes-pcos-veg.ts',                     planCategory:'pcos',                  dietVariant:'VEG',     recipeCount:30, cal:1600, protein:105, description:'PCOS/PCOD vegetarian. Low GI carbs ONLY (GI under 55). Anti-inflammatory: omega-3, turmeric, ginger. High fibre. No refined sugar. Zinc and magnesium-rich.' },
  { slug:'pcos-non-veg',                 file:'seed-recipes-pcos-non-veg.ts',                 planCategory:'pcos',                  dietVariant:'NON_VEG', recipeCount:30, cal:1650, protein:120, description:'PCOS/PCOD non-veg. Low GI carbs. Omega-3 fish 4x/week. Lean chicken and fish. No red meat more than 1x/week. No dairy excess.' },
  { slug:'diabetic-veg',                 file:'seed-recipes-diabetic-veg.ts',                 planCategory:'diabetic',              dietVariant:'VEG',     recipeCount:30, cal:1700, protein:105, description:'Diabetic-friendly vegetarian. Low GI every meal. Controlled carb portions (45-60g/meal). High fibre. Protein at every meal. No sugar in any form.' },
  { slug:'diabetic-non-veg',             file:'seed-recipes-diabetic-non-veg.ts',             planCategory:'diabetic',              dietVariant:'NON_VEG', recipeCount:30, cal:1700, protein:120, description:'Diabetic-friendly non-veg. Lean protein at every meal. Low GI carbs in controlled portions. Omega-3 fish for insulin sensitivity. High fibre always.' },
  { slug:'pre-diabetic-veg',             file:'seed-recipes-pre-diabetic-veg.ts',             planCategory:'pre_diabetic',          dietVariant:'VEG',     recipeCount:25, cal:1600, protein:100, description:'Pre-diabetes vegetarian. Low GI carbs to normalise blood sugar. Weight loss component. High fibre. Regular meal timing.' },
  { slug:'pre-diabetic-non-veg',         file:'seed-recipes-pre-diabetic-non-veg.ts',         planCategory:'pre_diabetic',          dietVariant:'NON_VEG', recipeCount:25, cal:1650, protein:115, description:'Pre-diabetes non-veg. Lean protein at every meal. Low GI controlled carbs. Anti-inflammatory omega-3 from fish. No sugar, no white grains.' },
  { slug:'thyroid-veg',                  file:'seed-recipes-thyroid-veg.ts',                  planCategory:'thyroid',               dietVariant:'VEG',     recipeCount:25, cal:1550, protein:95,  description:'Hypothyroid support vegetarian. Selenium-rich foods. GOITROGENIC VEGETABLES ALWAYS COOKED NEVER RAW. Zinc-rich. Moderate calories for low metabolic rate.' },
  { slug:'thyroid-non-veg',              file:'seed-recipes-thyroid-non-veg.ts',              planCategory:'thyroid',               dietVariant:'NON_VEG', recipeCount:25, cal:1600, protein:110, description:'Hypothyroid support non-veg. Selenium-rich fish (rohu, mackerel) 4x/week. Iodine from seafood and eggs. All goitrogenic vegetables cooked only.' },
  { slug:'heart-health-veg',             file:'seed-recipes-heart-health-veg.ts',             planCategory:'heart_health',          dietVariant:'VEG',     recipeCount:25, cal:1750, protein:95,  description:'Heart and cholesterol vegetarian. DASH-inspired. Very LOW saturated fat. Olive oil as primary fat. High omega-3 from flaxseed. Soluble fibre. Sodium under 1500mg/day.' },
  { slug:'heart-health-non-veg',         file:'seed-recipes-heart-health-non-veg.ts',         planCategory:'heart_health',          dietVariant:'NON_VEG', recipeCount:25, cal:1750, protein:115, description:'Heart health non-veg. Omega-3 fatty fish 4-5x/week. Lean chicken no skin no frying. Olive oil only. Low sodium. NO red meat, NO processed meats.' },
  { slug:'hypertension-veg',             file:'seed-recipes-hypertension-veg.ts',             planCategory:'hypertension',          dietVariant:'VEG',     recipeCount:25, cal:1750, protein:95,  description:'Hypertension vegetarian. STRICT sodium under 1500mg/day. High potassium (spinach, dal, banana). Magnesium-rich. DASH-adapted Indian food. No pickles, no papad.' },
  { slug:'hypertension-non-veg',         file:'seed-recipes-hypertension-non-veg.ts',         planCategory:'hypertension',          dietVariant:'NON_VEG', recipeCount:25, cal:1750, protein:115, description:'Hypertension non-veg. Sodium under 1500mg/day. Omega-3 fish 4x/week. High potassium vegetables. No processed meats. No fried foods.' },
  { slug:'fatty-liver-veg',              file:'seed-recipes-fatty-liver-veg.ts',              planCategory:'fatty_liver',           dietVariant:'VEG',     recipeCount:25, cal:1600, protein:100, description:'Fatty liver NAFLD vegetarian. Low fat under 25% calories. ZERO alcohol. High antioxidants (turmeric, cruciferous vegetables). Coffee incorporated.' },
  { slug:'fatty-liver-non-veg',          file:'seed-recipes-fatty-liver-non-veg.ts',          planCategory:'fatty_liver',           dietVariant:'NON_VEG', recipeCount:25, cal:1600, protein:115, description:'Fatty liver NAFLD non-veg. Only lean proteins (no red meat, no fried food). Omega-3 fish for hepatic inflammation. ZERO alcohol. Low saturated fat.' },
  { slug:'kidney-health-veg',            file:'seed-recipes-kidney-health-veg.ts',            planCategory:'kidney_health',         dietVariant:'VEG',     recipeCount:25, cal:1800, protein:70,  description:'Kidney health vegetarian. CONTROLLED protein (0.8g/kg, max 70g/day). LOW potassium (leach vegetables). LOW phosphorus (limit dairy, nuts, legumes). LOW sodium.' },
  { slug:'kidney-health-non-veg',        file:'seed-recipes-kidney-health-non-veg.ts',        planCategory:'kidney_health',         dietVariant:'NON_VEG', recipeCount:25, cal:1800, protein:75,  description:'Kidney health non-veg. Controlled protein (max 75g/day). Lean white fish and egg whites (lower phosphorus). Low potassium. Low sodium. No red meat.' },
  { slug:'gout-veg',                     file:'seed-recipes-gout-veg.ts',                     planCategory:'gout',                  dietVariant:'VEG',     recipeCount:25, cal:1700, protein:85,  description:'Uric acid and gout vegetarian. LOW PURINE foods only. Limited dal and spinach. High Vitamin C. Cherry and berry. High hydration. No alcohol, no fructose excess.' },
  { slug:'gout-non-veg',                 file:'seed-recipes-gout-non-veg.ts',                 planCategory:'gout',                  dietVariant:'NON_VEG', recipeCount:25, cal:1700, protein:100, description:'Gout non-veg. LOW PURINE only. NO red meat, NO organ meats, NO shellfish, NO mackerel/sardines. Only low-purine proteins: chicken breast, tilapia. High vitamin C.' },
  { slug:'anaemia-veg',                  file:'seed-recipes-anaemia-veg.ts',                  planCategory:'anaemia',               dietVariant:'VEG',     recipeCount:25, cal:1750, protein:100, description:'Anaemia correction vegetarian. Iron-rich foods at EVERY meal. VITAMIN C PAIRED with every iron-rich meal. B12 from dairy. Folate from greens. No tea/coffee at meals.' },
  { slug:'anaemia-non-veg',              file:'seed-recipes-anaemia-non-veg.ts',              planCategory:'anaemia',               dietVariant:'NON_VEG', recipeCount:25, cal:1750, protein:120, description:'Anaemia correction non-veg. Haem iron from chicken, liver (1x/week), fish. Vitamin C paired at every iron meal. B12 from animal protein. Folate from greens.' },
  { slug:'vitamin-d-veg',                file:'seed-recipes-vitamin-d-veg.ts',                planCategory:'vitamin_d',             dietVariant:'VEG',     recipeCount:20, cal:1750, protein:100, description:'Vitamin D deficiency vegetarian. Mushroom (UV-exposed), fortified milk, eggs, fatty dairy. Vitamin D foods at every meal. Magnesium-rich for D3 activation.' },
  { slug:'vitamin-d-non-veg',            file:'seed-recipes-vitamin-d-non-veg.ts',            planCategory:'vitamin_d',             dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:110, description:'Vitamin D deficiency non-veg. Fatty fish (salmon, mackerel) as primary Vitamin D source. Egg yolks. Fortified dairy. Magnesium-rich foods.' },
  { slug:'b12-deficiency-veg',           file:'seed-recipes-b12-deficiency-veg.ts',           planCategory:'b12_deficiency',        dietVariant:'VEG',     recipeCount:20, cal:1750, protein:100, description:'B12 deficiency vegetarian. B12 from dairy, fortified foods, paneer at every meal. Folate-rich foods. Avoid absorption inhibitors.' },
  { slug:'b12-deficiency-non-veg',       file:'seed-recipes-b12-deficiency-non-veg.ts',       planCategory:'b12_deficiency',        dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:115, description:'B12 deficiency non-veg. Maximum B12 from animal sources: liver (1x/week), fish, chicken, eggs. Folate from greens. Avoid B12 absorption inhibitors.' },
  { slug:'obesity-veg',                  file:'seed-recipes-obesity-veg.ts',                  planCategory:'obesity',               dietVariant:'VEG',     recipeCount:25, cal:1400, protein:110, description:'Obesity management vegetarian. BMI 30+. Moderate 500 kcal deficit (never below 1200 kcal). High protein. High volume high fibre for satiety. No crash dieting.' },
  { slug:'obesity-non-veg',              file:'seed-recipes-obesity-non-veg.ts',              planCategory:'obesity',               dietVariant:'NON_VEG', recipeCount:25, cal:1450, protein:130, description:'Obesity management non-veg. 500 kcal deficit. Very high protein from lean chicken and fish for satiety. Large vegetable volume. No liquid calories.' },
  { slug:'knee-health-veg',              file:'seed-recipes-knee-health-veg.ts',              planCategory:'knee_health',           dietVariant:'VEG',     recipeCount:25, cal:1700, protein:100, description:'Knee and joint health vegetarian. Anti-inflammatory every meal (turmeric, ginger, omega-3). Collagen precursors (Vitamin C + protein). Calcium and Vitamin D.' },
  { slug:'knee-health-non-veg',          file:'seed-recipes-knee-health-non-veg.ts',          planCategory:'knee_health',           dietVariant:'NON_VEG', recipeCount:25, cal:1700, protein:115, description:'Knee health non-veg. Bone broth for natural collagen. Omega-3 fish 4x/week. Anti-inflammatory spices daily. Calcium from dairy and fish.' },
  { slug:'post-surgery-veg',             file:'seed-recipes-post-surgery-veg.ts',             planCategory:'post_surgery',          dietVariant:'VEG',     recipeCount:25, cal:1800, protein:120, description:'Post-surgery recovery vegetarian. Very high protein for tissue repair. Vitamin C at every meal. Zinc-rich for wound healing. Anti-inflammatory. Soft textures.' },
  { slug:'post-surgery-non-veg',         file:'seed-recipes-post-surgery-non-veg.ts',         planCategory:'post_surgery',          dietVariant:'NON_VEG', recipeCount:25, cal:1800, protein:140, description:'Post-surgery recovery non-veg. High protein from easily digestible lean meats and fish. Bone broth daily. Soft textures. Vitamin C pairing. Anti-inflammatory.' },
  { slug:'post-covid-veg',               file:'seed-recipes-post-covid-veg.ts',               planCategory:'post_covid',            dietVariant:'VEG',     recipeCount:25, cal:1750, protein:105, description:'Post-COVID recovery vegetarian. High antioxidants for lung repair (Vitamin C, E, A). Iron-rich for oxygen capacity. B12 and folate for energy. Probiotic foods.' },
  { slug:'post-covid-non-veg',           file:'seed-recipes-post-covid-non-veg.ts',           planCategory:'post_covid',            dietVariant:'NON_VEG', recipeCount:25, cal:1800, protein:130, description:'Post-COVID recovery non-veg. High protein lean meats for immune rebuilding. Omega-3 fish to resolve COVID inflammation. B12 from animal protein. Zinc from meats.' },
  { slug:'cancer-recovery-veg',          file:'seed-recipes-cancer-recovery-veg.ts',          planCategory:'cancer_recovery',       dietVariant:'VEG',     recipeCount:25, cal:1900, protein:110, description:'Cancer recovery vegetarian. High antioxidants. Anti-inflammatory. Easy to digest soft textures. High protein for immune function. Adequate calories to prevent wasting.' },
  { slug:'cancer-recovery-non-veg',      file:'seed-recipes-cancer-recovery-non-veg.ts',      planCategory:'cancer_recovery',       dietVariant:'NON_VEG', recipeCount:25, cal:1900, protein:130, description:'Cancer recovery non-veg. Easily digestible lean protein. High antioxidants. Soft textures. Anti-nausea food choices. Omega-3 for anti-inflammatory support.' },
  { slug:'liver-detox',                  file:'seed-recipes-liver-detox.ts',                  planCategory:'liver_detox',           dietVariant:'VEG',     recipeCount:20, cal:1600, protein:95,  description:'21-day liver detox vegetarian. ZERO alcohol. NO refined sugar. HIGH cruciferous vegetables. Turmeric at every meal. Black coffee incorporated. 3L+ water daily.' },
  { slug:'gut-health-veg',               file:'seed-recipes-gut-health-veg.ts',               planCategory:'gut_health',            dietVariant:'VEG',     recipeCount:25, cal:1700, protein:95,  description:'Gut health IBS vegetarian. Low-FODMAP framework. Probiotic foods daily (curd, fermented). Prebiotic fibre. Gentle cooking. Anti-inflammatory.' },
  { slug:'gut-health-non-veg',           file:'seed-recipes-gut-health-non-veg.ts',           planCategory:'gut_health',            dietVariant:'NON_VEG', recipeCount:25, cal:1750, protein:115, description:'Gut health IBS non-veg. Low-FODMAP proteins (chicken, fish, eggs). Probiotic foods daily. Prebiotic vegetables. No processed meats with additives.' },
  // ── FEMALE-SPECIFIC (12) ───────────────────────────────────────────────────
  { slug:'menopause-veg',                file:'seed-recipes-menopause-veg.ts',                planCategory:'menopause',             dietVariant:'VEG',     recipeCount:25, cal:1650, protein:105, description:'Menopause nutrition vegetarian. High calcium and Vitamin D for bone density. Phytoestrogens from soy and flaxseed. Controlled calories. Omega-3 for heart protection.' },
  { slug:'menopause-non-veg',            file:'seed-recipes-menopause-non-veg.ts',            planCategory:'menopause',             dietVariant:'NON_VEG', recipeCount:25, cal:1650, protein:115, description:'Menopause non-veg. Omega-3 fish 4x/week. High calcium from dairy and fish. Lean protein for muscle preservation. Anti-inflammatory. No alcohol, no excess sodium.' },
  { slug:'fertility-veg',                file:'seed-recipes-fertility-veg.ts',                planCategory:'fertility',             dietVariant:'VEG',     recipeCount:25, cal:1900, protein:110, description:'Fertility pre-conception vegetarian. HIGH FOLATE (leafy greens, legumes, fortified grains). Iron optimisation. Plant DHA from flaxseed. Zinc for egg quality. Antioxidants.' },
  { slug:'fertility-non-veg',            file:'seed-recipes-fertility-non-veg.ts',            planCategory:'fertility',             dietVariant:'NON_VEG', recipeCount:25, cal:1900, protein:125, description:'Fertility pre-conception non-veg. Marine DHA from low-mercury fish (salmon, rohu). Haem iron for pre-pregnancy stores. High folate. No high-mercury fish.' },
  { slug:'post-pregnancy-veg',           file:'seed-recipes-post-pregnancy-veg.ts',           planCategory:'post_pregnancy',        dietVariant:'VEG',     recipeCount:25, cal:2100, protein:115, description:'Post-pregnancy lactation vegetarian. Calorie surplus (300-400 kcal) for breastfeeding. High iron. Calcium at every meal. DHA from flaxseed. Galactagogue foods.' },
  { slug:'post-pregnancy-non-veg',       file:'seed-recipes-post-pregnancy-non-veg.ts',       planCategory:'post_pregnancy',        dietVariant:'NON_VEG', recipeCount:25, cal:2100, protein:135, description:'Post-pregnancy lactation non-veg. Calorie surplus for breastfeeding. DHA from fatty fish. Haem iron from lean meats. Calcium every meal. No high-mercury fish.' },
  { slug:'pms-veg',                      file:'seed-recipes-pms-veg.ts',                      planCategory:'pms',                   dietVariant:'VEG',     recipeCount:20, cal:1750, protein:100, description:'PMS management vegetarian. Magnesium-rich at every meal (seeds, dark greens, dark chocolate). Vitamin B6. LOW sodium to prevent bloating. Anti-inflammatory.' },
  { slug:'pms-non-veg',                  file:'seed-recipes-pms-non-veg.ts',                  planCategory:'pms',                   dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:115, description:'PMS management non-veg. Omega-3 fish 4x/week to reduce prostaglandins. Magnesium from seeds. B6 from chicken. Low sodium. Anti-inflammatory throughout cycle.' },
  { slug:'female-athlete-veg',           file:'seed-recipes-female-athlete-veg.ts',           planCategory:'female_athlete',        dietVariant:'VEG',     recipeCount:25, cal:2000, protein:130, description:'Female athlete vegetarian. Higher iron with Vitamin C pairing (menstrual losses). Calcium at non-iron meals. Plant omega-3. Cycle-aware carb periodisation.' },
  { slug:'female-athlete-non-veg',       file:'seed-recipes-female-athlete-non-veg.ts',       planCategory:'female_athlete',        dietVariant:'NON_VEG', recipeCount:25, cal:2100, protein:145, description:'Female athlete non-veg. Haem iron from lean meats. DHA from fatty fish. Cycle-aware nutrition. Anti-inflammatory. Adequate zinc and magnesium.' },
  { slug:'hormonal-acne-veg',            file:'seed-recipes-hormonal-acne-veg.ts',            planCategory:'hormonal_acne',         dietVariant:'VEG',     recipeCount:20, cal:1650, protein:100, description:'Hormonal acne vegetarian. Strictly LOW GI. Zinc-rich at every meal (pumpkin seeds, legumes). Omega-3 anti-inflammatory. Dairy-optional. No whey protein.' },
  { slug:'hormonal-acne-non-veg',        file:'seed-recipes-hormonal-acne-non-veg.ts',        planCategory:'hormonal_acne',         dietVariant:'NON_VEG', recipeCount:20, cal:1650, protein:115, description:'Hormonal acne non-veg. NO dairy. NO whey. Omega-3 fish for skin anti-inflammation. Zinc from lean meats. Strictly low GI. Anti-inflammatory spices.' },
  // ── SKIN & HAIR (10) ──────────────────────────────────────────────────────
  { slug:'anti-aging-veg',               file:'seed-recipes-anti-aging-veg.ts',               planCategory:'anti_aging',            dietVariant:'VEG',     recipeCount:20, cal:1750, protein:100, description:'Anti-aging collagen vegetarian. High Vitamin C every meal for collagen. Vitamin E from nuts/seeds. Lycopene from cooked tomatoes. Omega-3. No refined sugar.' },
  { slug:'anti-aging-non-veg',           file:'seed-recipes-anti-aging-non-veg.ts',           planCategory:'anti_aging',            dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:115, description:'Anti-aging non-veg. Omega-3 fish 4x/week for skin barrier. Marine collagen precursors. Vitamin C pairing. Lycopene from cooked tomatoes. No refined sugar.' },
  { slug:'acne-skin-veg',                file:'seed-recipes-acne-skin-veg.ts',                planCategory:'acne_skin',             dietVariant:'VEG',     recipeCount:20, cal:1650, protein:100, description:'Acne clearing vegetarian. Strictly LOW GI every meal. Zinc at every meal. Omega-3 from flaxseed. Dairy-optional. Anti-inflammatory. No whey, no refined sugar.' },
  { slug:'acne-skin-non-veg',            file:'seed-recipes-acne-skin-non-veg.ts',            planCategory:'acne_skin',             dietVariant:'NON_VEG', recipeCount:20, cal:1650, protein:115, description:'Acne clearing non-veg. NO dairy throughout. Omega-3 fish for skin anti-inflammation. Zinc from lean meats. Strictly low GI. No whey, no fried foods.' },
  { slug:'hair-health-veg',              file:'seed-recipes-hair-health-veg.ts',              planCategory:'hair_health',           dietVariant:'VEG',     recipeCount:20, cal:1750, protein:105, description:'Hair fall prevention vegetarian. High protein. Iron with Vitamin C pairing every iron meal. Biotin from nuts and seeds. Zinc for follicle health. Selenium.' },
  { slug:'hair-health-non-veg',          file:'seed-recipes-hair-health-non-veg.ts',          planCategory:'hair_health',           dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:120, description:'Hair health non-veg. Eggs 5x/week for biotin. Selenium-rich fish for scalp health. Haem iron from lean meats. High protein. Omega-3 for scalp environment.' },
  { slug:'eczema-veg',                   file:'seed-recipes-eczema-veg.ts',                   planCategory:'eczema',                dietVariant:'VEG',     recipeCount:20, cal:1700, protein:95,  description:'Eczema psoriasis vegetarian. Maximum anti-inflammatory (turmeric, ginger, omega-3 from flaxseed). Probiotic foods daily. Dairy-optional. No processed foods, no high omega-6 oils.' },
  { slug:'eczema-non-veg',               file:'seed-recipes-eczema-non-veg.ts',               planCategory:'eczema',                dietVariant:'NON_VEG', recipeCount:20, cal:1700, protein:115, description:'Eczema psoriasis non-veg. Fatty fish 4-5x/week (most potent dietary anti-inflammatory). Dairy-optional. Probiotic foods daily. No processed meats, no high omega-6 oils.' },
  { slug:'skin-glow-veg',                file:'seed-recipes-skin-glow-veg.ts',                planCategory:'skin_glow',             dietVariant:'VEG',     recipeCount:20, cal:1750, protein:100, description:'Skin glow hyperpigmentation vegetarian. High Vitamin C every meal (collagen). Vitamin E from nuts. Lycopene. Omega-3 from flaxseed. Zinc for cell renewal. No refined sugar.' },
  { slug:'skin-glow-non-veg',            file:'seed-recipes-skin-glow-non-veg.ts',            planCategory:'skin_glow',             dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:115, description:'Skin glow non-veg. Omega-3 fish 4x/week for skin barrier. Marine collagen from fish. Vitamin C pairing. Lycopene. Zinc from lean meats. No refined sugar.' },
  // ── ADDICTION & RECOVERY (5) ──────────────────────────────────────────────
  { slug:'quit-smoking-veg',             file:'seed-recipes-quit-smoking-veg.ts',             planCategory:'quit_smoking',          dietVariant:'VEG',     recipeCount:20, cal:1750, protein:100, description:'Quit smoking vegetarian. Very high Vitamin C every meal (smoking depletes at 6x rate). Maximum antioxidants. Blood sugar stabilisation. Tryptophan-rich for mood.' },
  { slug:'quit-smoking-non-veg',         file:'seed-recipes-quit-smoking-non-veg.ts',         planCategory:'quit_smoking',          dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:120, description:'Quit smoking non-veg. High Vitamin C every meal. Tryptophan from lean meats for serotonin. Maximum antioxidants for oxidative damage repair. Blood sugar stability.' },
  { slug:'alcohol-recovery-veg',         file:'seed-recipes-alcohol-recovery-veg.ts',         planCategory:'alcohol_recovery',      dietVariant:'VEG',     recipeCount:20, cal:1800, protein:105, description:'Alcohol recovery vegetarian. Very high B-vitamins (B1 thiamine, B6, B12, folate — all depleted by alcohol). Liver-supportive foods. Blood sugar stabilisation. ZERO alcohol.' },
  { slug:'alcohol-recovery-non-veg',     file:'seed-recipes-alcohol-recovery-non-veg.ts',     planCategory:'alcohol_recovery',      dietVariant:'NON_VEG', recipeCount:20, cal:1800, protein:125, description:'Alcohol recovery non-veg. B12 from animal protein for direct repletion. Liver-supportive vegetables. Lean protein for liver repair. Zero alcohol. Blood sugar stability.' },
  { slug:'detox-reset',                  file:'seed-recipes-detox-reset.ts',                  planCategory:'detox_reset',           dietVariant:'VEG',     recipeCount:15, cal:1650, protein:100, description:'21-day detox reset vegetarian. ZERO refined sugar. ZERO processed foods. ZERO alcohol. Maximum whole food density. Anti-inflammatory every meal. Gut microbiome reset.' },
  // ── SENIOR & KIDS (4) ─────────────────────────────────────────────────────
  { slug:'senior-veg',                   file:'seed-recipes-senior-veg.ts',                   planCategory:'senior',                dietVariant:'VEG',     recipeCount:25, cal:1600, protein:90,  description:'Senior nutrition 55+ vegetarian. SOFT TEXTURES easy to chew. Controlled calories. High calcium and Vitamin D for bones. B12 at every meal. LOW sodium. High fibre.' },
  { slug:'senior-non-veg',               file:'seed-recipes-senior-non-veg.ts',               planCategory:'senior',                dietVariant:'NON_VEG', recipeCount:25, cal:1650, protein:105, description:'Senior nutrition 55+ non-veg. Soft fish and well-cooked chicken. B12 from animal protein. Omega-3 for cardiovascular and cognitive protection. Low sodium.' },
  { slug:'kids-teen-veg',                file:'seed-recipes-kids-teen-veg.ts',                planCategory:'kids_teen',             dietVariant:'VEG',     recipeCount:25, cal:1800, protein:95,  description:'Kids and teen 8-17 vegetarian. High calcium at every meal. Plant DHA from flaxseed. Iron-rich with Vitamin C. Adequate protein for growth. Complex carbs for school focus.' },
  { slug:'kids-teen-non-veg',            file:'seed-recipes-kids-teen-non-veg.ts',            planCategory:'kids_teen',             dietVariant:'NON_VEG', recipeCount:25, cal:1900, protein:110, description:'Kids and teen 8-17 non-veg. Marine DHA from fish for brain development. Haem iron for growth phase. High calcium alongside protein. Kid-friendly. No processed junk.' },
  // ── SEASONAL / FESTIVAL (4) ───────────────────────────────────────────────
  { slug:'navratri',                     file:'seed-recipes-navratri.ts',                     planCategory:'navratri',              dietVariant:'VEG',     recipeCount:15, cal:1500, protein:70,  description:'Navratri fasting saatvik. ONLY: kuttu (buckwheat), singhara (water chestnut), sabudana, fruits, dairy, nuts. NO regular grains. NO onion, NO garlic. Sendha namak ONLY.' },
  { slug:'ramadan',                      file:'seed-recipes-ramadan.ts',                      planCategory:'ramadan',               dietVariant:'NON_VEG', recipeCount:15, cal:1900, protein:130, description:'Ramadan Sehri and Iftar. Sehri: SLOW-DIGESTING complex carbs + high protein. Iftar: break fast with dates and water, then fast carbs, then balanced meal. High hydration.' },
  { slug:'diwali-detox',                 file:'seed-recipes-diwali-detox.ts',                 planCategory:'diwali_detox',          dietVariant:'VEG',     recipeCount:15, cal:1600, protein:95,  description:'Post-Diwali detox reset 21-day. ZERO refined sugar, ZERO mithai, ZERO fried snacks, ZERO alcohol. Liver support (cruciferous, turmeric). High hydration. Gut reset.' },
  { slug:'shravan',                      file:'seed-recipes-shravan.ts',                      planCategory:'shravan',               dietVariant:'VEG',     recipeCount:15, cal:1600, protein:75,  description:'Shravan Ekadashi saatvik. NO non-veg. NO onion, NO garlic on observation days. High dairy for protein and calcium. Fruits and natural sweeteners. Light cooking methods.' },
  // ── SPORTS NUTRITION (20) ─────────────────────────────────────────────────
  { slug:'endurance-veg',                file:'seed-recipes-endurance-veg.ts',                planCategory:'endurance',             dietVariant:'VEG',     recipeCount:30, cal:2500, protein:130, description:'Performance and endurance vegetarian. HIGH CARBOHYDRATE BASE (55-60% calories) for glycogen. Pre-training: easily digestible carbs. Post-training: 3:1 carb:protein. Electrolytes managed.' },
  { slug:'endurance-non-veg',            file:'seed-recipes-endurance-non-veg.ts',            planCategory:'endurance',             dietVariant:'NON_VEG', recipeCount:30, cal:2600, protein:145, description:'Performance and endurance non-veg. HIGH CARB BASE for glycogen loading. Pre-training: digestible carbs 60-90 mins before. Post-training: fast protein + carbs. Electrolytes managed.' },
  { slug:'strength-hypertrophy-veg',     file:'seed-recipes-strength-hypertrophy-veg.ts',     planCategory:'strength_hypertrophy',  dietVariant:'VEG',     recipeCount:30, cal:2400, protein:170, description:'Strength and hypertrophy vegetarian. Very high protein (2.0g/kg) from paneer, soy, dal, dairy. Complete amino acid combining. Carb cycling for training days. Leucine-rich foods.' },
  { slug:'strength-hypertrophy-non-veg', file:'seed-recipes-strength-hypertrophy-non-veg.ts', planCategory:'strength_hypertrophy',  dietVariant:'NON_VEG', recipeCount:30, cal:2500, protein:185, description:'Strength and hypertrophy non-veg. Very high protein (2.2g/kg). Carb cycling (high carbs on training days). Pre-workout: carbs + moderate protein 90 mins before. Post-workout: fast protein + high carbs within 45 mins.' },
  { slug:'competition-prep-veg',         file:'seed-recipes-competition-prep-veg.ts',         planCategory:'competition_prep',      dietVariant:'VEG',     recipeCount:25, cal:1750, protein:165, description:'Competition prep vegetarian. Progressive calorie deficit. Very high protein to preserve muscle. Low-fat dairy. Carb cycling to peak week. Strategic food choices.' },
  { slug:'competition-prep-non-veg',     file:'seed-recipes-competition-prep-non-veg.ts',     planCategory:'competition_prep',      dietVariant:'NON_VEG', recipeCount:25, cal:1800, protein:180, description:'Competition prep non-veg. Progressive deficit. Very high protein from lean meats to preserve muscle. Carb cycling final weeks. Water and sodium management for peak week.' },
  { slug:'sports-recovery-veg',          file:'seed-recipes-sports-recovery-veg.ts',          planCategory:'sports_recovery',       dietVariant:'VEG',     recipeCount:25, cal:1900, protein:130, description:'Sports recovery vegetarian. Very high Vitamin C for collagen synthesis. Plant omega-3 from flaxseed. High protein from paneer and dairy. Anti-inflammatory turmeric and ginger daily.' },
  { slug:'sports-recovery-non-veg',      file:'seed-recipes-sports-recovery-non-veg.ts',      planCategory:'sports_recovery',       dietVariant:'NON_VEG', recipeCount:25, cal:2000, protein:145, description:'Sports recovery non-veg. Bone broth for natural collagen. Omega-3 fish for injury inflammation resolution. High Vitamin C. High leucine-rich protein for muscle repair.' },
  { slug:'cricket-veg',                  file:'seed-recipes-cricket-veg.ts',                  planCategory:'cricket',               dietVariant:'VEG',     recipeCount:25, cal:2300, protein:145, description:'Cricket nutrition vegetarian. MATCH DAY: carb-forward easily digestible meals. TRAINING DAY: paneer and dal-forward high protein. RECOVERY: anti-inflammatory. Electrolytes for Indian heat.' },
  { slug:'cricket-non-veg',              file:'seed-recipes-cricket-non-veg.ts',              planCategory:'cricket',               dietVariant:'NON_VEG', recipeCount:25, cal:2400, protein:160, description:'Cricket nutrition non-veg. Match day: high carb low fibre. Training day: high protein. Recovery: anti-inflammatory and collagen. Electrolytes for Indian heat.' },
  { slug:'football-veg',                 file:'seed-recipes-football-veg.ts',                 planCategory:'football',              dietVariant:'VEG',     recipeCount:25, cal:2300, protein:140, description:'Football futsal vegetarian. HIGH CARB on match day. High protein dal and paneer on training days. Anti-inflammatory recovery. Electrolytes. No heavy meals within 3 hours of match.' },
  { slug:'football-non-veg',             file:'seed-recipes-football-non-veg.ts',             planCategory:'football',              dietVariant:'NON_VEG', recipeCount:25, cal:2400, protein:155, description:'Football futsal non-veg. Match day high carb loading. Training day high protein. Recovery: omega-3 and glycogen replenishment. Electrolytes. No alcohol during season.' },
  { slug:'swimming-veg',                 file:'seed-recipes-swimming-veg.ts',                 planCategory:'swimming',              dietVariant:'VEG',     recipeCount:25, cal:2700, protein:150, description:'Swimming performance vegetarian. VERY HIGH CALORIES for dual-session swimmers. High carbs from rice, roti, oats. Protein-dense from paneer, dairy, soy. Iron-rich (chlorine increases iron needs).' },
  { slug:'swimming-non-veg',             file:'seed-recipes-swimming-non-veg.ts',             planCategory:'swimming',              dietVariant:'NON_VEG', recipeCount:25, cal:2800, protein:165, description:'Swimming performance non-veg. High total calories. Pre-session: digestible carbs. Post-session: fast protein + carbs within 30 min. Electrolytes. Iron management.' },
  { slug:'martial-arts-veg',             file:'seed-recipes-martial-arts-veg.ts',             planCategory:'martial_arts',          dietVariant:'VEG',     recipeCount:25, cal:2100, protein:155, description:'Martial arts MMA vegetarian. Weight-class management. High protein from paneer, soy, dairy. Carb cycling for training and competition. Fight week carb loading. Anti-inflammatory recovery.' },
  { slug:'martial-arts-non-veg',         file:'seed-recipes-martial-arts-non-veg.ts',         planCategory:'martial_arts',          dietVariant:'NON_VEG', recipeCount:25, cal:2200, protein:170, description:'Martial arts MMA non-veg. Weight-class management with high protein. Controlled calorie cycling. Fight week: strategic rehydration and carb loading. No extreme water cutting.' },
  { slug:'female-athlete-sports-veg',    file:'seed-recipes-female-athlete-sports-veg.ts',    planCategory:'female_athlete',        dietVariant:'VEG',     recipeCount:25, cal:2000, protein:130, description:'Female athlete sports vegetarian. Maximum non-haem iron with Vitamin C pairing. Calcium at non-iron meals. Plant omega-3. Cycle-aware carb periodisation. No under-fuelling.' },
  { slug:'female-athlete-sports-non-veg',file:'seed-recipes-female-athlete-sports-non-veg.ts',planCategory:'female_athlete',        dietVariant:'NON_VEG', recipeCount:25, cal:2100, protein:145, description:'Female athlete sports non-veg. Haem iron from lean meats. DHA from fatty fish. Cycle-aware nutrition (higher carbs in luteal phase). Anti-inflammatory. No under-fuelling.' },
  { slug:'youth-athlete-veg',            file:'seed-recipes-youth-athlete-veg.ts',            planCategory:'youth_athlete',         dietVariant:'VEG',     recipeCount:25, cal:2300, protein:140, description:'Youth athlete 14-18 vegetarian. High protein combining for growth and athletic adaptation. Maximum calcium from dairy. Iron-rich with Vitamin C. High carbs for growth and training energy.' },
  { slug:'youth-athlete-non-veg',        file:'seed-recipes-youth-athlete-non-veg.ts',        planCategory:'youth_athlete',         dietVariant:'NON_VEG', recipeCount:25, cal:2400, protein:155, description:'Youth athlete 14-18 non-veg. Higher calories for growth and training. Marine DHA for brain. Haem iron for growth phase. High calcium. Age-appropriate kid-friendly food. No excessive supplements.' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. MEAL SLOT DISTRIBUTION
// ─────────────────────────────────────────────────────────────────────────────
function getMealSlots(plan: PlanConfig): Record<string, number> {
  const n = plan.recipeCount;
  if (plan.planCategory === 'intermittent_fasting')
    return n <= 20 ? { BREAKFAST: 7, LUNCH: 7, DINNER: 6 } : { BREAKFAST: 9, LUNCH: 9, DINNER: 7 };
  if (n <= 15) return { BREAKFAST: 4, LUNCH: 5, SNACK: 2, DINNER: 4 };
  if (n <= 20) return { BREAKFAST: 5, LUNCH: 6, SNACK: 3, DINNER: 6 };
  if (n <= 25) return { BREAKFAST: 6, LUNCH: 8, SNACK: 4, DINNER: 7 };
  return               { BREAKFAST: 8, LUNCH: 10, SNACK: 5, DINNER: 7 };
}

const SLOT_MACRO_SPLIT = {
  BREAKFAST: { calPct: 0.24, proPct: 0.24 },
  LUNCH:     { calPct: 0.30, proPct: 0.30 },
  SNACK:     { calPct: 0.13, proPct: 0.13 },
  DINNER:    { calPct: 0.25, proPct: 0.25 },
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. CUISINE MATRIX — v5.0 INDIA-FIRST (replaces the old international-heavy matrix)
//
//   PRIMARY (80%): Indian regional cuisines — use these first, always
//   SECONDARY (20%): Indian fusion — only after all regional options used in this plan
//
//   NOTE: "Fusion" here means Indian technique + global flavour profile.
//   Continental_Indian = Indian spices with European plating.
//   IndoMediterranean = dal-based hummus, not tahini. Olive oil + Indian spices.
//   IndoChinese = soy sauce + ginger + dal, not gochujang.
// ─────────────────────────────────────────────────────────────────────────────
const CUISINE_MATRIX_INDIAN_REGIONAL = [
  'NorthIndian', 'Maharashtrian', 'SouthIndian', 'Bengali', 'Gujarati',
  'Rajasthani', 'Punjabi', 'Goan', 'Chettinad', 'MalabarCoast',
  'Andhra', 'Kashmiri', 'MumbaiStreet', 'Sindhi', 'Bihari',
  'Odia', 'Assamese', 'Hyderabadi', 'Awadhi', 'Coorgi',
];

const CUISINE_MATRIX_INDIAN_FUSION = [
  'Continental_Indian', 'IndoMediterranean', 'IndoChinese', 'IndoThai',
  'IndoMexican', 'IndoItalian', 'IndoJapanese',
];

const CUISINE_MATRIX = [...CUISINE_MATRIX_INDIAN_REGIONAL, ...CUISINE_MATRIX_INDIAN_FUSION];

const PROTEIN_SOURCES: Record<string, string[]> = {
  VEG:     ['paneer', 'tofu', 'chickpeas', 'rajma', 'masoor_dal', 'toor_dal', 'moong_dal', 'soya', 'tempeh', 'hung_curd', 'oats', 'quinoa'],
  EGG:     ['egg_whole', 'egg_white', 'paneer', 'tofu', 'chickpeas', 'dal', 'hung_curd'],
  NON_VEG: ['chicken_breast', 'rohu', 'salmon', 'egg_whole', 'paneer', 'chickpeas', 'dal'],
  VEGAN:   ['tofu', 'tempeh', 'chickpeas', 'rajma', 'masoor_dal', 'soya', 'quinoa', 'lentils'],
  JAIN:    ['paneer', 'dal', 'tofu', 'soya', 'hung_curd'],
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. PUNE CLOUD KITCHEN SOURCING MANDATE — v5.0 (NEW)
//    Injected into every single prompt. Non-negotiable.
// ─────────────────────────────────────────────────────────────────────────────
const PUNE_SOURCING_MANDATE = `
━━━ PUNE CLOUD KITCHEN SOURCING — NON-NEGOTIABLE ━━━
FitFuel operates from a cloud kitchen in Pune, Maharashtra.
Every ingredient must be available from Pune wholesale markets (APMC Pune / local mandi) in bulk.

ABSOLUTELY FORBIDDEN INGREDIENTS (cannot source at cloud kitchen scale in Pune):
❌ Tahini, miso paste, gochujang, kimchi — not available in bulk in Pune
❌ Fresh lemongrass (dried ok in tiny amounts as accent only)
❌ Avocado — seasonal, expensive, not scalable at cloud kitchen volume
❌ Edamame — not available fresh in Pune at scale
❌ Rice noodles, udon noodles — exception: IndoChinese plans only, in small amounts
❌ Chipotle chilli, pickled jalapeños — not available in Pune
❌ Fresh basil (Italian variety), fresh dill, fresh parsley in large quantities
❌ Couscous — not stocked by Pune mandi suppliers
❌ Any ingredient requiring specialty import

ALWAYS AVAILABLE IN PUNE — use freely:
✅ All Indian dals: toor, masoor, moong, chana, rajma, urad, matki, kulith
✅ Paneer, curd, ghee, milk, hung curd, buttermilk
✅ Chicken breast, chicken thigh, rohu, surmai, bombil, prawns (seasonal), pomfret
✅ All Indian vegetables: spinach, methi, bhindi, brinjal, cauliflower, capsicum,
   lauki, turai, drumstick, raw banana, raw jackfruit, beetroot, sweet potato,
   pumpkin, ridge gourd, pointed gourd, bitter gourd, taro, colocasia
✅ All Indian spices: turmeric, jeera, dhania, garam masala, degi mirch, ajwain,
   mustard seeds, curry leaves, hing, black pepper, cinnamon, cardamom, cloves,
   star anise, bay leaves, fennel seeds, fenugreek seeds, kasuri methi, amchur
✅ Rice (basmati, brown), roti/chapati flour, oats (rolled), poha, dalia, ragi flour,
   jowar flour, bajra flour, sabudana, makhana, whole wheat flour, multigrain flour
✅ Flaxseeds, sesame seeds, peanuts, almonds, cashews, walnuts (Indian grown)
✅ Tomatoes, onion, garlic, ginger, green chilli, fresh coriander, fresh mint
✅ Soy sauce (small quantities for IndoChinese only), tofu (available in Pune)
✅ Mustard oil, coconut oil, groundnut oil, sunflower oil, olive oil (imported ok)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

// ─────────────────────────────────────────────────────────────────────────────
// 8. PLAN CATEGORY SPECIFIC PROMPT INJECTIONS (unchanged from v4.1)
// ─────────────────────────────────────────────────────────────────────────────
function getPlanCategoryInjection(plan: PlanConfig): string {
  const injections: Partial<Record<string, string>> = {
    weight_loss: `
⚖️ WEIGHT LOSS MANDATES:
  → Keep kcal targets per slot TIGHT — do not overshoot by more than 30 kcal
  → Satiety engineering: every dish must have HIGH FIBRE (7g+) + HIGH PROTEIN + HIGH WATER CONTENT
  → Volume eating: large portions feel satisfying at low calories (leafy greens, cucumbers, broth bases)
  → No hidden calories: do NOT use coconut milk, cream, or excess oil beyond listed amounts
  → Snacks must feel like a treat — not like a punishment. Makhana chaat > plain boiled chickpeas.
  → Every dish must prove that "diet food" is a myth. It should taste ₹800 restaurant quality.`,

    muscle_gain: `
💪 MUSCLE GAIN MANDATES:
  → Protein target is NON-NEGOTIABLE — minimum 35g protein per breakfast, 45g per lunch/dinner
  → Leucine-trigger: at least one leucine-rich ingredient per meal (paneer, soya, dal, hung curd)
  → Calorie density matters — use calorie-dense clean foods (nuts, ghee, brown rice, quinoa)
  → Complete amino acid profile: combine grains + legumes or dairy + plant protein at every meal
  → Post-workout meals: high carb + fast protein — rice or oats with paneer/tofu, NOT salads
  → Breakfast must be substantial: 500+ kcal minimum, not a light bowl`,

    keto: `
🔴 KETO MANDATES — ZERO TOLERANCE:
  → ABSOLUTELY NO: rice, roti, oats, wheat, bread, maida, quinoa, potato, fruit juice
  → Net carbs PER RECIPE must stay under 12g (part of a daily 50g budget across 4 meals)
  → High fat sources: ghee, coconut oil/milk, paneer, cream, almonds, walnuts
  → Every carb gram must come from vegetables, nuts, or dairy — not grains
  → Indian keto still smells and tastes 100% Indian — all spices, all tadkas, all curries allowed`,

    diabetic: `
🩺 DIABETIC MANDATES:
  → GI of EVERY ingredient must be under 55 — NO white rice, NO maida, NO sugar
  → Carbs must always be paired with protein + fibre to blunt glucose response
  → Portion size matters: 45-60g carbs MAX per meal (total, not per ingredient)
  → Vinegar or acid (lemon, amchur) ALWAYS included — lowers GI of the whole meal
  → Cinnamon and fenugreek leaves incorporated wherever possible (proven GI reduction)`,

    pcos: `
🌸 PCOS MANDATES:
  → Low GI throughout — no high-GI ingredients even in small amounts
  → Anti-inflammatory REQUIRED: turmeric + ginger + omega-3 source in every meal
  → Zinc-rich ingredients: pumpkin seeds, legumes, oats at each meal
  → Inositol-rich: legumes, oats, brown rice preferred over white rice
  → No excess dairy — use curd over paneer where possible
  → Magnesium-rich: dark leafy greens, nuts, seeds at every meal`,

    intermittent_fasting: `
⏰ INTERMITTENT FASTING MANDATES:
  → 3 MEALS ONLY — NO SNACK slot. Never generate SNACK mealType.
  → BREAKFAST (break-fast at 12pm): MUST start with protein + fat, NOT carbs alone
      → Examples: Paneer bhurji, eggs, dal cheela with hung curd, NOT idli, NOT poha
  → LUNCH: Largest meal of the day — 40% of daily calories here
  → DINNER: Light but protein-rich. Easy to digest. Finished by 8pm.
  → No bulky fibre at first meal (can cause discomfort when breaking a fast)`,

    heart_health: `
❤️ HEART HEALTH MANDATES:
  → Saturated fat STRICTLY under 7g per recipe — no coconut milk, no cream, no full-fat dairy
  → Omega-3 at every meal: flaxseed, walnuts, or fatty fish for non-veg
  → Soluble fibre REQUIRED: oats, legumes, psyllium-adjacent ingredients
  → Sodium STRICTLY under 400mg per recipe (total daily under 1500mg)
  → Olive oil as primary cooking fat — NO ghee for heart health plans (small amounts only)
  → Sterols from nuts and seeds in every recipe`,

    hypertension: `
🩸 HYPERTENSION MANDATES:
  → SODIUM CRITICAL: use ZERO added table salt — flavour must come from spices, herbs, lemon
  → If using preserved ingredients (pickles, sauces), CHECK and EXCLUDE — list per-recipe sodium
  → High potassium REQUIRED: spinach, dal, banana, sweet potato in every meal
  → Magnesium sources: dark greens, pumpkin seeds, black beans, banana
  → NO pickles, NO papad, NO processed sauces — flavour via whole spices and fresh herbs only`,

    sports_recovery: `
🏃 SPORTS RECOVERY MANDATES:
  → Collagen precursors REQUIRED: Vitamin C + glycine-rich protein at every meal
  → Anti-inflammatory ALWAYS: turmeric + ginger + omega-3 in EVERY recipe
  → Post-session meals: carb + protein within 45 minutes — must state timing in kitchenNote
  → Zinc at every meal for tissue healing: pumpkin seeds, legumes, lean meats
  → No inflammatory oils — only olive oil, ghee, mustard oil
  → Bone broth (non-veg plans) or turmeric golden milk (veg plans) as base liquid option`,

    endurance: `
🚴 ENDURANCE PERFORMANCE MANDATES:
  → CARBS ARE KING — 55-60% of calories must come from complex carbohydrates
  → Pre-training meals: NO high fat, NO high fibre — easily digestible carbs only
  → Post-training meals: 3:1 carb:protein ratio — rice + dal, oats + curd, banana + protein
  → Electrolytes EXPLICIT: mention sodium, potassium, magnesium in relevant recipes
  → Every recipe must state in kitchenNote: "Pre-training: eat 90 min before" or "Post-training: within 45 min"`,

    kidney_health: `
💧 KIDNEY HEALTH CRITICAL MANDATES:
  → CONTROLLED PROTEIN: max 15g protein per meal, 70g per day for veg / 75g for non-veg
  → LOW POTASSIUM: LEACH all vegetables (boil 15 min, drain, use fresh water for cooking)
      → HIGH POTASSIUM FORBIDDEN: banana, tomato, potato, spinach in large amounts
  → LOW PHOSPHORUS: NO nuts (except small portion almonds), NO dairy in excess, NO legumes in large amounts
  → LOW SODIUM: zero added salt, flavour with lemon and herbs only
  → Adequate calories: 30-35 kcal/kg body weight to prevent muscle catabolism`,

    navratri: `
🪔 NAVRATRI STRICT MANDATES:
  → ONLY PERMITTED: kuttu (buckwheat), singhara flour, sabudana, dairy, fruits, coconut, nuts, rock salt
  → FORBIDDEN: wheat, rice, maida, onion, garlic, non-veg, table salt
  → Sendha namak (rock salt / pink salt) ONLY — explicitly state in prepNote
  → All recipes must feel celebratory and festive — this is fasting food that should feel abundant
  → Saatvik cooking only: no overly pungent flavours, no heavy spices`,

    jain: `
🙏 JAIN DIET — ABSOLUTE PROHIBITIONS — EVERY RECIPE MUST COMPLY:
  ══════════════════════════════════════════════════════════════
  ROOT VEGETABLES / RHIZOMES — 100% FORBIDDEN (living organisms underground):
  ❌ ONION, GARLIC, LEEK, SHALLOT, SCALLION, GREEN_ONION, SPRING_ONION — all alliums
  ❌ POTATO, SWEET_POTATO, YAM, TARO
  ❌ CARROT, BEETROOT, RADISH, TURNIP, PARSNIP
  ❌ GINGER (rhizome — forbidden), TURMERIC (rhizome — forbidden)
  ❌ MUSHROOMS (grown on decaying matter — forbidden)
  ❌ CAULIFLOWER, BROCCOLI (multi-layered — insects may hide)
  ══════════════════════════════════════════════════════════════
  PERMITTED PROTEINS: paneer, curd, milk, ghee, cheese, toor dal, moong dal, masoor dal,
    chana dal, soya chunks, tofu, oats, quinoa, nuts, seeds
  PERMITTED VEGETABLES (above-ground, single-layer only):
    capsicum, bell pepper, tomato, spinach, methi leaves, zucchini, pumpkin, lauki, turai,
    ridge gourd, bottle gourd, drumstick, raw banana, raw jackfruit, corn, peas (fresh)
  ══════════════════════════════════════════════════════════════
  MANDATORY SUBSTITUTIONS:
  → Onion/garlic flavour → HING (asafoetida) 0.5–1g + cumin seeds as base tadka
  → Ginger → skip entirely, or use a tiny pinch of DRY GINGER POWDER (sonth) sparingly
  → Turmeric → saffron-infused water for colour, or simply omit
  → Every tadka MUST start with: hing + cumin seeds (never onion, never garlic)
  ══════════════════════════════════════════════════════════════
  REJECTION RULE: ANY recipe using ONION, GARLIC, GINGER, CARROT, POTATO, MUSHROOM,
  CAULIFLOWER, or BROCCOLI will cause the entire batch to be REJECTED immediately.`,
  };

  return injections[plan.planCategory] ?? '';
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. MASTER PROMPT BUILDER — v5.0
//    Key changes: India-first cuisine instructions, Pune sourcing mandate,
//    missingFoodItems now expected for ALL non-core-30 ingredients
// ─────────────────────────────────────────────────────────────────────────────
function buildPrompt(
  plan: PlanConfig,
  slotQueue: string[],
  batchIdx: number,
  totalBatches: number,
  usedSlugs: Set<string>,
  knownMissingKeys: Set<string>,
  usedCuisines: Set<string>,
  usedProteins: Set<string>,
  mustDeclareKeys: Set<string>,
): string {
  const assignments = slotQueue.map((slot, i) => {
    const split = SLOT_MACRO_SPLIT[slot as keyof typeof SLOT_MACRO_SPLIT] ?? { calPct: 0.25, proPct: 0.25 };
    const targetCal = Math.round(plan.cal * split.calPct);
    const targetPro = Math.round(plan.protein * split.proPct);
    const tolerance  = 40;
    return `  Recipe ${i + 1}: mealType="${slot}" → TARGET ${targetCal - tolerance}–${targetCal + tolerance} kcal | ${targetPro - 5}–${targetPro + 5}g protein`;
  }).join('\n');

  const dietRules: Record<string, string> = {
    VEG:     '🌿 VEGETARIAN — No eggs, no chicken, no fish, no meat. Dairy + plant proteins only.',
    EGG:     '🥚 EGGETARIAN — Eggs freely allowed. No chicken, no fish, no meat.',
    NON_VEG: '🍗 NON-VEG — Chicken, fish, eggs all allowed. Lean cuts preferred.',
    JAIN:    '🙏 JAIN — STRICTLY no root vegetables (potato, carrot, onion, garlic, beetroot, radish). Above-ground only.',
    VEGAN:   '🌱 VEGAN — No dairy, no eggs, no honey. Pure plant-based only.',
  };

  // India-first: show unused Indian regional cuisines first, fusion second
  const usedCuisinesLower = new Set(Array.from(usedCuisines).map(c => c.toLowerCase()));
  const unusedRegional = CUISINE_MATRIX_INDIAN_REGIONAL.filter(c => !usedCuisinesLower.has(c.toLowerCase()));
  const unusedFusion   = CUISINE_MATRIX_INDIAN_FUSION.filter(c => !usedCuisinesLower.has(c.toLowerCase()));

  // Core 30 keys that already have DB IDs (no missingFoodItems needed for these)
  const core30Keys = Object.keys(FI_MAP).join(', ');

  const mustDeclareBlock = mustDeclareKeys.size > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⛔ MACRO ACCURACY VIOLATION — RETRY REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The previous attempt used these ingredient keys WITHOUT declaring them in missingFoodItems.
YOU MUST add ALL of the following keys to missingFoodItems with ACCURATE per-100g values:
  → ${Array.from(mustDeclareKeys).join('\n  → ')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : '';

  return `You are the executive head chef and nutrition director of FitFuel — a premium healthy cloud kitchen in Pune, Maharashtra.
FitFuel ships at ₹700–900 per meal. Every dish competes with Pune's best restaurants. Being healthy is a constraint, not the identity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MISSION: Generate EXACTLY ${slotQueue.length} world-class recipes — Batch ${batchIdx + 1}/${totalBatches} of "${plan.slug}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${mustDeclareBlock}
${PUNE_SOURCING_MANDATE}
━━━ PLAN CONTEXT ━━━
Slug: ${plan.slug}
Goal: ${plan.description}
Diet rule: ${dietRules[plan.dietVariant] || plan.dietVariant}

━━━ MEAL SLOT ASSIGNMENTS WITH MACRO TARGETS ━━━
${assignments}
(kcal targets are non-negotiable — choose gram weights to hit them.)

━━━ PLAN-SPECIFIC MANDATES ━━━
${getPlanCategoryInjection(plan)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUISINE DIVERSITY — INDIA-FIRST MANDATORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FitFuel is a PUNE CLOUD KITCHEN. The menu must feel like a premium Indian tiffin service, not a global food tour.

CUISINE RULE:
  → 80% of all recipes in this plan MUST be Indian regional cuisines
  → 20% maximum may be Indian fusion (IndoChinese, Continental_Indian etc.)
  → ZERO recipes with purely international cuisine (no Japanese, Korean, Turkish, Thai, Mexican etc.)
  → "Fusion" means Indian technique + global flavour using Pune-sourceable ingredients only

Indian regional cuisines already used this plan: [${Array.from(usedCuisines).filter(c =>
    CUISINE_MATRIX_INDIAN_REGIONAL.map(r => r.toLowerCase()).includes(c.toLowerCase())
  ).join(', ') || 'none yet'}]
Indian regional cuisines AVAILABLE (USE THESE FIRST): [${unusedRegional.slice(0, 12).join(', ')}]
Indian fusion cuisines available (ONLY after all regional options exhausted): [${unusedFusion.join(', ')}]

Each recipe in this batch MUST have a DIFFERENT cuisineType.
Prioritise unused Indian regional cuisines before considering fusion.

━━━ PRIMARY PROTEIN DIVERSITY ━━━
Primary proteins already used this plan: [${Array.from(usedProteins).join(', ') || 'none yet'}]
Preferred proteins for this batch (use different ones): [${(PROTEIN_SOURCES[plan.dietVariant] ?? PROTEIN_SOURCES['VEG']).filter(p => !usedProteins.has(p)).slice(0, 8).join(', ')}]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PALATE ARCHITECTURE — every dish must contain ALL THREE layers:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔴 BASE NOTES (depth & umami):
     Slow-cooked caramelised onion / roasted whole spices in ghee / charred tomato / slow-cooked dal / sun-dried tomato / fermented elements

  🟡 MID NOTES (body & soul):
     Primary protein (paneer sear, crispy tofu, golden chickpea) / bloom of powdered spices in hot oil / garlic confit / ginger julienne / curry leaf temper / whole green chilli

  🟢 BRIGHT NOTES (lift & contrast — MUST be present):
     Fresh lemon juice / raw pomegranate / chopped fresh coriander or mint / amchur / pickled element (onion, daikon, cucumber) / green chutney swirl / yoghurt drizzle

TEXTURE MANDATE — every dish MUST have at least 2 of these 4:
  ✦ CRISPY: toasted seeds/nuts, seared paneer crust, crisp curry leaf, roasted chickpeas, seeds temper
  ✦ CREAMY: hung curd, smooth dal, paneer crumble, coconut cream in controlled quantity
  ✦ CHEWY: grain (brown rice, millet, roti), legume (whole rajma/chickpea), tempeh, protein
  ✦ FRESH: julienned raw vegetable, sprouts, fresh herb, pomegranate arils

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLOUD KITCHEN OPERATIONS STANDARDS — non-negotiable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every kitchenNote in steps MUST cover one of:
  → HOLD TIME: "Holds well in warmer at 65°C for up to 45 min"
  → PACK INSTRUCTION: "Pack chutney/sauce in separate 30ml pot — never on dish pre-delivery"
  → VISUAL CUE: "Look for golden-brown crust with slight char at edges"
  → BATCH PREP: "Marinade can be prepped night before, store covered in chill"
  → DELIVERY RISK: "If crispiness promised, sauce goes separate — moisture kills crunch within 15 min of packing"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAMING — THE GOLD STANDARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMAT: [Regional Style/Technique] + [Hero Ingredient] + "with" + [Star Accompaniment] + "&" + [Bright Finishing Element]

✅ GREAT INDIAN NAMES (use as inspiration, do not copy):
  "Chettinad Cauliflower Steak with Slow-Cooked Coconut-Black Pepper Gravy & Millet Pilaf"
  "Andhra Guntur Masala Paneer Fry with Tomato-Tamarind Chutney & Jowar Bhakri"
  "Rajasthani Smoked Dal Baati Reimagined with Baked Jowar Baati & Ghee Tadka"
  "Maharashtrian Usal with Sprouted Matki, Kanda Lasun Masala & Pav"
  "Bengali Mustard Rohu with Panchphoron-Tempered Rice & Gondhoraj Lemon"
  "Punjabi Sarson da Saag with Makki Roti & Salted White Butter"
  "Goan Cafreal Chicken with Coconut Rice & Kachumber Salad"
  "Kashmiri Dum Aloo with Lotus Root Chips & Fennel-Curd Gravy"
  "MumbaiStreet Bhel Puri Bowl with Tamarind-Date Chutney & Pomegranate"

❌ NAMES THAT WILL BE REJECTED:
  "Paneer and Vegetable Bowl" — generic, no soul
  "Healthy Chickpea Curry" — no personality
  "Protein Quinoa Stir-Fry" — cafeteria menu
  Any name suggesting Japanese, Korean, Thai, Turkish, Mexican cuisine

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESCRIPTION GOLD STANDARD — minimum 130 characters
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Structure: TECHNIQUE used → HERO INGREDIENT featured → FLAVOUR JOURNEY → WHY IT'S SPECIAL

✅ GOLD EXAMPLE:
"A whole cauliflower steak blackened in a screaming-hot cast iron with Chettinad's 17-spice blend, finished in slow-cooked coconut-black pepper gravy for two hours. Served over millet pilaf toasted in curry-leaf ghee. The kind of dish that makes non-vegetarians forget meat exists. 32g protein, high fibre."

━━━ CORE INGREDIENT KEYS (these 30 have real DB IDs — no missingFoodItems needed) ━━━
[${core30Keys}]

━━━ missingFoodItems RULE (CRITICAL) ━━━
For EVERY ingredient NOT in the 30 core keys above, you MUST declare it in missingFoodItems.
This includes: garlic, ginger, green chilli, oils, spices, fresh herbs, additional vegetables,
grains (brown rice, ragi flour, jowar flour), additional proteins (tofu, tempeh, hung curd), etc.

The seed script will CREATE these food items in the DB automatically. This is how new
ingredients enter the system — NOT via separate seed files.

Already declared missing this session: [${Array.from(knownMissingKeys).join(', ') || 'none'}]
(Do NOT re-declare keys already in the list above — they're already handled)

⚠️ PRE-FLIGHT CHECKLIST — do this BEFORE writing a single recipe:
  Step 1: List every unique ingredient key you plan to use across ALL recipes in this batch.
  Step 2: For each key, check if it appears in the CORE 30 list above.
  Step 3: Every key NOT in the core 30 → add to missingFoodItems with accurate per-100g macros.
  Step 4: Only then write the recipes.

━━━ SLUG RULES ━━━
Used (DO NOT REPEAT): [${Array.from(usedSlugs).join(', ') || 'none'}]
Format: [dish-name-words]-[plan-abbreviation] e.g. "chettinad-cauliflower-wl-veg"

━━━ INGREDIENT RULES ━━━
Minimum 12 ingredients per recipe (spices count individually).
Spices: 1–5g each | Proteins: 70–180g | Grains: 60–180g | Oils: 5–15g | Vegetables: 50–180g
List EVERY spice individually with gram weights.
List aromatics (garlic, ginger, green chilli, curry leaves, mustard seeds) individually.
List oils and cooking fats explicitly with gram weights.

━━━ DIETARY TAGS RULE ━━━
VEG plans: always ['VEGETARIAN'] | EGG plans: ['EGG'] | NON_VEG: ['NON_VEG'] | VEGAN: ['VEGAN'] | JAIN: ['JAIN', 'VEGETARIAN']

━━━ PLAN CATEGORIES RULE — CRITICAL ━━━
planCategories MUST always be EXACTLY: ["${plan.planCategory}"]

━━━ DO NOT OUTPUT MACRO FIELDS ━━━
NEVER include: caloriesPerServing, proteinGrams, carbsGrams, fatGrams, fibreGrams or any Per100g field.
Macros are calculated automatically from ingredient gram weights.

━━━ OUTPUT FORMAT — STRICT JSON ONLY ━━━
No markdown. No explanations. No preamble. Raw JSON only:

{
  "missingFoodItems": [
    { "name": "Garlic", "key": "GARLIC", "category": "Aromatics", "per100Calories": 149, "per100Protein": 6.4, "per100Carbs": 33.1, "per100Fat": 0.5, "per100Fiber": 2.1 },
    { "name": "Ginger", "key": "GINGER", "category": "Aromatics", "per100Calories": 80, "per100Protein": 1.8, "per100Carbs": 17.8, "per100Fat": 0.8, "per100Fiber": 2.0 }
  ],
  "recipes": [
    {
      "name": "Chettinad Cauliflower Steak with Coconut-Pepper Gravy & Millet Pilaf",
      "slug": "chettinad-cauliflower-steak-wl-veg",
      "description": "A whole cauliflower steak seared in cast iron with Chettinad's 17-spice blend, finished in slow-cooked coconut-black pepper gravy. Served over millet pilaf toasted in curry-leaf ghee. The kind of dish that makes non-vegetarians forget meat exists. 28g protein, high fibre, low GI.",
      "shortDescription": "Chettinad spiced cauliflower, coconut gravy, millet pilaf",
      "cuisineType": "Chettinad",
      "mealType": "LUNCH",
      "dietaryTags": ["VEGETARIAN"],
      "planCategories": ["${plan.planCategory}"],
      "servingSizeGrams": 420,
      "prepTimeMins": 15,
      "cookTimeMins": 30,
      "difficulty": "medium",
      "equipmentNeeded": ["cast_iron_pan", "heavy_bottomed_pot"],
      "allergens": ["dairy"],
      "shelfLifeHours": 4,
      "packagingType": "compartment_box",
      "kitchenStation": "hot_kitchen",
      "seasonTags": ["all_year"],
      "rotationGroup": 2,
      "isFeatured": true,
      "platingSummary": "Millet pilaf base, cauliflower steak centre-stage, dark pepper gravy poured tableside, curry leaf garnish, fresh coriander.",
      "ingredients": [
        { "foodItemKey": "CAULIFLOWER", "quantityGrams": 250, "cookedWeightFactor": 0.85, "prepNote": "1 large head, sliced into 2cm steaks", "isOptional": false, "orderInRecipe": 1 },
        { "foodItemKey": "COCONUT_OIL", "quantityGrams": 10, "cookedWeightFactor": 1.0, "prepNote": "for searing", "isOptional": false, "orderInRecipe": 2 }
      ],
      "steps": [
        {
          "stepNumber": 1,
          "title": "Sear the cauliflower steak",
          "instruction": "Heat coconut oil in a cast iron pan over maximum heat until shimmering and just beginning to smoke — 2 minutes. Place cauliflower steaks flat-side down, press firmly with a spatula. Cook undisturbed for 3 minutes until deep golden-brown. Flip once. The crust is your flavour base — resist the urge to move it. Look for caramelised edges and Maillard browning.",
          "durationMins": 6,
          "technique": "sear",
          "kitchenNote": "Batch sear maximum 2 steaks at once. Crowding drops pan temperature and produces pale, steamed cauliflower. Hold seared steaks on a wire rack at 65°C — do not stack."
        }
      ]
    }
  ]
}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. NUTRITIONAL FALLBACK TABLE (unchanged from v4.1 — comprehensive)
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_MACROS: Record<string, { cal: number; pro: number; carb: number; fat: number; fib: number }> = {
  EGG: { cal: 155, pro: 13.0, carb: 1.1, fat: 11.0, fib: 0.0 },
  EGGS: { cal: 155, pro: 13.0, carb: 1.1, fat: 11.0, fib: 0.0 },
  WHOLE_EGG: { cal: 155, pro: 13.0, carb: 1.1, fat: 11.0, fib: 0.0 },
  GARLIC: { cal: 149, pro: 6.4, carb: 33.1, fat: 0.5, fib: 2.1 },
  GINGER: { cal: 80, pro: 1.8, carb: 17.8, fat: 0.8, fib: 2.0 },
  GREEN_CHILLI: { cal: 40, pro: 2.0, carb: 9.5, fat: 0.2, fib: 1.5 },
  FRESH_CORIANDER: { cal: 23, pro: 2.1, carb: 3.7, fat: 0.5, fib: 2.8 },
  FRESH_MINT: { cal: 70, pro: 3.8, carb: 14.9, fat: 0.9, fib: 8.0 },
  LEMON_JUICE: { cal: 22, pro: 0.4, carb: 6.9, fat: 0.2, fib: 0.3 },
  OLIVE_OIL: { cal: 884, pro: 0.0, carb: 0.0, fat: 100, fib: 0.0 },
  MUSTARD_OIL: { cal: 884, pro: 0.0, carb: 0.0, fat: 100, fib: 0.0 },
  COCONUT_OIL: { cal: 892, pro: 0.0, carb: 0.0, fat: 100, fib: 0.0 },
  OIL: { cal: 884, pro: 0.0, carb: 0.0, fat: 100, fib: 0.0 },
  CUMIN_SEEDS: { cal: 375, pro: 17.8, carb: 44.2, fat: 22.3, fib: 10.5 },
  TURMERIC: { cal: 354, pro: 7.8, carb: 64.9, fat: 9.9, fib: 21.1 },
  CORIANDER_POWDER: { cal: 298, pro: 12.4, carb: 55.0, fat: 17.8, fib: 41.9 },
  GARAM_MASALA: { cal: 379, pro: 12.7, carb: 50.4, fat: 15.0, fib: 16.0 },
  DEGI_MIRCH: { cal: 282, pro: 13.5, carb: 54.5, fat: 5.8, fib: 27.3 },
  MUSTARD_SEEDS: { cal: 508, pro: 26.1, carb: 28.1, fat: 36.2, fib: 12.2 },
  CURRY_LEAVES: { cal: 108, pro: 6.1, carb: 18.7, fat: 1.0, fib: 6.4 },
  CINNAMON: { cal: 247, pro: 4.0, carb: 80.6, fat: 1.2, fib: 53.1 },
  AMCHUR: { cal: 239, pro: 3.0, carb: 61.0, fat: 0.6, fib: 5.4 },
  CAPSICUM: { cal: 31, pro: 1.0, carb: 6.0, fat: 0.3, fib: 2.1 },
  CUCUMBER: { cal: 16, pro: 0.7, carb: 3.6, fat: 0.1, fib: 0.5 },
  BROCCOLI: { cal: 34, pro: 2.8, carb: 7.0, fat: 0.4, fib: 2.6 },
  MUSHROOMS: { cal: 22, pro: 3.1, carb: 3.3, fat: 0.3, fib: 1.0 },
  SWEET_POTATO: { cal: 90, pro: 2.0, carb: 20.7, fat: 0.1, fib: 3.3 },
  METHI_LEAVES: { cal: 49, pro: 4.4, carb: 6.0, fat: 0.9, fib: 2.7 },
  GREEN_PEAS: { cal: 81, pro: 5.4, carb: 14.5, fat: 0.4, fib: 5.1 },
  BEETROOT: { cal: 43, pro: 1.6, carb: 9.6, fat: 0.2, fib: 2.8 },
  BROWN_RICE: { cal: 362, pro: 7.5, carb: 76.2, fat: 2.7, fib: 3.5 },
  BROWN_RICE_COOKED: { cal: 112, pro: 2.6, carb: 23.0, fat: 0.9, fib: 1.8 },
  QUINOA_COOKED: { cal: 120, pro: 4.4, carb: 21.3, fat: 1.9, fib: 2.8 },
  QUINOA: { cal: 368, pro: 14.1, carb: 64.2, fat: 6.1, fib: 7.0 },
  RAGI_FLOUR: { cal: 328, pro: 7.3, carb: 72.0, fat: 1.3, fib: 3.6 },
  JOWAR_FLOUR: { cal: 349, pro: 10.4, carb: 72.6, fat: 1.9, fib: 6.3 },
  BAJRA_FLOUR: { cal: 361, pro: 11.6, carb: 67.5, fat: 5.0, fib: 1.2 },
  TOFU: { cal: 144, pro: 15.7, carb: 3.9, fat: 8.0, fib: 2.0 },
  TEMPEH: { cal: 193, pro: 19.0, carb: 9.4, fat: 10.8, fib: 1.4 },
  MAKHANA: { cal: 347, pro: 9.7, carb: 76.9, fat: 0.1, fib: 14.5 },
  HUNG_CURD: { cal: 97, pro: 10.0, carb: 3.6, fat: 4.0, fib: 0.0 },
  SESAME_SEEDS: { cal: 573, pro: 17.7, carb: 23.4, fat: 49.7, fib: 11.8 },
  WALNUTS: { cal: 654, pro: 15.2, carb: 13.7, fat: 65.2, fib: 6.7 },
  CASHEWS: { cal: 553, pro: 18.2, carb: 30.2, fat: 43.9, fib: 3.3 },
  PUMPKIN_SEEDS: { cal: 559, pro: 30.2, carb: 10.7, fat: 49.1, fib: 6.0 },
  FLAXSEEDS: { cal: 534, pro: 18.3, carb: 28.9, fat: 42.2, fib: 27.3 },
  POMEGRANATE: { cal: 83, pro: 1.7, carb: 18.7, fat: 1.2, fib: 4.0 },
  POMEGRANATE_ARILS: { cal: 83, pro: 1.7, carb: 18.7, fat: 1.2, fib: 4.0 },
  COCONUT_MILK: { cal: 230, pro: 2.3, carb: 5.5, fat: 23.8, fib: 2.2 },
  FRESH_CREAM: { cal: 345, pro: 2.1, carb: 3.0, fat: 36.0, fib: 0.0 },
  SOY_SAUCE: { cal: 53, pro: 8.1, carb: 4.9, fat: 0.6, fib: 0.8 },
  TOMATO_PASTE: { cal: 82, pro: 4.3, carb: 18.9, fat: 0.5, fib: 4.3 },
  VEGETABLE_STOCK: { cal: 7, pro: 0.3, carb: 1.4, fat: 0.1, fib: 0.0 },
  WATER: { cal: 0, pro: 0.0, carb: 0.0, fat: 0.0, fib: 0.0 },
  SALT: { cal: 0, pro: 0.0, carb: 0.0, fat: 0.0, fib: 0.0 },
  BLACK_SALT: { cal: 0, pro: 0.0, carb: 0.0, fat: 0.0, fib: 0.0 },
  ROCK_SALT: { cal: 0, pro: 0.0, carb: 0.0, fat: 0.0, fib: 0.0 },
  SENDHA_NAMAK: { cal: 0, pro: 0.0, carb: 0.0, fat: 0.0, fib: 0.0 },
  JAGGERY: { cal: 383, pro: 0.4, carb: 98.0, fat: 0.1, fib: 0.0 },
  HONEY: { cal: 304, pro: 0.3, carb: 82.4, fat: 0.0, fib: 0.2 },
  SUGAR: { cal: 387, pro: 0.0, carb: 100, fat: 0.0, fib: 0.0 },
  TAMARIND: { cal: 239, pro: 2.8, carb: 62.5, fat: 0.6, fib: 5.1 },
  TAMARIND_PASTE: { cal: 239, pro: 2.8, carb: 62.5, fat: 0.6, fib: 5.1 },
  MULTIGRAIN_FLOUR: { cal: 340, pro: 12.0, carb: 68.0, fat: 2.5, fib: 6.0 },
  WHEAT_FLOUR: { cal: 364, pro: 10.3, carb: 76.3, fat: 1.0, fib: 2.7 },
  CHICKPEA_FLOUR: { cal: 387, pro: 22.4, carb: 57.8, fat: 6.7, fib: 10.8 },
  SOYA_CHUNKS: { cal: 336, pro: 52.4, carb: 33.5, fat: 0.5, fib: 13.0 },
  SOYA_GRANULES: { cal: 336, pro: 52.4, carb: 33.5, fat: 0.5, fib: 13.0 },
  GREEN_ONION: { cal: 32, pro: 1.8, carb: 7.3, fat: 0.2, fib: 2.6 },
  SPRING_ONION: { cal: 32, pro: 1.8, carb: 7.3, fat: 0.2, fib: 2.6 },
  CABBAGE: { cal: 25, pro: 1.3, carb: 5.8, fat: 0.1, fib: 2.5 },
  KALE: { cal: 35, pro: 2.9, carb: 4.4, fat: 0.7, fib: 4.1 },
  EGGPLANT: { cal: 25, pro: 1.0, carb: 5.9, fat: 0.2, fib: 3.0 },
  PUMPKIN: { cal: 26, pro: 1.0, carb: 6.5, fat: 0.1, fib: 0.5 },
  ZUCCHINI: { cal: 17, pro: 1.2, carb: 3.1, fat: 0.3, fib: 1.0 },
  DATES: { cal: 282, pro: 2.5, carb: 75.0, fat: 0.4, fib: 8.0 },
  SAFFRON: { cal: 310, pro: 11.4, carb: 65.4, fat: 5.9, fib: 3.9 },
  CARDAMOM: { cal: 311, pro: 10.8, carb: 68.5, fat: 6.7, fib: 28.0 },
  CLOVES: { cal: 274, pro: 6.0, carb: 65.5, fat: 13.0, fib: 33.9 },
  STAR_ANISE: { cal: 337, pro: 17.6, carb: 50.0, fat: 16.0, fib: 14.6 },
  BAY_LEAVES: { cal: 313, pro: 7.6, carb: 74.9, fat: 8.4, fib: 26.3 },
  FENNEL_SEEDS: { cal: 345, pro: 15.8, carb: 52.3, fat: 14.9, fib: 39.8 },
  FENUGREEK_SEEDS: { cal: 323, pro: 23.0, carb: 58.4, fat: 6.4, fib: 24.6 },
  KASOORI_METHI: { cal: 49, pro: 4.4, carb: 6.0, fat: 0.9, fib: 2.7 },
  KASHMIRI_RED_CHILLI_POWDER: { cal: 282, pro: 13.5, carb: 54.5, fat: 5.8, fib: 27.3 },
  BLACK_PEPPER: { cal: 251, pro: 10.4, carb: 63.9, fat: 3.3, fib: 25.3 },
  RED_CHILLI_POWDER: { cal: 282, pro: 13.5, carb: 54.5, fat: 5.8, fib: 27.3 },
  CHILLI_POWDER: { cal: 282, pro: 13.5, carb: 54.5, fat: 5.8, fib: 27.3 },
  TANDOORI_MASALA: { cal: 282, pro: 12.0, carb: 49.0, fat: 8.0, fib: 18.0 },
  HING: { cal: 297, pro: 4.0, carb: 67.8, fat: 1.1, fib: 4.1 },
  MACKEREL: { cal: 205, pro: 19.0, carb: 0.0, fat: 13.9, fib: 0.0 },
  PRAWN: { cal: 85, pro: 20.0, carb: 0.7, fat: 0.5, fib: 0.0 },
  PRAWNS: { cal: 85, pro: 20.0, carb: 0.7, fat: 0.5, fib: 0.0 },
  POMFRET: { cal: 96, pro: 18.5, carb: 0.0, fat: 2.6, fib: 0.0 },
  SURMAI: { cal: 109, pro: 20.2, carb: 0.0, fat: 3.0, fib: 0.0 },
  TILAPIA: { cal: 96, pro: 20.1, carb: 0.0, fat: 1.7, fib: 0.0 },
  EGG_YOLK: { cal: 322, pro: 15.9, carb: 3.6, fat: 26.5, fib: 0.0 },
  RED_ONION: { cal: 40, pro: 1.1, carb: 9.3, fat: 0.1, fib: 1.7 },
  TOMATO_PUREE: { cal: 82, pro: 4.3, carb: 18.9, fat: 0.5, fib: 4.3 },
  MICROGREENS: { cal: 25, pro: 2.5, carb: 3.5, fat: 0.5, fib: 2.0 },
  FRESH_PARSLEY: { cal: 36, pro: 3.0, carb: 6.3, fat: 0.8, fib: 3.3 },
  CILANTRO: { cal: 23, pro: 2.1, carb: 3.7, fat: 0.5, fib: 2.8 },
  MINT_LEAVES: { cal: 70, pro: 3.8, carb: 14.9, fat: 0.9, fib: 8.0 },
  BONE_BROTH: { cal: 15, pro: 2.7, carb: 0.3, fat: 0.3, fib: 0.0 },
  GREEK_YOGHURT: { cal: 59, pro: 10.2, carb: 3.6, fat: 0.4, fib: 0.0 },
  YOGHURT: { cal: 61, pro: 3.5, carb: 4.7, fat: 3.3, fib: 0.0 },
  BUTTER: { cal: 717, pro: 0.9, carb: 0.1, fat: 81.1, fib: 0.0 },
  PEPPER: { cal: 251, pro: 10.4, carb: 63.9, fat: 3.3, fib: 25.3 },
  GROUND_CUMIN: { cal: 375, pro: 17.8, carb: 44.2, fat: 22.3, fib: 10.5 },
  GROUND_CORIANDER: { cal: 298, pro: 12.4, carb: 55.0, fat: 17.8, fib: 41.9 },
};

// ─────────────────────────────────────────────────────────────────────────────
// 11. CATEGORY INFERENCE (unchanged from v4.1 — fallback for truly unknown keys)
// ─────────────────────────────────────────────────────────────────────────────
type InferredMacro = { category: string; macros: { cal: number; pro: number; carb: number; fat: number; fib: number } };

function inferMacrosFromKey(key: string): InferredMacro {
  const k = key.toUpperCase();
  if (/OIL|BUTTER|GHEE|FAT|LARD|CREAM(?!Y)|SHORTENING/.test(k))
    return { category: 'fat', macros: { cal: 850, pro: 0, carb: 2, fat: 94, fib: 0 } };
  if (/NUT|SEED|ALMOND|CASHEW|WALNUT|PECAN|PISTACHIO|HAZELNUT|PEPITA|PUMPKIN_SEED|SUNFLOWER_SEED/.test(k))
    return { category: 'nut_seed', macros: { cal: 580, pro: 18, carb: 20, fat: 50, fib: 8 } };
  if (/CHORIZO|BACON|PEPPERONI|SAUSAGE|SALAMI|LAMB\b|MUTTON|BEEF\b|PORK\b|MINCE|KEEMA/.test(k))
    return { category: 'meat', macros: { cal: 280, pro: 24, carb: 2, fat: 19, fib: 0 } };
  if (/PRAWN|SHRIMP|TUNA|MACKEREL|TILAPIA|COD\b|CRAB|LOBSTER|SQUID|NORI|DASHI/.test(k))
    return { category: 'seafood', macros: { cal: 100, pro: 20, carb: 0, fat: 2, fib: 0 } };
  if (/SPICE|POWDER|MASALA|PAPRIKA|CUMIN|CORIANDER|TURMERIC|PEPPER(?!ONI)|CHILLI|CHILI|FLAKES|ZEST|SALT|SAFFRON|CARDAMOM|CINNAMON|CLOVE|ANISE|BAY|SEASONING|ZAATAR|SUMAC|AMCHUR/.test(k))
    return { category: 'spice', macros: { cal: 300, pro: 10, carb: 55, fat: 10, fib: 20 } };
  if (/FRESH_|MICROGREEN|CILANTRO|PARSLEY|BASIL|MINT\b|DILL\b|CHIVE|CORIANDER|THYME|ROSEMARY|OREGANO|KASOORI/.test(k))
    return { category: 'fresh_herb', macros: { cal: 30, pro: 2.5, carb: 4, fat: 0.5, fib: 2.5 } };
  if (/SAUCE|PASTE|CHUTNEY|KETCHUP|VINEGAR|SOY|MISO|SRIRACHA|HARISSA|PESTO|MARINADE|DRESSING/.test(k))
    return { category: 'sauce', macros: { cal: 120, pro: 3, carb: 15, fat: 5, fib: 1 } };
  if (/MILK|CURD|YOGHURT|YOGURT|CHEESE|PANEER|RICOTTA|FETA|PARMESAN/.test(k))
    return { category: 'dairy', macros: { cal: 150, pro: 6, carb: 8, fat: 10, fib: 0 } };
  if (/BEAN|LENTIL|DAL|PEA(?!NUT)|CHICKPEA|EDAMAME|SOYA|SOY(?!_SAUCE)|TOFU|TEMPEH/.test(k))
    return { category: 'legume', macros: { cal: 120, pro: 8, carb: 18, fat: 2, fib: 7 } };
  if (/RICE|WHEAT|FLOUR|BREAD|NOODLE|PASTA|COUSCOUS|GRAIN|OATS|MILLET|BARLEY|ROTI|QUINOA|RAGI|JOWAR|BAJRA|SABUDANA/.test(k))
    return { category: 'grain', macros: { cal: 355, pro: 10, carb: 72, fat: 2, fib: 4 } };
  if (/FRUIT|BERRY|MANGO|APPLE|BANANA|GRAPE|LEMON|LIME|ORANGE|PINEAPPLE|POMEGRANATE|AVOCADO|COCONUT|DATES\b|FIG/.test(k))
    return { category: 'fruit', macros: { cal: 60, pro: 1, carb: 15, fat: 0.3, fib: 2 } };
  if (/CHICKEN|FISH|EGG|SALMON/.test(k))
    return { category: 'protein', macros: { cal: 150, pro: 20, carb: 2, fat: 7, fib: 0 } };
  return { category: 'vegetable', macros: { cal: 35, pro: 2, carb: 7, fat: 0.3, fib: 2.5 } };
}

declare namespace calculateMacros { let _warnedFallback: Set<string> | undefined; }

// ─────────────────────────────────────────────────────────────────────────────
// 12. MACRO CALCULATOR (unchanged from v4.1)
// ─────────────────────────────────────────────────────────────────────────────
type MacroResult = {
  caloriesPerServing: number;
  proteinGrams:       number;
  carbsGrams:         number;
  fatGrams:           number;
  fibreGrams:         number;
  caloriesPer100g:    number;
  proteinPer100g:     number;
  carbsPer100g:       number;
  fatPer100g:         number;
  fibrePer100g:       number;
};

function calculateMacros(
  ingredients: Ingredient[],
  missingMacros: Record<string, MissingFoodItem>,
  servingSizeGrams: number,
): { macros: MacroResult; unknownKeys: string[] } {
  const unknownKeys: string[] = [];
  let cal = 0, pro = 0, carb = 0, fat = 0, fib = 0;

  for (const ing of ingredients) {
    const key = ing.foodItemKey.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    const m = FI_MACROS[key] ?? (missingMacros[key]
      ? {
          cal:  missingMacros[key].per100Calories,
          pro:  missingMacros[key].per100Protein,
          carb: missingMacros[key].per100Carbs,
          fat:  missingMacros[key].per100Fat,
          fib:  missingMacros[key].per100Fiber,
        }
      : null);

    if (!m) {
      const fallback = FALLBACK_MACROS[key];
      if (fallback) {
        if (!calculateMacros._warnedFallback) calculateMacros._warnedFallback = new Set();
        if (!calculateMacros._warnedFallback.has(key)) {
          if (process.env.FITFUEL_VERBOSE) console.warn(`   [FALLBACK] "${key}" resolved from FALLBACK_MACROS`);
          calculateMacros._warnedFallback.add(key);
        }
        cal  += (fallback.cal  / 100) * ing.quantityGrams;
        pro  += (fallback.pro  / 100) * ing.quantityGrams;
        carb += (fallback.carb / 100) * ing.quantityGrams;
        fat  += (fallback.fat  / 100) * ing.quantityGrams;
        fib  += (fallback.fib  / 100) * ing.quantityGrams;
        continue;
      }
      unknownKeys.push(key);
      continue;
    }

    cal  += (m.cal  / 100) * ing.quantityGrams;
    pro  += (m.pro  / 100) * ing.quantityGrams;
    carb += (m.carb / 100) * ing.quantityGrams;
    fat  += (m.fat  / 100) * ing.quantityGrams;
    fib  += (m.fib  / 100) * ing.quantityGrams;
  }

  const r1 = (n: number) => Math.round(n * 10) / 10;
  const sg = servingSizeGrams || 300;

  return {
    unknownKeys,
    macros: {
      caloriesPerServing: Math.round(cal),
      proteinGrams:       r1(pro),
      carbsGrams:         r1(carb),
      fatGrams:           r1(fat),
      fibreGrams:         r1(fib),
      caloriesPer100g:    Math.round((cal / sg) * 100),
      proteinPer100g:     r1((pro  / sg) * 100),
      carbsPer100g:       r1((carb / sg) * 100),
      fatPer100g:         r1((fat  / sg) * 100),
      fibrePer100g:       r1((fib  / sg) * 100),
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. LLM CALL — v5.0 — CLAUDE API
// ─────────────────────────────────────────────────────────────────────────────
async function generateBatch(
  plan: PlanConfig,
  slotQueue: string[],
  batchIdx: number,
  totalBatches: number,
  usedSlugs: Set<string>,
  knownMissingKeys: Set<string>,
  usedCuisines: Set<string>,
  usedProteins: Set<string>,
  allMissing: Map<string, MissingFoodItem>,
) {
  let lastError: Error | null = null;
  const mustDeclareKeys = new Set<string>();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const prompt = buildPrompt(
        plan, slotQueue, batchIdx, totalBatches,
        usedSlugs, knownMissingKeys, usedCuisines, usedProteins,
        mustDeclareKeys,
      );

      // ── Claude API call ──────────────────────────────────────────────────
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 16000,
        system: `You are the world's best healthy cloud kitchen chef-nutritionist for a Pune, India cloud kitchen.
Your output is raw JSON only. No markdown. No preamble. No explanation.
CRITICAL RULES:
1. Every recipe must use Indian regional or Indian fusion cuisine. Zero purely international recipes.
2. Every ingredient must be sourceable from Pune APMC mandi in bulk.
3. Forbidden: tahini, miso, gochujang, kimchi, couscous, fresh lemongrass at scale, avocado, edamame, chipotle, rice noodles (except IndoChinese), pickled jalapeños.
4. Every recipe name must reflect Indian regional or fusion identity — not global.
5. Every description must be 130+ characters describing technique and why it tastes amazing.
6. Every step instruction must include visual cues, timing, and the reason behind the technique.
7. Every kitchenNote must address delivery/pack/hold operations.
8. Minimum 12 ingredients per recipe (every spice listed individually with gram weights).
9. Minimum 5 steps per recipe.
10. Never generate macro fields on the recipe object.
11. CRITICAL: Every ingredient NOT in the core 30 keys MUST be declared in missingFoodItems with accurate per-100g nutritional data. This includes garlic, ginger, all spices, all oils, all herbs, all additional vegetables.
12. DIET VIOLATION = INSTANT BATCH REJECTION: VEG/VEGAN/JAIN plans MUST NEVER include fish sauce, oyster sauce, anchovy, fish stock, meat stock, lard, gelatin, or any animal-derived ingredient.`,
        messages: [
          { role: 'user', content: prompt },
        ],
      });

      const raw = response.content[0].type === 'text' ? response.content[0].text : '{}';

      function repairJson(s: string): any {
        try { return JSON.parse(s); } catch {}
        const block = s.match(/\{[\s\S]*\}/);
        if (block) {
          try { return JSON.parse(block[0]); } catch {}
          let truncated = block[0];
          truncated = truncated.replace(/,\s*$/, '');
          truncated = truncated.replace(/"[^"]*$/, '"...')
            .replace(/'[^']*$/, "'...");
          let opens = 0, openBraces = 0;
          for (const ch of truncated) {
            if (ch === '[') opens++;
            else if (ch === ']') opens--;
            else if (ch === '{') openBraces++;
            else if (ch === '}') openBraces--;
          }
          truncated += ']'.repeat(Math.max(0, opens));
          truncated += '}'.repeat(Math.max(0, openBraces));
          try { return JSON.parse(truncated); } catch {}
        }
        throw new Error('Invalid JSON — response could not be repaired');
      }

      let parsed: any;
      try {
        parsed = repairJson(raw);
      } catch (jsonErr: any) {
        throw new Error(`Invalid JSON — ${jsonErr.message}`);
      }

      if (parsed.result && typeof parsed.result === 'object') parsed = parsed.result;
      if (!Array.isArray(parsed.recipes)) throw new Error('No recipes array in response');
      parsed.missingFoodItems = parsed.missingFoodItems || [];

      // ── Normalise fields ────────────────────────────────────────────────
      const DIFFICULTY_MAP: Record<string, string> = {
        easy:'easy', medium:'medium', hard:'hard', simple:'easy', beginner:'easy', basic:'easy',
        intermediate:'medium', moderate:'medium', advanced:'hard', expert:'hard', complex:'hard',
      };

      parsed.recipes.forEach((r: any) => {
        if (typeof r.difficulty === 'string')
          r.difficulty = DIFFICULTY_MAP[r.difficulty.toLowerCase().trim()] ?? 'medium';

        const numFields = ['servingSizeGrams','prepTimeMins','cookTimeMins','shelfLifeHours','rotationGroup'];
        for (const f of numFields) if (r[f] != null) r[f] = Number(r[f]);

        if (!r.shortDescription || typeof r.shortDescription !== 'string')
          r.shortDescription = (r.name || '').slice(0, 80);
        else if (r.shortDescription.length > 80)
          r.shortDescription = r.shortDescription.slice(0, 80);
        if (!r.description || typeof r.description !== 'string' || r.description.length < 80)
          r.description = r.shortDescription + '. A premium FitFuel recipe crafted for your specific nutrition goals with carefully sourced, fresh Indian ingredients.';
        if (!r.cuisineType || typeof r.cuisineType !== 'string') r.cuisineType = 'NorthIndian';
        if (!r.packagingType || typeof r.packagingType !== 'string') r.packagingType = 'standard_box';
        if (!r.kitchenStation || typeof r.kitchenStation !== 'string') r.kitchenStation = 'hot_kitchen';
        if (!Array.isArray(r.dietaryTags))    r.dietaryTags    = [];
        if (!Array.isArray(r.planCategories)) r.planCategories = [];
        if (!Array.isArray(r.equipmentNeeded)) r.equipmentNeeded = [];
        if (!Array.isArray(r.allergens))      r.allergens      = [];
        if (!Array.isArray(r.seasonTags))     r.seasonTags     = ['all_year'];
        if (r.rotationGroup == null || isNaN(r.rotationGroup)) r.rotationGroup = 1;
        if (r.isFeatured == null) r.isFeatured = false;
        if (r.shelfLifeHours == null || isNaN(r.shelfLifeHours)) r.shelfLifeHours = 4;

        (r.ingredients || []).forEach((ing: any, i: number) => {
          ing.orderInRecipe      = Number(ing.orderInRecipe ?? i + 1);
          ing.isOptional         = ing.isOptional ?? false;
          ing.cookedWeightFactor = Number(ing.cookedWeightFactor ?? 1.0);
          ing.quantityGrams      = Number(ing.quantityGrams);
          ing.foodItemKey        = (ing.foodItemKey || '').toUpperCase().replace(/[^A-Z0-9]/g, '_');
        });

        (r.steps || []).forEach((s: any, i: number) => {
          s.stepNumber = Number(s.stepNumber ?? i + 1);
          if (s.durationMins != null) s.durationMins = Number(s.durationMins);
          if (s.temperatureC != null) s.temperatureC = Number(s.temperatureC);
          if (!s.title || typeof s.title !== 'string') s.title = `Step ${s.stepNumber}`;
          if (!s.instruction || typeof s.instruction !== 'string' || s.instruction.length < 20)
            s.instruction = `${s.title}. Ensure even cooking throughout and plate with care for visual appeal.`;
        });
      });

      (parsed.missingFoodItems || []).forEach((item: any) => {
        ['per100Calories','per100Protein','per100Carbs','per100Fat','per100Fiber']
          .forEach(f => { if (item[f] != null) item[f] = Number(item[f]); });
      });

      // ── Zod validation ──────────────────────────────────────────────────
      let validated: any;
      try {
        validated = BatchSchema.parse(parsed);
      } catch (zodErr: any) {
        if (zodErr.errors) {
          console.error('\n   📋 ZOD VALIDATION ERRORS:');
          for (const e of zodErr.errors)
            console.error(`      path: ${e.path.join('.')} | code: ${e.code} | message: ${e.message}`);
        }
        throw new Error(`Schema validation failed: ${zodErr.message}`);
      }

      // ── Macro gate: warn-only, auto-infer truly unknown keys ────────────
      const batchMissingMacros: Record<string, MissingFoodItem> = {};
      for (const [k, v] of allMissing.entries()) batchMissingMacros[k.toUpperCase()] = v;
      validated.missingFoodItems.forEach((item: MissingFoodItem) => {
        batchMissingMacros[item.key.toUpperCase()] = item;
      });

      for (const r of validated.recipes) {
        const { unknownKeys } = calculateMacros(r.ingredients, batchMissingMacros, r.servingSizeGrams);
        if (unknownKeys.length > 0) {
          unknownKeys.forEach(k => {
            const inferred = inferMacrosFromKey(k);
            FALLBACK_MACROS[k] = inferred.macros;
            if (!calculateMacros._warnedFallback) calculateMacros._warnedFallback = new Set();
            if (!calculateMacros._warnedFallback.has(k)) {
              console.warn(`   ⚠️  [AUTO-INFER] "${k}" → category="${inferred.category}" (${inferred.macros.cal} kcal) — add to FALLBACK_MACROS if recurring`);
              calculateMacros._warnedFallback.add(k);
            }
          });
        }
      }

      // ── Quality gates ───────────────────────────────────────────────────
      const cuisinesInBatch = new Set<string>();
      for (const r of validated.recipes) {
        if (!r.steps.length) throw new Error(`No steps: ${r.name}`);
        if (r.steps.length < 4) throw new Error(`Insufficient steps (${r.steps.length} < 4): ${r.name}`);
        if (!r.ingredients.length) throw new Error(`No ingredients: ${r.name}`);
        if (r.ingredients.length < 10) throw new Error(`Too few ingredients (${r.ingredients.length} < 10): ${r.name}`);
        if (r.description.length < 80) throw new Error(`Description too short (${r.description.length} chars): ${r.name}`);
        if (!r.cuisineType || r.cuisineType.length < 3) throw new Error(`Missing cuisineType: ${r.name}`);
        if (cuisinesInBatch.has(r.cuisineType.toLowerCase()))
          console.warn(`   ⚠️  Duplicate cuisineType "${r.cuisineType}" in batch`);
        cuisinesInBatch.add(r.cuisineType.toLowerCase());
      }

      return validated;

    } catch (err: any) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const wait = attempt * 2500;
        console.log(`\n   ⚠️  Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message.slice(0, 180)}`);
        console.log(`   ↻  Retrying in ${wait / 1000}s...`);
        await sleep(wait);
      }
    }
  }

  throw new Error(`Batch failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. TS FILE ASSEMBLER (unchanged from v4.1 — only core 30 in FI map now)
// ─────────────────────────────────────────────────────────────────────────────
function buildIngredients(ings: Ingredient[]): string {
  return ings.map(ing => {
    const parts = [
      `foodItemKey: '${ing.foodItemKey}'`,
      `quantityGrams: ${ing.quantityGrams}`,
      `cookedWeightFactor: ${ing.cookedWeightFactor ?? 1.0}`,
      ing.prepNote ? `prepNote: '${ing.prepNote.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'` : null,
      `isOptional: ${ing.isOptional ?? false}`,
      `orderInRecipe: ${ing.orderInRecipe}`,
    ].filter(Boolean);
    return `      { ${parts.join(', ')} }`;
  }).join(',\n');
}

function buildSteps(steps: Step[]): string {
  return steps.map(s => {
    const parts = [
      `stepNumber: ${s.stepNumber}`,
      `title: '${s.title.replace(/'/g, "\\'")}'`,
      `instruction: ${JSON.stringify(s.instruction)}`,
      s.durationMins  != null ? `durationMins: ${s.durationMins}`      : null,
      s.temperatureC  != null ? `temperatureC: ${s.temperatureC}`      : null,
      s.technique     ? `technique: '${s.technique}'`                  : null,
      s.kitchenNote   ? `kitchenNote: ${JSON.stringify(s.kitchenNote)}` : null,
    ].filter(Boolean);
    return `      { ${parts.join(', ')} }`;
  }).join(',\n');
}

async function writeSeedFile(plan: PlanConfig, recipes: RecipeInput[], missingItems: MissingFoodItem[]) {
  const missingMacros: Record<string, MissingFoodItem> = {};
  for (const m of missingItems) missingMacros[m.key.toUpperCase()] = m;

  const missingBlock = missingItems.length
    ? missingItems.map(i =>
        `  { name: '${i.name.replace(/'/g, "\\'")}', category: '${i.category}', ` +
        `per100Calories: ${i.per100Calories}, per100Protein: ${i.per100Protein}, ` +
        `per100Carbs: ${i.per100Carbs}, per100Fat: ${i.per100Fat}, per100Fiber: ${i.per100Fiber} }`,
      ).join(',\n')
    : '';

  let lastMealType = '';
  const mealTypeCounts: Record<string, number> = {};
  recipes.forEach(r => { mealTypeCounts[r.mealType] = (mealTypeCounts[r.mealType] || 0) + 1; });

  const recipeBlocks = recipes.map(r => {
    const { macros } = calculateMacros(r.ingredients, missingMacros, r.servingSizeGrams);
    let header = '';
    if (r.mealType !== lastMealType) {
      const count = mealTypeCounts[r.mealType];
      const mealLabel = r.mealType === 'LUNCH' ? 'LUNCHES' : r.mealType + 'S';
      header = `\n\n  // =========================================================================\n  // ${mealLabel} (${count} recipe${count !== 1 ? 's' : ''})\n  // =========================================================================\n`;
      lastMealType = r.mealType;
    }
    const platingSummaryLine = (r as any).platingSummary
      ? `\n      platingSummary: '${((r as any).platingSummary as string).replace(/'/g, "\\'")}',`
      : '';
    return `${header}  {\n    recipe: {\n      name: '${r.name.replace(/'/g, "\\'")}',\n      slug: '${r.slug}',\n      description: '${r.description.replace(/'/g, "\\'")}',\n      shortDescription: '${r.shortDescription.replace(/'/g, "\\'")}',\n      cuisineType: '${r.cuisineType}',\n      mealType: MealSlot.${r.mealType},\n      dietaryTags: ${JSON.stringify(r.dietaryTags)},\n      planCategories: ${JSON.stringify(r.planCategories)},\n      tierAvailability: [PlanTier.STANDARD, PlanTier.PREMIUM, PlanTier.LUXURY],\n      servingSizeGrams: ${r.servingSizeGrams},\n      prepTimeMins: ${r.prepTimeMins},\n      cookTimeMins: ${r.cookTimeMins},\n      difficulty: '${r.difficulty}',\n      equipmentNeeded: ${JSON.stringify(r.equipmentNeeded)},\n      allergens: ${JSON.stringify(r.allergens)},\n      shelfLifeHours: ${r.shelfLifeHours},\n      packagingType: '${r.packagingType}',\n      kitchenStation: '${r.kitchenStation}',\n      seasonTags: ${JSON.stringify(r.seasonTags)},\n      rotationGroup: ${r.rotationGroup},\n      caloriesPerServing: ${macros.caloriesPerServing},\n      proteinGrams: ${macros.proteinGrams},\n      carbsGrams: ${macros.carbsGrams},\n      fatGrams: ${macros.fatGrams},\n      fibreGrams: ${macros.fibreGrams},\n      caloriesPer100g: ${macros.caloriesPer100g},\n      proteinPer100g: ${macros.proteinPer100g},\n      carbsPer100g: ${macros.carbsPer100g},\n      fatPer100g: ${macros.fatPer100g},\n      fibrePer100g: ${macros.fibrePer100g},${platingSummaryLine}\n      isActive: true,\n      isFeatured: ${r.isFeatured},\n    },\n    ingredients: [\n${buildIngredients(r.ingredients)}\n    ],\n    steps: [\n${buildSteps(r.steps)}\n    ],\n  }`;
  }).join(',\n');

  const staticMapLines = Object.entries(FI_MAP).map(([k]) => `    ${k.padEnd(24)}: FI.${k}`).join(',\n');
  const dietLabel = plan.dietVariant.replace(/_/g, '-');
  const catLabel  = plan.planCategory.replace(/_/g, ' ');

  const ts = `// prisma/${plan.file}
// Run: npx tsx prisma/${plan.file}
// Seeds: ${plan.recipeCount} commercial-grade ${dietLabel} recipes for ${catLabel} plan
// Generated by FitFuel Seed Generator v5.0 (Claude API, India-first) — ${new Date().toISOString().split('T')[0]}
// Depends on: 9A schema migration complete, seed-meal-plans.ts run

import 'dotenv/config'
import { PrismaClient, MealSlot, PlanTier } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// CORE FOOD ITEM IDs — verified DB IDs (30 items)
// ---------------------------------------------------------------------------
const FI = {
  BASMATI_RICE_COOKED:    '${FI_MAP.BASMATI_RICE_COOKED}',
  ROTI:                   '${FI_MAP.ROTI}',
  POHA:                   '${FI_MAP.POHA}',
  UPMA:                   '${FI_MAP.UPMA}',
  IDLI:                   '${FI_MAP.IDLI}',
  OATS_DRY:               '${FI_MAP.OATS_DRY}',
  TOOR_DAL:               '${FI_MAP.TOOR_DAL}',
  MASOOR_DAL:             '${FI_MAP.MASOOR_DAL}',
  RAJMA:                  '${FI_MAP.RAJMA}',
  CHICKPEAS:              '${FI_MAP.CHICKPEAS}',
  MOONG_DAL:              '${FI_MAP.MOONG_DAL}',
  SPINACH:                '${FI_MAP.SPINACH}',
  TOMATO:                 '${FI_MAP.TOMATO}',
  ONION:                  '${FI_MAP.ONION}',
  CAULIFLOWER:            '${FI_MAP.CAULIFLOWER}',
  CARROT:                 '${FI_MAP.CARROT}',
  CURD_LOWFAT:            '${FI_MAP.CURD_LOWFAT}',
  GHEE:                   '${FI_MAP.GHEE}',
  EGG_WHOLE:              '${FI_MAP.EGG_WHOLE}',
  EGG_WHITE:              '${FI_MAP.EGG_WHITE}',
  CHICKEN_BREAST:         '${FI_MAP.CHICKEN_BREAST}',
  CHICKEN_THIGH:          '${FI_MAP.CHICKEN_THIGH}',
  ROHU_FISH:              '${FI_MAP.ROHU_FISH}',
  SALMON:                 '${FI_MAP.SALMON}',
  ALMONDS:                '${FI_MAP.ALMONDS}',
  PEANUTS:                '${FI_MAP.PEANUTS}',
  CHIA_SEEDS:             '${FI_MAP.CHIA_SEEDS}',
  BANANA:                 '${FI_MAP.BANANA}',
  PANEER:                 '${FI_MAP.PANEER}',
  CURD_FULLFAT:           '${FI_MAP.CURD_FULLFAT}',
}

// ---------------------------------------------------------------------------
// MISSING FOOD ITEMS — created by this seed at runtime
// These are all ingredients beyond the core 30 used in these recipes.
// The seed script creates them in food_items and maps their real IDs.
// ---------------------------------------------------------------------------
const MISSING_FOOD_ITEMS = [
${missingBlock}
]

const NEW_FI: Record<string, string> = {}

// ---------------------------------------------------------------------------
// RECIPE DEFINITIONS — ${recipes.length} recipes, ${catLabel} ${dietLabel}
// ---------------------------------------------------------------------------

type RecipeData = {
  name: string; slug: string; description: string; shortDescription: string
  cuisineType: string; mealType: MealSlot; dietaryTags: string[]
  planCategories: string[]; tierAvailability: PlanTier[]
  servingSizeGrams: number; prepTimeMins: number; cookTimeMins: number
  difficulty: 'easy' | 'medium' | 'hard'; equipmentNeeded: string[]; allergens: string[]
  shelfLifeHours: number; packagingType: string; kitchenStation: string
  seasonTags: string[]; rotationGroup: number
  caloriesPerServing: number; proteinGrams: number; carbsGrams: number
  fatGrams: number; fibreGrams: number
  caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number
  fatPer100g: number; fibrePer100g: number
  platingSummary?: string; glycaemicIndex?: number
  isActive: boolean; isFeatured: boolean
}
type IngredientRef = {
  foodItemKey: string; quantityGrams: number; cookedWeightFactor: number
  prepNote?: string; isOptional: boolean; orderInRecipe: number
}
type StepData = {
  stepNumber: number; title: string; instruction: string
  durationMins?: number; temperatureC?: number; technique?: string; kitchenNote?: string
}
type RecipeDef = { recipe: RecipeData; ingredients: IngredientRef[]; steps: StepData[] }

const RECIPES: RecipeDef[] = [
${recipeBlocks}
]

// ---------------------------------------------------------------------------
// LOOKUP HELPER
// ---------------------------------------------------------------------------
function getFoodItemId(key: string): string | null {
  const staticMap: Record<string, string> = {
${staticMapLines}
  }
  if (staticMap[key] !== undefined) return staticMap[key]
  if (NEW_FI[key] !== undefined)    return NEW_FI[key]
  return null
}

// ---------------------------------------------------------------------------
// SEED FUNCTION
// ---------------------------------------------------------------------------
async function seedRecipes() {
  console.log('\\n🌱 Starting ${dietLabel} recipe seed (v5.0, India-first)...')
  console.log('📦 Step 1: Creating missing food items...\\n')

  const nameToKey = (s: string) =>
    s.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '')

  for (const item of MISSING_FOOD_ITEMS) {
    const key = nameToKey(item.name)
    if (!key) { console.log(\`⚠️  No key for: \${item.name}\`); continue }
    const existing = await prisma.foodItem.findFirst({ where: { name: item.name } })
    if (existing) {
      NEW_FI[key] = existing.id
      console.log(\`⏭️  Exists: \${item.name} → \${existing.id}\`)
      continue
    }
    const created = await prisma.foodItem.create({
      data: {
        name: item.name, category: item.category,
        per100Calories: item.per100Calories, per100Protein: item.per100Protein,
        per100Carbs: item.per100Carbs, per100Fat: item.per100Fat,
        per100Fiber: item.per100Fiber, isCustom: false,
      },
    })
    NEW_FI[key] = created.id
    console.log(\`✅ Created: \${item.name} → \${created.id}\`)
  }

  console.log(\`\\n📋 Step 2: Seeding \${RECIPES.length} recipes...\\n\`)
  let created = 0, skipped = 0

  for (const def of RECIPES) {
    const existing = await prisma.recipe.findUnique({
      where: { slug: def.recipe.slug },
      include: { ingredients: true },
    })

    let recipe: { id: string }

    if (existing) {
      if (existing.ingredients.length > 0) {
        console.log(\`⏭️  Exists: \${def.recipe.name}\`); skipped++; continue
      }
      console.log(\`♻️  Re-seeding orphaned recipe: \${def.recipe.name}\`)
      recipe = existing
    } else {
      const { platingSummary: _p, glycaemicIndex: _g, ...recipeData } = def.recipe
      recipe = await prisma.recipe.create({ data: recipeData })
    }

    let errs = 0

    for (const ing of def.ingredients) {
      const id = getFoodItemId(ing.foodItemKey)
      if (!id) { console.log(\`  ⚠️  Missing key: \${ing.foodItemKey}\`); errs++; continue }
      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id, foodItemId: id,
          quantityGrams: ing.quantityGrams, cookedWeightFactor: ing.cookedWeightFactor,
          prepNote: ing.prepNote ?? null, isOptional: ing.isOptional, orderInRecipe: ing.orderInRecipe,
        },
      })
    }

    for (const step of def.steps) {
      await prisma.recipeStep.create({
        data: {
          recipeId: recipe.id, stepNumber: step.stepNumber,
          title: step.title, instruction: step.instruction,
          durationMins: step.durationMins ?? null,
          temperatureC: step.temperatureC ?? null,
          technique: step.technique ?? null,
          kitchenNote: step.kitchenNote ?? null,
          imageUrl: null,
        },
      })
    }

    const status = errs > 0 ? \`⚠️  (\${errs} missing keys)\` : '✅'
    console.log(\`\${status} \${def.recipe.cuisineType} | \${def.recipe.mealType} | \${def.recipe.name} (\${def.ingredients.length} ing, \${def.steps.length} steps)\`)
    created++
  }

  console.log('\\n─────────────────────────────────────────────────')
  console.log(\`✅ Recipes created : \${created}\`)
  console.log(\`⏭️  Recipes skipped : \${skipped}\`)
  console.log(\`📋 Total           : \${RECIPES.length}\`)
  console.log('─────────────────────────────────────────────────')
  console.log('🎉 ${catLabel} ${dietLabel} seed complete! (FitFuel Seed Generator v5.0)')
}

seedRecipes()
  .catch(e => { console.error('💥 Seed failed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); pool.end() })
`;

  let formatted = ts;
  try {
    formatted = await prettier.format(ts, { parser: 'typescript', singleQuote: true, printWidth: 120, trailingComma: 'all' });
  } catch {
    console.warn('   ⚠️  Prettier failed, saving unformatted.');
  }

  await fs.writeFile(path.join(OUTPUT_DIR, plan.file), formatted, 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// 15. ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────────────────
async function loadProgress() {
  try { return JSON.parse(await fs.readFile(PROGRESS_FILE, 'utf8')); }
  catch { return { completed: [], failed: [] }; }
}
async function saveProgress(p: any) { await fs.writeFile(PROGRESS_FILE, JSON.stringify(p, null, 2)); }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  const args        = process.argv.slice(2);
  const targetPlan  = args.find(a => a.startsWith('--plan='))?.split('=')[1];
  const fromIndex   = parseInt(args.find(a => a.startsWith('--from='))?.split('=')[1] || '0', 10);
  const retryFailed = args.includes('--retry-failed');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const progress = await loadProgress();

  let queue: PlanConfig[];
  if (targetPlan)       queue = PLAN_LIST.filter(p => p.slug === targetPlan);
  else if (retryFailed) queue = PLAN_LIST.filter(p => progress.failed.includes(p.slug));
  else                  queue = PLAN_LIST.slice(fromIndex).filter(p => !progress.completed.includes(p.slug));

  if (queue.length === 0) {
    console.log('✅ Nothing to generate. Use --retry-failed or --plan=<slug>.');
    return;
  }

  console.log(`\n🚀 FITFUEL SEED GENERATOR v5.0 — CLAUDE API + INDIA-FIRST`);
  console.log(`📋 Plans queued  : ${queue.length}`);
  console.log(`📦 Batch size    : ${BATCH_SIZE} recipes per API call`);
  console.log(`🔁 Max retries   : ${MAX_RETRIES}`);
  console.log(`🍛 Cuisine matrix: ${CUISINE_MATRIX_INDIAN_REGIONAL.length} Indian regional + ${CUISINE_MATRIX_INDIAN_FUSION.length} Indian fusion`);
  console.log(`📂 Output dir    : ${OUTPUT_DIR}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  for (let i = 0; i < queue.length; i++) {
    const plan = queue[i];
    console.log(`\n⚙️  [${i + 1}/${queue.length}] ${plan.slug} (${plan.recipeCount} recipes | ${plan.cal} kcal | ${plan.protein}g protein)`);

    const slots     = getMealSlots(plan);
    const slotQueue = Object.entries(slots).flatMap(([slot, count]) => Array(count).fill(slot));

    const allRecipes: RecipeInput[]           = [];
    const allMissing = new Map<string, MissingFoodItem>();
    const usedSlugs           = new Set<string>();
    const knownMissingKeys    = new Set<string>();
    const usedCuisines        = new Set<string>();
    const usedProteins        = new Set<string>();

    try {
      const batches: string[][] = [];
      for (let j = 0; j < slotQueue.length; j += BATCH_SIZE) batches.push(slotQueue.slice(j, j + BATCH_SIZE));

      console.log(`   📦 ${slotQueue.length} recipes → ${batches.length} batches of ≤${BATCH_SIZE}`);
      console.log(`   🍽️  Slot distribution: ${Object.entries(slots).map(([s, n]) => `${s}×${n}`).join(' | ')}`);

      for (let bi = 0; bi < batches.length; bi++) {
        process.stdout.write(`   🔨 Batch ${bi + 1}/${batches.length} [${batches[bi].join(', ')}]... `);

        const result = await generateBatch(
          plan, batches[bi], bi, batches.length,
          usedSlugs, knownMissingKeys, usedCuisines, usedProteins,
          allMissing,
        );

        result.missingFoodItems.forEach((item: MissingFoodItem) => {
          const key = item.key.toUpperCase();
          allMissing.set(key, { ...item, key });
          knownMissingKeys.add(key);
        });

        result.recipes.forEach((r: RecipeInput) => {
          allRecipes.push(r);
          usedSlugs.add(r.slug);
          if (r.cuisineType) usedCuisines.add(r.cuisineType.toLowerCase());
          const primaryIngKey = r.ingredients?.[0]?.foodItemKey?.toLowerCase();
          if (primaryIngKey) usedProteins.add(primaryIngKey);
        });

        const cuisinesThisBatch = result.recipes.map((r: RecipeInput) => r.cuisineType).join(', ');
        console.log(`✅ ${result.recipes.length} recipes | cuisines: ${cuisinesThisBatch} | ${result.missingFoodItems.length} new food items`);

        if (bi < batches.length - 1) await sleep(DELAY_BATCH);
      }

      await writeSeedFile(plan, allRecipes, Array.from(allMissing.values()));
      progress.completed.push(plan.slug);
      progress.failed = progress.failed.filter((s: string) => s !== plan.slug);
      await saveProgress(progress);
      console.log(`   📄 Written: output/${plan.file}`);
      const recipeShortfall = plan.recipeCount - allRecipes.length;
      if (recipeShortfall > 0)
        console.warn(`   ⚠️  SHORTFALL: got ${allRecipes.length}/${plan.recipeCount} recipes. Re-run with --plan=${plan.slug} to top up.`);
      console.log(`   📊 ${allRecipes.length} recipes | ${allMissing.size} new food items | ${usedCuisines.size} unique cuisines`);

    } catch (err: any) {
      console.error(`\n   ❌ FAILED: ${plan.slug} — ${err.message}`);
      if (!progress.failed.includes(plan.slug)) progress.failed.push(plan.slug);
      await saveProgress(progress);
      await fs.writeFile(
        path.join(OUTPUT_DIR, `${plan.slug}.error.txt`),
        `Error: ${err.message}\n\nStack:\n${err.stack}`,
      );
    }

    if (i < queue.length - 1) await sleep(DELAY_PLAN);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const p = await loadProgress();
  console.log(`✅ Completed : ${p.completed.length} plans`);
  console.log(`❌ Failed    : ${p.failed.length} plans`);
  if (p.failed.length > 0)
    console.log(`\n🔁 Retry: npx tsx generate-fitfuel-seeds.ts --retry-failed`);
  console.log('\n📌 Next steps:');
  console.log('   1. Review output/*.ts — check recipe names are Indian, no forbidden ingredients');
  console.log('   2. cp output/*.ts prisma/');
  console.log('   3. npx tsx prisma/seed-recipes-<plan>.ts');
}

main().catch(console.error);

console.log('✅ [CANARY] FitFuel Seed Generator v5.0 loaded, main() invoked');