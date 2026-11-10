import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Homepage accessibility contracts (2026-11-10, homepage-a11y track).
//
// Same style as the other contract files: read the source and pin the
// behaviour that a redesign must not silently drop. These are static pins,
// not a browser audit — they catch regressions at the commit where they
// happen, and the numbers below were all verified against the live
// rendering rules before the tests were written.

const read = (p: string) => readFileSync(resolve(p), "utf8");

// WCAG ratio math, same as scripts/check-contrast.mjs.
const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const lum = (h: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** Opaque text over a background: what a reader actually sees. */
const blend = (fg: string, bg: string, alpha: number) =>
  "#" +
  [0, 2, 4]
    .map((i) => {
      const f = parseInt(fg.slice(1 + i, 3 + i), 16);
      const b = parseInt(bg.slice(1 + i, 3 + i), 16);
      return Math.round(alpha * f + (1 - alpha) * b)
        .toString(16)
        .padStart(2, "0");
    })
    .join("");

const HOME_FILES = [
  "app/_web/HomeExperience.tsx",
  "app/_web/HomeLaunchpad.tsx",
  "app/_web/HomeToday.tsx",
  "app/_web/FitFuelApp.tsx",
  "app/_web/HomeSections.tsx",
  "app/_web/YourNumbers.tsx",
  "app/_web/AppChrome.tsx",
];

test("the homepage renders exactly one h1, in the hero", () => {
  let total = 0;
  for (const file of HOME_FILES) {
    const count = (read(file).match(/<h1[\s>]/g) ?? []).length;
    total += count;
    if (file.endsWith("HomeExperience.tsx")) {
      assert.equal(count, 1, "hero must hold the single h1");
      assert.match(read(file), /<h1 id="home-title"/);
    } else {
      assert.equal(count, 0, `${file} must not add an h1`);
    }
  }
  assert.equal(total, 1);
});

test("heading levels never skip inside a homepage file", () => {
  for (const file of HOME_FILES) {
    const levels = [...read(file).matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    for (let i = 1; i < levels.length; i++) {
      assert.ok(
        levels[i] <= levels[i - 1] + 1,
        `${file} skips from h${levels[i - 1]} to h${levels[i]}`,
      );
    }
  }
});

test("the hero day tabs name their tabpanel, like the meal tabs do", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  // Day tabs: id + aria-controls on every tab, roving tabindex kept.
  assert.match(experience, /id=\{`week-tab-\$\{index\}`\}/);
  assert.match(experience, /aria-controls="meal-preview-panel"/);
  assert.match(experience, /tabIndex=\{activeDay === index \? 0 : -1\}/);
  // The shared panel is labelled by the active meal tab.
  assert.match(experience, /role="tabpanel"/);
  assert.match(experience, /aria-labelledby=\{`meal-preview-tab-/);
  // Meal tabs keep their own panel association.
  assert.match(experience, /id=\{`meal-preview-tab-\$\{activeDay\}-\$\{index\}`\}/);
});

test("every dish-card Add control names its dish", () => {
  const app = read("app/_web/FitFuelApp.tsx");
  // 48 identical "Add" buttons are indistinguishable to a screen reader
  // without an accessible name; the visible word stays "Add".
  assert.match(app, /aria-label=\{`Add \$\{dish\.name\} to your order`\}/);
  assert.match(app, /aria-label=\{\s*asked \? `Price requested for \$\{dish\.name\}` : `Ask the price of \$\{dish\.name\}`\s*\}/);
  // The stepper buttons already named their dish; keep them named.
  assert.match(app, /aria-label=\{`Remove one \$\{dish\.name\}`\}/);
  assert.match(app, /aria-label=\{`Add one more \$\{dish\.name\}`\}/);
  // The photo buttons name the dish they open.
  assert.match(app, /aria-label=\{`See \$\{d\.name\}`\}/);
});

test("the quantity live regions announce a quantity, not a bare number", () => {
  const app = read("app/_web/FitFuelApp.tsx");
  // aria-label on a span is ignored by assistive tech (no role), so the
  // announcement used to be just "3". The visible figure is aria-hidden
  // and the hidden text carries the quantity.
  assert.doesNotMatch(app, /className=\{s\.stepQty\}[\s\S]{0,120}aria-label/);
  assert.match(app, /<span className=\{s\.stepQty\} aria-live="polite">/);
  assert.match(app, /\{qty\} in order/);
  const drawer = read("app/_cart/CartDrawer.tsx");
  assert.match(drawer, /<span className="ff-step-n" aria-live="polite">/);
  assert.match(drawer, /\{l\.qty\} in order/);
  // The drawer is outside the .fk subtree, so it carries its own sr-only rule.
  assert.match(drawer, /\.ff-sr-only \{/);
});

test("the plan-builder axes are labelled groups, not bare button rows", () => {
  const sections = read("app/_web/HomeSections.tsx");
  assert.match(sections, /<div className=\{s\.axis\} role="group" aria-label=\{opts\.label\}>/);
  // The visible label stays the source of the group name.
  assert.match(sections, /<span className=\{s\.axisLabel\}>\{opts\.label\}<\/span>/);
});

test("only the hero image loads eagerly; below-fold feature images are lazy", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  assert.match(experience, /loading="eager"/);
  const app = read("app/_web/FitFuelApp.tsx");
  assert.doesNotMatch(app, /loading="eager"/);
  assert.match(app, /sizes="\(min-width: 1024px\) 38vw, 100vw"/);
});

test("the 44px touch minimum is pinned at the token and at the controls", () => {
  const tokens = read("app/_design/tokens.css");
  assert.match(tokens, /--fk-tap: 44px;/);
  const appCss = read("app/_web/app.module.css");
  for (const rule of [".fchip", ".add", ".stepBtn"]) {
    assert.ok(appCss.includes(rule), `missing rule ${rule}`);
  }
  assert.match(appCss, /min-height: var\(--fk-tap\)/);
  const experienceCss = read("app/_web/experience.module.css");
  assert.match(experienceCss, /\.weekTabActive?/);
  assert.match(experienceCss, /min-height: var\(--fk-tap\)/);
  // Visible focus is global, not per-component.
  assert.match(read("app/_design/base.css"), /\.fk :focus-visible \{/);
  assert.match(read("app/layout.tsx"), /Skip to content/);
});

test("opacity-blended text on the homepage still clears AA", () => {
  // Filter-chip counts render at opacity 0.7. The effective colours below
  // are the blend, not the token — a token-only check would miss them.
  // Unselected: ink-2 over the page, and over the hover band.
  assert.ok(ratio(blend("#c6c6c0", "#070707", 0.7), "#070707") >= 4.5);
  assert.ok(ratio(blend("#c6c6c0", "#1a1a17", 0.7), "#1a1a17") >= 4.5);
  // Selected: near-black text at 0.7 over the near-white chip.
  assert.ok(ratio(blend("#070707", "#f7f7f5", 0.7), "#f7f7f5") >= 4.5);
  // The empty-well note is a hardcoded grey, not a token: #85857e on #050504.
  assert.ok(ratio("#85857e", "#050504") >= 4.5);
  // The kcal tag is ink on a 72% black scrim; worst case is over a white photo.
  assert.ok(ratio("#f7f7f5", blend("#000000", "#ffffff", 0.72)) >= 4.5);
  // The error token the contrast script now covers.
  assert.ok(ratio("#f87171", "#070707") >= 4.5);
});

test("AI imagery is disclosed in the markup, never presented as a photo", () => {
  const dishImage = read("app/_hp/DishImage.tsx");
  assert.match(dishImage, /Illustrative AI-generated image\. Not a photograph/);
  const experience = read("app/_web/HomeExperience.tsx");
  assert.match(experience, /Illustrative AI-generated food image; not a photograph/);
  // The no-photo fallback is hidden from assistive tech: the button that
  // wraps it already carries the dish name.
  const slot = read("app/_shop/Slot.tsx");
  assert.match(slot, /aria-hidden="true"/);
});
