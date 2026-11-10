import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { dishSlot, isAiImageSrc, SHOP_DISHES } from "@/app/_shop/catalog";

const read = (p: string) => readFileSync(resolve(p), "utf8");

import { computeRecalibration } from "@/lib/coach/recalibration";
import type { WeeklySummary } from "@/lib/coach/types";
import { DELIVERY_WINDOWS } from "@/lib/delivery-windows";
import { addDateOnlyDays, formatDateOnly, parseDateOnly, todayIndiaDate } from "@/lib/date-only";
import { hasCompletePlanSchedule } from "@/lib/plan-readiness";
import { cutoffInstantFor } from "@/lib/order-cutoff";
import { servingScaleForTarget } from "@/lib/portion-personalization";
import { buildCheckoutUrl, DURATIONS } from "@/lib/plan-tier-pricing";
import { decomposePrice } from "@/lib/pricing-decomposition";
import { TRAINER_OFFLINE, TRAINER_OPENER, TRAINER_SYSTEM } from "@/lib/ai-trainer/persona";
import { NUTRABAY_PRODUCTS } from "@/lib/nutrabay-products";
import { NUTRABAY_CATALOG, findNutrabaySnapshotProduct, safeNutrabayUrl } from "@/lib/nutrabay-catalog";
import { readWithDeadline } from "@/lib/read-with-deadline";
import { TRIAL, TRIAL_SUBTOTAL_RS, TRIAL_TOTAL_RS } from "@/lib/trial-price";
import {
  decryptSensitiveData,
  encryptSensitiveData,
  isSensitiveDataEncrypted,
} from "@/lib/sensitive-data-core";
import {
  isPlanServiceDate,
  planDateRange,
  remainingServiceDays,
  serviceDayNumber,
} from "@/lib/plan-service-dates";
import {
  CALORIE_CEILING_KCAL,
  CALORIE_FLOOR_KCAL,
  CALORIE_FLOOR_MALE_KCAL,
  DEFAULT_CALORIE_TARGET_KCAL,
  clampCalorieTarget,
  resolveCalorieTarget,
} from "@/lib/calorie-target";
import { MENU, MENU_FROM, MENU_STATS } from "@/lib/menu-alacarte";
import { DISHES, ENQUIRY_COUNT, isOrderable, ORDERABLE_COUNT, receipt, resolveLines } from "@/lib/menu-cart";
import { goalsPatchSchema } from "@/lib/validation/schemas";

test("the advertised trial total is the checkout total", () => {
  assert.equal(TRIAL_SUBTOTAL_RS, 400);
  assert.equal(TRIAL_TOTAL_RS, 420);
  assert.equal(TRIAL.baseRs + TRIAL.deliveryRs + TRIAL.packagingRs, TRIAL.subtotalRs);
  assert.equal(TRIAL.subtotalRs + TRIAL.gstRs, TRIAL.totalRs);
});

test("every physical price decomposition balances", () => {
  for (const duration of DURATIONS) {
    const price = decomposePrice({ subtotalRs: 20_000, duration: duration.key });
    assert.equal(price.baseRs + price.deliveryRs + price.packagingRs, price.subtotalRs);
    assert.equal(price.subtotalRs + price.gstRs, price.totalRs);
    assert.ok(price.baseRs > 0);
  }
});

test("vegan checkout stays vegan across the URL boundary", () => {
  const url = buildCheckoutUrl({
    dietaryVariant: "VEGAN",
    duration: "TRIAL_DAY",
    mealCombo: "ALL_FOUR",
    priceRs: 400,
    planSlug: "vegan-plan",
    planName: "Vegan plan",
  });
  const params = new URL(url, "https://fitfuel.in").searchParams;
  assert.equal(params.get("diet"), "vegan");
  assert.equal(params.get("planSlug"), "vegan-plan");
  assert.equal(params.get("price"), "400");
});

