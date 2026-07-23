# FitFuel — DESIGN.md (art direction)

## ANTI-SLOP CONSTRAINTS (2026-07-23, non-negotiable)

Silence equals defaults: anything this file does not specify, a model fills
with the statistically average choice, and that average IS the "AI slop" look.
So these are stated as hard negatives. Breaking one is a bug.

**Never:**
- ❌ `Inter`, Roboto, or system-ui as the body face. It is the single most
  recognisable AI-generated-site tell. Body is **Archivo**; display is
  **Barlow Condensed**.
- ❌ Border-radius ≥ 8px. Corners are square (radius 0). No rounded cards.
- ❌ Uniform 3-up card grids as a section's whole layout.
- ❌ The rhythm `small kicker label → headline → paragraph → three cards`,
  repeated section after section. Vary the structure of every block.
- ❌ Decorative micro-labels, spec codes, unit captions or eyebrow chips
  stacked on every element. The owner reads these as slop on sight.
- ❌ Purple/indigo/blue gradients. The accent is lime `#84cc16` on near-black.
- ❌ Lukewarm type. No 400→600 weight steps, no timid size ramps.

**Always:**
- ✅ Extreme scale: display runs to ~11rem against ~15px body (≈10x), weights
  are 900 or 400 with nothing in between.
- ✅ Photography is art-directed full-bleed with ONE unified grade, never
  stock dropped into card slots: food keeps colour (`saturate 1.06 /
  contrast 1.07`), people and places take the lime duotone (`grayscale +
  #84cc16 mix-blend colour`), everything carries the shared grain overlay.
- ✅ Every service the business runs is reachable from the homepage
  (kitchen, app, supplements via Nutrabay, corporate, gym/trainer partners,
  franchise, digital plans, referrals, TDEE tool, ops pages).
- ✅ Run an explicit anti-slop audit pass before shipping any UI work.


> **2026-07-23 (rev 2) — ONE system, no exceptions.**
> The earlier "Beast Mode homepage vs Lab Dossier interior" split is **dead**.
> It produced three coexisting design generations (Syne + DM Sans on 14 pages,
> Barlow + Space Mono on 8, Barlow + Archivo on 1) and five typefaces on
> `/plans/[slug]` alone. There is now exactly one system, defined below, and it
> governs **every public surface**: homepage, catalog, plan detail, company
> pages, legal pages, chrome.
>
> Deleted from the vocabulary entirely: **Syne**, **DM Sans**, **Space Mono**.
> Display is Barlow Condensed. Body is Archivo. Nothing else.

Direction: **editorial precision** for a *verified-intake* health OS. It should
read like a precision instrument, never like a generic dark-SaaS landing page.

## The one-line brief
Measured, flush-left, high-contrast, near-flat. Data is the hero. Colour is rationed.
Whitespace and hairlines do the work that glows and gradients do in generic AI designs.

## Tokens (locked)

These are the **only** colours. They exist as CSS custom properties in
`app/globals.css` as `--ff-*`. Use the variables, never the literals.

```
--ff-bg          #070707   page
--ff-panel       #050504   recessed band (darker, not lighter)
--ff-panel-2     #0c0c0a   hover / raised row
--ff-ink         #f7f7f5   headlines, key values          19.0:1
--ff-mute        #9a9a94   body copy                       7.1:1  AA
--ff-dim         #85857e   metadata, captions, fine print  5.4:1  AA
--ff-rule        #232320   the primary structural device (1px rules)
--ff-rule-2      #33332f   hover / emphasis rule
--ff-lime        #84cc16   THE accent — one job per section, never decorative
--ff-lime-light  #a3e635   only for a single live/active value
--ff-radius      0px       square corners, no exceptions
```

**`dim` is `#85857e`, not `#5a5a57`.** The old value computed to 2.65:1 and
failed WCAG AA everywhere it was used, which was ~100 times per page at 8–11px.
Every contrast failure on this site traced back to that one token.

**No category-coded accent colours.** No purple `#c084fc`, sky `#38bdf8`, amber
`#f59e0b`, teal `#2dd4bf`, pink `#f9a8d4`. Categories are distinguished by
label and rule weight, not hue. Lime is the only chromatic value on the site.

## Type

Two faces, both loaded once via `next/font` in the root layout. No `@import`
inside `<style>` tags, ever: it blocks render and forces a second round trip.

