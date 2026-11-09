// lib/plan-schedule.ts
//
// ONE CODE PATH that turns a plan's menu into its PlanScheduleSlot rows.
//
// Until this module existed the rotation lived in two places, both hardcoded
// to the one plan that had a menu and both doing the same thing by hand:
// the veg recipe seed step 3 (29 recipes) and
// the veg patch step 4 (the same loop, rerun after the 10th lunch
// was added, so 30 recipes). Either copy could drift from the other and no
// test pinned what either one produced. Both now call rebuildPlanSchedule
// below, and that plan is the first user of the generic path, not a
// special case.
//
// WHAT THE BUILDER KNOWS, AND WHAT IT DOES NOT. The builder takes a plan
// slug, a length in days, and the plan's menu as input, and nothing else.
// It does not know what any one plan's recipes are, which categories or
// dietary tags select a plan's recipes, or where recipe ids come from: the
// caller loads the recipes (today, both callers run the same findMany over
// planCategories / dietaryTags) and passes them in. A plan with no menu
// data builds nothing: an empty recipe list produces zero slots, and a
// slot with no recipes is skipped, exactly as the hardcoded loop skipped
// it. No plan gains a menu it does not have.
//
// THE ROTATION, PRESERVED VERBATIM. For each day 1..days, in eating order
// BREAKFAST, LUNCH, SNACK, DINNER, the slot takes the recipe at index
// (day - 1) % (recipes in that slot), so each slot cycles through its own
// recipes independently and a plan repeats a recipe only when its slot runs
// out of fresh ones. Every slot carries servingMultiplier 1.0, as the old
// code wrote it. The seeded schedule covers the full 60-day cycle, so both
// callers pass days 60. That 60 is the plan row's cycleLengthDays: the
// readiness gate (lib/plan-readiness.ts) needs scheduleCount >=
// cycleLengthDays * mealsPerDay, so a 60-day plan with 4 meals a day needs
// 60 * 4 = 240 slots. The old hardcoded path built 30 days (120 slots)
// and the plan failed the gate despite being active and priced; piece 9f
// fixes that.
//
// ROTATIONGROUP, NOT USED. The Recipe row carries rotationGroup (schema:
// "1-60, ensures no repeat in 60-day cycle"), but the seeded values are
// per-slot sequence numbers 1-10, not a 60-day no-repeat design: a true
// no-repeat 60-day rotation would need 60 distinct recipes per slot, and
// the seeded menu has 8 breakfast, 10 lunch, 5 snack and 7 dinner
// recipes. The modulo rotation above is the honest mechanism for the menu
// that exists; the field stays stored, unused by the builder, until a menu
// is seeded with rotation groups that actually span a cycle.
//
// MENU-DATA CONTRACT, FOR FUTURE PLANS. A plan's schedule is built from
// three pieces, and only these:
// - MealPlan row: slug (lookup key), cycleLengthDays (schedule length in
//   days), mealsPerDay (slots per day), isActive (the seed flips it on
//   once the schedule exists). The gate needs cycleLengthDays *
//   mealsPerDay slots, so the days passed to the builder must equal
//   cycleLengthDays or the plan fails it.
// - PlanScheduleSlot rows: dayNumber 1..cycleLengthDays, mealSlot one of
//   BREAKFAST, LUNCH, SNACK, DINNER, recipeId, servingMultiplier (1.0),
//   unique on (mealPlanId, dayNumber, mealSlot).
// - Recipe selector: the caller loads the menu with a findMany over
//   planCategories and dietaryTags and passes the rows in; the query is
//   the plan-specific part and stays in the plan file.
// Builder input/output: ScheduleRecipe { id, mealType } in,
// BuildScheduleInput { days, recipes } in, ScheduleSlotDraft[]
// { dayNumber, mealSlot, recipeId, servingMultiplier } out. The builder
// never reads the database and never names a plan, a category or a tag.
//
// ORDER. Recipes keep the order the caller passes them in, within each
// slot. The old code grouped a findMany result with filter(), which also
// preserves order, so feeding the same query result into the builder
// produces the same rotation. Nothing here sorts, dedupes or reorders.

import type { PrismaClient } from "@prisma/client";

/** The four meal slots, in the eating order the plan page and the schedule
 *  API sort by. */
export const SCHEDULE_SLOT_ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;

export type ScheduleMealSlot = (typeof SCHEDULE_SLOT_ORDER)[number];

/** The only thing the builder needs to know about a recipe: its id and
 *  which slot it fills. Any richer shape (a Prisma Recipe row, a seed
 *  definition) narrows to this at the call site. */