test("a kitchen plan is ready only with every scheduled meal slot", () => {
  const plan = { cycleLengthDays: 30, mealsPerDay: 4 };
  assert.equal(hasCompletePlanSchedule({ ...plan, scheduleCount: 119 }), false);
  assert.equal(hasCompletePlanSchedule({ ...plan, scheduleCount: 120 }), true);
  assert.equal(hasCompletePlanSchedule({ scheduleCount: 0, cycleLengthDays: 0, mealsPerDay: 4 }), false);
});

test("delivery windows match the operational contract", () => {
  assert.equal(DELIVERY_WINDOWS.MORNING.time, "7–10 AM");
  assert.equal(DELIVERY_WINDOWS.EVENING.time, "5–8 PM");
});

test("delivery changes close at 9pm India time on the previous evening", () => {
  const delivery = new Date("2026-09-03T00:00:00.000Z");
  assert.equal(cutoffInstantFor(delivery).toISOString(), "2026-09-02T15:30:00.000Z");
});

test("nutrition calendar days are strict and follow India time", () => {
  assert.equal(formatDateOnly(todayIndiaDate(new Date("2026-08-26T20:00:00.000Z"))), "2026-08-27");
  assert.equal(formatDateOnly(todayIndiaDate(new Date("2026-08-26T18:00:00.000Z"))), "2026-08-26");
  assert.equal(addDateOnlyDays("2026-08-31", 1), "2026-09-01");
  assert.equal(parseDateOnly("2026-02-29"), null);
  assert.equal(parseDateOnly("26-08-2026"), null);
});

test("plan date ranges are inclusive and never create a free extra day", () => {
  const start = new Date("2026-08-27T00:00:00.000Z");
  const trial = planDateRange(start, "TRIAL_DAY");
  const week = planDateRange(start, "WEEKLY");
  assert.equal(trial.startDate.toISOString(), trial.endDate.toISOString());
  assert.equal(remainingServiceDays(trial.startDate, trial.endDate, "TRIAL_DAY"), 1);
  assert.equal(remainingServiceDays(week.startDate, week.endDate, "WEEKLY"), 7);
});

test("Mon–Fri plans contain 22 weekday deliveries and keep menu days continuous", () => {
  const saturday = new Date("2026-08-29T00:00:00.000Z");
  const range = planDateRange(saturday, "MONTHLY_EXCL_WEEKENDS");
  assert.equal(range.startDate.toISOString().slice(0, 10), "2026-08-31");
  assert.equal(isPlanServiceDate("MONTHLY_EXCL_WEEKENDS", range.endDate), true);
  assert.equal(remainingServiceDays(range.startDate, range.endDate, "MONTHLY_EXCL_WEEKENDS"), 22);
  const nextMonday = new Date("2026-09-07T00:00:00.000Z");
  assert.equal(serviceDayNumber(range.startDate, nextMonday, 30, "MONTHLY_EXCL_WEEKENDS"), 6);
});

test("personal targets become measurable, bounded kitchen portions", () => {
  assert.deepEqual(servingScaleForTarget({ calorieTarget: null, planCalories: 2000 }), {
    factor: 1,
    requestedFactor: 1,
    clamped: false,
  });
  assert.equal(servingScaleForTarget({ calorieTarget: 1800, planCalories: 2000 }).factor, 0.9);
  assert.deepEqual(servingScaleForTarget({ calorieTarget: 1200, planCalories: 2000 }), {
    factor: 0.7,
    requestedFactor: 0.6,
    clamped: true,
  });
});

test("customer-facing coach copy never exposes infrastructure or em dashes", () => {
  const customerCopy = [TRAINER_SYSTEM, TRAINER_OPENER, TRAINER_OFFLINE].join("\n");
  assert.equal(customerCopy.includes("—"), false);
  assert.equal(/api\s*key|gemini|anthropic/i.test(TRAINER_OFFLINE), false);
});

