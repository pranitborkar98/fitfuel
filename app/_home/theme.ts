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

/* extreme scale: 900 display vs 400 body, nothing in between */
export const huge = (size: string): CSSProperties => ({
  fontFamily: COND, fontWeight: 900, fontSize: size, lineHeight: 0.83,
  letterSpacing: "-0.02em", textTransform: "uppercase", color: INK, margin: 0,
});
export const mid = (size: string): CSSProperties => ({
  fontFamily: COND, fontWeight: 800, fontSize: size, lineHeight: 0.9,
  letterSpacing: "-0.01em", textTransform: "uppercase", color: INK, margin: 0,
});
export const copy = (size = 15): CSSProperties => ({
  fontSize: size, fontWeight: 400, color: MUTE, lineHeight: 1.62,
});
export const tag = (color = DIM): CSSProperties => ({
  fontFamily: COND, fontWeight: 700, fontSize: 12.5, letterSpacing: "0.28em",
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
