// app/_home/theme.ts
//
// Shared style primitives for the homepage. Deliberately framework-free (no
// "use client", no imports beyond a type) so both the server-rendered
// sections and the handful of client islands can pull from one source.
//
// Colours mirror the --ff-* tokens in globals.css. They stay as literals
// here because these objects feed inline `style` props, where a var()
// reference would defeat the point of keeping the values auditable.

import type { CSSProperties } from "react";

export const BG = "#070707";
export const INK = "#f7f7f5";
export const MUTE = "#9a9a94"; // 7.1:1 on BG
// Was #63635f, which computed to ~3.3:1 and failed WCAG AA everywhere it
// was used (12-13px labels: hero readout, tier pricing, attribution).
export const DIM = "#85857e"; // 5.4:1 on BG, passes AA at small sizes
export const RULE = "#232320";
export const LIME = "#84cc16";

export const COND = "var(--ff-cond)";
export const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const WRAP: CSSProperties = {
  width: "100%",
  maxWidth: 1400,
  margin: "0 auto",
  padding: "0 clamp(18px,4vw,56px)",
};

/* ── DISPLAY TYPE, MIGRATED 2026-08-21 ───────────────────────────────
   Was Barlow Condensed 900/800, UPPERCASE, lineHeight .83 — the rejected
   system in three properties. /partners was the last page setting headings
   that way; the homepage, the 59 plan pages and the 24 pages on
   app/_ui/theme.ts had already moved off it.

   NO calc() SCALE HERE, unlike app/_ui/theme.ts. That file multiplies the
   incoming clamp because twenty-four pages share it and re-measuring them all
   was not worth it. This file has exactly one consumer, and a blanket
   multiplier is wrong at the FLOOR: scaling clamp(2.6rem,7.4vw,6.2rem) by
   0.54 fixed the desktop hero but shrank the 375px hero to 22px, and h3s to
   14px — smaller than the body text under them. The call sites are retuned
   in place instead, so both ends of every clamp are a size somebody chose.

   The ceilings match the rest of the site: a hero tops out at 52px, the same
   as .h1 in app/_ui/page.module.css and the /plans detail hero. */
export const huge = (size: string): CSSProperties => ({
  fontFamily: "var(--fk-display, var(--font-newsreader), Georgia, serif)",
  fontWeight: 600, fontSize: size, lineHeight: 1.05,
  letterSpacing: "-0.022em", textTransform: "none", color: INK, margin: 0,
});
export const mid = (size: string): CSSProperties => ({
  fontFamily: "var(--fk-display, var(--font-newsreader), Georgia, serif)",
  fontWeight: 600, fontSize: size, lineHeight: 1.2,
  letterSpacing: "-0.015em", textTransform: "none", color: INK, margin: 0,
});
export const copy = (size = 15): CSSProperties => ({
  fontSize: size, fontWeight: 400, color: MUTE, lineHeight: 1.62,
});
/* Small kickers survive — the homepage keeps them at 11.5px/0.12em. What does
   not survive is 0.28em at 12.5px, which is a shout rather than a label, and
   the condensed face carrying it. */
export const tag = (color = DIM): CSSProperties => ({
  fontFamily: "var(--font-archivo), system-ui, sans-serif",
  fontWeight: 700, fontSize: 11.5, letterSpacing: "0.12em",
  textTransform: "uppercase", color,
});

export const GOALS = [
  { key: "weight-loss", label: "Lose fat" },
  { key: "muscle-gain", label: "Build muscle" },
  { key: "balanced", label: "Eat balanced" },
];
export const DIETS = [
  { key: "veg", label: "Veg" },
  { key: "egg", label: "Egg" },
  { key: "non-veg", label: "Non-Veg" },
  { key: "jain", label: "Jain" },
];
export const GOAL_NAME: Record<string, string> = {
  "weight-loss": "Weight Loss",
  "muscle-gain": "Muscle Gain",
  balanced: "Balanced",
};
