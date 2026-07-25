// app/_hp/theme.ts
//
// The new homepage's visual system.
//
// Why it is not the old one: the previous palette was #070707 with an acid lime.
// That is a supplement-brand skin, and it was wrapped around a food business whose
// customers include diabetics, postpartum and cancer-recovery clients. Near-black
// makes cooked food look grey, and the lime fought every photograph on the page.
//
// This is paper, ink and one deep green. Food photography is allowed to be the
// only saturated thing on screen, which is how food is sold.
//
// Type rule that changed: display type is MIXED CASE. The old page set 35 headlines
// in 900-weight condensed uppercase, so nothing could rank against anything else.
// Uppercase is now reserved for small labels, where it earns its keep.

import type { CSSProperties } from "react";

export const PAPER = "#f7f4ee"; // warm off-white, not clinical white
export const PAPER_2 = "#efe9dd"; // banded sections
export const INK = "#171512"; // 15.8:1 on PAPER
export const INK_2 = "#4a453d"; // 8.3:1 — body copy
export const INK_3 = "#6f6459"; // 4.9:1 — passes AA at small sizes
export const RULE = "#ded6c7";
export const GREEN = "#1f5130"; // 8.9:1 on PAPER — accent that reads as food, not neon
export const GREEN_DEEP = "#12331f"; // dark bands
export const GREEN_LIGHT = "#2f7a46";
// Darkened from #b4471f, which landed at exactly 4.5:1 as a 12px label on the
// banded background — passing by rounding is not passing.
export const CLAY = "#a33d17";
export const CLAY_SOFT = "#e8d9c8"; // warm fill behind figures, stops the flatness

export const SERIF = "var(--font-fraunces), Georgia, serif";
export const COND = "var(--font-barlow-condensed), 'Barlow Condensed', sans-serif";

export const WRAP: CSSProperties = {
  width: "100%",
  maxWidth: 1240,
  margin: "0 auto",
  padding: "0 clamp(20px,5vw,64px)",
};

/* Display: a warm old-style serif, sentence case. One per section, maximum.
   The serif is doing most of the work of not looking plain — it carries the
   editorial, food-magazine register that a condensed grotesque cannot. */
export const display = (size: string): CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: 600,
  fontSize: size,
  lineHeight: 1.02,
  letterSpacing: "-0.022em",
  color: INK,
  margin: 0,
});

/* Sub-heads sit clearly BELOW display in the hierarchy — the old page had no
   such step, which is why everything shouted. */
export const sub = (size: string): CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: 600,
  fontSize: size,
  lineHeight: 1.18,
  letterSpacing: "-0.01em",
  color: INK,
  margin: 0,
});

export const body = (size = 16.5): CSSProperties => ({
  fontSize: size,
  fontWeight: 400,
  color: INK_2,
  lineHeight: 1.65,
  margin: 0,
});

/* The only place uppercase survives. */
export const label = (color = INK_3): CSSProperties => ({
  fontFamily: COND,
  fontWeight: 600,
  fontSize: 12,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color,
});

/* Figures: serif and tabular. Big serif numerals are the cheapest editorial
   signal there is — the same number set in condensed sans reads as a spec sheet. */
export const figure = (size: string, color = INK): CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: 700,
  fontSize: size,
  lineHeight: 0.92,
  letterSpacing: "-0.03em",
  color,
  fontVariantNumeric: "tabular-nums",
});

/* Pull-quote / editorial italic, for the one line per section worth slowing on. */
export const quote = (size: string): CSSProperties => ({
  fontFamily: SERIF,
  fontWeight: 400,
  fontStyle: "italic",
  fontSize: size,
  lineHeight: 1.35,
  letterSpacing: "-0.01em",
  color: INK,
  margin: 0,
});

export const SECTION: CSSProperties = { padding: "clamp(64px,8vw,116px) 0" };
