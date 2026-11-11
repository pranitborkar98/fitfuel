import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";

import { TRIAL, TRIAL_TOTAL_RS } from "@/lib/trial-price";
import { SHOP_DISHES } from "@/app/_shop/catalog";
import { COACH_WEEKS } from "@/app/_web/home-data";
import {
  BODY_METRICS_18,
  COACH_CHAT,
  GOAL_BOXES,
  HERO_METRICS_6,
  STALL_DAY,
  TRAINING_SESSION,
  buildWeightSeries,
  coachWeekSeries,
  dayTotals,
  macroShares,
  proofLine,
} from "@/app/_web/homepage-v2-data";
import { SAMPLE_DAY } from "@/app/dashboard-preview/sample-data";

/* ── Trial receipt (§4) ───────────────────────────────────────────────────── */
test("v2: trial receipt still decomposes to ₹420", () => {
  assert.equal(TRIAL.baseRs, 300);
  assert.equal(TRIAL.deliveryRs, 50);
  assert.equal(TRIAL.packagingRs, 50);
  assert.equal(TRIAL.gstRs, 20);
  assert.equal(
    TRIAL.baseRs + TRIAL.deliveryRs + TRIAL.packagingRs + TRIAL.gstRs,
    420,
  );
  assert.equal(TRIAL_TOTAL_RS, 420);
});

/* ── Day-one sums are computed, never hardcoded (§6.2) ──────────────────── */
/* Values below are ILLUSTRATIVE test inputs for the summing logic only — they
   are not the seeded recipe values. The real day-1 numbers (1,859 kcal,
   breakfast 462 kcal · 32g protein) are asserted by scripts/seed-homepage-
   fixture.ts against the live database. */
const DAY_ONE_SHAPE = [
  { day: 1, slot: "BREAKFAST", name: "Moong Dal Chilla", blurb: null, cuisine: null, kcal: 462, protein: 32, carbs: 55, fat: 12, fibre: null },
  { day: 1, slot: "LUNCH", name: "Chettinad Cauliflower Steak", blurb: null, cuisine: null, kcal: 580, protein: 26, carbs: 74, fat: 20, fibre: null },
  { day: 1, slot: "SNACK", name: "Makhana Chaat", blurb: null, cuisine: null, kcal: 300, protein: 12, carbs: 44, fat: 8, fibre: null },
  { day: 1, slot: "DINNER", name: "Palak Paneer", blurb: null, cuisine: null, kcal: 500, protein: 38, carbs: 80, fat: 25, fibre: null },
];

test("v2: day-one totals are computed from the dishes", () => {
  const t = dayTotals(DAY_ONE_SHAPE);
  assert.equal(t.kcal, 462 + 580 + 300 + 500);
  assert.equal(t.protein, 32 + 26 + 12 + 38);
  assert.equal(t.carbs, 55 + 74 + 44 + 80);
  assert.equal(t.fat, 12 + 20 + 8 + 25);
  const shares = macroShares(t);
  assert.ok(Math.abs(shares.protein + shares.carbs + shares.fat - 1) < 0.001);
  assert.ok(shares.protein > 0 && shares.carbs > 0 && shares.fat > 0);
});

