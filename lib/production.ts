// lib/production.ts
// Phase 15B — the SINGLE SOURCE OF TRUTH for "who eats what on a given date",
// AND the kitchen SOP: scaled ingredients + cooking steps per recipe.
//
// Two consumers share this file so they can never disagree (Decision P15-1):
//   1) the nightly delivery cron (api/cron/generate-deliveries) — subscriber
//      selection + skip filtering only.
//   2) the Kitchen Production Dashboard (app/admin/production) — the full cook
//      sheet: portions per recipe (by window + slot), scaled ingredient roll-up,
//      step-by-step SOP, and a consolidated prep/shopping list.
//
// Menu day-number is CALENDAR-BASED (Q1b): day 1 = startDate, advancing one
// menu-day per calendar day, wrapping at cycleLengthDays. Skipped days do NOT
// shift the menu — they only suppress that day's delivery.

import { prisma } from "@/lib/prisma";

export type DeliveryWindowValue = "MORNING" | "EVENING";
export type MealSlotValue = "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";

export const SLOT_ORDER: Record<MealSlotValue, number> = {
  BREAKFAST: 0,
  LUNCH: 1,
  SNACK: 2,
  DINNER: 3,
};

export function mealSlotsForMealsPerDay(m: string | null | undefined): MealSlotValue[] {
  switch (m) {
    case "BREAKFAST_LUNCH":
      return ["BREAKFAST", "LUNCH"];
    case "SNACK_DINNER":
      return ["SNACK", "DINNER"];
    case "ALL_FOUR":
      return ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
    default:
      return ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
  }
}

