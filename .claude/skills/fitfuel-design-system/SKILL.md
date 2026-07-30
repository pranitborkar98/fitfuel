---
name: fitfuel-design-system
description: FitFuel's locked art direction — the Instrument System. Tokens, type, layout, signature devices, and the anti-slop reject list. Load this BEFORE any UI, styling, layout, component, page, colour, typography, animation or design work on this repo, and before following any generic design skill (ui-styling, ui-ux-pro-max, design, design-system, brand, banner-design, slides), whose defaults this overrides.
---

# FitFuel Design System — the Instrument System (locked)

`DESIGN.md` at the repo root is the source of truth. This file is its
operational digest: what to type when writing code. If the two ever disagree,
`DESIGN.md` wins and this file is the thing that is stale — fix it.

Reference implementation: `app/_hp/theme.ts` (style helpers) and
`app/_hp/hp.module.css` (the homepage, built to this system). Tokens live in
`app/globals.css` as `--ff-*`.

**Do not invent tokens.** There is no grey that is not on the ramp below.

---

## 0. Precedence — read this before any other design skill

Every other design skill in `.claude/skills/` is a generic third-party package.
Their defaults are, item for item, the things this system bans: shadcn/ui,
Tailwind utility classes, rounded cards, glassmorphism, gradient fills, glow
shadows, Inter, 161-palette pickers, 57 font pairings.

Use them only for process and structure. Take **zero** visual decisions from
them. Colour, type, radius, spacing, motion and component styling come from
this file, always.

---

## 1. The brief

Editorial precision for a verified-intake health OS. It reads like a precision
instrument, never like a generic dark-SaaS landing page. Measured, flush-left,
high-contrast, near-flat. Data is the hero. Colour is rationed. Whitespace and
1px hairlines do the work that glows and gradients do elsewhere.

Four rules govern everything, no exceptions:

1. Radius 0.
2. 1px hairlines do the structural work — no shadows, no glows, no glass.
3. Generated texture (grain), never faked depth.
4. Type scales with the viewport and moves with the scroll.

---

## 2. Colour — the only colours

Use the CSS variables, never the literals.

| Variable | Value | Use | Contrast on bg |
|---|---|---|---|
| `--ff-bg` | `#070707` | page | — |
| `--ff-panel` | `#050504` | recessed band — DARKER than page, never lighter | — |
| `--ff-panel-2` | `#0c0c0a` | hover / raised row | — |
| `--ff-ink` | `#f7f7f5` | headlines, key values | 19.0:1 |
| `--ff-mute` | `#9a9a94` | body copy | 7.1:1 AA |
| `--ff-dim` | `#85857e` | metadata, captions, fine print | 5.4:1 AA |
| `--ff-rule` | `#232320` | 1px rules — the primary structural device | — |
| `--ff-rule-2` | `#33332f` | hover / emphasis rule | — |
| `--ff-lime` | `#84cc16` | THE accent — one job per section | — |
| `--ff-lime-light` | `#a3e635` | a single live/active value only | — |
| `--ff-radius` | `0px` | square corners | — |

A recessed band is darker than the page. A lighter band reads as a card
floating on a page; a darker one reads as a well cut into it, which is the
instrument register.

`dim` is `#85857e`, **not** `#5a5a57`. The old value computed to 2.65:1 and
failed AA roughly a hundred times per page. Every contrast failure on this site
traced back to that one token.

**No category-coded accents.** No purple `#c084fc`, sky `#38bdf8`, amber
`#f59e0b`, teal `#2dd4bf`, pink `#f9a8d4`, and no per-condition palette.
Categories are distinguished by label and rule weight, never by hue. Lime is
the only chromatic value on the site and it is a scalpel: one purpose per
section, never decorative.

---

## 3. Type — three faces, loaded once in the root layout