test("curated Nutrabay products use unique tracked retailer links", () => {
  assert.ok(NUTRABAY_PRODUCTS.length > 0);
  assert.equal(
    new Set(NUTRABAY_PRODUCTS.map((product) => product.affiliateUrl)).size,
    NUTRABAY_PRODUCTS.length,
  );

  for (const product of NUTRABAY_PRODUCTS) {
    const url = new URL(product.affiliateUrl);
    assert.equal(url.protocol, "https:");
    assert.equal(url.hostname, "nutrabay.com");
    assert.equal(url.searchParams.get("ref"), "pranit1944");
    assert.ok(product.supplementSlug.length > 0);
    assert.ok(product.priceRs > 0);
  }
});

test("the repaired marketplace contains unique purchasable products, not image URLs", () => {
  assert.equal(NUTRABAY_CATALOG.length, 738);
  assert.equal(new Set(NUTRABAY_CATALOG.map((product) => product.retailerProductId)).size, 738);
  assert.equal(new Set(NUTRABAY_CATALOG.map((product) => product.slug)).size, 738);
  for (const product of NUTRABAY_CATALOG) {
    const destination = safeNutrabayUrl(product.affiliateUrl);
    assert.ok(destination, product.name);
    assert.equal(destination.searchParams.get("ref"), "pranit1944");
    assert.equal(destination.searchParams.get("pId"), product.retailerProductId);
    assert.ok(Number.isInteger(product.priceRs) && product.priceRs > 0);
    assert.equal(new URL(product.imageUrl).protocol, "https:");
    assert.equal(findNutrabaySnapshotProduct(`nby-${product.retailerProductId}`), product);
  }
});

test("marketplace redirects reject external hosts and unknown snapshot keys", () => {
  for (const url of [
    "https://nutrabay.com.evil.example/product",
    "https://evil.example/?next=nutrabay.com",
    "http://nutrabay.com/product",
    "https://user:password@nutrabay.com/product",
    "javascript:alert(1)",
  ]) assert.equal(safeNutrabayUrl(url), null);
  assert.equal(findNutrabaySnapshotProduct("nby-unknown"), null);
  assert.equal(findNutrabaySnapshotProduct("https://nutrabay.com/product"), null);
});

test("a stalled catalogue read yields to its fallback deadline", async () => {
  assert.equal(await readWithDeadline(Promise.resolve(738), 1_000), 738);
  await assert.rejects(readWithDeadline(new Promise<never>(() => {}), 1), /Read deadline exceeded/);
  await assert.rejects(readWithDeadline(Promise.reject(new Error("database unavailable")), 1_000), /database unavailable/);
});

const summary: WeeklySummary = {
  hasPlan: true,
  goal: "LOSE_WEIGHT",
  currentWeightKg: 78.1,
  targetWeightKg: 70,
  weightRateKgPerWeek: 0.1,
  weighInsInWindow: 4,
  calorieTarget: 2000,
  avgCaloriesIn: 1950,
  avgCaloriesOut: 200,
  avgNet: 1750,
  calorieDaysWithData: 7,
  proteinTarget: 120,
  avgProtein: 110,
  mealsLogged: 20,
  mealsScheduled: 28,
  workoutsCompleted: 3,
  streakDays: 5,
  daysActive: 7,
  consistencyScore: 78,
  consistencyLabel: "Good",
};

test("coach waits for a trend and caps a single change", () => {
  const insufficient = computeRecalibration({ ...summary, weighInsInWindow: 1 });
  assert.equal(insufficient.status, "insufficient_data");
  assert.equal(insufficient.canApply, false);

  const recommendation = computeRecalibration(summary);
  assert.equal(recommendation.deltaKcal, -300);
  assert.equal(recommendation.recommendedTarget, 1700);
  assert.equal(Math.abs(recommendation.deltaKcal) <= 300, true);
  assert.equal(Math.abs(recommendation.deltaKcal) % 10, 0);
});

