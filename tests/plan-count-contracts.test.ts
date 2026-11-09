import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (p: string) => readFileSync(resolve(p), "utf8");

// The counters are only ever imported dynamically below, but lib/prisma
// throws at import time without DATABASE_URL — so the dummy URL is set
// here, at module scope, before any of it loads. It points at a closed
// port (nothing can ever listen on port 1), so the queries in the
// soft-fail test must fail fast and return null.
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:1/fitfuel";

// --- Seed-file truth, counted here rather than trusted from a comment. ---
// prisma/seed-meal-plans.ts: 119 rows, 3 categories. Its old header claimed
// "113 variants across 8 categories" — wrong on both counts. If the seed
// gains or loses a row, these tests fail on purpose: the header, the
// reconciliation in lib/plan-counts.ts, and the manifest all have to be
// re-counted together, not silently drifted.

function seedMealPlans() {
  const src = read("prisma/seed-meal-plans.ts");
  const slugs = [...src.matchAll(/^\s+slug:\s*'([^']+)'/gm)].map((m) => m[1]);
  const categories = [...src.matchAll(/^\s+category:\s*PlanCategory\.([A-Z_]+)/gm)].map((m) => m[1]);
  const tiers = [...src.matchAll(/^\s+tier:\s*PlanTier\.([A-Z_]+)/gm)].map((m) => m[1]);
  return { src, slugs, categories, tiers };
}