- **Display** — Barlow Condensed 800/900, UPPERCASE, flush-LEFT, tight leading
  (0.83–0.95). Ragged right. Never centered as a block. Every `<h1>`/`<h2>` on
  every page uses this. Helper: `.ff-display`.
- **Labels** — Barlow Condensed 700, 12–13px, UPPERCASE, letter-spacing 0.28em,
  colour `dim`. Helper: `.ff-tag`.
- **Body** — Archivo, 15–16px, colour `mute`, line-height 1.6, max-width ~62ch,
  flush-left.

**Minimum type size is 12px.** Below that it is unreadable on the mid-range
Android phones our customers actually order from.

## Layout
- Content max-width 1180px, but compositions are **asymmetric** — offset columns, not centered stacks.
- Every major section opens with an **index header**: `[ 001 ]  SECTION LABEL ───────────────────`
  (mono number + mono label + a full-width hairline). This is the spine of the page.
- Full-bleed hairline rules separate sections. Vertical rhythm: 96–140px section padding.
- Data shown as **spec tables** (hairline-separated rows, mono values) and **readout panels**
  (nutrition-label / instrument styling), not as uniform icon cards.

## Signature devices (use these instead of generic patterns)
1. **Readout bar** — a full-bleed band welded to a section edge, hairline top
   rule, condensed 900 numerals against `dim` labels. Embodies verified intake.
2. **Spec tables** — real `<table>` elements, flush rows, hairline dividers,
   condensed values. If it is tabular data it is a `<table>`, not a grid of
   divs: assistive tech cannot parse the latter.
3. **Directory rows** — `.ff-svc`, a hairline-separated link list that shifts
   right and takes a lime border on hover. Replaces card grids for indexes.
4. **Full-bleed alternating editorial blocks** — image on one side, type on the
   other, sides alternate down the page. Replaces the 3-up card grid.

## Accessibility (non-negotiable, part of the design)
- Every text/background pair clears **WCAG AA**: 4.5:1 normal, 3:1 large.
  The token ramp above is pre-verified. Do not introduce new greys.
- Never encode meaning in a glyph alone. A "not included" cell needs a real
  text alternative, not a `·` at 1.5:1.
- Interactive targets **44×44 minimum** on touch. Pad the hit area if the
  visual needs to stay small.
- Overlay menus lock body scroll, move focus in, trap it, and restore it.
- Respect `prefers-reduced-motion` on every transform.

## Do NOT (AI-slop audit — reject on sight)
- ❌ Radial-gradient glow backgrounds / colored box-shadows / neon glows.
- ❌ Gradient text or gradient fills on type.
- ❌ Glassmorphism (backdrop-blur frosted cards).
- ❌ Everything centered; centered hero with a chip + headline + two pill buttons.
- ❌ Uniform 3-column icon+title+paragraph card grids used as the only layout.
- ❌ **Any** border-radius. Radius is 0. Not 2px, not 6px, and never 999px pills.
- ❌ Emoji. Decorative sparkles. Fake dashboards with lots of fake charts.
- ❌ Accent colour used decoratively. Lime is a scalpel: one purpose per section.
- ❌ Syne, DM Sans, Space Mono, Inter, Roboto, system-ui. Two faces only.

## Machine readability (this is design work too)
Discovery increasingly runs through answer engines, and they read structure,
not art direction. Every public page carries:
- A `canonical`, a real `<title>`, and a real description.
- JSON-LD where the page states facts: `Organization` + `LocalBusiness` on the
  homepage, `Product`/`Offer` on plan pages, `FAQPage` on the FAQ.
- An entry in `app/sitemap.ts`. A page not in the sitemap does not exist.
- Semantic HTML. Tabular data in `<table>`, headings in order, one `<h1>`.

Never advertise a capability the product does not ship.

## Motion
- Restrained. Fade/translate on reveal only (opacity + 12–18px y, 0.6s, ease `[0.16,1,0.3,1]`).
- Respect `prefers-reduced-motion` (skip transforms).
- No parallax, no bouncing, no auto-playing hero video.

## Copy
- No em dashes anywhere (use commas, colons, periods). Sentence case body, UPPERCASE display.
- Concrete and specific over adjectives. Numbers over claims. English only, Pune-first.