| Role | Face | Variable | Treatment |
|---|---|---|---|
| Display | Barlow Condensed 900 | `--ff-cond` / `--font-barlow-condensed` | UPPERCASE, flush-LEFT, line-height 0.83–0.95, letter-spacing -0.02em, ragged right |
| Body | Archivo 400 | `--ff-body` / `--font-archivo` | 15–16px, `--ff-mute`, line-height 1.6, max-width 62ch, flush-left |
| Data | JetBrains Mono 500/700 | `--font-mono` | labels, and every number that sits in a column |

Extreme scale: display runs to ~11rem against ~15px body, roughly 10x. Weights
are 900 or 400 with nothing in between — no 400→600 steps, no timid ramps.

Labels are mono, 12px, UPPERCASE, letter-spacing 0.22–0.28em, colour `dim`.
Numerals that must line up (macros, prices, times) are mono with
`font-variant-numeric: tabular-nums`; condensed 900 is for headline-scale
figures only.

**Minimum type size is 12px.** Below that it is unreadable on the mid-range
Android phones our customers actually order from.

Fonts load once via `next/font` in `app/layout.tsx`. Never `@import` a font
inside a `<style>` tag or a CSS module — it blocks render and costs a second
round trip.

### Faces that are deleted from the vocabulary

**Inter, Roboto, system-ui, Syne, DM Sans, Space Mono, Fraunces.**

Inter is the single most recognisable AI-generated-site tell. Syne, DM Sans and
Space Mono are the pre-rev-2 generations that produced five typefaces on one
page. Fraunces was a display-serif experiment (`app/preview/a`, `app/preview/c`)
proposing a warmer voice for food; it was **rejected 2026-07-30** — the warmth
belongs in the photography grade, not the headline face, and swapping the
display face would rebuild all 30 homepage components for a preference rather
than a defect.

---

## 4. Layout

- Content max-width **1180px**, padding `0 clamp(18px,4vw,40px)`.
- Compositions are **asymmetric** — offset columns, never centered stacks.
- Section padding `clamp(64px,8vw,120px) 0`. Full-bleed hairlines separate sections.
- Each section opens with **one** mono label and a full-width hairline rule.
  One label per section and nothing else at section level. The earlier version
  of this — bracketed serial number plus right-hand caption — is the
  over-annotation habit the owner has rejected by name.
- Texture is generated grain: `feTurbulence` in a data URI, `opacity ~0.055`,
  `mix-blend-mode: overlay`, fixed and `pointer-events: none`. No image
  request, nothing to 404.

### Signature devices — use these instead of generic patterns

1. **Readout bar** — full-bleed band welded to a section edge, hairline top
   rule, condensed 900 numerals against dim labels. Embodies verified intake.
2. **Spec tables** — real `<table>` elements, flush rows, hairline dividers,
   condensed values. If it is tabular data it is a `<table>`, not a grid of
   divs: assistive tech cannot parse the latter.
3. **Directory rows** — hairline-separated link list that shifts right and
   takes a lime border on hover. Replaces card grids for indexes.
4. **Full-bleed alternating editorial blocks** — image one side, type the
   other, sides alternate down the page. Replaces the 3-up card grid.

---

## 5. Photography

Art-directed full-bleed with ONE unified grade, never stock dropped into card
slots.

- Food keeps colour: `saturate(1.06) contrast(1.07)`.
- People and places take the lime duotone: grayscale + `#84cc16` `mix-blend-mode: color`.
- Everything carries the shared grain overlay.

This is the part of the system that has never shipped, and it is the reason the
page reads cold. Warmth is an image-grade problem, not a typography problem.

---

## 6. Motion

Native CSS scroll-driven animation (`animation-timeline: view()`) behind an
`@supports` guard, so sections stay server components and the page ships zero
JavaScript for animation. Where unsupported, everything degrades to plain
visibility.

Restrained: fade and translate on reveal only — opacity plus 12–18px y, ~0.6s,
ease `[0.16, 1, 0.3, 1]`. No parallax, no bouncing, no auto-playing hero video.
`prefers-reduced-motion` switches the lot off.

