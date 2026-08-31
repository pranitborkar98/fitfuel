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
//
// MIGRATED 2026-08-21 (Decision #223). Every helper below was condensed at
// 800/900, UPPERCASE, with radius 0 - the register AGENTS.md rejected by name
// on 2026-08-12 for being unparseable on a phone. AGENTS.md does say "the app
// half and the marketing half may look different", and that still holds: this
// file keeps its OWN, much tighter scale (24px titles, not 52px), its 12px
// floor and its dense hairline grids. What it does not get to keep is the
// shouting. DENSITY is the difference that was licensed; uppercase condensed
// display type is not.
//
// This is the lever for 25 files. Changing it here is the only way to move
// every logged-in screen together.

import type { CSSProperties } from "react";

/* ── Faces ─────────────────────────────────────────────────────────────── */
export const DISPLAY = "var(--fk-display), Georgia, serif";
/** @deprecated The condensed face is retired. Kept as an alias only so the
 *  files importing `COND` keep compiling; it resolves to DISPLAY now.
 *  Do not reference it in new code. */
export const COND = DISPLAY;
export const SANS = "var(--font-archivo), sans-serif";
export const MONO = "var(--font-mono), ui-monospace, monospace";

/* ── Colour ────────────────────────────────────────────────────────────────
   Every value is a token reference. No hex literal belongs in a component. */
export const C = {
  bg: "var(--fk-paper)",
  panel: "var(--fk-surface)",
  panel2: "var(--fk-warm)",
  ink: "var(--fk-ink)",
  mute: "var(--fk-ink-2)",
  dim: "var(--fk-ink-3)",
  rule: "var(--fk-line)",
  rule2: "var(--fk-line-2)",
  lime: "var(--fk-green)",
  limeLight: "var(--fk-green-deep)",
  /** On-lime text. Near-black rather than pure, so the lime does not vibrate. 9.6:1. */
  onLime: "#06140b",
  /** Bar troughs and the fat segment: the two steps between rule and dim. */
  trough: "var(--fk-warm-2)",
  fat: "var(--fk-line-strong)",
  wash: "var(--fk-green-wash)",
  /** The one semantic that is not lime. Always paired with a text label,
   *  never carrying meaning on its own. */
  danger: "var(--fk-danger)",
} as const;

/* ── Type, app scale ──────────────────────────────────────────────────────
   Reports, it does not argue. The 12px floor is legibility on mid-range
   Android, not taste, so it is baked into the helpers rather than trusted to
   each call site. */

export const MIN_TYPE_PX = 13;

/** The one screen title. Newsreader 600 at 24px - app scale, not editorial:
 *  the marketing hero is 52px and must not appear on these screens. */
export const screen = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 600, fontSize: "clamp(28px, 3vw, 36px)", lineHeight: 1.08,
  letterSpacing: "-0.02em", textTransform: "none", color: C.ink,
  margin: 0, ...extra,
});

/** A card or block heading. Newsreader 600 at 17px. */
export const section = (extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 600, fontSize: 19, lineHeight: 1.25,
  letterSpacing: "-0.012em", textTransform: "none", color: C.ink,
  margin: 0, ...extra,
});

/** Body / row copy. */
export const body = (size = 14, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: SANS, fontSize: Math.max(size, 14), lineHeight: 1.6,
  color: C.mute, margin: 0, ...extra,
});

/** Supporting copy and compact metadata. It stays sentence case and uses the
 * body face; app labels are instructions, not instrument-panel captions. */
export const label = (size = 12, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: SANS, fontWeight: 600, fontSize: Math.max(size, MIN_TYPE_PX),
  lineHeight: 1.45, letterSpacing: 0, textTransform: "none", color: C.dim, ...extra,
});

/** Any number that sits in a column. Tabular digits without a monospace face,
 * so measurements align without making the whole product feel financial. */
export const num = (size = 12, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: SANS, fontWeight: 650, fontSize: Math.max(size, MIN_TYPE_PX),
  fontVariantNumeric: "tabular-nums", color: C.ink, ...extra,
});

/** The number being reported. Large, calm and proportional, with tabular
 * digits for stability as live values change. */
export const figure = (size = 44, extra: CSSProperties = {}): CSSProperties => ({
  fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1,
  letterSpacing: "-0.035em", fontVariantNumeric: "tabular-nums", color: C.ink,
  ...extra,
});

/* ── Structure ─────────────────────────────────────────────────────────────
   Was "radius is 0, so a card is a hairline and a recessed ground" - the old
   system's radius ban, retired with the rest of it. A card is still a hairline
   and a recessed ground; it just has corners now, on the scale the homepage
   already uses. */

export const RADIUS = "var(--fk-r)";
export const RADIUS_LG = "var(--fk-r-lg)";

export const PANEL: CSSProperties = {
  background: C.panel, border: `1px solid ${C.rule}`, borderRadius: RADIUS_LG,
};

/** Promoted panel: lime hairline for the one thing per screen being acted on.
 *  Never more than one visible at a time. */
export const PANEL_LIVE: CSSProperties = {
  background: C.panel, border: `1px solid ${C.lime}`, borderRadius: RADIUS_LG,
};

/** A hairline grid: 1px gaps over the rule colour, so dividers ARE the gap.
 *  Never double-draws at a seam. */
export const grid = (cols: string, extra: CSSProperties = {}): CSSProperties => ({
  display: "grid", gridTemplateColumns: cols, gap: 1,
  background: C.rule, border: `1px solid ${C.rule}`,
  /* The children draw the seams, so the corners must be clipped - otherwise a
     square cell pokes out through the grid's own rounded corner. */
  borderRadius: RADIUS_LG, overflow: "hidden", ...extra,
});

/* ── Controls ──────────────────────────────────────────────────────────────
   44x44 minimum is a rule, so it lives in the helper. */

export const solidBtn = (extra: CSSProperties = {}): CSSProperties => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minHeight: 44, padding: "0 18px", background: C.lime,
  border: `1px solid ${C.lime}`, color: C.onLime, borderRadius: RADIUS,
  fontFamily: SANS, fontWeight: 600, fontSize: 15, letterSpacing: 0,
  textTransform: "none", cursor: "pointer", ...extra,
});

export const ghostBtn = (on = false, extra: CSSProperties = {}): CSSProperties => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  minHeight: 44, padding: "0 18px", background: "transparent",
  border: `1px solid ${on ? C.lime : C.rule2}`, color: on ? C.lime : C.ink,
  borderRadius: RADIUS,
  fontFamily: SANS, fontWeight: 600, fontSize: 14.5, letterSpacing: 0,
  textTransform: "none", cursor: "pointer", ...extra,
});

/* ── The app measure ───────────────────────────────────────────────────────
   Wider than the marketing measure (1180) because these screens are dense and
   two-column at desktop. */
export const APP_MAX = 1280;
export const SIDEBAR_W = 252;
export const TABBAR_H = 60;
/** The width at which the sidebar replaces the bottom tab bar. */
export const NAV_BREAK = 1024;
