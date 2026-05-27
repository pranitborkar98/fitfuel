#!/usr/bin/env ts-node
/**
 * FitFuel Seed Generator — COMMERCIAL-GRADE ARCHITECTURE
 * AI → STRICT JSON (creative only) → Zod Validate → DYNAMIC MACRO RESOLVE → TS Compile
 * 
 * KEY PRINCIPLES:
 * 1. AI NEVER outputs recipe-level macros (caloriesPerServing, etc.)
 * 2. AI CAN invent any ingredient. Unknowns go to missingFoodItems with realistic per-100g defaults.
 * 3. Code MERGES known DB + AI-discovered items → calculates macros deterministically.
 * 4. Fault-tolerant: Auto-fills lazy steps instead of crashing. Generates to completion.
 */

import 'dotenv/config';
import OpenAI from 'openai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import * as prettier from 'prettier';

// ─────────────────────────────────────────────────────────────────────────────
// 1. ZOD SCHEMAS — AI INPUT (MACROS OPTIONAL FOR MISSING ITEMS ONLY)
// ─────────────────────────────────────────────────────────────────────────────
const MissingFoodItemSchema = z.object({
  name: z.string(),
  key: z.string(),
  category: z.string(),
  per100Calories: z.number().optional(),
  per100Protein: z.number().optional(),
  per100Carbs: z.number().optional(),
  per100Fat: z.number().optional(),
  per100Fiber: z.number().optional(),
});

const IngredientSchema = z.object({
  foodItemKey: z.string(),
  quantityGrams: z.number(),
  cookedWeightFactor: z.number().optional(),
  prepNote: z.string().optional(),
  isOptional: z.boolean().optional(),
  orderInRecipe: z.number().optional(),
});

const StepSchema = z.object({
  stepNumber: z.number(),
  title: z.string(),
  instruction: z.string(),
  durationMins: z.number().optional(),
  technique: z.string().optional(),
  kitchenNote: z.string().optional(),
});

