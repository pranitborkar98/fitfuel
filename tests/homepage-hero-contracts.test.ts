import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

// Homepage redesign piece 1 — hero re-skin (2026-11-11, branch
// finish/homepage-hero).
//
// Same style as the other contract files: read the source and pin the
// behaviour a later edit must not silently drop. What this piece found and
// fixed, verified by reading the code at main 1fcbc14:
//   1. The headline never rendered at the 48-78px serif the base CSS
//      intended: home-workspace.module.css .workspace .title (0,2,0) beat
//      experience.module.css .title (0,1,0), so the h1 rendered at
//      clamp(28px, 3vw, 40px) in SANS. The hero headline is now huge serif
//      display, 64-80px desktop.
//   2. The hero grid was stacked (copy / menu / support full width); it is
//      two columns on desktop, type beside the food visual.
//   3. The four meal tabs were a flat row of pills (thumbnails and names
//      hidden by workspace rules); they are a staggered mosaic now.
//   4. The nav trial CTA already existed (FitFuelApp "Trial · ₹420") — no
//      duplicate was added; this file pins it so it is not removed.
// These are static pins, not a browser audit; the render check is separate.

const read = (p: string) => readFileSync(resolve(p), "utf8");

test("hero headline: huge serif display, 64-80px desktop", () => {
  const workspace = read("app/_web/home-workspace.module.css");
  const title = workspace.match(/\.workspace \.title \{([^}]*)\}/);
  assert.ok(title, ".workspace .title must exist");
  assert.match(title[1], /var\(--fk-display\)/, "headline must be the serif display face");
  assert.match(
    title[1],
    /clamp\(3\.5rem, 5\.2vw, 5rem\)/,
    "headline must be 56-80px (64-80px across normal desktop widths)",
  );
  assert.match(title[1], /max-width: 12ch/, "headline must wrap to a few short lines");
  // The phone headline is huge serif too, not the old 29px sans.
  assert.match(
    workspace,
    /@media \(max-width: 900px\)[\s\S]*?\.workspace \.title \{[^}]*clamp\(2\.5rem, 10vw, 3\.25rem\)/,
    "phone headline must be 40-52px serif",
  );
});

test("hero headline: one word in lime, the rest in ink", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  const css = read("app/_web/experience.module.css");
  assert.match(
    experience,
    /Chef-cooked meals, weighed to your\{" "\}\s*<span className=\{x\.titleAccent\}>macros\.<\/span>/,
    "exactly one word (macros) must carry the lime accent",
  );
  const accent = css.match(/\.titleAccent \{([^}]*)\}/);
  assert.ok(accent, ".titleAccent must exist");
  assert.match(accent[1], /color: var\(--fk-green\)/, "accent must be lime");
  // Lime #84cc16 on #070707 is 9.9:1, far above AA for large text.
  assert.doesNotMatch(accent[1], /font-style: italic/);
});

test("hero grid: two columns on desktop, type beside the food visual", () => {
  const workspace = read("app/_web/home-workspace.module.css");
  const hero = workspace.match(/\.workspace \.hero \{([^}]*)\}/);
  assert.ok(hero, ".workspace .hero must exist");
  assert.match(hero[1], /"copy menu"/, "copy and menu must share the top row");
  assert.match(hero[1], /"support menu"/, "support must sit under the copy");
  assert.match(
    hero[1],
    /grid-template-columns: minmax\(340px, 0\.9fr\) minmax\(520px, 1\.1fr\)/,
    "copy column must be narrower than the visual column",
  );
  // One restrained lime glow behind the visual column, not a band.
  assert.match(
    hero[1],
    /radial-gradient\([\s\S]*?rgba\(132, 204, 22, 0\.09\)/,
    "hero must carry one subtle lime glow",
  );
  // The copy column stacks (headline, lede, actions below): the old rule
  // put the actions in a second column beside the headline, which at
  // 64-80px squeezed it to ~200px and wrapped it word by word.
  const heading = workspace.match(/\.workspace \.heading \{([^}]*)\}/);
  assert.ok(heading, ".workspace .heading must exist");
  assert.match(
    heading[1],
    /grid-template-columns: minmax\(0, 1fr\);/,
    "copy column must be a single column",
  );
  assert.match(
    workspace,
    /\.heading > div \{\s*grid-column: 1;/,
    "hero actions must sit under the lede, not beside the headline",
  );
  // The guest override must match the two-column grid: the old stacked
  // areas undid the two-column hero for every logged-out visitor.
  const guest = workspace.match(/\.workspace \.heroGuest \{([^}]*)\}/);
  assert.ok(guest, ".workspace .heroGuest must exist");
  assert.match(guest[1], /"copy menu"/, "guest hero must keep copy beside the menu");
  assert.match(guest[1], /"support menu"/, "guest hero must keep support under the copy");
});

