import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Homepage smart-scale contracts (2026-11-10, homepage-scale track).
//
// Same style as the other contract files: read the source and pin the
// behaviour a later edit must not silently drop. The pins here are about
// honesty, because the homepage is anonymous and no visitor has readings:
// every example number is labelled "Example", only weight is ever called
// measured, the BMI bands are the ones in lib/personalization.ts, and the
// daily messages are only the ones the cron routes actually send. There is
// no daily weight email in the code, so the section must never claim one.

const read = (p: string) => readFileSync(resolve(p), "utf8");

const HOME = read("app/_web/HomeExperience.tsx");
// The ScaleBand function body only, so pins about its copy do not pass on
// the strength of some other band's words.
const SCALE = HOME.slice(
  HOME.indexOf("function ScaleBand()"),
  HOME.indexOf("export function HomeProductLinks"),
);
assert.ok(SCALE.length > 1000, "ScaleBand must exist in HomeExperience.tsx");
// JSX wraps prose across lines, so sentence pins match against the
// whitespace-collapsed copy, not the raw source.
const TEXT = SCALE.replace(/\s+/g, " ");
const norm = (s: string) => s.replace(/\s+/g, " ");

test("the scale band sits after how it works and before the menu", () => {
  const howItWorks = HOME.indexOf('id="how-it-works-title"');
  const scale = HOME.indexOf("<ScaleBand />");
  assert.ok(howItWorks > 0, "how-it-works section must exist");
  assert.ok(scale > howItWorks, "ScaleBand must render after how it works");
  // HomeExperience is rendered directly above the catalogue rail in
  // FitFuelApp, so a band at the end of HomeExperience is before the menu.
  const homeExperienceUse = read("app/_web/FitFuelApp.tsx");
  assert.ok(
    homeExperienceUse.indexOf("<HomeExperience") <
      homeExperienceUse.indexOf('id="catalog"'),
    "HomeExperience must render before the catalogue",
  );
});

test("the scale band adds no h1: the hero keeps the single h1", () => {
  assert.equal((SCALE.match(/<h1[\s>]/g) ?? []).length, 0);
  assert.match(SCALE, /<h2 id="smart-scale-title">/);
});

