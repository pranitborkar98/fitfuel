// app/_shop/theme.ts
//
// The Instrument System tokens, as the shop's inline styles need them.
//
// The prototype hardcodes hex literals and quoted font names because it renders
// standalone with a Google Fonts <link>. Neither travels: the three faces load
// once through next/font in app/layout.tsx, and DESIGN.md requires the colour
// variables rather than the literals. So every value the shop draws comes from
// here, and here is the only place in app/_shop that names a colour at all.

/* ── Faces ─────────────────────────────────────────────────────────────────
   Barlow Condensed display, Archivo body, JetBrains Mono for every number.
   Three, and no fourth. */
export const COND = "var(--ff-cond), sans-serif";
export const SANS = "var(--font-archivo), sans-serif";
export const MONO = "var(--font-mono), monospace";

/* ── Colour ────────────────────────────────────────────────────────────────
   The whole ramp, and nothing that is not on it. `line` and `wash` are the two
   values the prototype used that have no token: a 4px macro-bar trough and the
   10% lime fill behind a selected segment. Both are derived from tokens rather
   than being new greys. */
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
  /** On-lime text. Near-black rather than pure, so the lime does not vibrate. */
  onLime: "#06140b",
  /** Macro-bar trough and the fat segment: the two steps between rule and dim. */
  trough: "#1c1c1a",
  fat: "#5f5f59",
  wash: "rgba(132,204,22,0.1)",
} as const;

/* ── Type helpers ──────────────────────────────────────────────────────────
   Every heading, label and figure on the shop is one of these five. Written as
   functions returning style objects so a caller varies the size and nothing
   else, which is what stops the ramp drifting section by section. */

/** UPPERCASE Barlow Condensed 900, flush left, tight. The display voice. */
export const display = (size: number | string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: COND,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 0.88,
  letterSpacing: "-0.03em",
  textTransform: "uppercase",
  color: C.ink,
  margin: 0,
  ...extra,
});

/** Barlow Condensed 800 for a card or row title, which sets one notch tighter. */
export const sub = (size: number | string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: COND,
  fontWeight: 800,
  fontSize: size,
  lineHeight: 1.06,
  letterSpacing: "-0.01em",
  textTransform: "uppercase",
  color: C.ink,
  ...extra,
});

/** Archivo body. 12px floor, per DESIGN.md, on every surface. */
export const body = (size = 13.5, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: SANS,
  fontSize: size,
  lineHeight: 1.6,
  color: C.mute,
  margin: 0,
  ...extra,
});

/**
 * A mono section label. One per section, UPPERCASE, wide, `dim`.
 *
 * THE CLAMP IS THE POINT. The prototype sets these labels between 8.5px and
 * 10.5px, and DESIGN.md's floor is 12px with a stated reason: below that they
 * are unreadable on the mid-range Android phones our customers actually order
 * from. That is a legibility rule, not a taste one, so the floor wins and every
 * call site keeps the size it asked for as an intent rather than a value.
 *
 * Raising the floor is one number. If the tighter prototype setting is wanted
 * back, this is the only line to change.
 */
export const MIN_TYPE_PX = 12;

export const label = (size = 12, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: Math.max(size, MIN_TYPE_PX),
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: C.dim,
  ...extra,
});

/** Any number that sits in a column: mono, tabular, so digits line up. Same
 *  12px floor as label(), and for the same reason: a macro figure nobody can
 *  read on a phone is worse than no figure. */
export const num = (size = 12, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: MONO,
  fontWeight: 700,
  fontSize: Math.max(size, MIN_TYPE_PX),
  fontVariantNumeric: "tabular-nums",
  color: C.ink,
  ...extra,
});

/** A headline-scale figure: condensed 900 with tabular digits. */
export const figure = (size: number | string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  fontFamily: COND,
  fontWeight: 900,
  fontSize: size,
  lineHeight: 0.9,
  letterSpacing: "-0.035em",
  fontVariantNumeric: "tabular-nums",
  color: C.ink,
  ...extra,
});

/* ── Structure ─────────────────────────────────────────────────────────────
   Radius is 0 everywhere, so a "card" is a 1px hairline and a recessed panel.
   These four cover every box the shop draws. */

/** A hairline-bordered panel on the recessed ground. */
export const PANEL: React.CSSProperties = { background: C.panel, border: `1px solid ${C.rule}` };

/** The same panel, promoted: lime hairline for the one thing per section that
 *  is being sold. Never more than one of these visible at a time. */
export const PANEL_LIVE: React.CSSProperties = { background: C.panel, border: `1px solid ${C.lime}` };

/** A hairline grid: 1px gaps over the rule colour, so the dividers ARE the gap.
 *  Cheaper than borders per cell and it never double-draws at a seam. */
export const grid = (cols: string, extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "grid",
  gridTemplateColumns: cols,
  gap: 1,
  background: C.rule,
  border: `1px solid ${C.rule}`,
  ...extra,
});

/** A horizontally scrolling rail. `ffx` hides the scrollbar without hiding the
 *  scroll: the rails stay keyboard and trackpad reachable. */
export const RAIL: React.CSSProperties = {
  display: "flex",
  gap: 1,
  overflowX: "auto",
  scrollSnapType: "x mandatory",
};

/* ── Controls ──────────────────────────────────────────────────────────────
   44×44 minimum on touch is a DESIGN.md rule, not a preference, so the minimum
   height is baked into the helper rather than left to each call site. */

export const solidBtn = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 16px",
  background: C.lime,
  border: `1px solid ${C.lime}`,
  color: C.onLime,
  fontFamily: COND,
  fontWeight: 900,
  fontSize: 15,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
  ...extra,
});

export const ghostBtn = (on = false, extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 16px",
  background: "transparent",
  border: `1px solid ${on ? C.lime : C.rule2}`,
  color: on ? C.lime : C.ink,
  fontFamily: COND,
  fontWeight: 800,
  fontSize: 14,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
  ...extra,
});

/** A filter chip. Square, hairline, lime when on. Never a pill. */
export const chip = (on: boolean, extra: React.CSSProperties = {}): React.CSSProperties => ({
  flex: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  minHeight: 38,
  padding: "0 14px",
  background: on ? C.lime : "transparent",
  border: `1px solid ${on ? C.lime : C.rule}`,
  color: on ? C.onLime : C.mute,
  fontFamily: COND,
  fontWeight: 800,
  fontSize: 13.5,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  cursor: "pointer",
  ...extra,
});

/** A segmented control cell: top rule lights, ground washes. Used by the plan
 *  configurator, the corporate seat bands and the meal-count picker. */
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
   The prototype frames itself in a 480px device and widens to 940px at 860px.
   On the real site the page is the document, so the shell width becomes the
   content measure and the breakpoint stays where the design put it. */
export const SHELL_MAX = 940;
export const WRAP: React.CSSProperties = {
  width: "100%",
  maxWidth: SHELL_MAX,
  margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};
