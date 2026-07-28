// app/_hp/menu-data.ts
//
// One query for the whole menu section of the homepage.
//
// TrialDay renders day 1 in detail and Week renders days 1 to 7 as a table.
// Both read from PlanScheduleSlot joined to Recipe, so they are wrapped in
// React's `cache()` and share a single round trip per render rather than
// hitting Postgres twice for overlapping rows.
//
// SEVEN DAYS, NOT THIRTY. The schedule seeded for weight-loss-veg is 30 days
// deep (120 slots). Printing all of it turned the homepage into a menu board:
// a visitor cannot hold thirty days in their head and it buried the one day
// they can actually buy. A week is the unit a person plans against, so the
// homepage shows a week and links to the full schedule on the plan page.
//
// WHY ONLY ONE PLAN: recipe seeding is 1 of 126 (FITFUEL-MASTER-TRACKER
// -DEFINITIVE.md line 138, F4, still open). This is the only plan with a
// complete seeded schedule, so it is labelled as one plan's week rather than
// dressed up as the whole menu. When F4 lands, widening this is a change of
// `where`, not a rebuild.
//
// FAILURE BEHAVIOUR IS DELIBERATE. Every query is wrapped and an empty result
// still lets the section render its heading and CTA. A section that silently
// deletes itself when the database hiccups is how this page lost its trust
// strip for four days.

import { cache } from "react";

import { prisma } from "@/lib/prisma";

export const PLAN_SLUG = "weight-loss-veg";
export const WEEK_DAYS = 7;

/** The order a day is actually eaten in, not the order Postgres returns. */
export const SLOT_ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;
export type Slot = (typeof SLOT_ORDER)[number];

export const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  SNACK: "Snack",
  DINNER: "Dinner",
};

export type Dish = {
  day: number;
  slot: string;
  name: string;
  blurb: string | null;
  cuisine: string | null;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fibre: number | null;
};

/* Recipe macro columns are Prisma Decimal, not number. Summing them with `+`
   coerces each to a string and concatenates the day into "24.538.2...", which
   Math.round then turns into NaN on the totals bar. Coerce once, here, so
   everything downstream is a real number. */
function num(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* Seeded cuisine values are written closed-up ("NorthIndian") while others are
   single words ("Chettinad"). Split on the case boundary only. */
function humaniseCuisine(v: string | null): string | null {
  return v ? v.replace(/([a-z])([A-Z])/g, "$1 $2") : null;
}

export const getWeek = cache(async function getWeek(): Promise<Dish[]> {
  try {
    const plan = await prisma.mealPlan.findUnique({
      where: { slug: PLAN_SLUG },
      select: { id: true, name: true },
    });
    if (!plan) return [];

    const slots = await prisma.planScheduleSlot.findMany({
      where: { mealPlanId: plan.id, dayNumber: { lte: WEEK_DAYS } },
      include: {
        recipe: {
          select: {
            name: true,
            shortDescription: true,
            cuisineType: true,
            caloriesPerServing: true,
            proteinGrams: true,
            carbsGrams: true,
            fatGrams: true,
            fibreGrams: true,
          },
        },
      },
    });

    return slots
      .flatMap((x): Dish[] =>
        x.recipe
          ? [
              {
                day: Number(x.dayNumber),
                slot: String(x.mealSlot),
                name: x.recipe.name,
                blurb: x.recipe.shortDescription,
                cuisine: humaniseCuisine(x.recipe.cuisineType),
                kcal: num(x.recipe.caloriesPerServing),
                protein: num(x.recipe.proteinGrams),
                carbs: num(x.recipe.carbsGrams),
                fat: num(x.recipe.fatGrams),
                fibre: num(x.recipe.fibreGrams),
              },
            ]
          : [],
      )
      .sort(
        (a, b) =>
          a.day - b.day ||
          SLOT_ORDER.indexOf(a.slot as Slot) - SLOT_ORDER.indexOf(b.slot as Slot),
      );
  } catch {
    return [];
  }
});

/** Day one only, in eating order. The trial day a visitor can actually buy. */
export const getDayOne = cache(async function getDayOne(): Promise<Dish[]> {
  const week = await getWeek();
  return week.filter((d) => d.day === 1);
});

/** Total a day's kcal / protein without tripping over nulls. */
export function totals(dishes: Dish[]) {
  return {
    kcal: dishes.reduce((n, d) => n + (d.kcal ?? 0), 0),
    protein: dishes.reduce((n, d) => n + (d.protein ?? 0), 0),
  };
}