test("every example number is labelled Example", () => {
  // The example weight (the same 78.2 kg the dashboard band shows).
  assert.match(SCALE, /Example reading/);
  assert.match(SCALE, /Example: 78\.2 kg/);
  // The example BMI on the gauge. 24.7 is 78.2 kg at 178 cm tall, and
  // the height is stated beside the gauge, so the BMI is never shown
  // without the height behind it.
  assert.match(SCALE, /Example BMI/);
  assert.match(SCALE, /24\.7/);
  assert.match(SCALE, /aria-label="Example BMI 24\.7/);
  assert.match(SCALE, /78\.2 kg at 178 cm tall/);
  // The example trend and its example target.
  assert.match(SCALE, /Example: six weekly weigh-ins, from 80\.4 kg to 78\.2 kg/);
  assert.match(SCALE, /against an example target of 75 kg/);
  // No example figure may appear as a live reading.
  assert.doesNotMatch(SCALE, /live reading of 78\.2/);
  assert.doesNotMatch(SCALE, /your weight is 78\.2/);
});

test("the estimates disclaimer is verbatim from BodyMetricsClient", () => {
  const client = read("app/dashboard/body-metrics/BodyMetricsClient.tsx");
  const disclaimer =
    "Only weight is measured directly. The other body-composition values " +
    "are consumer-scale estimates derived from impedance and your profile. " +
    "Use them for trends, not diagnosis or treatment decisions.";
  assert.ok(norm(client).includes(norm(disclaimer)), "disclaimer must exist in the client");
  assert.ok(TEXT.includes(norm(disclaimer)), "disclaimer must appear verbatim on the homepage");
  const medical =
    "Consumer-scale estimates are not medical measurements. If a number " +
    "concerns you, discuss it with a qualified clinician rather than " +
    "changing treatment from this screen.";
  assert.ok(norm(client).includes(norm(medical)), "medical line must exist in the client");
  assert.ok(TEXT.includes(norm(medical)), "medical line must appear verbatim on the homepage");
});

test("the BMI gauge uses the lib/personalization.ts categories", () => {
  const personalization = read("lib/personalization.ts");
  assert.match(personalization, /if \(bmi < 18\.5\) return "Underweight"/);
  assert.match(personalization, /if \(bmi < 25\) return "Healthy"/);
  assert.match(personalization, /if \(bmi < 30\) return "Overweight"/);
  assert.match(personalization, /return "Obese"/);
  for (const label of ["Underweight", "Healthy", "Overweight", "Obese"]) {
    assert.ok(SCALE.includes(label), `gauge must show ${label}`);
  }
  assert.match(TEXT, /Underweight below 18\.5\. Healthy 18\.5 to 25\. Overweight 25 to 30\. Obese 30 and over\./);
});

test("the band lists all 18 metrics from computeAllMetrics, weight alone measured", () => {
  const expected = [
    "Weight", "BMI", "Body fat", "Fat mass", "Fat-free weight",
    "Subcutaneous fat", "Visceral fat", "Body water", "Water weight",
    "Skeletal muscle", "Muscle mass", "Muscle rate", "Bone mass",
    "Protein", "Protein mass", "BMR", "Body age", "Ideal weight",
  ];
  assert.equal(expected.length, 18);
  // The SCALE_METRICS array is module-level, above the ScaleBand function.
  for (const name of expected) {
    assert.ok(HOME.includes(`name: "${name}"`), `metrics list must include ${name}`);
  }
  // The SCALE_METRICS array is module-level, above the ScaleBand function,
  // so the measured/estimate split is counted in the whole file.
  assert.equal((HOME.match(/measured: true/g) ?? []).length, 1, "exactly one metric is measured");
  assert.equal((HOME.match(/measured: false/g) ?? []).length, 17, "the other 17 are estimates");
  assert.match(SCALE, /\{m\.measured \? "Measured" : "Estimate"\}/);
});

test("the Bluetooth flow is honest: browser pairing, no companion app, manual fallback", () => {
  const client = read("app/dashboard/body-metrics/BodyMetricsClient.tsx");
  assert.match(client, /navigator.*\.bluetooth\.requestDevice/);
  assert.match(TEXT, /Your browser asks which scale to pair/);
  assert.match(TEXT, /There is no companion app to install/);
  assert.doesNotMatch(TEXT, /Download (our|the) app/);
  assert.doesNotMatch(TEXT, /Install the FitFuel app/);
  assert.match(TEXT, /enter a reading by hand if Bluetooth is not available/);
  assert.match(TEXT, /locks the reading once your weight holds steady/);
});

test("no invented capability: no brand, model, accuracy figure or health claim", () => {
  for (const invented of [
    "Fitbit", "Withings", "Xiaomi", "Mi Scale", "Garmin",
    "% accurate", "accuracy of", "clinical grade", "medical device",
    "diagnose", "prescri", "guaranteed",
  ]) {
    assert.ok(!SCALE.includes(invented), `scale band must not claim ${invented}`);
  }
  assert.doesNotMatch(SCALE, /\d+(\.\d+)?\s*% accurate/);
});

test("daily messages are only what the cron routes send: no weight email is claimed", () => {
  const morning = read("app/api/cron/morning-preview/route.ts");
  const evening = read("app/api/cron/evening-recap/route.ts");
  const nudges = read("app/api/cron/daily-nudges/route.ts");
  assert.match(morning, /7 AM IST/);
  assert.match(morning, /morning_meal_preview/);
  assert.match(evening, /9 PM IST/);
  assert.match(evening, /evening_recap/);
  assert.match(nudges, /10 AM IST/);
  assert.match(nudges, /detectCoachNudges/);
  const coachNudges = read("lib/coach/nudges.ts");
  assert.match(coachNudges, /templateKey: "coach_plateau"/);
  assert.match(coachNudges, /templateKey: "coach_milestone"/);
  assert.match(SCALE, /7 AM, every morning/);
  assert.match(SCALE, /Today&apos;s meals, with total calories/);
  assert.match(SCALE, /9 PM, every evening/);
  assert.match(SCALE, /Tomorrow&apos;s meals and total calories/);
  assert.match(SCALE, /10 AM, every day/);
  assert.match(SCALE, /plateau nudge/);
  assert.match(SCALE, /milestone message/);
  assert.match(SCALE, /nothing is sent that you did not leave on/);
  for (const invented of [
    "daily weight email", "weight tracking email", "weight update email",
    "your weight by email", "weigh-in email", "weight report email",
  ]) {
    assert.ok(!SCALE.toLowerCase().includes(invented), `must not claim a ${invented}`);
  }
});

test("the trend chart is the dashboard chart, extracted not reinvented", () => {
  const shared = read("app/_web/WeightTrendChart.tsx");
  assert.match(shared, /extracted verbatim from/);
  assert.match(shared, /app\/dashboard\/progress\/ProgressClient\.tsx/);
  // The original markers: dashed target line, lime last-point dot.
  assert.match(shared, /strokeDasharray="4 6"/);
  assert.match(shared, /fill=\{C\.lime\}/);
  assert.match(shared, /Two .* readings are needed before a trend means anything/);
  const progress = read("app/dashboard/progress/ProgressClient.tsx");
  assert.match(progress, /from "@\/app\/_web\/WeightTrendChart"/);
  assert.match(progress, /<WeightTrendChart/);
  assert.doesNotMatch(progress, /function TrendChart\(/);
  // The homepage uses the shared chart with the labelled example series.
  assert.match(SCALE, /<WeightTrendChart/);
  assert.match(SCALE, /series=\{EXAMPLE_SERIES\}/);
  assert.match(SCALE, /target=\{EXAMPLE_TARGET_KG\}/);
});

test("the scale visual is drawn SVG, not a photograph or a new binary image", () => {
  assert.doesNotMatch(SCALE, /\/images\//);
  assert.doesNotMatch(SCALE, /<Image/);
  assert.match(SCALE, /role="img"/);
  assert.match(SCALE, /Illustration of a Bluetooth scale/);
});

// Readability fix (2026-11-11, homepage-fix-readability track). Chintu
// found the metrics grid unreadable: 200px cells were about 30px too
// narrow on a 1919px viewport, so "Subcutaneous fat %" split the % onto
// a second line and "Visceral fat level" wrapped. These pins keep the
// fix from regressing. They are layout-independent on purpose: they pin
// the column floor, the nowrap span and the width budget, not pixels
// measured in one browser.

test("metric names read on one line: name and unit share one nowrap span", () => {
  const css = read("app/_web/experience.module.css");
  const list = SCALE.slice(SCALE.indexOf('<ul className={x.scaleMetrics}>'));
  assert.ok(list.length > 100, "metrics list must exist in ScaleBand");
  // One span holds the name and its unit, and the tag sits outside it.
  const spanOpen = list.indexOf("<span className={x.scaleMetricName}>");
  assert.ok(spanOpen > 0, "name span must carry the scaleMetricName class");
  const afterSpan = list.slice(spanOpen);
  assert.ok(afterSpan.indexOf("{m.name}") < afterSpan.indexOf("</span>"), "name must be inside the span");
  assert.ok(
    afterSpan.indexOf("{m.unit ? <small> {m.unit}</small> : null}") <
      afterSpan.indexOf("</span>"),
    "unit must be inside the same span as the name",
  );
  assert.ok(
    afterSpan.indexOf("{m.measured ? \"Measured\" : \"Estimate\"}") >
      afterSpan.indexOf("</span>"),
    "Measured/Estimate tag must stay outside the name span",
  );
  // The span never wraps, so a name cannot split mid-word.
  assert.match(css, /\.scaleMetricName \{[^}]*white-space: nowrap;[^}]*\}/);
});

test("metrics grid columns are wide enough for the longest name plus its tag", () => {
  const css = read("app/_web/experience.module.css");
  const grid = css.match(
    /\.scaleMetrics \{[^}]*grid-template-columns: repeat\(auto-fill, minmax\((\d+)px, 1fr\)\);[^}]*\}/,
  );
  assert.ok(grid, "scaleMetrics must use an auto-fill minmax grid");
  const floor = Number(grid[1]);
  // Widest-cell budget, measured 2026-11-11 with PIL against two
  // reference sans fonts at bold (heavier than the real 600 weight, so
  // conservative): longest name and unit "Subcutaneous fat %" is
  // 133.7px in Liberation Sans Bold and 138.9px in Noto Sans Bold at
  // 14px; widest tag "Measured" is 59.4px at 12px bold; plus 12px
  // padding each side and a 10px gap. 140 + 60 + 24 + 10 = 234.
  assert.ok(floor >= 234, `column floor ${floor}px must cover the 234px widest-cell budget`);
});

