// lib/production.ts
// Phase 15B — the SINGLE SOURCE OF TRUTH for "who eats what on a given date".
//
// Two consumers share this file so they can never disagree (Decision P15-1):
//   1) the nightly delivery cron (api/cron/generate-deliveries) — uses the
//      subscriber selection + skip filtering.
//   2) the Kitchen Production Dashboard (app/admin/production) — uses the full
//      report (portions per recipe, by window + meal slot).
//
// Menu day-number is CALENDAR-BASED (Decision P15-2/Q1b): day 1 = startDate,
// advancing one menu-day per calendar day, wrapping at cycleLengthDays. Skipped
// days do NOT shift the menu — they only suppress that day's delivery.

import { prisma } from "@/lib/prisma";

export type DeliveryWindowValue = "MORNING" | "EVENING";
export type MealSlotValue = "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";

export const SLOT_ORDER: Record<MealSlotValue, number> = {
  BREAKFAST: 0,
  LUNCH: 1,
  SNACK: 2,
  DINNER: 3,
};

// What the cron stamps as `mealsIncluded` maps 1:1 to which menu slots a
// subscriber actually receives. Keep this in lockstep with the cron's mealsFor().
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

// target = a UTC-midnight Date. Default = tomorrow (matches the cron exactly so
// the production sheet reflects the deliveries that WILL be generated).
// ?date=YYYY-MM-DD overrides.
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

// Calendar-based menu day. Day 1 = startDate. Wraps at cycleLengthDays.
export function menuDayNumber(startDate: Date, target: Date, cycleLengthDays: number): number {
  const days = Math.floor((utcMidnight(target) - utcMidnight(startDate)) / 86_400_000);
  const cycle = cycleLengthDays && cycleLengthDays > 0 ? cycleLengthDays : 30;
  // ((days % cycle) + cycle) % cycle handles dates before startDate safely
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
  /** total active physical plans covering the date, BEFORE skip filtering */
  total: number;
  /** subscribers actually being served (skip-filtered) */
  served: ActiveSubscriber[];
  /** count of subscribers who skipped this date */
  skipped: number;
};

// THE predicate. Active, physical (non-digital), date within range, has an order.
// Returns served list (skip-filtered) + counts. The cron and the dashboard both
// call this so the subscriber set is defined in exactly one place.
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
};

export type ProductionReport = {
  date: string;
  headcount: { total: number; MORNING: number; EVENING: number };
  totalPortions: number;
  lines: ProductionRecipeLine[];
  warnings: string[];
};

// Build the full cook sheet for a date: portions per recipe, split by delivery
// window and meal slot, plus headcount. Reuses the schedule join shape from
// api/plans/[slug]/schedule.
export async function buildProductionReport(date: Date): Promise<ProductionReport> {
  const { served } = await getActiveSubscribersForDate(date);

  const report: ProductionReport = {
    date: ymd(date),
    headcount: { total: 0, MORNING: 0, EVENING: 0 },
    totalPortions: 0,
    lines: [],
    warnings: [],
  };
  if (served.length === 0) return report;

  // Resolve each subscriber's menu day, collect distinct (plan, day) pairs.
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

  // index: planId|day|slot -> slot
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
        };
        lineMap.set(rid, line);
      }
      line.totalPortions += portions;
      line.byWindow[r.window] += portions;
      line.bySlot[slot] += portions;
      report.totalPortions += portions;
    }
  }

  // primarySlot = the slot contributing the most portions for that recipe
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

  report.lines = Array.from(lineMap.values()).sort((a, b) => {
    const so = SLOT_ORDER[a.primarySlot] - SLOT_ORDER[b.primarySlot];
    return so !== 0 ? so : b.totalPortions - a.totalPortions;
  });

  return report;
}
