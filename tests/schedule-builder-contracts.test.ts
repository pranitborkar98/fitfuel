import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildScheduleSlots,
  rebuildPlanSchedule,
  SCHEDULE_SLOT_ORDER,
  type ScheduleMealSlot,
  type ScheduleRecipe,
  type ScheduleSlotDraft,
} from "../lib/plan-schedule";
import type { PrismaClient } from "@prisma/client";

const read = (p: string) => readFileSync(resolve(p), "utf8");

// --- The menu, read from the seed files rather than trusted from a comment.
// Each recipe object in the seed files carries its slug, then its mealType a
// few lines later, in file order. That order is the rotation order: the old
// code grouped a findMany result with filter(), which preserves order, and
// the builder preserves the order it is handed. Zipping slug to mealType in
// file order therefore reproduces the menu both paths rotate over.
function menuFromSeed(src: string): ScheduleRecipe[] {
  const recipes: ScheduleRecipe[] = [];
  for (const m of src.matchAll(/slug: '([^']+)',[\s\S]*?mealType: MealSlot\.([A-Z]+)/g)) {
    recipes.push({ id: m[1], mealType: m[2] as ScheduleMealSlot });
  }
  return recipes;
}

// --- THE ORACLE: the hardcoded rotation, copied verbatim from the loop this
// piece deleted (seed-recipes-weight-loss-veg.ts step 3 and patch-wl-veg.ts
// step 4 were the same loop twice). It is kept here, frozen, so the generic
// builder has something to be identical to. If the builder ever drifts, this
// test fails on purpose: the two paths must produce the same slots.
function hardcodedSchedule(days: number, recipes: ScheduleRecipe[]): ScheduleSlotDraft[] {
  const bySlot: Record<string, ScheduleRecipe[]> = {
    BREAKFAST: recipes.filter((r) => r.mealType === "BREAKFAST"),
    LUNCH: recipes.filter((r) => r.mealType === "LUNCH"),
    SNACK: recipes.filter((r) => r.mealType === "SNACK"),
    DINNER: recipes.filter((r) => r.mealType === "DINNER"),
  };
  const drafts: ScheduleSlotDraft[] = [];
  const SLOTS = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;
  for (let day = 1; day <= days; day++) {
    for (const slot of SLOTS) {
      const slotRecipes = bySlot[slot];
      if (!slotRecipes || slotRecipes.length === 0) continue;
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

function countBySlot(recipes: ScheduleRecipe[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of recipes) counts[r.mealType] = (counts[r.mealType] ?? 0) + 1;
  return counts;
}

test("seed file holds 29 weight-loss-veg recipes: 8 breakfast, 9 lunch, 5 snack, 7 dinner", () => {
  const recipes = menuFromSeed(read("prisma/seed-recipes-weight-loss-veg.ts"));
  assert.equal(recipes.length, 29);
  assert.deepEqual(countBySlot(recipes), {
    BREAKFAST: 8,
    LUNCH: 9,
    SNACK: 5,
    DINNER: 7,
  });
  // Every recipe id is a distinct slug; the rotation indexes by position,
  // so a duplicate id would silently repeat one recipe.
  assert.equal(new Set(recipes.map((r) => r.id)).size, 29);
});

test("patch adds exactly one lunch, the 10th", () => {
  const recipes = menuFromSeed(read("prisma/patch-wl-veg.ts"));
  assert.equal(recipes.length, 1);
  assert.equal(recipes[0].mealType, "LUNCH");
  assert.equal(recipes[0].id, "continental-paneer-bhurji-brown-rice-wl-veg");
});

test("generic builder matches the hardcoded path for the 29-recipe seed menu: 240 slots", () => {
  const recipes = menuFromSeed(read("prisma/seed-recipes-weight-loss-veg.ts"));
  const generic = buildScheduleSlots({ days: 60, recipes });
  const hardcoded = hardcodedSchedule(60, recipes);
  assert.equal(generic.length, 240);
  assert.deepEqual(generic, hardcoded);
});

test("generic builder matches the hardcoded path for the 30-recipe patched menu: 240 slots", () => {
  const seed = menuFromSeed(read("prisma/seed-recipes-weight-loss-veg.ts"));
  const patch = menuFromSeed(read("prisma/patch-wl-veg.ts"));
  const recipes = [...seed, ...patch];
  assert.equal(recipes.length, 30);
  const generic = buildScheduleSlots({ days: 60, recipes });
  const hardcoded = hardcodedSchedule(60, recipes);
  assert.equal(generic.length, 240);
  assert.deepEqual(generic, hardcoded);
});

test("the patched menu changes only lunch rotation: other slots identical, lunch days 1-9 identical", () => {
  const seed = menuFromSeed(read("prisma/seed-recipes-weight-loss-veg.ts"));
  const patch = menuFromSeed(read("prisma/patch-wl-veg.ts"));
  const before = buildScheduleSlots({ days: 60, recipes: seed });
  const after = buildScheduleSlots({ days: 60, recipes: [...seed, ...patch] });
  assert.deepEqual(
    after.filter((d) => d.mealSlot !== "LUNCH"),
    before.filter((d) => d.mealSlot !== "LUNCH"),
  );
  const lunchBefore = before.filter((d) => d.mealSlot === "LUNCH");
  const lunchAfter = after.filter((d) => d.mealSlot === "LUNCH");
  assert.deepEqual(lunchAfter.slice(0, 9), lunchBefore.slice(0, 9));
  // Day 10 is where the 10th lunch first appears: (10 - 1) % 9 wraps to the
  // first lunch, (10 - 1) % 10 reaches the new one.
  assert.equal(lunchAfter[9].dayNumber, 10);
  assert.equal(lunchAfter[9].recipeId, "continental-paneer-bhurji-brown-rice-wl-veg");
  assert.notEqual(lunchAfter[9].recipeId, lunchBefore[9].recipeId);
});

test("no menu data builds nothing: a plan with no recipes gets no slots", () => {
  assert.deepEqual(buildScheduleSlots({ days: 30, recipes: [] }), []);
  assert.deepEqual(buildScheduleSlots({ days: 0, recipes: [] }), []);
});

test("a menu missing a slot skips that slot and still rotates the rest", () => {
  const breakfastOnly: ScheduleRecipe[] = [
    { id: "a", mealType: "BREAKFAST" },
    { id: "b", mealType: "BREAKFAST" },
  ];
  const drafts = buildScheduleSlots({ days: 30, recipes: breakfastOnly });
  assert.equal(drafts.length, 30);
  assert.ok(drafts.every((d) => d.mealSlot === "BREAKFAST"));
  assert.deepEqual(
    drafts.map((d) => d.recipeId),
    Array.from({ length: 15 }, () => ["a", "b"]).flat(),
  );
  assert.deepEqual(buildScheduleSlots({ days: 0, recipes: breakfastOnly }), []);
});

test("every draft carries servingMultiplier 1, days 1-60, slots in eating order", () => {
  assert.deepEqual([...SCHEDULE_SLOT_ORDER], ["BREAKFAST", "LUNCH", "SNACK", "DINNER"]);
  const seed = menuFromSeed(read("prisma/seed-recipes-weight-loss-veg.ts"));
  const patch = menuFromSeed(read("prisma/patch-wl-veg.ts"));
  const drafts = buildScheduleSlots({ days: 60, recipes: [...seed, ...patch] });
  assert.ok(drafts.every((d) => d.servingMultiplier === 1.0));
  for (let day = 1; day <= 60; day++) {
    const dayDrafts = drafts.filter((d) => d.dayNumber === day);
    assert.equal(dayDrafts.length, 4);
    assert.deepEqual(
      dayDrafts.map((d) => d.mealSlot),
      ["BREAKFAST", "LUNCH", "SNACK", "DINNER"],
    );
  }
});

test("the 60-day build satisfies the readiness gate: 240 slots, days 1-60, 4 per day, unique day+slot", () => {
  const seed = menuFromSeed(read("prisma/seed-recipes-weight-loss-veg.ts"));
  const patch = menuFromSeed(read("prisma/patch-wl-veg.ts"));
  const drafts = buildScheduleSlots({ days: 60, recipes: [...seed, ...patch] });
  // 60 days * 4 meals = cycleLengthDays * mealsPerDay, the readiness gate.
  assert.equal(drafts.length, 240);
  const days = new Set(drafts.map((d) => d.dayNumber));
  assert.equal(days.size, 60);
  assert.equal(Math.min(...days), 1);
  assert.equal(Math.max(...days), 60);
  const pairs = new Set(drafts.map((d) => `${d.dayNumber}:${d.mealSlot}`));
  assert.equal(pairs.size, 240);
  for (let day = 1; day <= 60; day++) {
    const dayDrafts = drafts.filter((d) => d.dayNumber === day);
    assert.equal(dayDrafts.length, 4);
    assert.deepEqual(
      dayDrafts.map((d) => d.mealSlot),
      ["BREAKFAST", "LUNCH", "SNACK", "DINNER"],
    );
  }
});

test("the 60-day rotation wraps at each slot's menu size", () => {
  const seed = menuFromSeed(read("prisma/seed-recipes-weight-loss-veg.ts"));
  const patch = menuFromSeed(read("prisma/patch-wl-veg.ts"));
  const drafts = buildScheduleSlots({ days: 60, recipes: [...seed, ...patch] });
  const slot = (day: number, mealSlot: ScheduleMealSlot) =>
    drafts.find((d) => d.dayNumber === day && d.mealSlot === mealSlot)!.recipeId;
  // Breakfast has 8 recipes: day 9 repeats day 1, day 33 repeats day 1,
  // and day 31 repeats day 7 ((31 - 1) % 8 == 6), not day 1.
  assert.equal(slot(9, "BREAKFAST"), slot(1, "BREAKFAST"));
  assert.equal(slot(33, "BREAKFAST"), slot(1, "BREAKFAST"));
  assert.equal(slot(31, "BREAKFAST"), slot(7, "BREAKFAST"));
  assert.notEqual(slot(31, "BREAKFAST"), slot(1, "BREAKFAST"));
  // Lunch has 10 recipes: day 11 repeats day 1, day 31 repeats day 1.
  assert.equal(slot(11, "LUNCH"), slot(1, "LUNCH"));
  assert.equal(slot(31, "LUNCH"), slot(1, "LUNCH"));
  // Snack has 5 recipes: day 6 repeats day 1, day 31 repeats day 1.
  assert.equal(slot(6, "SNACK"), slot(1, "SNACK"));
  assert.equal(slot(31, "SNACK"), slot(1, "SNACK"));
  // Dinner has 7 recipes: day 8 repeats day 1, day 29 repeats day 1.
  assert.equal(slot(8, "DINNER"), slot(1, "DINNER"));
  assert.equal(slot(29, "DINNER"), slot(1, "DINNER"));
  // Day 60 is a full day: (60 - 1) % 8 == 3, so its breakfast is day 4's.
  assert.equal(slot(60, "BREAKFAST"), slot(4, "BREAKFAST"));
});

test("rebuildPlanSchedule clears the plan's slots and writes the generic drafts, in order", async () => {
  const seed = menuFromSeed(read("prisma/seed-recipes-weight-loss-veg.ts"));
  const patch = menuFromSeed(read("prisma/patch-wl-veg.ts"));
  const recipes = [...seed, ...patch];
  const created: unknown[] = [];
  let deletedWhere: unknown = null;
  let deleteCalls = 0;
  const stub = {
    mealPlan: {
      findUnique: async () => ({ id: "plan-wl-veg" }),
    },
    planScheduleSlot: {
      deleteMany: async (args: unknown) => {
        deleteCalls++;
        deletedWhere = args;
        return { count: 240 };
      },
      create: async (args: { data: unknown }) => {
        created.push(args.data);
        return args.data;
      },
    },
  } as unknown as PrismaClient;
  const result = await rebuildPlanSchedule(stub, {
    planSlug: "weight-loss-veg",
    days: 60,
    recipes,
  });
  assert.deepEqual(result, {
    mealPlanId: "plan-wl-veg",
    deleted: 240,
    slotsCreated: 240,
    recipesBySlot: { BREAKFAST: 8, LUNCH: 10, SNACK: 5, DINNER: 7 },
  });
  assert.equal(deleteCalls, 1);
  assert.deepEqual(deletedWhere, { where: { mealPlanId: "plan-wl-veg" } });
  // The rows written are the oracle rows, with the plan id attached, in
  // the same order the hardcoded loop created them.
  assert.equal(created.length, 240);
  const expected = hardcodedSchedule(60, recipes).map((d) => ({
    mealPlanId: "plan-wl-veg",
    dayNumber: d.dayNumber,
    mealSlot: d.mealSlot,
    recipeId: d.recipeId,
    servingMultiplier: d.servingMultiplier,
  }));
  assert.deepEqual(created, expected);
});

test("rebuildPlanSchedule returns null and writes nothing when the plan slug is unknown", async () => {
  const created: unknown[] = [];
  let deleteCalls = 0;
  const stub = {
    mealPlan: {
      findUnique: async () => null,
    },
    planScheduleSlot: {
      deleteMany: async () => {
        deleteCalls++;
        return { count: 0 };
      },
      create: async (args: { data: unknown }) => {
        created.push(args.data);
        return args.data;
      },
    },
  } as unknown as PrismaClient;
  const result = await rebuildPlanSchedule(stub, {
    planSlug: "no-such-plan",
    days: 30,
    recipes: [{ id: "a", mealType: "BREAKFAST" }],
  });
  assert.equal(result, null);
  assert.equal(deleteCalls, 0);
  assert.equal(created.length, 0);
});

test("the builder module holds no plan-specific data", () => {
  const src = read("lib/plan-schedule.ts");
  assert.ok(!src.includes("weight-loss-veg"), "builder must not name a plan slug");
  assert.ok(!src.includes("weight_loss"), "builder must not name a plan category");
  assert.ok(!src.includes("VEGETARIAN"), "builder must not name a dietary tag");
});

test("both seed files route through the generic builder and keep the same menu query", () => {
  for (const file of ["prisma/seed-recipes-weight-loss-veg.ts", "prisma/patch-wl-veg.ts"]) {
    const src = read(file);
    assert.ok(
      src.includes("import { rebuildPlanSchedule } from '../lib/plan-schedule'"),
      `${file} must import the generic builder`,
    );
    assert.ok(src.includes("rebuildPlanSchedule(prisma, {"), `${file} must call the builder`);
    assert.ok(src.includes("days: 60,"), `${file} must build a 60-day schedule`);
    // The menu query is the plan-specific part and stays in the plan file.
    assert.ok(
      src.includes("planCategories: { has: 'weight_loss' }"),
      `${file} must keep the weight_loss menu query`,
    );
    assert.ok(
      src.includes("dietaryTags: { has: 'VEGETARIAN' }"),
      `${file} must keep the VEGETARIAN menu query`,
    );
    // No hardcoded rotation left: no direct slot writes, no modulo loop.
    assert.ok(!src.includes("planScheduleSlot.create"), `${file} must not write slots directly`);
    assert.ok(!src.includes("planScheduleSlot.deleteMany"), `${file} must not clear slots directly`);
    assert.ok(!src.includes("(day - 1) %"), `${file} must not keep the hardcoded rotation`);
  }
});
