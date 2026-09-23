import "server-only";

import { prisma } from "@/lib/prisma";

const RECIPE_PREFIX = "recipe:";
const FITFUEL_CATEGORY = "PLAN_RECIPE";

type RecipeFood = {
  id: string;
  name: string;
  servingSizeGrams: number;
  caloriesPer100g: number;
  proteinPer100g: unknown;
  carbsPer100g: unknown;
  fatPer100g: unknown;
  fibrePer100g: unknown;
};

function n(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function recipeChoice(recipe: RecipeFood) {
  return {
    id: `${RECIPE_PREFIX}${recipe.id}`,
    name: recipe.name,
    brand: "FitFuel",
    category: FITFUEL_CATEGORY,
    per100Calories: n(recipe.caloriesPer100g),
    per100Protein: n(recipe.proteinPer100g),
    per100Carbs: n(recipe.carbsPer100g),
    per100Fat: n(recipe.fatPer100g),
    per100Fiber: n(recipe.fibrePer100g),
    isCustom: false,
    source: "fitfuel" as const,
    defaultQuantity: Math.max(1, recipe.servingSizeGrams || 100),
  };
}

export async function findFitFuelMeals(query: string, take = 12) {
  const recipes = await prisma.recipe.findMany({
    where: {
      isActive: true,
      ...(query ? { name: { contains: query, mode: "insensitive" as const } } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      servingSizeGrams: true,
      caloriesPer100g: true,
      proteinPer100g: true,
      carbsPer100g: true,
      fatPer100g: true,
      fibrePer100g: true,
    },
  });

  return recipes.map(recipeChoice);
}

/**
 * Turn a public FitFuel recipe result into the FoodItem required by the diary.
 * This write happens only after a signed-in user explicitly logs the meal.
 */
export async function resolveDiaryFood(reference: string, userId: string) {
  if (!reference.startsWith(RECIPE_PREFIX)) {
    return prisma.foodItem.findFirst({
      where: {
        id: reference,
        OR: [{ userId: null }, { userId }],
      },
    });
  }

  const recipeId = reference.slice(RECIPE_PREFIX.length);
  if (!recipeId) return null;

  const recipe = await prisma.recipe.findFirst({
    where: { id: recipeId, isActive: true },
    select: {
      id: true,
      name: true,
      servingSizeGrams: true,
      caloriesPer100g: true,
      proteinPer100g: true,
      carbsPer100g: true,
      fatPer100g: true,
      fibrePer100g: true,
    },
  });
  if (!recipe) return null;

  const values = recipeChoice(recipe);
  const existing = await prisma.foodItem.findFirst({
    where: { name: recipe.name, category: FITFUEL_CATEGORY, userId: null },
  });

  const data = {
    name: recipe.name,
    brand: "FitFuel",
    category: FITFUEL_CATEGORY,
    per100Calories: values.per100Calories,
    per100Protein: values.per100Protein,
    per100Carbs: values.per100Carbs,
    per100Fat: values.per100Fat,
    per100Fiber: values.per100Fiber,
    isCustom: false,
    userId: null,
  };

  return existing
    ? prisma.foodItem.update({ where: { id: existing.id }, data })
    : prisma.foodItem.create({ data });
}
