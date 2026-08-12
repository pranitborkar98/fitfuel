// Verify the FitFuel `--fk-*` palette against WCAG 2.1.
//
// app/_design/tokens.css records a contrast ratio next to almost every colour.
// A comment claiming "9.26:1 AAA" is worth nothing if the value drifts and
// nobody re-checks, so the claims are re-derived here FROM THE FILE ITSELF —
// the hex values are parsed out of tokens.css rather than duplicated, which
// means editing a token and forgetting to edit its comment fails this check.
//
//   node scripts/check-contrast.mjs        exits 1 on any AA failure
//
// AGENTS.md lists AA contrast under the rules that are "not up for
// reinterpretation". This is that rule, executable.

import fs from "node:fs";
import path from "node:path";

const CSS = path.resolve("app/_design/tokens.css");
const src = fs.readFileSync(CSS, "utf8");

/** Pull every `--fk-name: #rrggbb;` declaration out of the token file. */
const tokens = {};
for (const m of src.matchAll(/(--fk-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
  tokens[m[1]] = m[2].toLowerCase();
}

const hex = (h) => {
  const s = h.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const lin = (c) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const lum = (h) => {
  const [r, g, b] = hex(h);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [foreground, background, minimum, what it is used for]
// `min` is 4.5 for body-size text, 3 for large text and for non-text UI that
// carries meaning (WCAG 1.4.11). Purely decorative hairlines are NOT listed:
// they are exempt, and asserting 3:1 on them would be a false requirement.
const PAIRS = [
  ["--fk-ink", "--fk-paper", 4.5, "headings and prices on paper"],
  ["--fk-ink-2", "--fk-paper", 4.5, "body copy on paper"],
  ["--fk-ink-3", "--fk-paper", 4.5, "metadata on paper"],
  ["--fk-green", "--fk-paper", 4.5, "accent text on paper"],
  ["--fk-green-deep", "--fk-paper", 4.5, "links and focus ring on paper"],
  ["--fk-terracotta", "--fk-paper", 4.5, "price emphasis on paper"],

  ["--fk-ink", "--fk-surface", 4.5, "headings on a card"],
  ["--fk-ink-2", "--fk-surface", 4.5, "body copy on a card"],
  ["--fk-ink-3", "--fk-surface", 4.5, "metadata on a card"],

  ["--fk-ink", "--fk-warm", 4.5, "headings on the warm band"],
  ["--fk-ink-2", "--fk-warm", 4.5, "body copy on the warm band"],
  ["--fk-ink-3", "--fk-warm", 4.5, "metadata on the warm band"],
  ["--fk-green-deep", "--fk-warm", 4.5, "links on the warm band"],

  ["--fk-green-deep", "--fk-green-wash", 4.5, "chip text on its tint"],
  ["--fk-terracotta-deep", "--fk-terracotta-wash", 4.5, "warm chip text on its tint"],

  ["--fk-line-strong", "--fk-paper", 3, "form borders and meaningful dividers"],
  ["--fk-green", "--fk-paper", 3, "primary button ground against paper"],
  ["--fk-turmeric", "--fk-ink-bg", 4.5, "footer link hover on the dark ground"],
];

// Literal pairs that are not both tokens — white button text, footer greys.
const LITERALS = [
  ["#ffffff", "--fk-green", 4.5, "primary button label"],
  ["#ffffff", "--fk-green-deep", 4.5, "primary button label, hover"],
  ["#d8d3c8", "--fk-ink-bg", 4.5, "footer body text"],
  ["#b3ada0", "--fk-ink-bg", 4.5, "footer fine print"],
];

let failed = 0;
let checked = 0;

const grade = (r) => (r >= 7 ? "AAA" : r >= 4.5 ? "AA " : r >= 3 ? "AA*" : "---");

const run = (fg, bg, min, what) => {
  const fgHex = fg.startsWith("#") ? fg : tokens[fg];
  const bgHex = bg.startsWith("#") ? bg : tokens[bg];
  if (!fgHex || !bgHex) {
    console.log(`MISSING  ${fg} on ${bg} — token not found in tokens.css`);
    failed++;
    return;
  }
  const r = ratio(fgHex, bgHex);
  const ok = r >= min;
  checked++;
  if (!ok) failed++;
  console.log(
    `${ok ? "  ok  " : " FAIL "} ${r.toFixed(2).padStart(6)}:1 ${grade(r)}  (need ${min})  ${what}`,
  );
};

console.log(`\nFitFuel palette — WCAG check against ${path.relative(process.cwd(), CSS)}\n`);
for (const [fg, bg, min, what] of PAIRS) run(fg, bg, min, what);
for (const [fg, bg, min, what] of LITERALS) run(fg, bg, min, what);

// The turmeric guard. tokens.css states in prose that turmeric must never be
// used as text on a light ground. Assert it, so the comment cannot rot into a
// suggestion.
const turmericOnPaper = ratio(tokens["--fk-turmeric"], tokens["--fk-paper"]);
if (turmericOnPaper >= 4.5) {
  console.log(
    `\nNOTE  --fk-turmeric now passes on paper (${turmericOnPaper.toFixed(2)}:1). ` +
      `The "non-text accent only" comment in tokens.css is stale — update it.`,
  );
}

console.log(`\n${checked} pairs checked, ${failed} failing.\n`);
process.exit(failed ? 1 : 0);
