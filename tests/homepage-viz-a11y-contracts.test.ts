import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Homepage graphics, mobile + accessibility contracts
// (2026-11-10, finish/homepage-visuals integration).
//
// Same style as the other contract files: read the source and pin the
// behaviour the graphics pass must not silently drop. These are static
// pins, not a browser audit — they catch regressions at the commit where
// they happen. The rules they pin are written out in
// app/_hp/viz/VIZ_CONTRACT.md.
//
// History: the a11y track (finish/homepage-viz-a11y) wrote the first
// version of these tests against its own reference section, which
// duplicated the scale track's smart-scale band. The coordinator kept
// the scale track's band and adapted the tests to the kept
// implementation; the contract itself is unchanged.

const read = (p: string) => readFileSync(resolve(p), "utf8");

const HOME_CHARTS = "app/_web/HomeCharts.tsx";
const TREND_CHART = "app/_web/WeightTrendChart.tsx";
const HOME_SECTIONS = "app/_web/HomeSections.tsx";
const HOME_EXPERIENCE = "app/_web/HomeExperience.tsx";
const EXPERIENCE_CSS = "app/_web/experience.module.css";
const APP_CSS = "app/_web/app.module.css";
const CONTRAST = "scripts/check-contrast.mjs";

test("every SVG in the kept viz components is labelled or hidden, and viewBox-scaled", () => {
  let checked = 0;
  for (const file of [HOME_CHARTS, TREND_CHART]) {
    const src = read(file);
    const svgs = src.match(/<svg[\s\S]*?>/g) ?? [];
    for (const tag of svgs) {
      assert.match(tag, /viewBox/, `${file}: every svg needs a viewBox so it scales`);
      const decorative = tag.includes('aria-hidden="true"');
      const informative = tag.includes('role="img"') && tag.includes("aria-label");
      assert.ok(
        decorative || informative,
        `${file}: every svg is either role="img" with an aria-label, or aria-hidden`,
      );
      assert.ok(
        !decorative || !tag.includes('role="img"'),
        `${file}: a decorative svg must not also carry role="img"`,
      );
      // No fixed pixel width/height on the svg element itself:
      // width="100%" only. (Rects and lines inside may carry numbers.)
      assert.doesNotMatch(tag, /width="[0-9]+"/, `${file}: no numeric svg width`);
      assert.doesNotMatch(tag, /height="[0-9]+"/, `${file}: no numeric svg height`);
    }
    checked += svgs.length;
  }
  assert.ok(checked >= 3, "the kept viz components should define at least 3 literal svgs");

  // The scale band's two SVGs live in HomeExperience.tsx beside the
  // pre-existing decorative step icons, so they are pinned by their
  // labels rather than by a file-wide sweep.
  const exp = read(HOME_EXPERIENCE);
  assert.match(
    exp,
    /aria-label="Illustration of a Bluetooth scale showing an example reading of 78\.2 kilograms"/,
    "scale device SVG labels its example reading",
  );
  assert.match(
    exp,
    /aria-label="Example BMI 24\.7, in the healthy range from 18\.5 to 25"/,
    "BMI gauge SVG labels its example value and band",
  );
});