test("recalibration never recommends below the sex-aware floor", () => {
  // Same stalled-loss trend, target 1600: the uncapped recommendation is
  // 1300. A male user floors at 1500; female or unknown sex at 1200, so
  // the 1300 recommendation stands for them.
  const male = computeRecalibration({ ...summary, calorieTarget: 1600, gender: "MALE" });
  assert.equal(male.recommendedTarget, 1500);
  assert.equal(male.deltaKcal, -100);
  assert.equal(male.canApply, true);

  const female = computeRecalibration({ ...summary, calorieTarget: 1600, gender: "FEMALE" });
  assert.equal(female.recommendedTarget, 1300);
  assert.equal(female.deltaKcal, -300);

  const unknown = computeRecalibration({ ...summary, calorieTarget: 1600 });
  assert.equal(unknown.recommendedTarget, 1300);
});

test("partner payout details are authenticated-encrypted and tamper evident", () => {
  const previous = process.env.PARTNER_DATA_ENCRYPTION_KEY;
  process.env.PARTNER_DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  try {
    const encrypted = encryptSensitiveData("ABCDE1234F");
    assert.equal(isSensitiveDataEncrypted(encrypted), true);
    assert.equal(encrypted.includes("ABCDE1234F"), false);
    assert.equal(decryptSensitiveData(encrypted), "ABCDE1234F");

    const parts = encrypted.split(".");
    const tag = parts[1];
    assert.ok(tag);
    parts[1] = `${tag.startsWith("A") ? "B" : "A"}${tag.slice(1)}`;
    assert.throws(() => decryptSensitiveData(parts.join(".")));
  } finally {
    if (previous === undefined) delete process.env.PARTNER_DATA_ENCRYPTION_KEY;
    else process.env.PARTNER_DATA_ENCRYPTION_KEY = previous;
  }
});

test("nutrition goals reject a starvation-level calorie target", () => {
  assert.equal(goalsPatchSchema.safeParse({ calories: 0 }).success, false);
  assert.equal(goalsPatchSchema.safeParse({ calories: 1199 }).success, false);
  assert.equal(goalsPatchSchema.safeParse({ calories: 1200 }).success, true);
  assert.equal(goalsPatchSchema.safeParse({ calories: 20_000 }).success, true);
  assert.equal(goalsPatchSchema.safeParse({ calories: 20_001 }).success, false);
  const rejected = goalsPatchSchema.safeParse({ calories: 0 });
  assert.equal(rejected.success, false);
  if (!rejected.success) {
    assert.match(rejected.error.issues[0].message, /1200/);
  }
});

test("nutrition goals keep their existing macro bounds (no new macro rules)", () => {
  assert.equal(goalsPatchSchema.safeParse({ protein: 0 }).success, true);
  assert.equal(goalsPatchSchema.safeParse({ protein: 2000 }).success, true);
  assert.equal(goalsPatchSchema.safeParse({ protein: 2001 }).success, false);
  assert.equal(goalsPatchSchema.safeParse({ carbs: 5000 }).success, true);
  assert.equal(goalsPatchSchema.safeParse({ fat: 2000 }).success, true);
  assert.equal(goalsPatchSchema.safeParse({ fiber: 500 }).success, true);
  assert.equal(goalsPatchSchema.safeParse({ waterMl: 50_000 }).success, true);
  assert.equal(goalsPatchSchema.safeParse({ waterMl: 50_001 }).success, false);
});

