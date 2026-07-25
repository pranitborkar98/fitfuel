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

export const PAPER = "#f5f2ec"; // warm off-white, not clinical white
export const PAPER_2 = "#ebe6dc"; // banded sections
export const INK = "#171512"; // 15.8:1 on PAPER
export const INK_2 = "#4a453d"; // 8.3:1 — body copy
export const INK_3 = "#6f6459"; // 4.9:1 — passes AA at small sizes
export const RULE = "#d8d1c4";
export const GREEN = "#1f5130"; // 8.9:1 on PAPER — accent that reads as food, not neon
export const GREEN_LIGHT = "#2f7a46";
export const CLAY = "#b4471f"; // 5.1:1 — the single CTA colour, used sparingly

export const COND = "var(--font-barlow-condensed), 'Barlow Condensed', sans-serif";

export const WRAP: CSSProperties = {
  width: "100%",
  maxWidth: 1240,
  margin: "0 auto",
  padding: "0 clamp(20px,5vw,64px)",
};

/* Display: condensed, heavy, but sentence case. One of these per section, maximum. */
export const display = (size: string): CSSProperties => ({
  fontFamily: COND,
  fontWeight: 800,
  fontSize: size,
  lineHeight: 0.92,
  letterSpacing: "-0.015em",
  color: INK,
  margin: 0,
});

/* Sub-heads sit clearly BELOW display in the hierarchy — the old page had no
   such step, which is why everything shouted. */
export const sub = (size: string): CSSProperties => ({
  fontFamily: COND,
  fontWeight: 700,
  fontSize: size,
  lineHeight: 1.05,
  letterSpacing: "-0.005em",
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

/* Figures: tabular so columns of numbers line up. */
export const figure = (size: string, color = INK): CSSProperties => ({
  fontFamily: COND,
  fontWeight: 800,
  fontSize: size,
  lineHeight: 0.85,
  letterSpacing: "-0.02em",
  color,
  fontVariantNumeric: "tabular-nums",
});

export const SECTION: CSSProperties = { padding: "clamp(64px,8vw,116px) 0" };