test("chart labels state the values and say the data is an example", () => {
  const charts = read(HOME_CHARTS);
  assert.match(charts, /Example macro split for the sample day/, "macro label says it is an example");
  assert.match(charts, /Example day calories by meal/, "meal chart label says it is an example");
  assert.match(charts, /Example shape: net calories per day/, "calorie shape label says it is an example");
  assert.match(charts, /Not a customer's readings/, "calorie shape label says it is not a customer's data");

  // The shared trend chart is the dashboard's real TrendChart extracted
  // verbatim, so its own label is data-agnostic; the example wording
  // for the homepage use lives in the scale band caption beside it.
  const exp = read(HOME_EXPERIENCE);
  assert.match(exp, /Example: six weekly weigh-ins/, "trend caption says it is an example");
  assert.match(exp, /from 80\.4 kg to 78\.2 kg/, "trend caption states the example series");
});

test("the BMI gauge carries all four bands with the app's own edges, and the example BMI states its height", () => {
  const exp = read(HOME_EXPERIENCE);
  for (const [label, from, to] of [
    ["Underweight", 15, 18.5],
    ["Healthy", 18.5, 25],
    ["Overweight", 25, 30],
    ["Obese", 30, 40],
  ]) {
    assert.ok(exp.includes(`label: "${label}"`), `gauge must list the ${label} band`);
    assert.ok(exp.includes(`from: ${from}, to: ${to}`), `gauge must list the ${label} edges`);
  }
  assert.match(
    exp,
    /Underweight below 18\.5\.\s*Healthy 18\.5 to 25\.\s*Overweight 25 to\s*30\.\s*Obese 30 and over\./,
    "gauge caption prints every band range in words",
  );
  // A BMI is never shown without the height behind it: the example is
  // 78.2 kg at 178 cm, which is 24.7.
  assert.match(exp, /const EXAMPLE_BMI = 24\.7;/, "example BMI is 24.7");
  assert.match(exp, /78\.2 kg at 178 cm tall/, "example height is stated beside the gauge");
});

test("no viz file reads the viewport in JavaScript", () => {
  for (const file of [HOME_CHARTS, TREND_CHART, HOME_EXPERIENCE, "app/_web/home-data.ts"]) {
    const src = read(file);
    assert.doesNotMatch(src, /useMediaQuery/, `${file}: no useMediaQuery (hydration flash)`);
    assert.doesNotMatch(src, /matchMedia/, `${file}: no matchMedia`);
    assert.doesNotMatch(src, /innerWidth/, `${file}: no window.innerWidth`);
  }
});

test("viz CSS is phone-safe and honours reduced motion", () => {
  for (const file of [EXPERIENCE_CSS, APP_CSS]) {
    const css = read(file);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/, `${file}: reduced-motion block present`);
  }
  const css = read(EXPERIENCE_CSS);
  assert.match(css, /\.scaleCta \{[^}]*min-height: 44px/, "scale section CTA is a 44px target");
  assert.match(css, /\.scaleGrid \{[^}]*minmax\(/, "scale grid uses a minmax track, so it cannot overflow");
});

test("the scale band labels its example data and links to body metrics", () => {
  const src = read(HOME_EXPERIENCE);
  assert.match(src, /Example reading/, "the 78.2 kg reading is labelled as an example");
  assert.match(src, /78\.2/, "the example reading is the repo's own 78.2 kg figure");
  assert.match(src, /href="\/dashboard\/body-metrics"/, "scale band links to body metrics");
  assert.match(src, /className=\{x\.scaleCta\}/, "the link uses the 44px target class");
  assert.equal((src.match(/<h1[\s>]/g) ?? []).length, 1, "page keeps its single pre-existing h1");
  assert.equal(
    (src.match(/id="smart-scale-title"/g) ?? []).length,
    1,
    "scale band has exactly one h2",
  );
  // Scoped to the scale band itself: the file carries one em dash in a
  // pre-existing code comment above it, which is not customer copy.
  const band = src.slice(src.indexOf("function ScaleBand()"));
  assert.doesNotMatch(band, /—/, "scale band copy uses no em dashes");
});

test("the scale band renders after how-it-works, and only there", () => {
  const src = read(HOME_EXPERIENCE);
  assert.equal((src.match(/<ScaleBand \/>/g) ?? []).length, 1, "scale band renders exactly once");
  assert.ok(
    src.indexOf('id="how-it-works-title"') < src.indexOf("<ScaleBand />"),
    "scale band sits after how-it-works, before the menu",
  );
});

test("coach week bars are hidden from assistive tech; their numbers stay as text", () => {
  const src = read(HOME_SECTIONS);
  assert.match(
    src,
    /<span className=\{s\.weekBar\} aria-hidden="true">/,
    "week bars are aria-hidden decoration",
  );
  assert.match(src, /className=\{s\.weekFig\}/, "the week figures still print as text");
});

test("the contrast script pins the gauge bands as meaningful graphics", () => {
  const src = read(CONTRAST);
  assert.match(src, /BMI healthy band against a card/, "lime band pinned at 3:1");
  assert.match(src, /BMI other bands against a card/, "grey bands pinned at 3:1");
});