test("calorie target resolves in one documented precedence", () => {
  const all = {
    profileCalorieTarget: 2100,
    activePlanCalorieTarget: 1800,
    nutritionGoalCalories: 1700,
    planAvgCaloriesPerDay: 1600,
  };
  // The stored NutritionGoal wins: it is the user's explicit latest choice,
  // set deliberately in the goals dialog.
  assert.deepEqual(resolveCalorieTarget(all), { calories: 1700, source: "nutrition_goal" });
  assert.deepEqual(
    resolveCalorieTarget({ ...all, nutritionGoalCalories: null }),
    { calories: 2100, source: "profile" },
  );
  assert.deepEqual(
    resolveCalorieTarget({ ...all, nutritionGoalCalories: null, profileCalorieTarget: null }),
    { calories: 1800, source: "active_plan" },
  );
  assert.deepEqual(
    resolveCalorieTarget({
      ...all,
      nutritionGoalCalories: null,
      profileCalorieTarget: null,
      activePlanCalorieTarget: null,
    }),
    { calories: 1600, source: "plan_average" },
  );
  assert.deepEqual(resolveCalorieTarget({}), {
    calories: DEFAULT_CALORIE_TARGET_KCAL,
    source: "default",
  });
  assert.equal(DEFAULT_CALORIE_TARGET_KCAL, 2000);
});

test("calorie target treats zero and missing values as absent, and floors stored values", () => {
  assert.deepEqual(
    resolveCalorieTarget({
      profileCalorieTarget: 0,
      activePlanCalorieTarget: 0,
      nutritionGoalCalories: null,
      planAvgCaloriesPerDay: 1800,
    }),
    { calories: 1800, source: "plan_average" },
  );
  // A target stored below the floor before the guard existed still resolves
  // to the floor, and the source is still reported honestly.
  assert.deepEqual(resolveCalorieTarget({ profileCalorieTarget: 800 }), {
    calories: 1200,
    source: "profile",
  });
  assert.equal(CALORIE_FLOOR_KCAL, 1200);
  assert.equal(clampCalorieTarget(0), CALORIE_FLOOR_KCAL);
  assert.equal(clampCalorieTarget(25_000), CALORIE_CEILING_KCAL);
});

test("calorie target floor is sex-aware: 1500 for male/other, 1200 otherwise", () => {
  assert.equal(CALORIE_FLOOR_MALE_KCAL, 1500);
  // Male 1400 clamps up to 1500; female 1100 clamps up to 1200.
  assert.deepEqual(resolveCalorieTarget({ profileCalorieTarget: 1400, sex: "MALE" }), {
    calories: 1500,
    source: "profile",
  });
  assert.deepEqual(resolveCalorieTarget({ profileCalorieTarget: 1400, sex: "OTHER" }), {
    calories: 1500,
    source: "profile",
  });
  assert.deepEqual(resolveCalorieTarget({ nutritionGoalCalories: 1100, sex: "FEMALE" }), {
    calories: 1200,
    source: "nutrition_goal",
  });
  // Unknown or absent sex keeps the old 1200 floor.
  assert.deepEqual(resolveCalorieTarget({ nutritionGoalCalories: 1100 }), {
    calories: 1200,
    source: "nutrition_goal",
  });
  assert.deepEqual(resolveCalorieTarget({ nutritionGoalCalories: 1100, sex: null }), {
    calories: 1200,
    source: "nutrition_goal",
  });
  assert.equal(clampCalorieTarget(1400, "MALE"), 1500);
  assert.equal(clampCalorieTarget(1400, "FEMALE"), 1400);
  assert.equal(clampCalorieTarget(1400), 1400);
});

test("a provisional dish is never orderable at its placeholder price", () => {
  // 32 of 48 rows still carry the Rs 100 placeholder. None of them may enter
  // a basket, a total, or a checkout, at any step of the customer path.
  assert.equal(MENU_STATS.items, 48);
  assert.equal(MENU_STATS.provisional, 32);
  assert.equal(MENU_STATS.priced, 16);
  assert.equal(ORDERABLE_COUNT, 16);
  assert.equal(ENQUIRY_COUNT, 32);
  for (const d of DISHES) {
    assert.equal(isOrderable(d), !d.provisional && d.price != null, d.name);
    if (d.provisional) assert.equal(d.price, 100, d.name);
  }
  // The "from Rs X" headline never reads off the placeholder: the cheapest
  // kitchen-set price today is Rs 200, so the floor must be that, not 100.
  assert.equal(MENU_FROM, 200);
});

