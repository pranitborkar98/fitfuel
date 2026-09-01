import assert from "node:assert/strict";
import test from "node:test";

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