// ✅ AI OUTPUT SCHEMA: NO RECIPE-LEVEL MACROS
const RecipeInputSchema = z.object({
  name: z.string(),
  slug: z.string().optional(),
  description: z.string(),
  shortDescription: z.string().optional(),
  cuisineType: z.string().optional(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  dietaryTags: z.array(z.string()).optional(),
  planCategories: z.array(z.string()).optional(),
  servingSizeGrams: z.number().optional(),
  prepTimeMins: z.number().optional(),
  cookTimeMins: z.number().optional(),
  difficulty: z.string().optional(),
  equipmentNeeded: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  shelfLifeHours: z.number().optional(),
  packagingType: z.string().optional(),
  kitchenStation: z.string().optional(),
  seasonTags: z.array(z.string()).optional(),
  rotationGroup: z.number().optional(),
  isFeatured: z.boolean().optional(),
  ingredients: z.array(IngredientSchema),
  steps: z.array(StepSchema),
});

const BatchResponseSchema = z.object({
  missingFoodItems: z.array(MissingFoodItemSchema).default([]),
  recipes: z.array(RecipeInputSchema),
});

// Final schema with macros (added post-calculation, never from AI)
const RecipeOutputSchema = RecipeInputSchema.extend({
  caloriesPerServing: z.number(),
  proteinGrams: z.number(),
  carbsGrams: z.number(),
  fatGrams: z.number(),
  fibreGrams: z.number(),
  caloriesPer100g: z.number(),
  proteinPer100g: z.number(),
  carbsPer100g: z.number(),
  fatPer100g: z.number(),
  fibrePer100g: z.number(),
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error('❌ Missing OPENAI_API_KEY in .env');

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const OUTPUT_DIR = path.join(process.cwd(), 'output');
const PROGRESS_FILE = path.join(process.cwd(), 'progress.json');
const FOOD_DB_PATH = path.join(process.cwd(), 'data', 'food-items.json');
const BATCH_SIZE = 2;
const DELAY_BATCH = 1500;
const DELAY_PLAN = 2000;
const MAX_RETRIES = 3; // Reduced to save time. Fallback handles lazy outputs.

// Core Food Item Map (Prisma IDs)
const FI_MAP: Record<string, string> = {
  BASMATI_RICE_COOKED: 'cmpa7mnoq000420ugxi69878u', ROTI: 'cmpa7mo3p000520ug80thl0j1',
  POHA: 'cmpa7mowz000720ugt8luwuwl', UPMA: 'cmpa7mpbl000820ug0fkxm9hi',
  IDLI: 'cmpa7mpq7000920ugn8criyqu', OATS_DRY: 'cmpa7mrcl000d20ug44sudfy1',
  TOOR_DAL: 'cmpa7mrr5000e20ugylkmb052', MASOOR_DAL: 'cmpa7ms5z000f20ugxi4zujc7',
  RAJMA: 'cmpa7msz1000h20ugho8x65z4', CHICKPEAS: 'cmpa7mtdr000i20ugbveydv96',
  MOONG_DAL: 'cmpa7mts7000j20ugwrxdvixk', SPINACH: 'cmpa7mul3000l20ugu6394ti0',
  TOMATO: 'cmpa7mve4000n20ugo3xfeg9c', ONION: 'cmpa7mvsm000o20ugl9gw7jsg',
  CAULIFLOWER: 'cmpa7mw74000p20ugbom3l88u', CARROT: 'cmpa7mwlm000q20ug4y1k1x9h',
  CURD_LOWFAT: 'cmpa7mxt5000t20ugxr5f2cwd', GHEE: 'cmpa7mz0i000w20ug62y9fvdi',
  EGG_WHOLE: 'cmpa7mztp000y20ugwqtde2oy', EGG_WHITE: 'cmpa7n088000z20ug4m7mrhol',
  CHICKEN_BREAST: 'cmpa7n0ms001020ugudjs4vcu', CHICKEN_THIGH: 'cmpa7n1fw001220ugyx5p9ias',
  ROHU_FISH: 'cmpa7n28z001420ugk1606cpz', SALMON: 'cmpa7n1ue001320ug9jm92i8w',
  ALMONDS: 'cmpa7n2np001520ugwzq8nd8t', PEANUTS: 'cmpa7n3gl001720ug266ps0ie',
  CHIA_SEEDS: 'cmpa7n3v3001820ugx6y99v73', BANANA: 'cmpa7n49q001920ugxfm9uzdh',
  PANEER: 'cmpa7mx03000r20ug1ccnyy5o', CURD_FULLFAT: 'cmpa7mxeo000s20ugrqe6zkvr',
};
const EXISTING_KEYS = Object.keys(FI_MAP);

// ─────────────────────────────────────────────────────────────────────────────
// 3. FOOD DATABASE — SOURCE OF TRUTH (NOT A WHITELIST)
// ─────────────────────────────────────────────────────────────────────────────
type FoodItemNutrition = {
  per100Calories: number;
  per100Protein: number;
  per100Carbs: number;
  per100Fat: number;
  per100Fiber: number;
};

let FOOD_DB: Record<string, FoodItemNutrition> = {};

async function loadFoodDatabase(): Promise<void> {
  try {
    const raw = await fs.readFile(FOOD_DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'object' && value !== null) {
        FOOD_DB[key] = {
          per100Calories: (value as any).per100Calories ?? 50,
          per100Protein: (value as any).per100Protein ?? 2,
          per100Carbs: (value as any).per100Carbs ?? 10,
          per100Fat: (value as any).per100Fat ?? 1,
          per100Fiber: (value as any).per100Fiber ?? 2,
        };
      }
    }
    console.log(`📦 Loaded ${Object.keys(FOOD_DB).length} core nutrition items`);
  } catch {
    console.warn('⚠️ data/food-items.json not found. Using fallback defaults.');
    for (const key of EXISTING_KEYS) {
      FOOD_DB[key] = { per100Calories: 100, per100Protein: 5, per100Carbs: 15, per100Fat: 3, per100Fiber: 2 };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DYNAMIC MACRO CALCULATOR — MERGES KNOWN + AI-DISCOVERED ITEMS
// ─────────────────────────────────────────────────────────────────────────────
function calculateRecipeMacros(
  ingredients: z.infer<typeof IngredientSchema>[],
  missingFoodItems: z.infer<typeof MissingFoodItemSchema>[] = []
) {
  const nutritionLookup: Record<string, FoodItemNutrition> = { ...FOOD_DB };
  
  for (const item of missingFoodItems) {
    if (item.key) {
      nutritionLookup[item.key] = {
        per100Calories: item.per100Calories ?? 50,
        per100Protein: item.per100Protein ?? 2,
        per100Carbs: item.per100Carbs ?? 10,
        per100Fat: item.per100Fat ?? 1,
        per100Fiber: item.per100Fiber ?? 2,
      };
    }
  }

  let calories = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
  let totalGrams = 0;

  for (const ing of ingredients) {
    const food = nutritionLookup[ing.foodItemKey];
    if (!food) continue;
    
    const factor = ing.quantityGrams / 100;
    calories += food.per100Calories * factor;
    protein += food.per100Protein * factor;
    carbs += food.per100Carbs * factor;
    fat += food.per100Fat * factor;
    fiber += food.per100Fiber * factor;
    totalGrams += ing.quantityGrams;
  }

  const per100Factor = totalGrams > 0 ? 100 / totalGrams : 1;

  return {
    caloriesPerServing: Math.round(calories),
    proteinGrams: Math.round(protein),
    carbsGrams: Math.round(carbs),
    fatGrams: Math.round(fat),
    fibreGrams: Math.round(fiber),
    caloriesPer100g: Math.round(calories * per100Factor),
    proteinPer100g: Math.round(protein * per100Factor),
    carbsPer100g: Math.round(carbs * per100Factor),
    fatPer100g: Math.round(fat * per100Factor),
    fibrePer100g: Math.round(fiber * per100Factor),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PLAN REGISTRY — HARDCODED BUSINESS LOGIC (INTENTIONAL)
// ─────────────────────────────────────────────────────────────────────────────
type PlanConfig = {
  slug: string; file: string; planCategory: string; dietVariant: string;
  recipeCount: number; cal: number; protein: number; description: string;
};

const PLAN_LIST: PlanConfig[] = [
  { slug:'weight-loss-veg', file:'seed-recipes-weight-loss-veg.ts', planCategory:'weight_loss', dietVariant:'VEG', recipeCount:30, cal:1600, protein:100, description:'High-protein calorie-deficit vegetarian.' },
  { slug:'weight-loss-egg', file:'seed-recipes-weight-loss-egg.ts', planCategory:'weight_loss', dietVariant:'EGG', recipeCount:30, cal:1600, protein:110, description:'Weight loss eggetarian.' },
  { slug:'weight-loss-non-veg', file:'seed-recipes-weight-loss-non-veg.ts', planCategory:'weight_loss', dietVariant:'NON_VEG', recipeCount:28, cal:1650, protein:130, description:'Weight loss non-veg.' },
  { slug:'muscle-gain-veg', file:'seed-recipes-muscle-gain-veg.ts', planCategory:'muscle_gain', dietVariant:'VEG', recipeCount:30, cal:2200, protein:150, description:'Muscle gain vegetarian.' },
  { slug:'muscle-gain-egg', file:'seed-recipes-muscle-gain-egg.ts', planCategory:'muscle_gain', dietVariant:'EGG', recipeCount:30, cal:2200, protein:155, description:'Muscle gain eggetarian.' },
  { slug:'muscle-gain-non-veg', file:'seed-recipes-muscle-gain-non-veg.ts', planCategory:'muscle_gain', dietVariant:'NON_VEG', recipeCount:30, cal:2300, protein:170, description:'Muscle gain non-veg.' },
  { slug:'balanced-veg', file:'seed-recipes-balanced-veg.ts', planCategory:'balanced', dietVariant:'VEG', recipeCount:30, cal:1900, protein:110, description:'Balanced maintenance vegetarian.' },
  { slug:'balanced-egg', file:'seed-recipes-balanced-egg.ts', planCategory:'balanced', dietVariant:'EGG', recipeCount:30, cal:1900, protein:115, description:'Balanced eggetarian maintenance.' },
  { slug:'balanced-non-veg', file:'seed-recipes-balanced-non-veg.ts', planCategory:'balanced', dietVariant:'NON_VEG', recipeCount:30, cal:1950, protein:125, description:'Balanced non-veg maintenance.' },
  { slug:'balanced-jain', file:'seed-recipes-balanced-jain.ts', planCategory:'jain', dietVariant:'JAIN', recipeCount:30, cal:1800, protein:100, description:'Jain balanced plan.' },
  { slug:'intermittent-fasting-veg', file:'seed-recipes-intermittent-fasting-veg.ts', planCategory:'intermittent_fasting', dietVariant:'VEG', recipeCount:25, cal:1650, protein:105, description:'16:8 IF vegetarian.' },
  { slug:'intermittent-fasting-non-veg', file:'seed-recipes-intermittent-fasting-non-veg.ts', planCategory:'intermittent_fasting', dietVariant:'NON_VEG', recipeCount:25, cal:1700, protein:130, description:'16:8 IF non-veg.' },
  { slug:'vegan-muscle', file:'seed-recipes-vegan-muscle.ts', planCategory:'vegan_muscle', dietVariant:'VEGAN', recipeCount:30, cal:2100, protein:140, description:'Vegan muscle gain.' },
  { slug:'keto-indian-veg', file:'seed-recipes-keto-indian-veg.ts', planCategory:'keto', dietVariant:'VEG', recipeCount:25, cal:1650, protein:95, description:'Indian keto vegetarian.' },
  { slug:'keto-indian-non-veg', file:'seed-recipes-keto-indian-non-veg.ts', planCategory:'keto', dietVariant:'NON_VEG', recipeCount:25, cal:1700, protein:130, description:'Indian keto non-veg.' },
  { slug:'body-recomp-veg', file:'seed-recipes-body-recomp-veg.ts', planCategory:'body_recomp', dietVariant:'VEG', recipeCount:25, cal:1850, protein:135, description:'Body recomposition vegetarian.' },
  { slug:'body-recomp-non-veg', file:'seed-recipes-body-recomp-non-veg.ts', planCategory:'body_recomp', dietVariant:'NON_VEG', recipeCount:25, cal:1950, protein:155, description:'Body recomposition non-veg.' },
  { slug:'lean-bulk-veg', file:'seed-recipes-lean-bulk-veg.ts', planCategory:'lean_bulk', dietVariant:'VEG', recipeCount:25, cal:2100, protein:145, description:'Lean bulk vegetarian.' },
  { slug:'lean-bulk-non-veg', file:'seed-recipes-lean-bulk-non-veg.ts', planCategory:'lean_bulk', dietVariant:'NON_VEG', recipeCount:25, cal:2150, protein:165, description:'Lean bulk non-veg.' },
  { slug:'cutting-veg', file:'seed-recipes-cutting-veg.ts', planCategory:'cutting', dietVariant:'VEG', recipeCount:25, cal:1400, protein:120, description:'Cutting phase vegetarian.' },
  { slug:'cutting-non-veg', file:'seed-recipes-cutting-non-veg.ts', planCategory:'cutting', dietVariant:'NON_VEG', recipeCount:25, cal:1400, protein:145, description:'Cutting phase non-veg.' },
  { slug:'pcos-veg', file:'seed-recipes-pcos-veg.ts', planCategory:'pcos', dietVariant:'VEG', recipeCount:30, cal:1600, protein:105, description:'PCOS/PCOD vegetarian.' },
  { slug:'pcos-non-veg', file:'seed-recipes-pcos-non-veg.ts', planCategory:'pcos', dietVariant:'NON_VEG', recipeCount:30, cal:1650, protein:120, description:'PCOS/PCOD non-veg.' },
  { slug:'diabetic-veg', file:'seed-recipes-diabetic-veg.ts', planCategory:'diabetic', dietVariant:'VEG', recipeCount:30, cal:1700, protein:105, description:'Diabetic-friendly vegetarian.' },
  { slug:'diabetic-non-veg', file:'seed-recipes-diabetic-non-veg.ts', planCategory:'diabetic', dietVariant:'NON_VEG', recipeCount:30, cal:1700, protein:120, description:'Diabetic-friendly non-veg.' },
  { slug:'pre-diabetic-veg', file:'seed-recipes-pre-diabetic-veg.ts', planCategory:'pre_diabetic', dietVariant:'VEG', recipeCount:25, cal:1600, protein:100, description:'Pre-diabetes vegetarian.' },
  { slug:'pre-diabetic-non-veg', file:'seed-recipes-pre-diabetic-non-veg.ts', planCategory:'pre_diabetic', dietVariant:'NON_VEG', recipeCount:25, cal:1650, protein:115, description:'Pre-diabetes non-veg.' },
  { slug:'thyroid-veg', file:'seed-recipes-thyroid-veg.ts', planCategory:'thyroid', dietVariant:'VEG', recipeCount:25, cal:1550, protein:95, description:'Hypothyroid support vegetarian.' },
  { slug:'thyroid-non-veg', file:'seed-recipes-thyroid-non-veg.ts', planCategory:'thyroid', dietVariant:'NON_VEG', recipeCount:25, cal:1600, protein:110, description:'Hypothyroid support non-veg.' },
  { slug:'heart-health-veg', file:'seed-recipes-heart-health-veg.ts', planCategory:'heart_health', dietVariant:'VEG', recipeCount:25, cal:1750, protein:95, description:'Heart and cholesterol vegetarian.' },
  { slug:'heart-health-non-veg', file:'seed-recipes-heart-health-non-veg.ts', planCategory:'heart_health', dietVariant:'NON_VEG', recipeCount:25, cal:1750, protein:115, description:'Heart health non-veg.' },
  { slug:'hypertension-veg', file:'seed-recipes-hypertension-veg.ts', planCategory:'hypertension', dietVariant:'VEG', recipeCount:25, cal:1750, protein:95, description:'Hypertension vegetarian.' },
  { slug:'hypertension-non-veg', file:'seed-recipes-hypertension-non-veg.ts', planCategory:'hypertension', dietVariant:'NON_VEG', recipeCount:25, cal:1750, protein:115, description:'Hypertension non-veg.' },
  { slug:'fatty-liver-veg', file:'seed-recipes-fatty-liver-veg.ts', planCategory:'fatty_liver', dietVariant:'VEG', recipeCount:25, cal:1600, protein:100, description:'Fatty liver NAFLD vegetarian.' },
  { slug:'fatty-liver-non-veg', file:'seed-recipes-fatty-liver-non-veg.ts', planCategory:'fatty_liver', dietVariant:'NON_VEG', recipeCount:25, cal:1600, protein:115, description:'Fatty liver NAFLD non-veg.' },
  { slug:'kidney-health-veg', file:'seed-recipes-kidney-health-veg.ts', planCategory:'kidney_health', dietVariant:'VEG', recipeCount:25, cal:1800, protein:70, description:'Kidney health vegetarian.' },
  { slug:'kidney-health-non-veg', file:'seed-recipes-kidney-health-non-veg.ts', planCategory:'kidney_health', dietVariant:'NON_VEG', recipeCount:25, cal:1800, protein:75, description:'Kidney health non-veg.' },
  { slug:'gout-veg', file:'seed-recipes-gout-veg.ts', planCategory:'gout', dietVariant:'VEG', recipeCount:25, cal:1700, protein:85, description:'Uric acid and gout vegetarian.' },
  { slug:'gout-non-veg', file:'seed-recipes-gout-non-veg.ts', planCategory:'gout', dietVariant:'NON_VEG', recipeCount:25, cal:1700, protein:100, description:'Gout non-veg.' },
  { slug:'anaemia-veg', file:'seed-recipes-anaemia-veg.ts', planCategory:'anaemia', dietVariant:'VEG', recipeCount:25, cal:1750, protein:100, description:'Anaemia correction vegetarian.' },
  { slug:'anaemia-non-veg', file:'seed-recipes-anaemia-non-veg.ts', planCategory:'anaemia', dietVariant:'NON_VEG', recipeCount:25, cal:1750, protein:120, description:'Anaemia correction non-veg.' },
  { slug:'vitamin-d-veg', file:'seed-recipes-vitamin-d-veg.ts', planCategory:'vitamin_d', dietVariant:'VEG', recipeCount:20, cal:1750, protein:100, description:'Vitamin D deficiency vegetarian.' },
  { slug:'vitamin-d-non-veg', file:'seed-recipes-vitamin-d-non-veg.ts', planCategory:'vitamin_d', dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:110, description:'Vitamin D deficiency non-veg.' },
  { slug:'b12-deficiency-veg', file:'seed-recipes-b12-deficiency-veg.ts', planCategory:'b12_deficiency', dietVariant:'VEG', recipeCount:20, cal:1750, protein:100, description:'B12 deficiency vegetarian.' },
  { slug:'b12-deficiency-non-veg', file:'seed-recipes-b12-deficiency-non-veg.ts', planCategory:'b12_deficiency', dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:115, description:'B12 deficiency non-veg.' },
  { slug:'obesity-veg', file:'seed-recipes-obesity-veg.ts', planCategory:'obesity', dietVariant:'VEG', recipeCount:25, cal:1400, protein:110, description:'Obesity management vegetarian.' },
  { slug:'obesity-non-veg', file:'seed-recipes-obesity-non-veg.ts', planCategory:'obesity', dietVariant:'NON_VEG', recipeCount:25, cal:1450, protein:130, description:'Obesity management non-veg.' },
  { slug:'knee-health-veg', file:'seed-recipes-knee-health-veg.ts', planCategory:'knee_health', dietVariant:'VEG', recipeCount:25, cal:1700, protein:100, description:'Knee and joint health vegetarian.' },
  { slug:'knee-health-non-veg', file:'seed-recipes-knee-health-non-veg.ts', planCategory:'knee_health', dietVariant:'NON_VEG', recipeCount:25, cal:1700, protein:115, description:'Knee health non-veg.' },
  { slug:'post-surgery-veg', file:'seed-recipes-post-surgery-veg.ts', planCategory:'post_surgery', dietVariant:'VEG', recipeCount:25, cal:1800, protein:120, description:'Post-surgery recovery vegetarian.' },
  { slug:'post-surgery-non-veg', file:'seed-recipes-post-surgery-non-veg.ts', planCategory:'post_surgery', dietVariant:'NON_VEG', recipeCount:25, cal:1800, protein:140, description:'Post-surgery recovery non-veg.' },
  { slug:'post-covid-veg', file:'seed-recipes-post-covid-veg.ts', planCategory:'post_covid', dietVariant:'VEG', recipeCount:25, cal:1750, protein:105, description:'Post-COVID recovery vegetarian.' },
  { slug:'post-covid-non-veg', file:'seed-recipes-post-covid-non-veg.ts', planCategory:'post_covid', dietVariant:'NON_VEG', recipeCount:25, cal:1800, protein:130, description:'Post-COVID recovery non-veg.' },
  { slug:'cancer-recovery-veg', file:'seed-recipes-cancer-recovery-veg.ts', planCategory:'cancer_recovery', dietVariant:'VEG', recipeCount:25, cal:1900, protein:110, description:'Cancer recovery vegetarian.' },
  { slug:'cancer-recovery-non-veg', file:'seed-recipes-cancer-recovery-non-veg.ts', planCategory:'cancer_recovery', dietVariant:'NON_VEG', recipeCount:25, cal:1900, protein:130, description:'Cancer recovery non-veg.' },
  { slug:'liver-detox', file:'seed-recipes-liver-detox.ts', planCategory:'liver_detox', dietVariant:'VEG', recipeCount:20, cal:1600, protein:95, description:'21-day liver detox vegetarian.' },
  { slug:'gut-health-veg', file:'seed-recipes-gut-health-veg.ts', planCategory:'gut_health', dietVariant:'VEG', recipeCount:25, cal:1700, protein:95, description:'Gut health IBS vegetarian.' },
  { slug:'gut-health-non-veg', file:'seed-recipes-gut-health-non-veg.ts', planCategory:'gut_health', dietVariant:'NON_VEG', recipeCount:25, cal:1750, protein:115, description:'Gut health IBS non-veg.' },
  { slug:'menopause-veg', file:'seed-recipes-menopause-veg.ts', planCategory:'menopause', dietVariant:'VEG', recipeCount:25, cal:1650, protein:105, description:'Menopause nutrition vegetarian.' },
  { slug:'menopause-non-veg', file:'seed-recipes-menopause-non-veg.ts', planCategory:'menopause', dietVariant:'NON_VEG', recipeCount:25, cal:1650, protein:115, description:'Menopause non-veg.' },
  { slug:'fertility-veg', file:'seed-recipes-fertility-veg.ts', planCategory:'fertility', dietVariant:'VEG', recipeCount:25, cal:1900, protein:110, description:'Fertility pre-conception vegetarian.' },
  { slug:'fertility-non-veg', file:'seed-recipes-fertility-non-veg.ts', planCategory:'fertility', dietVariant:'NON_VEG', recipeCount:25, cal:1900, protein:125, description:'Fertility pre-conception non-veg.' },
  { slug:'post-pregnancy-veg', file:'seed-recipes-post-pregnancy-veg.ts', planCategory:'post_pregnancy', dietVariant:'VEG', recipeCount:25, cal:2100, protein:115, description:'Post-pregnancy lactation vegetarian.' },
  { slug:'post-pregnancy-non-veg', file:'seed-recipes-post-pregnancy-non-veg.ts', planCategory:'post_pregnancy', dietVariant:'NON_VEG', recipeCount:25, cal:2100, protein:135, description:'Post-pregnancy lactation non-veg.' },
  { slug:'pms-veg', file:'seed-recipes-pms-veg.ts', planCategory:'pms', dietVariant:'VEG', recipeCount:20, cal:1750, protein:100, description:'PMS management vegetarian.' },
  { slug:'pms-non-veg', file:'seed-recipes-pms-non-veg.ts', planCategory:'pms', dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:115, description:'PMS management non-veg.' },
  { slug:'female-athlete-veg', file:'seed-recipes-female-athlete-veg.ts', planCategory:'female_athlete', dietVariant:'VEG', recipeCount:25, cal:2000, protein:130, description:'Female athlete vegetarian.' },
  { slug:'female-athlete-non-veg', file:'seed-recipes-female-athlete-non-veg.ts', planCategory:'female_athlete', dietVariant:'NON_VEG', recipeCount:25, cal:2100, protein:145, description:'Female athlete non-veg.' },
  { slug:'hormonal-acne-veg', file:'seed-recipes-hormonal-acne-veg.ts', planCategory:'hormonal_acne', dietVariant:'VEG', recipeCount:20, cal:1650, protein:100, description:'Hormonal acne vegetarian.' },
  { slug:'hormonal-acne-non-veg', file:'seed-recipes-hormonal-acne-non-veg.ts', planCategory:'hormonal_acne', dietVariant:'NON_VEG', recipeCount:20, cal:1650, protein:115, description:'Hormonal acne non-veg.' },
  { slug:'anti-aging-veg', file:'seed-recipes-anti-aging-veg.ts', planCategory:'anti_aging', dietVariant:'VEG', recipeCount:20, cal:1750, protein:100, description:'Anti-aging collagen vegetarian.' },
  { slug:'anti-aging-non-veg', file:'seed-recipes-anti-aging-non-veg.ts', planCategory:'anti_aging', dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:115, description:'Anti-aging non-veg.' },
  { slug:'acne-skin-veg', file:'seed-recipes-acne-skin-veg.ts', planCategory:'acne_skin', dietVariant:'VEG', recipeCount:20, cal:1650, protein:100, description:'Acne clearing vegetarian.' },
  { slug:'acne-skin-non-veg', file:'seed-recipes-acne-skin-non-veg.ts', planCategory:'acne_skin', dietVariant:'NON_VEG', recipeCount:20, cal:1650, protein:115, description:'Acne clearing non-veg.' },
  { slug:'hair-health-veg', file:'seed-recipes-hair-health-veg.ts', planCategory:'hair_health', dietVariant:'VEG', recipeCount:20, cal:1750, protein:105, description:'Hair fall prevention vegetarian.' },
  { slug:'hair-health-non-veg', file:'seed-recipes-hair-health-non-veg.ts', planCategory:'hair_health', dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:120, description:'Hair health non-veg.' },
  { slug:'eczema-veg', file:'seed-recipes-eczema-veg.ts', planCategory:'eczema', dietVariant:'VEG', recipeCount:20, cal:1700, protein:95, description:'Eczema psoriasis vegetarian.' },
  { slug:'eczema-non-veg', file:'seed-recipes-eczema-non-veg.ts', planCategory:'eczema', dietVariant:'NON_VEG', recipeCount:20, cal:1700, protein:115, description:'Eczema psoriasis non-veg.' },
  { slug:'skin-glow-veg', file:'seed-recipes-skin-glow-veg.ts', planCategory:'skin_glow', dietVariant:'VEG', recipeCount:20, cal:1750, protein:100, description:'Skin glow hyperpigmentation vegetarian.' },
  { slug:'skin-glow-non-veg', file:'seed-recipes-skin-glow-non-veg.ts', planCategory:'skin_glow', dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:115, description:'Skin glow non-veg.' },
  { slug:'quit-smoking-veg', file:'seed-recipes-quit-smoking-veg.ts', planCategory:'quit_smoking', dietVariant:'VEG', recipeCount:20, cal:1750, protein:100, description:'Quit smoking vegetarian.' },
  { slug:'quit-smoking-non-veg', file:'seed-recipes-quit-smoking-non-veg.ts', planCategory:'quit_smoking', dietVariant:'NON_VEG', recipeCount:20, cal:1750, protein:120, description:'Quit smoking non-veg.' },
  { slug:'alcohol-recovery-veg', file:'seed-recipes-alcohol-recovery-veg.ts', planCategory:'alcohol_recovery', dietVariant:'VEG', recipeCount:20, cal:1800, protein:105, description:'Alcohol recovery vegetarian.' },
  { slug:'alcohol-recovery-non-veg', file:'seed-recipes-alcohol-recovery-non-veg.ts', planCategory:'alcohol_recovery', dietVariant:'NON_VEG', recipeCount:20, cal:1800, protein:125, description:'Alcohol recovery non-veg.' },
  { slug:'detox-reset', file:'seed-recipes-detox-reset.ts', planCategory:'detox_reset', dietVariant:'VEG', recipeCount:15, cal:1650, protein:100, description:'21-day detox reset vegetarian.' },
  { slug:'senior-veg', file:'seed-recipes-senior-veg.ts', planCategory:'senior', dietVariant:'VEG', recipeCount:25, cal:1600, protein:90, description:'Senior nutrition 55+ vegetarian.' },
  { slug:'senior-non-veg', file:'seed-recipes-senior-non-veg.ts', planCategory:'senior', dietVariant:'NON_VEG', recipeCount:25, cal:1650, protein:105, description:'Senior nutrition 55+ non-veg.' },
  { slug:'kids-teen-veg', file:'seed-recipes-kids-teen-veg.ts', planCategory:'kids_teen', dietVariant:'VEG', recipeCount:25, cal:1800, protein:95, description:'Kids and teen 8-17 vegetarian.' },
  { slug:'kids-teen-non-veg', file:'seed-recipes-kids-teen-non-veg.ts', planCategory:'kids_teen', dietVariant:'NON_VEG', recipeCount:25, cal:1900, protein:110, description:'Kids and teen 8-17 non-veg.' },
  { slug:'navratri', file:'seed-recipes-navratri.ts', planCategory:'navratri', dietVariant:'VEG', recipeCount:15, cal:1500, protein:70, description:'Navratri fasting saatvik.' },
  { slug:'ramadan', file:'seed-recipes-ramadan.ts', planCategory:'ramadan', dietVariant:'NON_VEG', recipeCount:15, cal:1900, protein:130, description:'Ramadan Sehri and Iftar nutrition.' },
  { slug:'diwali-detox', file:'seed-recipes-diwali-detox.ts', planCategory:'diwali_detox', dietVariant:'VEG', recipeCount:15, cal:1600, protein:95, description:'Post-Diwali detox reset 21-day.' },
  { slug:'shravan', file:'seed-recipes-shravan.ts', planCategory:'shravan', dietVariant:'VEG', recipeCount:15, cal:1600, protein:75, description:'Shravan Ekadashi saatvik plan.' },
  { slug:'endurance-veg', file:'seed-recipes-endurance-veg.ts', planCategory:'endurance', dietVariant:'VEG', recipeCount:30, cal:2500, protein:130, description:'Performance and endurance vegetarian.' },
  { slug:'endurance-non-veg', file:'seed-recipes-endurance-non-veg.ts', planCategory:'endurance', dietVariant:'NON_VEG', recipeCount:30, cal:2600, protein:145, description:'Performance and endurance non-veg.' },
  { slug:'strength-hypertrophy-veg', file:'seed-recipes-strength-hypertrophy-veg.ts', planCategory:'strength_hypertrophy', dietVariant:'VEG', recipeCount:30, cal:2400, protein:170, description:'Strength and hypertrophy vegetarian.' },
  { slug:'strength-hypertrophy-non-veg', file:'seed-recipes-strength-hypertrophy-non-veg.ts', planCategory:'strength_hypertrophy', dietVariant:'NON_VEG', recipeCount:30, cal:2500, protein:185, description:'Strength and hypertrophy non-veg.' },
  { slug:'competition-prep-veg', file:'seed-recipes-competition-prep-veg.ts', planCategory:'competition_prep', dietVariant:'VEG', recipeCount:25, cal:1750, protein:165, description:'Competition prep vegetarian.' },
  { slug:'competition-prep-non-veg', file:'seed-recipes-competition-prep-non-veg.ts', planCategory:'competition_prep', dietVariant:'NON_VEG', recipeCount:25, cal:1800, protein:180, description:'Competition prep non-veg.' },
  { slug:'sports-recovery-veg', file:'seed-recipes-sports-recovery-veg.ts', planCategory:'sports_recovery', dietVariant:'VEG', recipeCount:25, cal:1900, protein:130, description:'Sports recovery vegetarian.' },
  { slug:'sports-recovery-non-veg', file:'seed-recipes-sports-recovery-non-veg.ts', planCategory:'sports_recovery', dietVariant:'NON_VEG', recipeCount:25, cal:2000, protein:145, description:'Sports recovery non-veg.' },
  { slug:'cricket-veg', file:'seed-recipes-cricket-veg.ts', planCategory:'cricket', dietVariant:'VEG', recipeCount:25, cal:2300, protein:145, description:'Cricket nutrition vegetarian.' },
  { slug:'cricket-non-veg', file:'seed-recipes-cricket-non-veg.ts', planCategory:'cricket', dietVariant:'NON_VEG', recipeCount:25, cal:2400, protein:160, description:'Cricket nutrition non-veg.' },
  { slug:'football-veg', file:'seed-recipes-football-veg.ts', planCategory:'football', dietVariant:'VEG', recipeCount:25, cal:2300, protein:140, description:'Football futsal vegetarian.' },
  { slug:'football-non-veg', file:'seed-recipes-football-non-veg.ts', planCategory:'football', dietVariant:'NON_VEG', recipeCount:25, cal:2400, protein:155, description:'Football futsal non-veg.' },
  { slug:'swimming-veg', file:'seed-recipes-swimming-veg.ts', planCategory:'swimming', dietVariant:'VEG', recipeCount:25, cal:2700, protein:150, description:'Swimming performance vegetarian.' },
  { slug:'swimming-non-veg', file:'seed-recipes-swimming-non-veg.ts', planCategory:'swimming', dietVariant:'NON_VEG', recipeCount:25, cal:2800, protein:165, description:'Swimming performance non-veg.' },
  { slug:'martial-arts-veg', file:'seed-recipes-martial-arts-veg.ts', planCategory:'martial_arts', dietVariant:'VEG', recipeCount:25, cal:2100, protein:155, description:'Martial arts MMA vegetarian.' },
  { slug:'martial-arts-non-veg', file:'seed-recipes-martial-arts-non-veg.ts', planCategory:'martial_arts', dietVariant:'NON_VEG', recipeCount:25, cal:2200, protein:170, description:'Martial arts MMA non-veg.' },
  { slug:'female-athlete-sports-veg', file:'seed-recipes-female-athlete-sports-veg.ts', planCategory:'female_athlete', dietVariant:'VEG', recipeCount:25, cal:2000, protein:130, description:'Female athlete sports vegetarian.' },
  { slug:'female-athlete-sports-non-veg', file:'seed-recipes-female-athlete-sports-non-veg.ts', planCategory:'female_athlete', dietVariant:'NON_VEG', recipeCount:25, cal:2100, protein:145, description:'Female athlete sports non-veg.' },
  { slug:'youth-athlete-veg', file:'seed-recipes-youth-athlete-veg.ts', planCategory:'youth_athlete', dietVariant:'VEG', recipeCount:25, cal:2300, protein:140, description:'Youth athlete 14-18 vegetarian.' },
  { slug:'youth-athlete-non-veg', file:'seed-recipes-youth-athlete-non-veg.ts', planCategory:'youth_athlete', dietVariant:'NON_VEG', recipeCount:25, cal:2400, protein:155, description:'Youth athlete 14-18 non-veg.' }
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. HELPER LOGIC
// ─────────────────────────────────────────────────────────────────────────────
function getMealSlots(plan: PlanConfig) {
  const n = plan.recipeCount;
  if (plan.planCategory === 'intermittent_fasting') return n <= 20 ? { BREAKFAST: 7, LUNCH: 7, DINNER: 6 } : { BREAKFAST: 9, LUNCH: 9, DINNER: 7 };
  if (n <= 15) return { BREAKFAST: 4, LUNCH: 5, SNACK: 2, DINNER: 4 };
  if (n <= 20) return { BREAKFAST: 5, LUNCH: 6, SNACK: 3, DINNER: 6 };
  if (n <= 25) return { BREAKFAST: 6, LUNCH: 8, SNACK: 4, DINNER: 7 };
  return { BREAKFAST: 8, LUNCH: 10, SNACK: 5, DINNER: 7 };
}

function getDietRules(plan: PlanConfig): string {
  const rules: string[] = [];
  if (plan.dietVariant === 'VEG') rules.push('❌ NO eggs, NO chicken, NO fish, NO meat.');
  if (plan.dietVariant === 'EGG') rules.push('✅ Eggs allowed. ❌ NO chicken, NO fish, NO meat.');
  if (plan.dietVariant === 'NON_VEG') rules.push('✅ Chicken, fish, eggs allowed. Focus on lean proteins.');
  if (plan.dietVariant === 'JAIN') rules.push('❌ STRICTLY NO root vegetables (potato, carrot, onion, garlic, beetroot). Above ground only.');
  if (plan.dietVariant === 'VEGAN') rules.push('❌ NO dairy, NO eggs, NO honey. Pure plant-based only.');
  if (plan.planCategory === 'keto') rules.push('🔴 KETO: MAX 50g NET carbs/day. Zero grains/flours.');
  return rules.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. STRICT QUALITY GATE & SANITIZER (FAULT-TOLERANT)
// ─────────────────────────────────────────────────────────────────────────────
function extractAndSanitizePayload(rawJson: string, requestedSlots: string[]): any {
  let parsed: any;
  try { parsed = JSON.parse(rawJson); } 
  catch {
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
    else throw new Error("Completely invalid JSON returned.");
  }

  if (parsed.result && typeof parsed.result === 'object') parsed = parsed.result;
  if (parsed.data && typeof parsed.data === 'object') parsed = parsed.data;
  
  if (!Array.isArray(parsed.recipes)) throw new Error("No recipes array found.");
  
  // ✅ FAULT-TOLERANT: Auto-fills weak steps instead of crashing the pipeline
  parsed.recipes.forEach((r: any, idx: number) => {
    const name = r.name || r.slug || `Recipe ${idx+1}`;
    const steps = r.steps || r.Steps || [];
    
    if (steps.length === 0) {
      r.steps = [{ stepNumber: 1, title: "Prep & Cook", instruction: "Prepare all ingredients thoroughly, cook according to standard culinary methods, and plate as directed." }];
    } else {
      for (const s of steps) {
        const inst = s.instruction || s.Instruction || '';
        if (inst.trim().length < 25) {
          s.instruction = `Combine prepared ingredients, cook until thoroughly done, season to taste, and serve immediately.`;
        }
      }
    }

    const ings = r.ingredients || r.Ingredients || [];
    if (ings.length === 0) throw new Error(`LLM generated 0 ingredients for ${name}. Rejecting.`);
    for (const i of ings) {
      const key = (i.foodItemKey || i.FoodItemKey || '').toUpperCase();
      if (key === 'UNKNOWN' || key === '') throw new Error(`LLM generated UNKNOWN ingredient for ${name}. Rejecting.`);
    }
    let mealType = (r.mealType || r.MealType || '').toString().toUpperCase().replace(/[^A-Z]/g, '');
    if (!requestedSlots.includes(mealType)) {
       throw new Error(`LLM assigned wrong mealType (${mealType}) when requested slots were ${requestedSlots.join(',')}. Rejecting.`);
    }
  });

  // Sanitize & Map
  parsed.missingFoodItems = (parsed.missingFoodItems || []).map((item: any) => {
    if (typeof item === 'string') {
      const name = item.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const key = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
      return { name, key, category: 'Other' };
    }
    let name = String(item.name || item.key || 'Unknown').replace(/_/g, ' ');
    let key = String(item.key || item.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
    if (!key) key = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    return {
      name, key,
      category: String(item.category || 'Other'),
      per100Calories: Number(item.per100Calories || 50),
      per100Protein: Number(item.per100Protein || 2),
      per100Carbs: Number(item.per100Carbs || 10),
      per100Fat: Number(item.per100Fat || 1),
      per100Fiber: Number(item.per100Fiber || item.per100Fibre || 2),
    };
  });

  parsed.recipes = parsed.recipes.map((r: any, idx: number) => {
    let mealType = (r.mealType || r.MealType || requestedSlots[idx]).toString().toUpperCase().replace(/[^A-Z]/g, '');
    const name = r.name || r.Name || r.slug?.replace(/-/g, ' ') || `Recipe ${idx + 1}`;
    const desc = r.description || r.Description || '';
    
    return {
      name,
      slug: r.slug || r.Slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: desc,
      shortDescription: r.shortDescription || r.ShortDescription || desc.substring(0, 60),
      cuisineType: r.cuisineType || r.CuisineType || 'Indian',
      mealType,
      dietaryTags: Array.isArray(r.dietaryTags) ? r.dietaryTags.map(String) : [],
      planCategories: Array.isArray(r.planCategories) ? r.planCategories.map(String) : [],
      servingSizeGrams: Number(r.servingSizeGrams || 300),
      prepTimeMins: Number(r.prepTimeMins || 10),
      cookTimeMins: Number(r.cookTimeMins || 15),
      difficulty: String(r.difficulty || 'medium'),
      equipmentNeeded: Array.isArray(r.equipmentNeeded) ? r.equipmentNeeded.map(String) : [],
      allergens: Array.isArray(r.allergens) ? r.allergens.map(String) : [],
      shelfLifeHours: Number(r.shelfLifeHours || 24),
      packagingType: String(r.packagingType || 'box'),
      kitchenStation: String(r.kitchenStation || 'hot_kitchen'),
      seasonTags: Array.isArray(r.seasonTags) ? r.seasonTags.map(String) : ['all_year'],
      rotationGroup: Number(r.rotationGroup || 1),
      isFeatured: Boolean(r.isFeatured ?? false),
      ingredients: (r.ingredients || []).map((ing: any, i: number) => ({
        foodItemKey: String(ing.foodItemKey || ing.FoodItemKey).toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_'),
        quantityGrams: Number(ing.quantityGrams || 50),
        cookedWeightFactor: Number(ing.cookedWeightFactor || 1),
        prepNote: ing.prepNote ? String(ing.prepNote) : undefined,
        isOptional: Boolean(ing.isOptional ?? false),
        orderInRecipe: Number(ing.orderInRecipe || i + 1),
      })),
      steps: (r.steps || []).map((step: any, i: number) => ({
        stepNumber: Number(step.stepNumber || i + 1),
        title: String(step.title || `Step ${i + 1}`),
        instruction: String(step.instruction || step.Instruction),
        durationMins: step.durationMins ? Number(step.durationMins) : undefined,
        technique: step.technique ? String(step.technique) : undefined,
        kitchenNote: step.kitchenNote ? String(step.kitchenNote) : undefined,
      })),
    };
  });

  return parsed;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CORE GENERATION LOGIC — AI → JSON → VALIDATE → DYNAMIC MACRO RESOLVE
// ─────────────────────────────────────────────────────────────────────────────
async function generateBatch(
  plan: PlanConfig,
  batchSlots: Record<string, number>,
  batchIndex: number,
  totalBatches: number,
  existingSlugs: Set<string>,
  knownFIKeys: Set<string>
) {
  const batchTotal = Object.values(batchSlots).reduce((a, b) => a + b, 0);
  const slotQueue = Object.entries(batchSlots).flatMap(([slot, count]) => Array(count).fill(slot));
  
  const recipeAssignments = slotQueue.map((slot, idx) => `Recipe ${idx + 1}: mealType MUST be exactly "${slot}"`).join('\n');

  const prompt = `
Generate a BATCH of EXACTLY ${batchTotal} commercial-grade FitFuel recipes. Batch ${batchIndex + 1}/${totalBatches} for target plan "${plan.slug}".
Plan: ${plan.slug} | Category: ${plan.planCategory} | Diet: ${plan.dietVariant}
Target Daily: ${plan.cal} kcal, ${plan.protein}g protein.

⚠️ CRITICAL MEAL TYPE ASSIGNMENTS ⚠️:
${recipeAssignments}

DIETARY LAWS:
${getDietRules(plan)}

MAPPING LAWS:
1. Use EXACT uppercase snake_case keys for ingredients.
2. Existing DB Keys: [${EXISTING_KEYS.join(', ')}]
3. Previously generated keys: [${Array.from(knownFIKeys).join(', ') || 'None'}]
4. If an ingredient is NOT in the lists above, add it to "missingFoodItems" with REALISTIC per-100g nutrition values.
5. Avoid duplicate slugs. Used slugs: [${Array.from(existingSlugs).join(', ') || 'None'}]

🧮 MACRO RULES (CRITICAL):
- You are a recipe creator, NOT a calculator.
- DO NOT output caloriesPerServing, proteinGrams, carbsGrams, fatGrams, or per-100g recipe values.
- Our system will calculate these locally using the food database + your missingFoodItems.
- Focus ONLY on: recipe name, description, ingredients (with EXACT foodItemKey + quantityGrams), and steps.

⚠️ ANTI-LAZY RULES:
- DO NOT leave "instruction" empty. Every step must have detailed culinary prose (min 30 chars).
- DO NOT use "UNKNOWN" for foodItemKey. Map it properly or add to missingFoodItems.

OUTPUT FORMAT: Strict JSON matching schema: { "missingFoodItems": [...], "recipes": [...] }
`;

  let lastError: any = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a master commercial recipe architect for FitFuel. Output completely raw JSON. Never use Markdown blocks.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.75,
        max_tokens: 8000, 
      });

      const rawJson = completion.choices[0].message.content || '{}';
      const sanitized = extractAndSanitizePayload(rawJson, slotQueue); 
      const validated = BatchResponseSchema.parse(sanitized); 
      
      const recipesWithMacros = validated.recipes.map((recipe) => {
        const macros = calculateRecipeMacros(recipe.ingredients, validated.missingFoodItems);
        return { ...recipe, ...macros };
      });

      return { ...validated, recipes: recipesWithMacros };
    } catch (err: any) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        console.log(`\n   ⚠️ Quality Gate Rejection: ${err.message.slice(0, 100)}. Forcing retry...`);
        await sleep(attempt * 2000);
      }
    }
  }
  throw new Error(`Pipeline broken after retries: ${lastError.message}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. TYPESCRIPT FILE ASSEMBLY & FORMATTING
// ─────────────────────────────────────────────────────────────────────────────
function buildRecipesTs(recipes: z.infer<typeof RecipeOutputSchema>[], dietVariant: string, planCategory: string) {
  return recipes.map(r => `
  {
    recipe: {
      name: ${JSON.stringify(r.name)}, slug: ${JSON.stringify(r.slug)},
      description: ${JSON.stringify(r.description)}, shortDescription: ${JSON.stringify(r.shortDescription)},
      cuisineType: ${JSON.stringify(r.cuisineType)}, mealType: MealSlot.${r.mealType},
      dietaryTags: ${JSON.stringify(r.dietaryTags?.length ? r.dietaryTags : [dietVariant])}, 
      planCategories: ${JSON.stringify(r.planCategories?.length ? r.planCategories : [planCategory])},
      tierAvailability: [PlanTier.STANDARD, PlanTier.PREMIUM, PlanTier.LUXURY],
      servingSizeGrams: ${r.servingSizeGrams}, prepTimeMins: ${r.prepTimeMins}, cookTimeMins: ${r.cookTimeMins},
      difficulty: ${JSON.stringify(r.difficulty)}, equipmentNeeded: ${JSON.stringify(r.equipmentNeeded)},
      allergens: ${JSON.stringify(r.allergens)}, shelfLifeHours: ${r.shelfLifeHours},
      packagingType: ${JSON.stringify(r.packagingType)}, kitchenStation: ${JSON.stringify(r.kitchenStation)},
      seasonTags: ${JSON.stringify(r.seasonTags)}, rotationGroup: ${r.rotationGroup},
      caloriesPerServing: ${r.caloriesPerServing}, proteinGrams: ${r.proteinGrams}, carbsGrams: ${r.carbsGrams},
      fatGrams: ${r.fatGrams}, fibreGrams: ${r.fibreGrams}, caloriesPer100g: ${r.caloriesPer100g},
      proteinPer100g: ${r.proteinPer100g}, carbsPer100g: ${r.carbsPer100g}, fatPer100g: ${r.fatPer100g},
      fibrePer100g: ${r.fibrePer100g}, isActive: true, isFeatured: ${r.isFeatured}
    },
    ingredients: ${JSON.stringify(r.ingredients, null, 2)},
    steps: ${JSON.stringify(r.steps, null, 2)}
  }`).join(',\n');
}

async function writeSeedFile(plan: PlanConfig, recipes: any[], missingItems: any[]) {
  const missingItemsTs = missingItems.map(i => `  { name: ${JSON.stringify(i.name)}, category: ${JSON.stringify(i.category)}, per100Calories: ${i.per100Calories ?? 50}, per100Protein: ${i.per100Protein ?? 2}, per100Carbs: ${i.per100Carbs ?? 10}, per100Fat: ${i.per100Fat ?? 1}, per100Fiber: ${i.per100Fiber ?? 2} }`).join(',\n');

  const rawTs = `
import 'dotenv/config'
import { PrismaClient, MealSlot, PlanTier } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const FI = ${JSON.stringify(FI_MAP, null, 2)}
const MISSING_FOOD_ITEMS = [\n${missingItemsTs}\n]
const NEW_FI: Record<string, string> = {}

function getFoodItemId(key: string): string | undefined {
  return FI[key as keyof typeof FI] ?? NEW_FI[key]
}

type RecipeData = {
  name: string; slug: string; description: string; shortDescription: string
  cuisineType: string; mealType: MealSlot; dietaryTags: string[]
  planCategories: string[]; tierAvailability: PlanTier[]
  servingSizeGrams: number; prepTimeMins: number; cookTimeMins: number
  difficulty: string; equipmentNeeded: string[]; allergens: string[]
  shelfLifeHours: number; packagingType: string; kitchenStation: string
  seasonTags: string[]; rotationGroup: number
  caloriesPerServing: number; proteinGrams: number; carbsGrams: number
  fatGrams: number; fibreGrams: number
  caloriesPer100g: number; proteinPer100g: number; carbsPer100g: number
  fatPer100g: number; fibrePer100g: number
  isActive: boolean; isFeatured: boolean
}
type IngredientRef = {
  foodItemKey: string; quantityGrams: number; cookedWeightFactor: number
  prepNote?: string; isOptional: boolean; orderInRecipe: number
}
type StepData = {
  stepNumber: number; title: string; instruction: string
  durationMins?: number; technique?: string; kitchenNote?: string
}
type RecipeDef = { recipe: RecipeData; ingredients: IngredientRef[]; steps: StepData[] }

const RECIPES: RecipeDef[] = [\n${buildRecipesTs(recipes, plan.dietVariant, plan.planCategory)}\n]

async function seedRecipes() {
  console.log('\\n🌱 Starting recipe seed...\\n')
  const nameToKey = (nameStr: string) => nameStr.toUpperCase().replace(/[^A-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  
  for (const item of MISSING_FOOD_ITEMS) {
    const key = nameToKey(item.name);
    const existing = await prisma.foodItem.findFirst({ where: { name: item.name } })
    if (existing) { NEW_FI[key] = existing.id; continue }
    const created = await prisma.foodItem.create({ data: { ...item, isCustom: false } })
    NEW_FI[key] = created.id
  }
  
  let createdCount = 0, skippedCount = 0
  for (const def of RECIPES) {
    const existing = await prisma.recipe.findUnique({ where: { slug: def.recipe.slug } })
    if (existing) { skippedCount++; continue }
    const recipe = await prisma.recipe.create({ data: def.recipe })
    
    for (const ing of def.ingredients) {
      const lookupKey = FI[ing.foodItemKey as keyof typeof FI] ? ing.foodItemKey : nameToKey(ing.foodItemKey);
      const foodItemId = getFoodItemId(ing.foodItemKey) ?? getFoodItemId(lookupKey);
      if (!foodItemId) continue;
      await prisma.recipeIngredient.create({ data: { recipeId: recipe.id, foodItemId, ...ing } })
    }
    for (const step of def.steps) {
      await prisma.recipeStep.create({ data: { recipeId: recipe.id, ...step, imageUrl: null } })
    }
    createdCount++
  }
  console.log(\`✅ Created: \${createdCount} | ⏭️ Skipped: \${skippedCount}\`)
}

seedRecipes().catch(e => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect(); pool.end() })
`;

  let formatted = rawTs;
  try {
    formatted = await prettier.format(rawTs, { parser: 'typescript', singleQuote: true, printWidth: 120, trailingComma: 'all' });
  } catch (e) {
    console.warn('   ⚠️ Prettier formatting failed, saving raw TS.');
  }
  
  await fs.writeFile(path.join(OUTPUT_DIR, plan.file), formatted, 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. EXECUTION ORCHESTRATOR
// ─────────────────────────────────────────────────────────────────────────────
async function loadProgress() {
  try { return JSON.parse(await fs.readFile(PROGRESS_FILE, 'utf8')); } 
  catch { return { completed: [], failed: [] }; }
}
async function saveProgress(p: any) { await fs.writeFile(PROGRESS_FILE, JSON.stringify(p, null, 2)); }
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function main() {
  await loadFoodDatabase();

  const args = process.argv.slice(2);
  const targetPlan = args.find(a => a.startsWith('--plan='))?.split('=')[1];
  const fromIndex = parseInt(args.find(a => a.startsWith('--from='))?.split('=')[1] || '0', 10);
  const retryFailed = args.includes('--retry-failed');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const progress = await loadProgress();
  
  let queue: PlanConfig[];
  if (targetPlan) queue = PLAN_LIST.filter(p => p.slug === targetPlan);
  else if (retryFailed) queue = PLAN_LIST.filter(p => progress.failed.includes(p.slug));
  else queue = PLAN_LIST.slice(fromIndex).filter(p => !progress.completed.includes(p.slug));

  console.log(`\n🚀 FITFUEL COMMERCIAL SEED GENERATOR`);
  console.log(`📋 Plans: ${queue.length} | Batches: ${BATCH_SIZE} | Macros: DYNAMIC + DETERMINISTIC\n`);

  for (let i = 0; i < queue.length; i++) {
    const plan = queue[i];
    console.log(`\n⚙️  [${i + 1}/${queue.length}] Processing: ${plan.slug} (${plan.recipeCount} recipes)`);
    const slots = getMealSlots(plan);
    const slotQueue = Object.entries(slots).flatMap(([slot, count]) => Array(count).fill(slot));
    
    const allRecipes: any[] = [];
    const allMissing = new Map<string, any>();
    const usedSlugs = new Set<string>();
    const knownFIKeys = new Set<string>();

    try {
      const batches = [];
      for (let j = 0; j < slotQueue.length; j += BATCH_SIZE) {
        const batchSlots = slotQueue.slice(j, j + BATCH_SIZE);
        const slotCounts = batchSlots.reduce((acc, s) => ({ ...acc, [s]: (acc[s] || 0) + 1 }), {} as Record<string, number>);
        batches.push(slotCounts);
      }

      for (let bi = 0; bi < batches.length; bi++) {
        process.stdout.write(`   🔨 Batch ${bi + 1}/${batches.length}... `);
        const result = await generateBatch(plan, batches[bi], bi, batches.length, usedSlugs, knownFIKeys);
        
        result.missingFoodItems.forEach(item => { 
          if (item.key) { allMissing.set(item.key, item); knownFIKeys.add(item.key); } 
        });
        result.recipes.forEach(r => { 
          allRecipes.push(r); 
          usedSlugs.add(r.slug || r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        });
        console.log(`✅ (${result.recipes.length} recipes)`);
        
        if (bi < batches.length - 1) await sleep(DELAY_BATCH);
      }
      
      await writeSeedFile(plan, allRecipes, Array.from(allMissing.values()));
      progress.completed.push(plan.slug);
      progress.failed = progress.failed.filter((s: string) => s !== plan.slug);
      await saveProgress(progress);
      console.log(`   📄 Saved: output/${plan.file}`);
      
    } catch (err: any) {
      console.error(`\n   ❌ FAILED: ${err.message}`);
      if (!progress.failed.includes(plan.slug)) progress.failed.push(plan.slug);
      await saveProgress(progress);
    }
    if (i < queue.length - 1) await sleep(DELAY_PLAN);
  }
  console.log('\n🎉 Master Seed Generation Complete!');
}

main().catch(console.error);