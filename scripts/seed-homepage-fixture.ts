// scripts/seed-homepage-fixture.ts
//
// HOME PAGE FIXTURE — seeds ONLY what the homepage needs, then proves it.
//
// Run:  npx tsx scripts/seed-homepage-fixture.ts
// Idempotent: every seed it calls is safe to re-run (upserts / skips).
//
// v1's renders proved the failure mode: an empty local DB turns the hero
// mosaic, the proof line, the retail band and the comparison into voids, so
// the design was never verified as the visitor sees it. This script is a
// MERGE BLOCKER: no render check counts until its assertion report is all
// PASS.
//
// It reuses the repo's own seeds rather than duplicating them, in order:
//   prisma/seed.ts                      126 MealPlan rows + price matrix
//   prisma/seed-recipes-weight-loss-veg 30 recipes + 120 day slots (day 1 = trial day)
//   prisma/seed-plan-prices.ts          PlanPrice matrix rows
//   prisma/seed-phase14.ts              3 featured Testimonial rows (in-repo copy)
//   prisma/seed-supplements.ts          46 Supplement evidence rows
//   prisma/seed-nutrabay-links.ts       Nutrabay SupplementLink rows + prices
//   prisma/seed-nutrabay-catalog.ts     Nutrabay marketplace snapshot
//
// The fixture NEVER invents a dish name, a price, a quote or a macro number.
// Day-1 totals are computed from getDayOne() and asserted, never hardcoded
// into a component. If a seed sum differs from the asserted value, the script
// FAILS and the seed is investigated — the component always renders the
// computed sum.
//
// Requires DATABASE_URL (via .env, loaded by dotenv/config in the seeds and
// by lib/prisma here). Exits non-zero if any assertion fails.

import "dotenv/config";

import { execFileSync } from "node:child_process";
import type { MealsPerDay, PlanDuration } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { TRIAL } from "../lib/trial-price";
import { getDayOne } from "../app/_hp/menu-data";
import { SHOP_DISHES } from "../app/_shop/catalog";
import { buildWeightSeries, STALL_DAY, EXAMPLE_WEIGHT_KG } from "../app/_web/homepage-v2-data";

const SEEDS = [
  "prisma/seed.ts",
  "prisma/seed-recipes-weight-loss-veg.ts",
  "prisma/seed-plan-prices.ts",
  "prisma/seed-phase14.ts",
  "prisma/seed-supplements.ts",
  "prisma/seed-nutrabay-links.ts",
  "prisma/seed-nutrabay-catalog.ts",
];

type Check = { name: string; expected: string; actual: string; pass: boolean };
const checks: Check[] = [];

function check(name: string, expected: string, actual: string, pass: boolean) {
  checks.push({ name, expected, actual, pass });
  console.log(`${pass ? "  PASS " : "  FAIL "} ${name} — expected ${expected}, got ${actual}`);
}

function runSeeds() {
  for (const seed of SEEDS) {
    console.log(`\n── seed: ${seed} ──`);
    execFileSync("npx", ["tsx", seed], { stdio: "inherit", cwd: process.cwd() });
  }
}

