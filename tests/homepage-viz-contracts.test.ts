import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { SAMPLE_DAY, SAMPLE_PLAN } from "../app/dashboard-preview/sample-data";
import {
  EXAMPLE_CALORIES,
  macroShares,
  sampleDayTotals,
} from "../app/_web/home-data";

// Homepage visualisation contracts (2026-11-10, homepage-viz track).
//
// Same style as the other contract files: pin the behaviour a later edit
// must not silently drop. The sample-day sums are computed live from the
// dashboard preview's sample day, so the numbers below were derived from
// sample-data.ts, not typed from a screenshot.

const read = (p: string) => readFileSync(resolve(p), "utf8");

test("the sample day totals are summed from its four meals, not typed", () => {
  const totals = sampleDayTotals();
  const summed = SAMPLE_DAY.meals.reduce(
    (t, m) => ({
      kcal: t.kcal + m.recipe.caloriesPerServing,
      protein: t.protein + m.recipe.proteinGrams,
      carbs: t.carbs + m.recipe.carbsGrams,
      fat: t.fat + m.recipe.fatGrams,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
  assert.deepEqual(totals, summed);
  // Pinned so a change to the sample day is a visible decision, not drift.
  assert.deepEqual(totals, { kcal: 2000, protein: 100, carbs: 252, fat: 65 });
  assert.equal(SAMPLE_DAY.meals.length, 4);
});

test("the macro split normalises to 100 and matches the sample day", () => {
  const totals = sampleDayTotals();
  const shares = macroShares(totals.protein, totals.carbs, totals.fat);
  assert.equal(shares.protein + shares.carbs + shares.fat, 100);
  assert.deepEqual(shares, { protein: 20, carbs: 51, fat: 29 });
  // Same method as FitFuelApp's macro split: 4/4/9 kcal per gram.
  const kcal = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
  assert.equal(kcal, 1993);
});

test("the example calorie chart is 30 days against the sample plan target", () => {
  assert.equal(EXAMPLE_CALORIES.days.length, 30);
  assert.equal(EXAMPLE_CALORIES.target, SAMPLE_PLAN.calorieTarget);
  assert.equal(EXAMPLE_CALORIES.target, 2000);
  const burn = SAMPLE_DAY.workout.estimatedCalories;
  assert.equal(burn, 180);
  for (const d of EXAMPLE_CALORIES.days) {
    assert.equal(d.out, burn, "burn is the sample workout's own figure");
    assert.equal(d.in - d.out, d.net, "in minus out must equal net");
    assert.ok(d.net > 0);
  }
  const avgNet =
    EXAMPLE_CALORIES.days.reduce((a, d) => a + d.net, 0) /
    EXAMPLE_CALORIES.days.length;
  assert.ok(avgNet < EXAMPLE_CALORIES.target, "average net sits under target");
  const over = EXAMPLE_CALORIES.days.filter((d) => d.net > EXAMPLE_CALORIES.target);
  assert.equal(over.length, 5, "five days over target, so both bar colours show");
});

test("every homepage chart carries role img and a real example aria-label", () => {
  const charts = read("app/_web/HomeCharts.tsx");
  const svgs = [...charts.matchAll(/<svg[\s\S]*?>/g)].map((m) => m[0]);
  assert.equal(svgs.length, 2, "two SVGs: per-meal bars and the calorie chart");
  for (const svg of svgs) {
    assert.match(svg, /role="img"/);
    assert.match(svg, /aria-label=\{`[^`]*Example[^`]*`/);
  }
  // The stacked macro bar is HTML, not SVG, and gets the same treatment.
  assert.match(charts, /className=\{s\.macroBar\}[\s\S]*?role="img"/);
  assert.match(charts, /aria-label=\{`Example macro split/);
  // Phone-readable: both charts size their viewBox from a 360-wide constant,
  // never the 720-wide original.
  assert.equal((charts.match(/const W = 360/g) ?? []).length, 2);
  assert.equal((charts.match(/viewBox=\{`0 0 \$\{W\} \$\{H\}`\}/g) ?? []).length, 2);
  assert.doesNotMatch(charts, /0 0 720/);
  // No fixed pixel widths that can overflow a phone.
  assert.doesNotMatch(charts, /width="720"|width=\{720/);
});

test("the example labelling is on the page, not just in a comment", () => {
  const charts = read("app/_web/HomeCharts.tsx");
  assert.match(charts, /Example shape, not a customer/);
  assert.match(charts, /A sample full day from the dashboard preview/);
  assert.match(charts, /Not a customer/);
  assert.match(charts, /The trial day is priced in the\s+receipt above/);
  // No h1 is added by the visualisation file.
  assert.equal((charts.match(/<h1[\s>]/g) ?? []).length, 0);
});

test("the weighing flow reuses the real weighing photo and nothing else", () => {
  const charts = read("app/_web/HomeCharts.tsx");
  const imgs = [...charts.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(imgs, ["/images/brand/meals-weighed-in-kitchen.webp"]);
  // The same asset the day timeline's 06:30 step already uses.
  const data = read("app/_web/home-data.ts");
  assert.ok(data.includes('img: "/images/brand/meals-weighed-in-kitchen.webp"'));
  // Four steps, and every line is a sentence the page already prints.
  assert.match(charts, /Your target sets the grams/);
  assert.match(charts, /Weighed before sealing/);
  assert.match(charts, /Labelled to you/);
  assert.match(charts, /Already in your diary/);
  // A process illustration, never a meal drawn as a diagram.
  assert.doesNotMatch(charts, /diagram of (a|the) meal/i);
});

test("macro visuals live in plan/trial context only, never on dish cards", () => {
  const sections = read("app/_web/HomeSections.tsx");
  assert.equal((sections.match(/<SampleDayVisual \/>/g) ?? []).length, 1);
  assert.equal((sections.match(/<ExampleCalorieChart \/>/g) ?? []).length, 1);
  assert.equal((sections.match(/<WeighingFlow \/>/g) ?? []).length, 1);
  // Placement: weighing flow after the day timeline, calorie chart after the
  // coach card, sample day inside the trial receipt.
  assert.ok(
    sections.indexOf("<WeighingFlow />") > sections.indexOf("dayGrid"),
    "weighing flow sits under the day timeline",
  );
  assert.ok(
    sections.indexOf("<ExampleCalorieChart />") >
      sections.indexOf("maximum single change"),
    "calorie chart sits after the coach card",
  );
  assert.ok(
    sections.indexOf("<SampleDayVisual />") >
      sections.indexOf("No aggregator takes a cut"),
    "sample day sits inside the trial receipt",
  );
  // FitFuelApp (dish cards, day builder) never imports the chart file.
  assert.doesNotMatch(read("app/_web/FitFuelApp.tsx"), /HomeCharts/);
});