test("metric units read at name size, not as tiny subscripts", () => {
  const css = read("app/_web/experience.module.css");
  assert.match(css, /\.scaleMetrics li small \{[^}]*font-size: inherit;[^}]*\}/);
});

test("wider metrics columns do not make the grid taller, at any width", () => {
  const css = read("app/_web/experience.module.css");
  const liRule = css.match(/\.scaleMetrics li \{[^}]*\}/);
  assert.ok(liRule, "scaleMetrics li rule must exist");
  // No 48px min-height forcing tall rows: the row height is the text
  // line plus its vertical padding, about 32px.
  assert.doesNotMatch(liRule[0], /min-height:/);
  const pad = liRule[0].match(/padding: (\d+)px (\d+)px;/);
  assert.ok(pad, "scaleMetrics li must set its padding");
  assert.ok(Number(pad[1]) <= 8, `vertical padding ${pad[1]}px must stay small enough to hold the height`);
  const row = 14 * 1.4 + 2 * Number(pad[1]);
  const floor = Number(
    css.match(/\.scaleMetrics \{[^}]*minmax\((\d+)px, 1fr\)/)?.[1],
  );
  assert.ok(floor > 0, "column floor must parse");
  const cols = (content: number, min: number) =>
    Math.max(1, Math.floor((content + 1) / (min + 1)));
  const height = (content: number, min: number, rowH: number) => {
    const rows = Math.ceil(18 / cols(content, min));
    return rows * rowH + (rows - 1) * 1;
  };
  // Content widths from .home (1360px cap, gutter clamp 20px/5vw/40px):
  // 1919px desktop, 1180px, 980px, 720px, 560px and 390px phone.
  // Old grid: 200px floor, 48px rows.
  for (const content of [1280, 1100, 900, 648, 504, 350]) {
    assert.ok(
      height(content, floor, row) <= height(content, 200, 48),
      `metrics grid at ${content}px content must be no taller than before`,
    );
  }
});

test("metrics grid has no visible empty cells: grid background is transparent", () => {
  const css = read("app/_web/experience.module.css");
  // 18 items in 5 desktop columns leave 2 empty slots in the last row.
  // A line-coloured grid background would paint those slots as grey
  // boxes (the same defect as the rails). Transparent slots read as
  // page ground, so the grid ends where the items end.
  assert.match(css, /\.scaleMetrics \{[^}]*background: transparent;[^}]*\}/);
});