export interface ScheduleRecipe {
  id: string;
  mealType: ScheduleMealSlot;
}

/** One PlanScheduleSlot row, before the plan id is attached by the writer:
 *  day, slot, recipe, and the serving multiplier the old code wrote (1.0). */
export interface ScheduleSlotDraft {
  dayNumber: number;
  mealSlot: ScheduleMealSlot;
  recipeId: string;
  servingMultiplier: number;
}

export interface BuildScheduleInput {
  /** Length of the rotation in days. Must equal the plan row's
   *  cycleLengthDays, or the plan fails the readiness gate. */
  days: number;
  /** The plan's menu: every recipe that may appear in the rotation. */
  recipes: ScheduleRecipe[];
}

/** Pure rotation: plan slug and menu in, slot drafts out. No database, no
 *  plan-specific data, so a contract test can pin it exactly. An empty
 *  menu, or a menu with no recipe for a slot, yields no drafts for that
 *  slot; days <= 0 yields nothing. */
export function buildScheduleSlots(input: BuildScheduleInput): ScheduleSlotDraft[] {
  const { days, recipes } = input;
  if (days <= 0 || recipes.length === 0) return [];

  const bySlot: Record<ScheduleMealSlot, ScheduleRecipe[]> = {
    BREAKFAST: [],
    LUNCH: [],
    SNACK: [],
    DINNER: [],
  };
  for (const recipe of recipes) bySlot[recipe.mealType].push(recipe);

  const drafts: ScheduleSlotDraft[] = [];
  for (let day = 1; day <= days; day++) {
    for (const slot of SCHEDULE_SLOT_ORDER) {
      const slotRecipes = bySlot[slot];
      if (slotRecipes.length === 0) continue;
      const recipe = slotRecipes[(day - 1) % slotRecipes.length];
      drafts.push({
        dayNumber: day,
        mealSlot: slot,
        recipeId: recipe.id,
        servingMultiplier: 1.0,
      });
    }
  }
  return drafts;
}

export interface RebuildPlanScheduleInput {
  /** Slug of the MealPlan whose schedule is rebuilt. */
  planSlug: string;
  /** Length of the rotation in days. Must equal the plan row's
   *  cycleLengthDays, or the plan fails the readiness gate. */
  days: number;
  /** The plan's menu, loaded by the caller. */
  recipes: ScheduleRecipe[];
}

export interface RebuildPlanScheduleResult {
  mealPlanId: string;
  /** Slots cleared before the rebuild, for the caller's log line. */
  deleted: number;
  slotsCreated: number;
  /** Recipes per slot in the menu that was rotated. */
  recipesBySlot: Record<ScheduleMealSlot, number>;
}

/** Rebuild one plan's schedule through the generic path: look the plan up
 *  by slug, clear its existing slots, and write the drafts
 *  buildScheduleSlots produces, in the same order, one create per slot, as
 *  the hardcoded path did. Returns null when no MealPlan has the slug, so
 *  the caller can say so and skip its follow-up steps (the old code's
 *  not-found branch); with a plan but no recipes it clears the stale slots
 *  and creates none, also as the old code did. */
export async function rebuildPlanSchedule(
  prisma: PrismaClient,
  input: RebuildPlanScheduleInput,
): Promise<RebuildPlanScheduleResult | null> {
  const mealPlan = await prisma.mealPlan.findUnique({
    where: { slug: input.planSlug },
    select: { id: true },
  });
  if (!mealPlan) return null;

  const deleted = await prisma.planScheduleSlot.deleteMany({
    where: { mealPlanId: mealPlan.id },
  });

  const drafts = buildScheduleSlots({ days: input.days, recipes: input.recipes });
  for (const draft of drafts) {
    await prisma.planScheduleSlot.create({
      data: {
        mealPlanId: mealPlan.id,
        dayNumber: draft.dayNumber,
        mealSlot: draft.mealSlot,
        recipeId: draft.recipeId,
        servingMultiplier: draft.servingMultiplier,
      },
    });
  }

  const recipesBySlot: Record<ScheduleMealSlot, number> = {
    BREAKFAST: 0,
    LUNCH: 0,
    SNACK: 0,
    DINNER: 0,
  };
  for (const recipe of input.recipes) recipesBySlot[recipe.mealType] += 1;

  return {
    mealPlanId: mealPlan.id,
    deleted: deleted.count,
    slotsCreated: drafts.length,
    recipesBySlot,
  };
}
