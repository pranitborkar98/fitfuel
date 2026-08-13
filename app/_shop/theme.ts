// app/_shop/theme.ts
//
// The storefront's palette and type. One file, and the only place in app/_shop
// that names a colour. Shop, Chrome, DishSheet, PlanSheet, ReturnBand, Sheet
// and Slot all render through it, so this file IS the design of every section.
//
// REBUILT FOR REAL 2026-08-12.
//
// The previous header of this file already claimed "REBUILT 2026-08-12, LIGHT
// AND WARM — the ground is cream, the accent is a leaf green", and listed
// contrast ratios against #FBF7F0. None of it was true in the code: every value
// below it still read `var(--ff-bg)`, `var(--ff-lime)` and friends, which
// resolve to #070707 and #84cc16 in globals.css. A commit named "light warm
// tokens" shipped, the comment changed, the pixels did not. That is the whole
// reason the owner was still looking at a near-black trading terminal on his
// phone after the redesign was reported as done.
//
// So: the values now actually point at the warm ramp in app/_design/tokens.css.
// If you are reading this to find out what the shop looks like, read the values,
// not this comment.
//
// EXPORT SIGNATURES ARE UNCHANGED ON PURPOSE. Every key in `C` keeps its old
// name — including `lime`, `limeLight` and `onLime`, which are now green, light
// green and white. Renaming them would touch seven components and ~1,900 lines
// of JSX for zero visual gain, and the point of this change is that it restyles
// the ENTIRE storefront without deleting or rewriting a single section.
//
// CONTRAST, verified by npm run design:contrast rather than asserted here.

/* ── Faces ─────────────────────────────────────────────────────────────────
   Newsreader carries the display voice now. A condensed athletic grotesque set
   at 900 in uppercase is what made a food shop read as an instrument panel;
   a warm editorial serif in sentence case is the single biggest lever on
   "does this look like food". Archivo body, JetBrains Mono for real numbers. */
export const COND = "var(--fk-display), Georgia, serif";
export const SANS = "var(--fk-sans), sans-serif";
export const MONO = "var(--fk-mono), monospace";

/* ── Colour ────────────────────────────────────────────────────────────────
   Warm paper hosts the food; it never competes with it. */
export const C = {
  bg: "var(--fk-paper)",
  panel: "var(--fk-surface)",
  panel2: "var(--fk-warm)",
  ink: "var(--fk-ink)",
  mute: "var(--fk-ink-2)",
  dim: "var(--fk-ink-3)",
  rule: "var(--fk-line)",
  rule2: "var(--fk-line-2)",
  /** LEGACY KEY NAMES. `lime` is the deep herb green; `onLime` is white. */
  lime: "var(--fk-green)",
  limeLight: "var(--fk-green-deep)",
  onLime: "var(--fk-on-green)",
  /** Macro-bar trough and the fat segment. */
  trough: "var(--fk-warm-2)",
  fat: "var(--fk-terracotta)",
  wash: "var(--fk-green-wash)",
} as const;

/* ── Type helpers ──────────────────────────────────────────────────────────
   Same five helpers, same call sites, different voice. */

/** The display voice: Newsreader, sentence case, tight. NOT uppercase — the
 *  copy in Shop.tsx is already authored in sentence case ("Anyone can sell you
 *  a salad", "Order tonight"), and the old `textTransform: uppercase` was
 *  shouting it back at the customer. */
export const display = (size: number | string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: COND,
  fontWeight: 500,
  fontSize: size,
  lineHeight: 1.08,
  letterSpacing: "-0.02em",
  textTransform: "none",
  color: C.ink,
  margin: 0,
  ...extra,
});

/** A card or row title, one notch tighter. */
export const sub = (size: number | string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: COND,
  fontWeight: 500,
  fontSize: size,
  lineHeight: 1.2,
  letterSpacing: "-0.01em",
  textTransform: "none",
  color: C.ink,
  ...extra,
});

/** Archivo body. */
export const body = (size = 14.5, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SANS,
  fontSize: size,
  lineHeight: 1.6,
  color: C.mute,
  margin: 0,
  ...extra,
});

/**
 * A section label. One per section.
 *
 * NO LONGER MONO. Setting every caption in tracked-out uppercase monospace is
 * the specific thing the owner called "AI slop" — it annotates rather than
 * labels, and it is what made the page read as a readout. Mono is now reserved
 * for figures that were actually measured (see num/figure below).
 *
 * THE 12px FLOOR STAYS. Below that these are unreadable on the mid-range
 * Android phones our customers order from. That is legibility, not taste.
 */
