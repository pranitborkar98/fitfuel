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
// Colour, type and radius match the shipped system exactly. Do not add a grey.

import type { CSSProperties } from "react";

/* ── surfaces ────────────────────────────────────────────────────────
   Recessed bands are DARKER than the page, never lighter. A lighter band
   reads as a card floating on a page; a darker one reads as a well cut
   into it, which is the instrument register. */
export const BG = "var(--fk-paper)";
export const PANEL = "var(--fk-surface)";
export const PANEL_2 = "var(--fk-warm)";

export const INK = "var(--fk-ink)"; // 19.0:1 on BG
export const MUTE = "var(--fk-ink-2)"; //  7.1:1 — body copy
export const DIM = "var(--fk-ink-3)"; //  5.4:1 — metadata, fine print

export const RULE = "var(--fk-line)";
export const RULE_2 = "var(--fk-line-2)";

export const LIME = "var(--fk-green)";
export const LIME_LIGHT = "var(--fk-green-deep)";

/** Was 0 — "stated as a constant so a card that wants one has to import
 *  something that says zero". The ban was part of the rejected system; the
 *  live one carries a radius scale, so this now names the scale's base. */
export const RADIUS = "var(--fk-r)";

/** @deprecated The condensed face is retired; this now resolves to the
 *  display serif so any straggling import cannot reintroduce it. */
export const COND = "var(--fk-display), Georgia, serif";
export const SANS = "var(--font-archivo), sans-serif";
export const MONO = "var(--font-mono), ui-monospace, monospace";

export const WRAP: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  padding: "0 clamp(18px,4vw,40px)",
};

/* ── DISPLAY TYPE, MIGRATED 2026-08-21 ─────────────────────────────────────
   Was Barlow Condensed 900, UPPERCASE, lineHeight .86. That is the rejected
   system in three properties: AGENTS.md names "uppercase condensed everything"
   as a reason the old screen read as a trading terminal, and the homepage and
   the 59 plan pages have both moved off it.

   TWENTY-FOUR FILES SPREAD THESE TWO HELPERS — about, blog, contact, faq,
   how-it-works, locations, our-*, results, supplements, tdee-calculator,
   testimonials, the legal set and more. Changing them here is the only way to
   move those pages together; page-by-page would be twenty-four chances to
   leave one behind.

   THE calc(...) IS NOT A TRICK, it is the point. Every call site passes a
   clamp() tuned for CONDENSED type at 900 — "clamp(2.6rem,6.4vw,5.4rem)" is a
   sensible 86px in Barlow and an enormous one in a serif at 600, because
   condensed faces set far more characters per em. Scaling the incoming string
   keeps every call site's RELATIVE hierarchy intact while bringing the whole
   ramp to the new face's scale. One number to tune instead of twenty-four
   files to re-measure.

   0.62 puts the largest display heading at ~53px against the plan detail
   page's own .h1 ceiling of 52px, so a hero here and a hero there match. */
const DISPLAY_SCALE = 0.62;
const SUB_SCALE = 0.78;

/* THE SCALE IS BOUNDED, and this is the correction to the note above.
   Multiplying the whole clamp is right at the CEILING and wrong at the FLOOR:
   it shrinks the 375px end by the same 0.62, which took the /blog article
   title to a MEASURED 22px while every other page title on the site sat at
   32px, and took a /plans section h2 to 18px. The outer clamp pins both ends
   to the site's own ramp — the same 1.75rem/3.25rem that .h1 and .bandTitle
   in app/_ui/page.module.css use — while the middle term still carries each
   call site's relative hierarchy between them. One lever, both ends sane. */
export const display = (size: string): CSSProperties => ({
  fontFamily: "var(--fk-display)",
  fontWeight: 600,
  fontSize: `clamp(1.75rem, calc(${size} * ${DISPLAY_SCALE}), 3.25rem)`,
  lineHeight: 1.05,
  letterSpacing: "-0.022em",
  textTransform: "none",
  color: "var(--fk-ink)",
  margin: 0,
});

export const sub = (size: string): CSSProperties => ({
  fontFamily: "var(--fk-display)",
  fontWeight: 600,
  fontSize: `calc(${size} * ${SUB_SCALE})`,
  lineHeight: 1.15,
  letterSpacing: "-0.015em",
  textTransform: "none",
  color: "var(--fk-ink)",
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
   from. */
/* Small uppercase kickers survive the migration — the homepage uses them for
   band eyebrows and field labels at 11px/0.12em. What does not survive is
   0.22em, which at 12px is a shout rather than a label. */
export const label = (color = DIM): CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 650,
  fontSize: 13,
  letterSpacing: "0.01em",
  textTransform: "none",
  color,
  display: "block",
});

/* Figures are MONO, which is what the homepage sets every number in and what
   makes a column of them line up. Was condensed 900 at -0.035em — a display
   face doing a measurement job. */
export const figure = (size: string, color = INK): CSSProperties => ({
  fontFamily: MONO,
  fontWeight: 700,
  fontSize: `calc(${size} * 0.72)`,
  lineHeight: 1,
  letterSpacing: "-0.01em",
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