test("a stored provisional line drops out of the basket instead of pricing", () => {
  const provisional = DISHES.find((d) => d.provisional)!;
  const priced = DISHES.find((d) => isOrderable(d))!;
  // A stale localStorage entry, or a hand-built request, naming a provisional
  // dish at any quantity resolves to nothing: it never reaches a total.
  assert.deepEqual(resolveLines([{ id: provisional.id, qty: 2 }]), []);
  assert.deepEqual(resolveLines([{ id: "no-such-dish", qty: 1 }]), []);
  const kept = resolveLines([
    { id: provisional.id, qty: 2 },
    { id: priced.id, qty: 1 },
  ]);
  assert.equal(kept.length, 1);
  assert.equal(kept[0].id, priced.id);
  assert.equal(kept[0].unitRs, priced.price);
  // An enquiry-only basket charges nothing: no food, no delivery, no
  // packaging, no GST. The receipt of zero lines is zero throughout.
  assert.deepEqual(receipt([]), {
    subtotalRs: 0,
    deliveryRs: 0,
    packagingRs: 0,
    gstRs: 0,
    totalRs: 0,
  });
});

// ── Conversion restructure: menu track (2026-11-10) ────────────────────────
// The homepage menu defaults to the 16 priced dishes, the 32 unpriced ones
// sit under "Coming soon", and the dish card carries photo, name, kcal,
// protein, price and Add — nothing else.

test("menu dish names carry no medical claims", () => {
  // The renames, at the source of truth.
  const names = MENU.flatMap((c) => c.items.map((i) => i.name));
  assert.ok(names.includes("Ajwain, lemon and honey, served warm"));
  assert.ok(names.includes("Carrot and orange juice with ginger, turmeric and chia"));
  assert.ok(names.includes("Sprouted moong bowl"));
  assert.ok(names.includes("Spinach, cucumber and green apple juice"));
  assert.ok(names.includes("Cucumber, green apple and mint cooler"));
  // The category renamed with them.
  assert.equal(MENU.find((c) => c.key === "juices")?.label, "Cold-pressed juices");
  // No dish or category name left making a health claim.
  const labels = [...names, ...MENU.map((c) => c.label)];
  for (const label of labels) {
    assert.doesNotMatch(label, /detox/i, label);
    assert.doesNotMatch(label, /period pain/i, label);
    assert.doesNotMatch(label, /reliever/i, label);
    assert.doesNotMatch(label, /magic juice for eyes/i, label);
  }
});

test("every dish id resolves a kitchen macro estimate", () => {
  // MACROS is keyed by the derived dish id, so renaming a dish without
  // moving its row silently zeroes its kcal and protein. Pin the join.
  const src = read("app/_shop/catalog.ts");
  const rows = [...src.matchAll(/^  "([^"]+)": \[(\d+), (\d+), (\d+), (\d+)\],$/gm)];
  assert.equal(rows.length, 48);
  for (const [, id, kcal] of rows) assert.ok(Number(kcal) > 0, id);
  for (const d of DISHES) {
    assert.ok(
      rows.some(([, id]) => id === d.id),
      `no macro row for ${d.id}`,
    );
  }
});