export const MIN_TYPE_PX = 12;

export const label = (size = 12, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: Math.max(size, MIN_TYPE_PX),
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: C.dim,
  ...extra,
});

/** Any number in a column: mono, tabular, so digits line up. */
export const num = (size = 12, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: MONO,
  fontWeight: 600,
  fontSize: Math.max(size, MIN_TYPE_PX),
  fontVariantNumeric: "tabular-nums",
  color: C.ink,
  ...extra,
});

/** A headline-scale figure. */
export const figure = (size: number | string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: COND,
  fontWeight: 600,
  fontSize: size,
  lineHeight: 1,
  letterSpacing: "-0.02em",
  fontVariantNumeric: "tabular-nums",
  color: C.ink,
  ...extra,
});

/* ── Structure ─────────────────────────────────────────────────────────────
   Radius is back, restrained. A card is white on warm paper with one hairline
   and one shallow, warm-tinted shadow. No glow, no glass, no coloured shadow. */

export const PANEL: React.CSSProperties = {
  background: C.panel,
  border: `1px solid ${C.rule}`,
  borderRadius: "var(--fk-r-lg)",
  boxShadow: "var(--fk-shadow-1)",
};

/** The same panel, promoted: green hairline for the one thing per section being
 *  sold. Never more than one visible at a time. */
export const PANEL_LIVE: React.CSSProperties = {
  background: C.panel,
  border: `1px solid ${C.lime}`,
  borderRadius: "var(--fk-r-lg)",
  boxShadow: "var(--fk-shadow-2)",
};

/** A hairline grid: 1px gaps over the rule colour, so the dividers ARE the gap.
 *  `overflow: hidden` lets the outer radius clip the cells. */
export const grid = (cols: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: cols,
  gap: 1,
  background: C.rule,
  border: `1px solid ${C.rule}`,
  borderRadius: "var(--fk-r-lg)",
  overflow: "hidden",
  ...extra,
});

/** A horizontally scrolling rail — the webapp's primary browse gesture. */
export const RAIL: React.CSSProperties = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  scrollPadding: "0 16px",
};

/* ── Controls ──────────────────────────────────────────────────────────────
   44×44 minimum on touch is a rule, not a preference, so it is baked in here
   rather than left to each call site. */

export const solidBtn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 18px",
  background: C.lime,
  border: `1px solid ${C.lime}`,
  borderRadius: "var(--fk-r)",
  color: C.onLime,
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 15,
  letterSpacing: "0",
  textTransform: "none",
  cursor: "pointer",
  ...extra,
});

export const ghostBtn = (on = false, extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 18px",
  background: on ? C.wash : "transparent",
  border: `1px solid ${on ? C.lime : "var(--fk-line-strong)"}`,
  borderRadius: "var(--fk-r)",
  color: on ? C.limeLight : C.ink,
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 14.5,
  letterSpacing: "0",
  textTransform: "none",
  cursor: "pointer",
  ...extra,
});

/** A filter chip — the webapp browse control. Rounded, because this is the one
 *  place a full radius genuinely belongs. */
export const chip = (on: boolean, extra: React.CSSProperties = {}): React.CSSProperties => ({
  flex: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  minHeight: 44,
  padding: "0 16px",
  background: on ? C.ink : "transparent",
  border: `1px solid ${on ? C.ink : "var(--fk-line-strong)"}`,
  borderRadius: "var(--fk-r-full)",
  color: on ? C.bg : C.mute,
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: "0",
  textTransform: "none",
  cursor: "pointer",
  ...extra,
});

/** A segmented control cell: top rule lights, ground washes. */
export const seg = (on: boolean, extra: React.CSSProperties = {}): React.CSSProperties => ({
  padding: "12px 11px",
  textAlign: "left",
  background: on ? C.wash : C.panel,
  border: 0,
  borderTop: `2px solid ${on ? C.lime : "transparent"}`,
  color: on ? C.ink : C.mute,
  cursor: "pointer",
  minHeight: 44,
  ...extra,
});

/* ── The shell ─────────────────────────────────────────────────────────────
   Widened from 940 to 1120. 940 was inherited from a 480px device mock-up and
   it is why the shop read as a phone screenshot stretched onto a desktop; a
   food webapp wants the extra column of dishes. The grids below it are all
   `repeat(auto-fit, minmax(...))` or explicit breakpoints, so they absorb it. */
export const SHELL_MAX = 1120;
export const WRAP: React.CSSProperties = {
  width: "100%",
  maxWidth: SHELL_MAX,
  margin: "0 auto",
  padding: "0 clamp(16px,4vw,32px)",
};
