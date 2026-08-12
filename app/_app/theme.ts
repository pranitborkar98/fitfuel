// app/_app/theme.ts
//
// ONE app-scale theme for every logged-in surface: dashboard, nutrition,
// training, body, coach, referrals, partners.
//
// WHY THIS EXISTS. There were ten copies of a hardcoded `const T = {...}`
// across app/dashboard alone, and between them they used eight different
// near-blacks (#0a0a0a, #0f0f0f, #101010, #111111, #141414, #161616, #1a1a1a,
// #1f1f1f), none of which is --ff-bg, plus blue #60a5fa, green #22c55e and
// orange #f97316. The app was on a different design generation from the rest
// of the site. This module is the single source, and it reads the --ff-*
// variables rather than restating them, so the app can never drift from
// globals.css again.
//
// The "app scale" is the type ramp here. The editorial ramp (display
// to 9rem) belongs to marketing pages and must not appear on these screens.

import type { CSSProperties } from "react";

/* ── Faces ─────────────────────────────────────────────────────────────── */
export const COND = "var(--ff-cond), 'Arial Narrow', sans-serif";
export const SANS = "var(--font-archivo), sans-serif";
export const MONO = "var(--font-mono), ui-monospace, monospace";

/* ── Colour ────────────────────────────────────────────────────────────────
   Every value is a token reference. No hex literal belongs in a component. */
export const C = {
  bg: "var(--ff-bg)",
  panel: "var(--ff-panel)",
  panel2: "var(--ff-panel-2)",
  ink: "var(--ff-ink)",
  mute: "var(--ff-mute)",
  dim: "var(--ff-dim)",
  rule: "var(--ff-rule)",
  rule2: "var(--ff-rule-2)",
  lime: "var(--ff-lime)",
  limeLight: "var(--ff-lime-light)",
  /** On-lime text. Near-black rather than pure, so the lime does not vibrate. 9.6:1. */
  onLime: "#06140b",
  /** Bar troughs and the fat segment: the two steps between rule and dim. */
  trough: "#1c1c1a",
  fat: "#5f5f59",
  wash: "rgba(132,204,22,0.1)",
  /** The one semantic that is not lime. Always paired with a text label,
   *  never carrying meaning on its own. */
  danger: "#dc2626",
} as const;

/* ── Type, app scale ──────────────────────────────────────────────────────
   Reports, it does not argue. The 12px floor is legibility on mid-range
   Android, not taste, so it is baked into the helpers rather than trusted to
   each call site. */

export const MIN_TYPE_PX = 12;

/** The one screen title. 22px condensed 800. */
export const screen = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: COND, fontWeight: 800, fontSize: 22, lineHeight: 1.05,
  letterSpacing: "-0.01em", textTransform: "uppercase", color: C.ink,
  margin: 0, ...extra,
});

/** A card or block heading. 16px condensed 800. */
export const section = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: COND, fontWeight: 800, fontSize: 16, lineHeight: 1.1,
  letterSpacing: "0.01em", textTransform: "uppercase", color: C.ink,
  margin: 0, ...extra,
});

/** Body / row copy. */
export const body = (size = 14, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: SANS, fontSize: Math.max(size, MIN_TYPE_PX), lineHeight: 1.55,
  color: C.mute, margin: 0, ...extra,
});

/** A mono label. One per block, uppercase, wide, dim. */
export const label = (size = 12, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: MONO, fontWeight: 700, fontSize: Math.max(size, MIN_TYPE_PX),
  letterSpacing: "0.18em", textTransform: "uppercase", color: C.dim, ...extra,
});

/** Any number that sits in a column. Tabular so digits do not shift. */
export const num = (size = 12, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: MONO, fontWeight: 700, fontSize: Math.max(size, MIN_TYPE_PX),
  fontVariantNumeric: "tabular-nums", color: C.ink, ...extra,
});

/** The number being reported: condensed 900, tabular, 28-56px. */
export const figure = (size = 44, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: COND, fontWeight: 900, fontSize: size, lineHeight: 0.88,
  letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", color: C.ink,
  ...extra,
});

/* ── Structure ─────────────────────────────────────────────────────────────
   Radius is 0, so a "card" is a hairline and a recessed ground. */

export const PANEL: CSSProperties = { background: C.panel, border: `1px solid ${C.rule}` };

/** Promoted panel: lime hairline for the one thing per screen being acted on.
 *  Never more than one visible at a time. */
export const PANEL_LIVE: CSSProperties = { background: C.panel, border: `1px solid ${C.lime}` };

/** A hairline grid: 1px gaps over the rule colour, so dividers ARE the gap.
 *  Never double-draws at a seam. */
export const grid = (cols: string, extra: CSSProperties = {}): CSSProperties => ({
  display: "grid", gridTemplateColumns: cols, gap: 1,
  background: C.rule, border: `1px solid ${C.rule}`, ...extra,
});

/* ── Controls ──────────────────────────────────────────────────────────────
   44x44 minimum is a rule, so it lives in the helper. */

export const solidBtn = (extra: CSSProperties = {}): CSSProperties => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minHeight: 44, padding: "0 16px", background: C.lime,
  border: `1px solid ${C.lime}`, color: C.onLime,
  fontFamily: COND, fontWeight: 900, fontSize: 15, letterSpacing: "0.06em",
  textTransform: "uppercase", cursor: "pointer", ...extra,
});

export const ghostBtn = (on = false, extra: CSSProperties = {}): CSSProperties => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minHeight: 44, padding: "0 16px", background: "transparent",
  border: `1px solid ${on ? C.lime : C.rule2}`, color: on ? C.lime : C.ink,
  fontFamily: COND, fontWeight: 800, fontSize: 14, letterSpacing: "0.06em",
  textTransform: "uppercase", cursor: "pointer", ...extra,
});

/* ── The app measure ───────────────────────────────────────────────────────
   Wider than the marketing measure (1180) because these screens are dense and
   two-column at desktop. */
export const APP_MAX = 1280;
export const SIDEBAR_W = 236;
export const TABBAR_H = 60;
/** The width at which the sidebar replaces the bottom tab bar. */
export const NAV_BREAK = 1024;