test("hero copy budget: headline + lede + actions stay under 40 words", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  // The static copy above the fold. Dish names are imagery (CookUnity's
  // rule: the food does the talking), so they are not counted here.
  // [source form, rendered form]. The eyebrow and CTA carry the price via
  // the trialTotal variable, so the source check uses the template form
  // while the word count uses what the visitor reads.
  const copy: Array<[string, string]> = [
    ["`First day ${trialTotal}`", "First day ₹420"],
    ["Chef-cooked meals, weighed to your", "Chef-cooked meals, weighed to your macros."],
    ["Four meals a day, delivered in Pune by 10 AM.", "Four meals a day, delivered in Pune by 10 AM."],
    ["Start your trial · {trialTotal}", "Start your trial · ₹420"],
    ["Check my pincode", "Check my pincode"],
  ];
  for (const [sourceForm, renderedForm] of copy) {
    assert.ok(
      experience.includes(sourceForm),
      `hero copy must still say: ${renderedForm}`,
    );
  }
  const words = copy
    .map(([, renderedForm]) => renderedForm)
    .join(" ")
    .split(/\s+/).length;
  assert.ok(words <= 40, `hero copy must be <= 40 words, got ${words}`);
});

test("hero: no invented struck-through price, the trial IS the offer", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  const heroStart = experience.indexOf('<section\n        className={`${x.hero}');
  assert.ok(heroStart > 0, "hero section must exist");
  const heroEnd = experience.indexOf("</section>", heroStart);
  const hero = experience.slice(heroStart, heroEnd);
  assert.doesNotMatch(hero, /line-through|strikethrough|<s>|<del>/);
  assert.match(hero, /First day \$\{trialTotal\}/, "trial price must show early");
  assert.match(hero, /Start your trial · \{trialTotal\}/, "hero CTA must carry the price");
});