test("homepage dish cards are slim and priced-first", () => {
  const app = read("app/_web/FitFuelApp.tsx");
  // Removed from the card: the per-card estimate label, the per-gram price
  // and the "Price on request" price slot.
  assert.doesNotMatch(app, /Macros estimated from the recipe/);
  assert.doesNotMatch(app, /per gram of protein/);
  assert.doesNotMatch(app, /Price on request/);
  // The donut still exists for plan cards, exactly once — not on dish cards.
  assert.equal(app.match(/<MacroSplit/g)?.length, 1);
  // What the card keeps: one kcal and protein line, and "Coming soon" for
  // the unpriced slot.
  assert.match(app, /g protein/);
  assert.match(app, /<span className=\{s\.askPrice\}>Coming soon<\/span>/);
  // The menu defaults to priced dishes, with the rest under one heading.
  assert.match(app, /d\.category === c\.key && d\.orderable/);
  assert.match(app, /const comingSoon = results\.filter\(\(d\) => !d\.orderable\)/);
  assert.match(app, /<b>Coming soon<\/b>/);
  // Six render per course, the rest on "Show all".
  assert.match(app, /list\.slice\(0, 6\)/);
  assert.match(app, /comingSoon\.slice\(0, 6\)/);
  // One macro footnote for the whole menu, worded from the estimate rule.
  assert.match(app, /Calorie and protein figures are kitchen estimates/);
  assert.match(app, /not weighed per portion/);
});

test("the photo-less wells keep their placeholder sentence", () => {
  // Item 4 (clean no-image cards) was CANCELLED by chintu's decision: the
  // wells stay exactly as they are until the image track wires AI food-image
  // placeholders in. The sentence is the fallback for a slot with no image,
  // not a card feature, and the AI-illustration label belongs to that track.
  assert.match(read("app/_web/FitFuelApp.tsx"), /Photo added with final kitchen listing/);
  assert.match(read("app/_hp/DishImage.tsx"), /Photo added with final kitchen listing/);
  assert.match(read("app/menu/MenuCatalog.tsx"), /Photo added with final kitchen listing/);
});

test("homepage images are capped below 3840px", () => {
  const config = read("next.config.ts");
  assert.match(config, /deviceSizes: \[640, 750, 828, 1080, 1200, 1920\]/);
  assert.doesNotMatch(config, /3840/);
  // The CSS-only caps survive: phone 2, tablet 4 per course.
  const css = read("app/_web/app.module.css");
  assert.match(css, /\.courseGroup:not\(\.courseOpen\) > li:nth-child\(n \+ 4\)/);
  assert.match(css, /\.courseGroup:not\(\.courseOpen\) > li:nth-child\(n \+ 6\)/);
  assert.match(css, /\.courseMoreDesktop/);
});
/* ── Dish and hero image coverage (conv-images) ───────────────────────────
   The 48 dishes resolve to files on disk, not to a labelled well: a dish
   with no file renders "Photo added with final kitchen listing", and after
   the AI placeholder set landed there must be none left. The check reads
   the same lookup order DishImage uses, real photography first, then the
   ai/ tree, so a real photograph dropped in later keeps the test green.
   Paths resolve from this file, never from process.cwd(), so the suite
   passes however the runner is invoked. */

const publicDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

const hasDishImage = (name: string): boolean => {
  const slot = dishSlot(name);
  return [".jpg", ".jpeg", ".png", ".webp"].some(
    (ext) =>
      existsSync(join(publicDir, "images", "dishes", `${slot}${ext}`)) ||
      existsSync(join(publicDir, "images", "ai", "dishes", `${slot}${ext}`)),
  );
};

test("every dish on the menu has an image file, so no card renders the labelled well", () => {
  assert.equal(SHOP_DISHES.length, 48);
  assert.deepEqual(
    SHOP_DISHES.filter((d) => !hasDishImage(d.name)).map((d) => d.name),
    [],
  );
});

test("the hero trial-day spread exists in the ai/ tree for the restructured hero", () => {
  assert.equal(
    existsSync(join(publicDir, "images", "ai", "hero", "hero-week-spread.webp")),
    true,
  );
});

test("the AI-illustration flag follows the public path, not a data field", () => {
  assert.equal(isAiImageSrc("/images/ai/dishes/pineapple-cucumber-salad.webp"), true);
  assert.equal(isAiImageSrc("/images/dishes/pineapple-cucumber-salad.jpg"), false);
  assert.equal(isAiImageSrc(undefined), false);
  assert.equal(isAiImageSrc(null), false);

});