test("v2: day-one totals tolerate null macros", () => {
  const t = dayTotals([{ ...DAY_ONE_SHAPE[0], kcal: null, protein: null, carbs: null, fat: null }]);
  assert.deepEqual(t, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
});

/* ── Hero proof line never reads "0 plans" (§3.1 fallback) ──────────────── */
test("v2: proof line shows live counts, never zero", () => {
  const seeded = proofLine(126, 59, "21523035002815");
  assert.match(seeded, /126 plans/);
  assert.match(seeded, /59 goals and conditions/);
  assert.match(seeded, /FSSAI 21523035002815/);
  const empty = proofLine(0, 0, "21523035002815");
  assert.doesNotMatch(empty, /0 plans/);
  assert.equal(empty, "FSSAI 21523035002815");
});

/* ── Weight series (§6.4) ────────────────────────────────────────────────── */
test("v2: 30-day weight series runs 80.1 to 78.2 through the coach anchors", () => {
  const series = buildWeightSeries();
  assert.equal(series.length, 31);
  assert.equal(series[0]?.kg, 80.1);
  assert.equal(series[series.length - 1]?.kg, 78.2);
  const at = (day: number) => series.find((p) => p.day === day)?.kg;
  assert.equal(at(-24), 78.4);
  assert.equal(at(-17), 78.1);
  assert.equal(at(STALL_DAY), 78.0);
  assert.equal(at(-3), 78.1);
  assert.equal(STALL_DAY, -10);
});

test("v2: coach week series matches COACH_WEEKS exactly", () => {
  const series = coachWeekSeries();
  assert.deepEqual(series.map((p) => p.kg), COACH_WEEKS.map((w) => w.kg));
  assert.deepEqual(series.map((p) => p.kg), [78.4, 78.1, 78.0, 78.1]);
  const coachBubble = COACH_CHAT.find((b) => b.from === "coach")?.text ?? "";
  assert.match(coachBubble, /78\.0 kg/);
  assert.match(coachBubble, /1,700 kcal/);
  assert.match(coachBubble, /300 kcal/);
});

/* ── 18 readings (§3.7, §10.8) ───────────────────────────────────────────── */
test("v2: body-metric grid is exactly the 18 dashboard metrics", () => {
  assert.equal(BODY_METRICS_18.length, 18);
  assert.equal(new Set(BODY_METRICS_18.map((m) => m.key)).size, 18);
  assert.equal(HERO_METRICS_6.length, 6);
  // Only weight carries a measured value; everything else is "Estimated".
  const valued = BODY_METRICS_18.filter((m) => m.value !== null);
  assert.deepEqual(valued.map((m) => m.key), ["weight"]);
  assert.equal(valued[0]?.value, "78.2");
  assert.ok(BODY_METRICS_18.filter((m) => m.estimated).length === 17);
});

/* ── Training session comes from the sample data (§6.4) ─────────────────── */
test("v2: training sets match the dashboard-preview sample data", () => {
  const sample = SAMPLE_DAY.workout?.exercises ?? [];
  assert.equal(TRAINING_SESSION.length, sample.length);
  for (let i = 0; i < sample.length; i++) {
    assert.equal(TRAINING_SESSION[i]?.name, sample[i]?.name);
    assert.equal(TRAINING_SESSION[i]?.sets, sample[i]?.sets);
  }
});

/* ── Dish catalog (§6.2) ─────────────────────────────────────────────────── */
test("v2: dish catalog is 48 dishes, 16 priced", () => {
  assert.equal(SHOP_DISHES.length, 48);
  assert.equal(SHOP_DISHES.filter((d) => d.orderable).length, 16);
});

/* ── Palette: no lime anywhere in the v2 tokens (§9.1) ──────────────────── */
test("v2: tokens carry the cream/green/terracotta palette, no lime", () => {
  const css = fs
    .readFileSync(path.resolve("app/_design/tokens.css"), "utf8")
    // Comments name the old lime hex to record its removal; check the
    // declarations, not the prose.
    .replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(css, /#84cc16/i);
  assert.doesNotMatch(css, /#a3e635/i);
  assert.match(css, /--fk-paper:\s*#FAF6EF/i);
  assert.match(css, /--fk-green:\s*#1E5B3A/i);
  assert.match(css, /--fk-accent:\s*#C14E1D/i);
  assert.match(css, /--fk-forest:\s*#12291C/i);
});

/* ── Goal boxes (§3.9): four boxes, images that exist, no invented routes ── */
test("v2: goal boxes point at real assets and catalog filters", () => {
  assert.equal(GOAL_BOXES.length, 4);
  for (const box of GOAL_BOXES) {
    const file = path.join("public", box.img);
    assert.ok(fs.existsSync(file), `goal box image missing: ${box.img}`);
    assert.ok(["all", "STANDARD", "LIFESTYLE_MEDICAL", "SPORTS"].includes(box.filter.cat));
  }
});