test("meal mosaic: four vertical food cards, 2nd and 4th stepped down", () => {
  const css = read("app/_web/experience.module.css");
  assert.match(
    css,
    /\.mealGrid \{\s*display: grid;\s*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/,
    "meal mosaic must be 4 columns on desktop",
  );
  assert.match(
    css,
    /\.mealGrid button:nth-child\(2\),\s*\.mealGrid button:nth-child\(4\) \{\s*transform: translateY\(10px\);/,
    "the 2nd and 4th cards must step down 10px",
  );
  const thumb = css.match(/\.mealThumb \{([^}]*)\}/);
  assert.ok(thumb, ".mealThumb must exist");
  assert.match(thumb[1], /width: 100%/, "mosaic thumbnail must be full-width");
  assert.match(thumb[1], /height: 88px/, "mosaic thumbnail must be tall enough to show food");
  // The old workspace rules that hid the mosaic's thumbnails and names.
  const workspace = read("app/_web/home-workspace.module.css");
  assert.doesNotMatch(
    workspace,
    /\.workspace \.hero \.menu \[role="tab"\] > span:first-child/,
    "workspace must not hide meal-tab thumbnails",
  );
  assert.doesNotMatch(
    workspace,
    /\.workspace \.hero \.menu \[role="tab"\] b \{/,
    "workspace must not hide meal-tab names",
  );
  // No breakpoint anywhere may hide the meal name or flatten a card back
  // into a thumbnail row: the mosaic stays a vertical food card at every
  // width, including 390px (a <=420px rule used to do exactly this).
  assert.doesNotMatch(
    css,
    /\.mealGrid b \{\s*display: none;/,
    "no breakpoint may hide the mosaic meal names",
  );
  assert.doesNotMatch(
    css,
    /\.mealGrid button \{\s*grid-template-columns: 46px/,
    "no breakpoint may flatten mosaic cards into thumbnail rows",
  );
});

test("hero carousel: auto-advances every 6s, pauses on hover/focus, off under reduced motion", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  assert.match(experience, /window\.setInterval\(/, "carousel must auto-advance");
  assert.match(experience, /6000/, "auto-advance interval must be 6 seconds");
  assert.match(
    experience,
    /const reduceMotion = usePrefersReducedMotion\(\);/,
    "reduced motion must come from the hook, not inline matchMedia",
  );
  assert.match(experience, /previewPaused\.current = true/, "hover/focus must pause it");
  const hook = read("app/_web/usePrefersReducedMotion.ts");
  assert.match(
    hook,
    /const QUERY = "\(prefers-reduced-motion: reduce\)";/,
    "hook must query the reduced-motion preference",
  );
  assert.match(
    hook,
    /window\.matchMedia\(QUERY\)\.matches/,
    "hook must read the reduced-motion preference",
  );
  assert.match(
    hook,
    /useSyncExternalStore\(subscribe, readPreference, \(\) => false\)/,
    "hook must use a store with a server snapshot (no hydration flash)",
  );
  assert.match(experience, /previewPaused\.current = true/, "hover/focus must pause it");
  assert.match(
    experience,
    /aria-live=\{autoAdvance \? "off" : "polite"\}/,
    "the panel must not announce a new meal every 6 seconds",
  );
  // The feature image crossfades on change (320ms slow token).
  const css = read("app/_web/experience.module.css");
  assert.match(
    css,
    /\.featureMeal > img \{\s*animation: hero-fade var\(--fk-dur-slow\) var\(--fk-ease\);/,
    "feature image must fade on meal change",
  );
  assert.match(css, /@keyframes hero-fade \{/, "hero-fade keyframes must exist");
  assert.match(experience, /<Image\s*key=\{activeMeal\.slot\}/, "image must remount per meal so the fade re-runs");
});

test("hero keeps everything it had: support links, day tabs, delivery status", () => {
  const experience = read("app/_web/HomeExperience.tsx");
  assert.match(experience, /Ask the AI coach/);
  assert.match(experience, /Order on WhatsApp/);
  assert.match(experience, /Preview a day of the week/);
  assert.match(experience, /Order by \{cutoffLabel\}/);
  assert.match(experience, /Portion preview/);
  assert.match(experience, /Sample four-meal day/);
});

test("nav trial CTA already exists and must stay: Trial · ₹420 to /plans?trial=true", () => {
  const app = read("app/_web/FitFuelApp.tsx");
  assert.match(
    app,
    /<Link href="\/plans\?trial=true" className=\{r\.trialCta\}>\s*Trial · \{trialTotal\}/,
    "the header must keep its one persistent trial CTA",
  );
});

test("AGENTS.md macro-ring rule: ring allowed beside a photo, banned only as a stand-in for it", () => {
  const rules = read("AGENTS.md");
  assert.match(rules, /allowed beside a photo well/, "ring must be allowed beside a photo well");
  assert.match(
    rules,
    /banned is a ring, a glyph or a\s*typographic stand-in FOR the dish photo/,
    "ring/glyph stand-in FOR the photo must stay banned",
  );
});
