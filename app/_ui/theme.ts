// app/_ui/theme.ts
//
// THE INSTRUMENT SYSTEM, for the whole site.
//
// This is app/_hp/theme.ts, promoted. It lived under `_hp` (homepage) while the
// homepage was the only surface built to the locked system; every other public
// page styled itself independently, which is why /plans still carries radius 16
// cards and a lime glow shadow. Those pages are now being migrated, and they
// cannot sensibly import their tokens from a folder named "homepage".
//
// app/_hp/theme.ts re-exports everything here, so nothing that already imports
// it needs to change.
//
// Colour, type and radius match DESIGN.md exactly. Do not add a grey.

import type { CSSProperties } from "react";

/* ── surfaces ────────────────────────────────────────────────────────
   Recessed bands are DARKER than the page, never lighter. A lighter band
   reads as a card floating on a page; a darker one reads as a well cut
   into it, which is the instrument register. */
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

/** Radius is 0. Stated as a constant so a card that wants one has to import
 *  something that says zero, rather than typing a number. */
export const RADIUS = 0;

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
