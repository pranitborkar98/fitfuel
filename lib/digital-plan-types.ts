// lib/digital-plan-types.ts
// The contract between 13A (Prisma -> this shape) and 13B (this shape -> PDF).
// This interface is STABLE regardless of your exact Recipe column names.
// 13A's job: map your schema (fibreGrams, difficulty, etc.) onto this. 13B never touches Prisma.

export interface DigitalPlanIngredient {
  name: string;       // FoodItem name
  rawGrams: number;   // RecipeIngredient quantity (raw grams)
}

export interface DigitalPlanMeal {
  slot: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  recipeName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fibreG?: number;
  cuisine?: string;
  difficulty?: string;
  ingredients: DigitalPlanIngredient[];
  steps: string[];    // ordered RecipeStep text
}

export interface DigitalPlanDayTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface DigitalPlanDay {
  day: number;        // 1..durationDays
  meals: DigitalPlanMeal[];
  totals: DigitalPlanDayTotals;
}

export interface GroceryLineItem {
  foodName: string;
  totalRawGrams: number;
  category?: string;  // grouping on the grocery appendix (e.g. Produce, Dairy, Protein)
}

export interface DigitalPlanData {
  planName: string;
  tier: "STANDARD" | "PREMIUM" | "LUXURY";
  dietVariant: "VEG" | "EGG" | "NON_VEG" | "JAIN" | "VEGAN";
  durationDays: number;
  targetCalories?: number;
  targetProteinG?: number;
  days: DigitalPlanDay[];      // full 30-day, recipes inline (your chosen "full" scope)
  grocery: GroceryLineItem[];  // aggregated across all days (doubles as 9Q)
}
