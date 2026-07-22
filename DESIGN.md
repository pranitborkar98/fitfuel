# FitFuel — DESIGN.md (art direction)

> **2026-07-23 — Homepage direction pivot (owner directive).**
> The **homepage (`app/page.tsx`)** now runs a **"Beast Mode"** treatment that
> intentionally supersedes the flat rules below: an animated canvas particle
> constellation + drifting aurora in the hero, count-up stats, cursor-spotlight
> gradient-border cards, a live animated readout, and richer scroll motion. On
> the homepage, controlled glow / gradient-border / spotlight ARE allowed. This
> is deliberate, not a bug. Everything stays lime-on-near-black, keeps the
> Barlow + Space Mono identity, is fully code-driven (zero images), and respects
> `prefers-reduced-motion`. The "Lab Dossier" rules below still govern interior
> app/marketing pages until they are pivoted too.

Direction (interior pages): **"Lab Dossier"** — editorial precision for a
*verified-intake* health OS. It should read like a precision instrument /
scientific record, never like a generic dark-SaaS landing page.

## The one-line brief
Measured, flush-left, high-contrast, near-flat. Data is the hero. Colour is rationed.
Whitespace and hairlines do the work that glows and gradients do in generic AI designs.

## Tokens (locked)
```
bg          #080808     page
panel       #0c0c0c     raised surface (flat, no gradient)
panel-2     #101010     nested surface
hairline    #1e1e1e     the primary structural device (1px rules everywhere)
hairline-2  #2a2a2a     hover / emphasis rule
text        #f5f5f4     headlines, key values
mute        #8a8a86     body copy
dim         #5a5a57     metadata, ticks, captions
lime        #84cc16     THE accent — one job per section, never decorative
lime-light  #a3e635     only for a single live/active value
```
No other accent colours except the condition-coded chips in the plan index (kept muted).

## Type
- **Display** — Barlow Condensed 800/900, UPPERCASE, flush-LEFT, tight leading (0.9–0.95),
  large (up to `clamp(2.5rem, 7vw, 6.5rem)`). Ragged right. Never centered as a block.
- **Data / labels** — monospace (`'Space Mono', ui-monospace, monospace`), 10–12px, UPPERCASE,
  letter-spacing 0.12–0.2em, colour `dim`. Used for eyebrows, section numbers, units, captions,
  table values. This mono is the signature.
- **Body** — Inter, 15–16px, colour `mute`, line-height 1.6, max-width ~62ch, flush-left.

## Layout
- Content max-width 1180px, but compositions are **asymmetric** — offset columns, not centered stacks.
- Every major section opens with an **index header**: `[ 001 ]  SECTION LABEL ───────────────────`
  (mono number + mono label + a full-width hairline). This is the spine of the page.
- Full-bleed hairline rules separate sections. Vertical rhythm: 96–140px section padding.
- Data shown as **spec tables** (hairline-separated rows, mono values) and **readout panels**
  (nutrition-label / instrument styling), not as uniform icon cards.

## Signature devices (use these instead of generic patterns)
1. **Index headers** — `[ 00N ] LABEL` + hairline, mono.
2. **Readout panel** — a bordered instrument block with mono metrics + tick marks (embodies verified intake).
3. **Spec tables** — flush rows, hairline dividers, mono right-aligned values.
4. **Tick rulers / measurement marks** as texture (not glows).
5. **Marquee** as a thin mono ticker, understated.

## Do NOT (AI-slop audit — reject on sight)
- ❌ Radial-gradient glow backgrounds / colored box-shadows / neon glows.
- ❌ Gradient text or gradient fills on type.
- ❌ Glassmorphism (backdrop-blur frosted cards).
- ❌ Everything centered; centered hero with a chip + headline + two pill buttons.
- ❌ Uniform 3-column icon+title+paragraph card grids used as the only layout.
- ❌ Rounded pill chips scattered as decoration; oversized border-radius (keep radius ≤ 6px, often 0–2px).
- ❌ Emoji. Decorative sparkles. Fake dashboards with lots of fake charts.
- ❌ Accent colour used decoratively. Lime is a scalpel: one purpose per section.

## Motion
- Restrained. Fade/translate on reveal only (opacity + 12–18px y, 0.6s, ease `[0.16,1,0.3,1]`).
- Respect `prefers-reduced-motion` (skip transforms).
- No parallax, no bouncing, no auto-playing hero video.

## Copy
- No em dashes anywhere (use commas, colons, periods). Sentence case body, UPPERCASE display.
- Concrete and specific over adjectives. Numbers over claims. English only, Pune-first.
