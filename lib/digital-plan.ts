// lib/digital-plan.ts  (Phase 13A — the recipe data layer)
// Pulls a MealPlan's full schedule -> DigitalPlanData (recipes inline + aggregated grocery list).
// Field names verified against schema.prisma (Decision #61). Decimals -> Number().
//
// ADJUST the prisma import to your project's client (commonly "@/lib/prisma" or "@/lib/db").
import { prisma } from "@/lib/prisma";
import type {
  DigitalPlanData, DigitalPlanDay, DigitalPlanMeal, GroceryLineItem,
} from "./digital-plan-types";

// Prisma Decimal -> number (Decimal implements valueOf, but be explicit)
const num = (d: unknown): number => Number(d ?? 0);

// Enum slot order for stable day layout (Prisma enum sort can't be relied on across versions).
const SLOT_RANK: Record<string, number> = { BREAKFAST: 0, LUNCH: 1, DINNER: 2, SNACK: 3 };

export async function getDigitalPlanData(slug: string): Promise<DigitalPlanData | null> {
  const plan = await prisma.mealPlan.findUnique({
    where: { slug },
    include: {
      scheduleSlots: {
        include: {
          recipe: {
            include: {
              ingredients: {
                orderBy: { orderInRecipe: "asc" },
                include: { foodItem: true },
              },
              steps: { orderBy: { stepNumber: "asc" } },
            },
          },
        },
      },
    },
  });
  if (!plan) return null;

  // ── Group slots by day ──
  const byDay = new Map<number, typeof plan.scheduleSlots>();
  for (const slot of plan.scheduleSlots) {
    const arr = byDay.get(slot.dayNumber) ?? [];
    arr.push(slot);
    byDay.set(slot.dayNumber, arr);
  }

  // ── Grocery aggregation across the whole plan (keyed by FoodItem) ──
  const grocery = new Map<string, GroceryLineItem>();

  const days: DigitalPlanDay[] = [];
  for (const dayNumber of [...byDay.keys()].sort((a, b) => a - b)) {
    const slots = byDay
      .get(dayNumber)!
      .sort((a, b) => (SLOT_RANK[a.mealSlot] ?? 9) - (SLOT_RANK[b.mealSlot] ?? 9));

    const meals: DigitalPlanMeal[] = slots.map((slot) => {
      const r = slot.recipe;
      const mult = num(slot.servingMultiplier) || 1;

      const ingredients = r.ingredients
        .filter((ri) => !ri.isOptional || true) // keep optional, label later if needed
        .map((ri) => {
          const grams = Math.round(num(ri.quantityGrams) * mult);
          // accumulate grocery
          const key = ri.foodItemId;
          const existing = grocery.get(key);
          if (existing) existing.totalRawGrams += grams;
          else grocery.set(key, {
            foodName: ri.foodItem.name,
            totalRawGrams: grams,
            category: ri.foodItem.category ?? "Other",
          });
          return { name: ri.foodItem.name, rawGrams: grams };
        });

      return {
        slot: slot.mealSlot as DigitalPlanMeal["slot"],
        recipeName: r.name,
        calories: Math.round(r.caloriesPerServing * mult),
        proteinG: Math.round(num(r.proteinGrams) * mult),
        carbsG: Math.round(num(r.carbsGrams) * mult),
        fatG: Math.round(num(r.fatGrams) * mult),
        fibreG: Math.round(num(r.fibreGrams) * mult),
        cuisine: r.cuisineType,
        difficulty: r.difficulty,
        ingredients,
        steps: r.steps.map((s) => `${s.title}: ${s.instruction}`),
      };
    });

    const totals = meals.reduce(
      (t, m) => ({
        calories: t.calories + m.calories,
        proteinG: t.proteinG + m.proteinG,
        carbsG: t.carbsG + m.carbsG,
        fatG: t.fatG + m.fatG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    );

    days.push({ day: dayNumber, meals, totals });
  }

  // ── Grocery list: group + sort by category then name ──
  const groceryList = [...grocery.values()].sort((a, b) =>
    (a.category ?? "").localeCompare(b.category ?? "") || a.foodName.localeCompare(b.foodName),
  );

  return {
    planName: plan.displayName,
    tier: plan.tier as DigitalPlanData["tier"],
    dietVariant: plan.dietaryVariant as DigitalPlanData["dietVariant"],
    durationDays: plan.cycleLengthDays,
    targetCalories: plan.avgCaloriesPerDay,
    targetProteinG: plan.avgProteinGrams,
    days,
    grocery: groceryList,
  };
}