Do not add Framer Motion or any client-side animation library.

---

## 7. Code conventions

- **React server components** by default. Add `"use client"` only where an
  interaction genuinely requires it.
- **CSS Modules** (`hp.module.css` pattern) or **inline `style={{}}` objects**
  built from the `theme.ts` helpers: `display()`, `sub()`, `body()`, `label()`,
  `figure()`, `num()`, plus `WRAP` and `SECTION`.
- **No Tailwind utility classes in page bodies.** Tailwind appears only on the
  root layout `<body>`.
- **No shadcn/ui, no Radix, no component library.** Components are written here.
- Small scoped `<style>` blocks are fine for hover, media and keyframes.
- Semantic HTML, headings in order, one `<h1>` per page.

---

## 8. Accessibility — part of the design, not a later pass

- Every text/background pair clears **WCAG AA**: 4.5:1 normal, 3:1 large. The
  ramp above is pre-verified. Do not introduce new greys.
- Never encode meaning in a glyph alone. A "not included" cell needs real text,
  not a `·` at 1.5:1.
- Interactive targets **44×44 minimum** on touch. Pad the hit area if the
  visual needs to stay small.
- `:focus-visible` gets a lime outline. The root layout carries a skip-link.
- Overlay menus lock body scroll, move focus in, trap it, and restore it.

---

## 9. Machine readability — this is design work too

Every public page carries a `canonical`, a real `<title>` and description,
JSON-LD where the page states facts (`Organization` + `LocalBusiness` on the
homepage, `Product`/`Offer` on plan pages, `FAQPage` on the FAQ), and an entry
in `app/sitemap.ts`. A page not in the sitemap does not exist.

Never advertise a capability the product does not ship.

---

## 10. Copy

No em dashes anywhere — use commas, colons, periods. Sentence case body,
UPPERCASE display. Concrete and specific over adjectives, numbers over claims.
English only, Pune-first.

---

## 11. AI-slop audit — reject on sight

Silence equals defaults: anything left unspecified gets filled with the
statistically average choice, and that average **is** the slop look. So these
are hard negatives. Breaking one is a bug, not a matter of taste.

- ❌ **Any** border-radius. Radius is 0. Not 2px, not 6px, never 999px pills.
- ❌ Inter, Roboto, system-ui, Syne, DM Sans, Space Mono, Fraunces.
- ❌ Radial-gradient glow backgrounds, coloured box-shadows, neon glows.
- ❌ Gradient text or gradient fills on type.
- ❌ Glassmorphism, backdrop-blur, frosted cards.
- ❌ Everything centered. Centered hero with a chip, a headline and two pill buttons.
- ❌ Uniform 3-column icon + title + paragraph card grids as a section's whole layout.
- ❌ The rhythm `kicker label → headline → paragraph → three cards`, repeated
  section after section. Vary the structure of every block.
- ❌ Decorative micro-labels, spec codes, unit captions or eyebrow chips stacked
  on every element. The owner reads these as slop on sight.
- ❌ Purple/indigo/blue gradients, and per-category accent hues.
- ❌ Lukewarm type — 400→600 weight steps, timid size ramps.
- ❌ Emoji. Decorative sparkles. Fake dashboards full of fake charts.
- ❌ Accent colour used decoratively.
- ❌ Tailwind utilities or shadcn components in page bodies.

Run this audit explicitly before calling any UI work done.

---

## 12. What this file replaced

The version before 2026-07-30 was reconstructed from an old tracker and had
gone stale against `DESIGN.md` rev 2. It specified **Inter** for body, **Space
Mono** for eyebrows, **radius 14–18** cards, **lime glow shadows**
(`rgba(132,204,22,0.35)`) on CTAs, `#080808`/`#101010`/`#1f1f1f` surfaces, and
a full per-category and per-condition accent palette.

Every one of those is now banned. If you see them in code, that code predates
the system and is a migration target, not a precedent.