test("seed-meal-plans.ts holds 119 plans in 3 categories, all STANDARD tier, all inactive at seed", () => {
  const { src, slugs, categories, tiers } = seedMealPlans();
  assert.equal(slugs.length, 119);
  assert.equal(new Set(slugs).size, 119);
  const byCategory: Record<string, number> = {};
  for (const c of categories) byCategory[c] = (byCategory[c] ?? 0) + 1;
  assert.deepEqual(byCategory, { STANDARD: 27, LIFESTYLE_MEDICAL: 70, SPORTS: 22 });
  assert.ok(tiers.length === 119 && tiers.every((t) => t === "STANDARD"));
  // 119 plan-level `isActive: false`; the only `isActive: true` in the file
  // belongs to PlanPrice upserts, not to MealPlan rows.
  assert.equal((src.match(/^\s+isActive: false,/gm) ?? []).length, 119);
  assert.equal((src.match(/isActive:\s*true/g) ?? []).length, 2);
  // 58 distinct subCategories (concepts) in this file alone.
  const subs = new Set([...src.matchAll(/^\s+subCategory:\s*'([^']+)'/gm)].map((m) => m[1]));
  assert.equal(subs.size, 58);
  // The header states the counted numbers, not the old claim.
  assert.match(src.split("\n")[2], /119 plans across 3 categories/);
});

test("the two seeds reconcile to 126 rows and 59 concepts — that is where 126 came from", () => {
  const { slugs: seedSlugs } = seedMealPlans();
  const seedTs = read("prisma/seed.ts");
  const block = seedTs.match(/const MEAL_PLANS: MealPlanSeed\[\] = \[([\s\S]*?)\n\]/)?.[1] ?? "";
  const otherSlugs = [...block.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
  // NOTE: the review and the brief both said 16 here; counted, it is 15.
  assert.equal(otherSlugs.length, 15);
  const overlap = otherSlugs.filter((s) => seedSlugs.includes(s));
  const added = otherSlugs.filter((s) => !seedSlugs.includes(s));
  assert.equal(overlap.length, 8);
  assert.deepEqual(added.sort(), [
    "balanced-diet-egg",
    "balanced-diet-jain",
    "balanced-diet-non-veg",
    "balanced-diet-veg",
    "balanced-diet-vegan",
    "muscle-gain-vegan",
    "weight-loss-vegan",
  ]);
  assert.equal(new Set([...seedSlugs, ...otherSlugs]).size, 126);
  // seed.ts adds exactly one new subCategory ('balanced'): 58 + 1 = 59.
  const subs = new Set([...seedMealPlans().src.matchAll(/^\s+subCategory:\s*'([^']+)'/gm)].map((m) => m[1]));
  const otherSubs = new Set([...block.matchAll(/subCategory:\s*'([^']+)'/g)].map((m) => m[1]));
  assert.equal(new Set([...subs, ...otherSubs]).size, 59);
  // seed.ts activates only weight-loss-veg (in the upsert after the array);
  // seed-meal-plans.ts upserts the
  // whole row (isActive: false), so whichever seed ran last decides whether
  // that one plan is live. The live count comes from the DB, not from here.
  assert.match(seedTs, /isActive:\s*p\.slug === 'weight-loss-veg'/);
});

// --- The /plans metadata description: never "0 plan concepts". ---

test("plans metadata states a count only when active plans exist", async () => {
  const { plansMetadataDescription } = await import("../lib/plan-counts");
  assert.match(plansMetadataDescription(3), /explore 3 plan concepts\./);
  assert.match(plansMetadataDescription(1), /explore 1 plan concept\./);
  assert.match(plansMetadataDescription(0), /explore plan concepts\./);
  assert.doesNotMatch(plansMetadataDescription(0), /0 plan/);
  assert.match(plansMetadataDescription(null), /explore plan concepts\./);
  assert.doesNotMatch(plansMetadataDescription(null), /\d+ plan/);
});

// --- The counters fail soft when the database cannot be reached. ---

test("plan counters return null instead of throwing when the database is unreachable", async () => {
  const { countPlans, countActiveOrderablePlans } = await import("../lib/plan-counts");
  assert.equal(await countPlans(), null);
  assert.equal(await countActiveOrderablePlans(), null);
});

// --- No hardcoded 126 / 113 remains on a live surface. ---
// Live surfaces are the files a customer can reach (homepage, /plans, plan
// detail, metadata, and the modules they import). Dead files are NOT in
// this list on purpose: app/_hp/*, app/_hp/v2/*, app/_web/Behind.tsx,
// app/_web/HomeBands.tsx, app/_shop/Shop.tsx and app/_shop/Chrome.tsx
// held "126" and were deleted by the dead-code cleanup (piece 4), so they
// no longer exist to check. app/menu/[dish]/page.tsx is excluded too: its
// "126" counts RecipeStep rows, not plans.

const LIVE_SURFACES_WITHOUT_ANY_126_OR_113 = [
  "app/plans/page.tsx",
  "app/_web/FitFuelApp.tsx",
  "app/_web/HomeSections.tsx",
  "app/_web/YourNumbers.tsx",
  "app/_web/home-data.ts",
  "app/_hp/menu-data.ts",
  "app/_shop/PlanSheet.tsx",
  "lib/ai-trainer/persona.ts",
  "lib/menu-alacarte.ts",
  "lib/meal-plans-data.ts",
  "prisma/schema.prisma",
];

test("no live surface states a hardcoded 126 or 113 plan total", () => {
  for (const file of LIVE_SURFACES_WITHOUT_ANY_126_OR_113) {
    const src = read(file);
    assert.ok(!src.includes("126"), `${file} still contains 126`);
    assert.ok(!src.includes("113"), `${file} still contains 113`);
  }
});

test("homepage and plan-counts module carry no hardcoded fallback number", () => {
  // app/page.tsx documents where "126" came from in a comment, so it is
  // checked for live claims (a fallback literal, a rendered count) rather
  // than for the digits themselves.
  const page = read("app/page.tsx");
  assert.ok(!page.includes("|| 126"), "homepage still falls back to 126");
  assert.ok(!page.includes("?? 126"), "homepage still falls back to 126");
  assert.match(page, /countPlans\(\)/);
  assert.match(page, /planCount=\{counts\?\.concepts \?\? null\}/);
  const counts = read("lib/plan-counts.ts");
  assert.ok(!counts.includes("|| 126"), "plan-counts still falls back to 126");
  assert.ok(!counts.includes("?? 126"), "plan-counts still falls back to 126");
  assert.ok(!counts.includes("|| 113"), "plan-counts still falls back to 113");
});

test("/plans metadata reads through the source of truth", () => {
  const src = read("app/plans/page.tsx");
  assert.match(src, /countActiveOrderablePlans\(\)/);
  assert.match(src, /plansMetadataDescription\(n\)/);
  assert.doesNotMatch(src, /explore \$\{n\} plan concepts/);
  assert.match(src, /ORDERABLE_PLAN_CATEGORIES/);
  assert.doesNotMatch(src, /const ORDERABLE =/);
});

test("catalog.ts holds no hardcoded 126 at all", () => {
  // Piece 4 deleted AISLES and FOOTER_COLS (the two annotated dead-only
  // 126s) and relabelled the live PLAN_CATS heading from "All 126" to
  // "All plans", matching the filter chip text. No 126 literal may return.
  const src = read("app/_shop/catalog.ts");
  assert.ok(!src.includes("126"), "catalog.ts still contains 126");
  assert.ok(!src.includes("113"), "catalog.ts still contains 113");
  assert.match(src, /\{ key: "all", label: "All plans" \}/);
});
