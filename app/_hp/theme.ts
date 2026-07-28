// app/_hp/theme.ts
//
// THE INSTRUMENT SYSTEM. This reverses the "dark premium bento" pass.
//
// WHY THE REVERSAL. The previous theme used 16–20px radii, 999px pills, radial
// glow blooms, coloured box-shadows and backdrop-filter glass. That list is,
// item for item, the "AI-slop audit — reject on sight" list in DESIGN.md. It is
// also the 2022–2025 house style of every dark SaaS landing page, which is
// exactly what this page was asked to stop looking like.
//
// The 2026 direction is the opposite: sharp geometry, 1px hairlines as the
// primary structural device, mathematically generated texture (grain) instead of
// faked depth, and viewport-scaled kinetic type carrying the page instead of a
// hero image. That is the same system DESIGN.md locked months ago. So this file
// is not a new invention: it is the locked system, finally pushed hard.
//
// Colour, type and radius below match DESIGN.md exactly. Do not add a grey.

import type { CSSProperties } from "react";

/* ── surfaces ────────────────────────────────────────────────────────
   Recessed bands are DARKER than the page, never lighter. A lighter band
   reads as a card floating on a page; a darker one reads as a well cut
   into it, which is the instrument register we want. */
export const BG = "#070707";
export const PANEL = "#050504";
export const PANEL_2 = "#0c0c0a";

export const INK = "#f7f7f5"; // 19.0:1 on BG
export const MUTE = "#9a9a94"; //  7.1:1 — body copy
export const DIM = "#85857e"; //  5.4:1 — metadata, fine print

export const RULE = "#232320";
export const RULE_2 = "#33332f";

export const LIME = "#84cc16";
export const LIME_LIGHT = "#a3e635";

export const COND = "var(--font-barlow-condensed), 'Arial Narrow', sans-serif";
export const SANS = "var(--font-archivo), sans-serif";
export const MONO = "var(--font-mono), ui-monospace, monospace";

export const WRAP: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  padding: "0 clamp(18px,4vw,40px)",
};

/* Display. UPPERCASE, flush left, 900, tight. The size argument is expected to
   be a clamp() with a vw middle term: type is meant to scale with the viewport,
   not sit at three fixed breakpoints. */
export const display = (size: string): CSSProperties => ({
  fontFamily: COND,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 0.86,
  letterSpacing: "-0.02em",
  textTransform: "uppercase",
  color: INK,
  margin: 0,
});

export const sub = (size: string): CSSProperties => ({
  fontFamily: COND,
  fontWeight: 800,
  fontSize: size,
  lineHeight: 0.98,
  letterSpacing: "-0.01em",
  textTransform: "uppercase",
  color: INK,
  margin: 0,
});

export const body = (size = 15.5): CSSProperties => ({
  fontFamily: SANS,
  fontSize: size,
  fontWeight: 400,
  color: MUTE,
  lineHeight: 1.62,
  margin: 0,
  maxWidth: "62ch",
});

/* Labels and every number are mono: the measurement voice. 12px floor, because
   below that it is unreadable on the mid-range Androids our customers order
   from (DESIGN.md, "minimum type size"). */
export const label = (color = DIM): CSSProperties => ({
  fontFamily: MONO,
  fontWeight: 500,
  fontSize: 12,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color,
  display: "block",
});

export const figure = (size: string, color = INK): CSSProperties => ({
  fontFamily: COND,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 0.82,
  letterSpacing: "-0.035em",
  color,
  fontVariantNumeric: "tabular-nums",
});

/* Numerals that must line up in a column (macros, prices, times) are mono,
   not condensed: condensed 900 is for headline-scale figures only. */
export const num = (size: string, color = INK): CSSProperties => ({
  fontFamily: MONO,
  fontWeight: 700,
  fontSize: size,
  lineHeight: 1,
  letterSpacing: "-0.02em",
  color,
  fontVariantNumeric: "tabular-nums",
});

export const SECTION: CSSProperties = { padding: "clamp(64px,8vw,120px) 0" };