export function targetDayUTC(override?: string | null): Date {
  if (override) return new Date(`${override}T00:00:00.000Z`);
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sameUTCDate(a: Date, b: Date): boolean {
  return ymd(a) === ymd(b);
}

function utcMidnight(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function menuDayNumber(startDate: Date, target: Date, cycleLengthDays: number): number {
  const days = Math.floor((utcMidnight(target) - utcMidnight(startDate)) / 86_400_000);
  const cycle = cycleLengthDays && cycleLengthDays > 0 ? cycleLengthDays : 30;
  return (((days % cycle) + cycle) % cycle) + 1;
}

export type ActiveSubscriber = {
  id: string;
  orderId: string | null;
  mealPlanId: string;
  mealsPerDay: string | null;
  deliveryWindow: DeliveryWindowValue | null;
  skipDates: Date[];
  startDate: Date;
  mealPlan: { id: string; name: string; slug: string; cycleLengthDays: number };
};

export type ActiveSubscribersResult = {
  total: number;
  served: ActiveSubscriber[];
  skipped: number;
};

// THE predicate. Shared by the cron and the dashboard so the subscriber set is
// defined in exactly one place.
export async function getActiveSubscribersForDate(date: Date): Promise<ActiveSubscribersResult> {
  const subs = (await prisma.userActivePlan.findMany({
    where: {
      status: "active",
      isDigital: false,
      startDate: { lte: date },
      endDate: { gte: date },
      orderId: { not: null },
    },
    select: {
      id: true,
      orderId: true,
      mealPlanId: true,
      mealsPerDay: true,
      deliveryWindow: true,
      skipDates: true,
      startDate: true,
      mealPlan: { select: { id: true, name: true, slug: true, cycleLengthDays: true } },
    },
  })) as unknown as ActiveSubscriber[];

  const served: ActiveSubscriber[] = [];
  let skipped = 0;
  for (const s of subs) {
    if (s.skipDates?.some((sd) => sameUTCDate(new Date(sd), date))) {
      skipped++;
      continue;
    }
    served.push(s);
  }
  return { total: subs.length, served, skipped };
}

export type IngredientNeed = {
  name: string;
  category: string | null;
  gramsPerServing: number;
  totalGrams: number;
  prepNote: string | null;
  isOptional: boolean;
};

export type RecipeStepLine = {
  stepNumber: number;
  title: string;
  instruction: string;
  technique: string | null;
  kitchenNote: string | null;
  durationMins: number | null;
};

export type ProductionRecipeLine = {
  recipeId: string;
  recipeName: string;
  recipeSlug: string;
  cuisineType: string;
  servingSizeGrams: number;
  caloriesPerServing: number;
  primarySlot: MealSlotValue;
  totalPortions: number;
  byWindow: Record<DeliveryWindowValue, number>;
  bySlot: Record<MealSlotValue, number>;
  ingredients: IngredientNeed[];
  steps: RecipeStepLine[];
};

export type ShoppingListItem = {
  name: string;
  category: string | null;
  totalGrams: number;
};

export type ProductionReport = {
  date: string;
  headcount: { total: number; MORNING: number; EVENING: number };
  totalPortions: number;
  lines: ProductionRecipeLine[];
  shoppingList: ShoppingListItem[];
  warnings: string[];
};

// Build the full cook sheet for a date. When `detailed` (default), also fetches
// scaled ingredients + cooking steps and the consolidated shopping list.
export async function buildProductionReport(
  date: Date,
  opts: { detailed?: boolean } = {}
): Promise<ProductionReport> {
  const detailed = opts.detailed ?? true;
  const { served } = await getActiveSubscribersForDate(date);

  const report: ProductionReport = {
    date: ymd(date),
    headcount: { total: 0, MORNING: 0, EVENING: 0 },
    totalPortions: 0,
    lines: [],
    shoppingList: [],
    warnings: [],
  };
  if (served.length === 0) return report;

  type Resolved = ActiveSubscriber & { dayNumber: number; window: DeliveryWindowValue };
  const resolved: Resolved[] = served.map((s) => ({
    ...s,
    dayNumber: menuDayNumber(new Date(s.startDate), date, s.mealPlan.cycleLengthDays),
    window: (s.deliveryWindow ?? "MORNING") as DeliveryWindowValue,
  }));

  const pairKey = (planId: string, day: number) => `${planId}|${day}`;
  const pairs = new Map<string, { mealPlanId: string; dayNumber: number }>();
  for (const r of resolved) pairs.set(pairKey(r.mealPlanId, r.dayNumber), { mealPlanId: r.mealPlanId, dayNumber: r.dayNumber });

  const slots = await prisma.planScheduleSlot.findMany({
    where: { OR: Array.from(pairs.values()) },
    select: {
      mealPlanId: true,
      dayNumber: true,
      mealSlot: true,
      servingMultiplier: true,
      recipe: {
        select: {
          id: true,
          name: true,
          slug: true,
          cuisineType: true,
          servingSizeGrams: true,
          caloriesPerServing: true,
        },
      },
    },
  });

  const slotIndex = new Map<string, (typeof slots)[number]>();
  for (const sl of slots) slotIndex.set(`${sl.mealPlanId}|${sl.dayNumber}|${sl.mealSlot}`, sl);

  const lineMap = new Map<string, ProductionRecipeLine>();
  const warned = new Set<string>();

  for (const r of resolved) {
    report.headcount.total++;
    report.headcount[r.window]++;

    for (const slot of mealSlotsForMealsPerDay(r.mealsPerDay)) {
      const sl = slotIndex.get(`${r.mealPlanId}|${r.dayNumber}|${slot}`);
      if (!sl || !sl.recipe) {
        const w = `No recipe scheduled: ${r.mealPlan.name} · day ${r.dayNumber} · ${slot}`;
        if (!warned.has(w)) {
          warned.add(w);
          report.warnings.push(w);
        }
        continue;
      }
      const portions = Number(sl.servingMultiplier ?? 1);
      const rid = sl.recipe.id;
      let line = lineMap.get(rid);
      if (!line) {
        line = {
          recipeId: rid,
          recipeName: sl.recipe.name,
          recipeSlug: sl.recipe.slug,
          cuisineType: sl.recipe.cuisineType,
          servingSizeGrams: sl.recipe.servingSizeGrams,
          caloriesPerServing: sl.recipe.caloriesPerServing,
          primarySlot: slot,
          totalPortions: 0,
          byWindow: { MORNING: 0, EVENING: 0 },
          bySlot: { BREAKFAST: 0, LUNCH: 0, SNACK: 0, DINNER: 0 },
          ingredients: [],
          steps: [],
        };
        lineMap.set(rid, line);
      }
      line.totalPortions += portions;
      line.byWindow[r.window] += portions;
      line.bySlot[slot] += portions;
      report.totalPortions += portions;
    }
  }

  for (const line of lineMap.values()) {
    let best: MealSlotValue = "BREAKFAST";
    let bestN = -1;
    (Object.keys(line.bySlot) as MealSlotValue[]).forEach((s) => {
      if (line.bySlot[s] > bestN) {
        bestN = line.bySlot[s];
        best = s;
      }
    });
    line.primarySlot = best;
  }

  // ── SOP detail: scaled ingredients + steps + consolidated shopping list ──
  if (detailed && lineMap.size > 0) {
    const recipeIds = Array.from(lineMap.keys());

    const [ings, steps] = await Promise.all([
      prisma.recipeIngredient.findMany({
        where: { recipeId: { in: recipeIds } },
        orderBy: { orderInRecipe: "asc" },
        select: {
          recipeId: true,
          quantityGrams: true,
          prepNote: true,
          isOptional: true,
          foodItem: { select: { name: true, category: true } },
        },
      }),
      prisma.recipeStep.findMany({
        where: { recipeId: { in: recipeIds } },
        orderBy: { stepNumber: "asc" },
        select: {
          recipeId: true,
          stepNumber: true,
          title: true,
          instruction: true,
          technique: true,
          kitchenNote: true,
          durationMins: true,
        },
      }),
    ]);

    const shop = new Map<string, ShoppingListItem>();

    for (const ing of ings) {
      const line = lineMap.get(ing.recipeId);
      if (!line) continue;
      const perServing = Number(ing.quantityGrams ?? 0);
      const total = perServing * line.totalPortions;
      const name = ing.foodItem?.name ?? "Unknown item";
      const category = ing.foodItem?.category ?? null;

      line.ingredients.push({
        name,
        category,
        gramsPerServing: perServing,
        totalGrams: total,
        prepNote: ing.prepNote ?? null,
        isOptional: ing.isOptional,
      });

      // consolidated procurement (skip optional items so we don't over-order)
      if (!ing.isOptional) {
        const key = `${name}|${category ?? ""}`;
        const existing = shop.get(key);
        if (existing) existing.totalGrams += total;
        else shop.set(key, { name, category, totalGrams: total });
      }
    }

    for (const st of steps) {
      const line = lineMap.get(st.recipeId);
      if (!line) continue;
      line.steps.push({
        stepNumber: st.stepNumber,
        title: st.title,
        instruction: st.instruction,
        technique: st.technique ?? null,
        kitchenNote: st.kitchenNote ?? null,
        durationMins: st.durationMins ?? null,
      });
    }

    report.shoppingList = Array.from(shop.values()).sort((a, b) => {
      const ca = (a.category ?? "~").localeCompare(b.category ?? "~");
      return ca !== 0 ? ca : a.name.localeCompare(b.name);
    });

    // flag recipes missing an SOP so the kitchen knows the data is incomplete
    for (const line of lineMap.values()) {
      if (line.ingredients.length === 0) {
        report.warnings.push(`No ingredients defined for recipe "${line.recipeName}" — cannot generate prep list.`);
      }
    }
  }

  report.lines = Array.from(lineMap.values()).sort((a, b) => {
    const so = SLOT_ORDER[a.primarySlot] - SLOT_ORDER[b.primarySlot];
    return so !== 0 ? so : b.totalPortions - a.totalPortions;
  });

  return report;
}