async function assertAll() {
  console.log("\n── assertions ──");

  // 1. MealPlan rows: 126.
  const planCount = await prisma.mealPlan.count();
  check("MealPlan rows", "126", String(planCount), planCount === 126);

  // 2. Plan concepts (distinct subCategory): 59.
  const concepts = await prisma.mealPlan.groupBy({ by: ["subCategory"] });
  check("Plan concepts", "59", String(concepts.length), concepts.length === 59);

  // 3. Condition plans: 70.
  const conditionPlans = await prisma.mealPlan.count({
    where: { category: "LIFESTYLE_MEDICAL" },
  });
  check("Condition plans", "70", String(conditionPlans), conditionPlans === 70);

  // 4. Day-1 trial meals from getDayOne(): 4 rows, in eating order.
  const dayOne = await getDayOne();
  const slots = dayOne.map((d) => d.slot).join(",");
  check(
    "Day-1 trial meals",
    "4 rows BREAKFAST,LUNCH,SNACK,DINNER",
    `${dayOne.length} rows ${slots}`,
    dayOne.length === 4 && slots === "BREAKFAST,LUNCH,SNACK,DINNER",
  );

  // 5. Day-1 names, matched by substring on recipe.name.
  const expectedNames: Record<string, string> = {
    BREAKFAST: "Moong Dal Chilla",
    LUNCH: "Chettinad Cauliflower Steak",
    SNACK: "Makhana Chaat",
    DINNER: "Palak Paneer",
  };
  for (const dish of dayOne) {
    const want = expectedNames[dish.slot];
    check(
      `Day-1 ${dish.slot} name contains "${want}"`,
      want,
      dish.name,
      dish.name.includes(want),
    );
  }

  // 6. Day-1 totals, COMPUTED from getDayOne() — never typed into a component.
  const sums = {
    kcal: dayOne.reduce((n, d) => n + (d.kcal ?? 0), 0),
    protein: dayOne.reduce((n, d) => n + (d.protein ?? 0), 0),
    carbs: dayOne.reduce((n, d) => n + (d.carbs ?? 0), 0),
    fat: dayOne.reduce((n, d) => n + (d.fat ?? 0), 0),
  };
  console.log(
    `       computed day-1 sums: ${sums.kcal} kcal · ${sums.protein}g protein · ${sums.carbs}g carbs · ${sums.fat}g fat`,
  );
  check("Day-1 kcal sum", "1859", String(sums.kcal), sums.kcal === 1859);
  const breakfast = dayOne.find((d) => d.slot === "BREAKFAST");
  check(
    "Breakfast 462 kcal · 32g protein",
    "462 kcal · 32g",
    `${breakfast?.kcal ?? "?"} kcal · ${breakfast?.protein ?? "?"}g`,
    breakfast?.kcal === 462 && breakfast?.protein === 32,
  );

  // 7. Trial receipt: 300 + 50 + 50 + 20 = 420.
  const receiptSum = TRIAL.baseRs + TRIAL.deliveryRs + TRIAL.packagingRs + TRIAL.gstRs;
  check(
    "Trial receipt",
    "300 + 50 + 50 + 20 = 420",
    `${TRIAL.baseRs} + ${TRIAL.deliveryRs} + ${TRIAL.packagingRs} + ${TRIAL.gstRs} = ${receiptSum}`,
    receiptSum === 420 && TRIAL.totalRs === 420,
  );

  // 8. Featured testimonials: 3 rows, from seed-phase14 (the in-repo copy).
  const featured = await prisma.testimonial.count({
    where: { isActive: true, isFeatured: true },
  });
  check("Featured testimonials", "3", String(featured), featured === 3);

  // 9. Retail products: the 4 showcase slugs, first link price + Nutrabay image.
  const expectedPrices: Record<string, number> = {
    "whey-protein": 3429,
    creatine: 379,
    omega3: 799,
    magnesium: 349,
  };
  for (const [slug, price] of Object.entries(expectedPrices)) {
    const supp = await prisma.supplement.findUnique({
      where: { slug },
      select: {
        imageUrl: true,
        links: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { priceRs: "asc" }],
          select: { priceRs: true },
          take: 1,
        },
      },
    });
    const firstPrice = supp?.links[0]?.priceRs ?? null;
    check(
      `Retail ${slug} first-link price`,
      `₹${price}`,
      firstPrice === null ? "no link" : `₹${firstPrice}`,
      firstPrice === price,
    );
    check(
      `Retail ${slug} image under Nutrabay folder`,
      "/images/supplements/nutrabay/",
      supp?.imageUrl ?? "no image",
      (supp?.imageUrl ?? "").startsWith("/images/supplements/nutrabay/"),
    );
  }

  // 10. PlanPrice matrix: the builder's default cell + the other lengths.
  const priceCells: [string, string][] = [
    ["ONE_MONTH", "BREAKFAST_LUNCH"],
    ["WEEKLY", "BREAKFAST_LUNCH"],
    ["BI_WEEKLY", "BREAKFAST_LUNCH"],
    ["TWO_MONTH", "BREAKFAST_LUNCH"],
  ];
  for (const [duration, meals] of priceCells) {
    const row = await prisma.planPrice.findFirst({
      where: { diet: "VEGETARIAN", duration: duration as PlanDuration, mealsPerDay: meals as MealsPerDay, isActive: true },
      select: { priceRs: true },
    });
    check(
      `PlanPrice VEGETARIAN ${duration} ${meals}`,
      "a row with priceRs > 0",
      row ? `₹${row.priceRs}` : "missing",
      !!row && row.priceRs > 0,
    );
  }

  // 11. Dish catalog (code, not DB): 48 dishes, 16 priced.
  const priced = SHOP_DISHES.filter((d) => d.orderable).length;
  check("Dish catalog", "48 dishes", `${SHOP_DISHES.length} dishes`, SHOP_DISHES.length === 48);
  check("Priced dishes", "16 priced", `${priced} priced`, priced === 16);

  // 12. Weight series (pure): 31 points, 80.1 → 78.2, stall anchor at STALL_DAY.
  const series = buildWeightSeries();
  check("Weight series length", "31 points", `${series.length} points`, series.length === 31);
  check("Weight series start", "80.1 kg", `${series[0]?.kg} kg`, series[0]?.kg === 80.1);
  check("Weight series end", "78.2 kg", `${series[series.length - 1]?.kg} kg`, series[series.length - 1]?.kg === EXAMPLE_WEIGHT_KG);
  const stall = series.find((p) => p.day === STALL_DAY);
  check("Weight series stall anchor", "78.0 kg at day -10", `${stall?.kg} kg`, stall?.kg === 78.0);
}

async function main() {
  runSeeds();
  await assertAll();
  const failed = checks.filter((c) => !c.pass);
  console.log(
    `\nFixture: ${checks.length - failed.length}/${checks.length} assertions passed.`,
  );
  if (failed.length > 0) {
    console.log("Failing assertions:");
    for (const f of failed) console.log(`  - ${f.name}`);
    process.exitCode = 1;
  } else {
    console.log("All fixture assertions PASS. The homepage can now be verified against real data.");
  }
}

main()
  .catch((e) => {
    console.error("Fixture failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
