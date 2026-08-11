# FitFuel — DESIGN.md

**One authority.** This file. Not a skill, not AGENTS.md, not a copy. The last
version of this system lived in three files at once, so deleting one changed
nothing and the direction could never actually move. If a rule is not in this
file, it is not a rule.

**Version 3 — 2026-08-09.** Supersedes the Instrument System (rev 1–2,
2026-07-23 → 2026-08-03). Revisable. See §0.

---

## 0. Why this is not "locked"

The previous version opened with "the art direction is locked and has already
swung twice." It then swung four more times. Locking did not stop the swinging;
it just meant every swing had to be smuggled in as a bug fix.

The direction moves when there is a **stated reason and a measured defect**.
It does not move on preference, and it does not move by regenerating a page from
scratch. Record the reason here when it moves.

**What v3 changes and why:**

| Change | Defect it fixes |
|---|---|
| Two type scales | There was one scale, built for a landing page, being used on a data product. The Shop's biggest headline is 46px with no `clamp()`. |
| App-first, not page-first | 15,683 lines went into the marketing homepage; 7,721 into the entire dashboard. The product is the 130 routes, not the front door. |

---

## 1. What FitFuel is

A **daily-use health application** that delivers the food it measures. Not a
restaurant site with a dashboard attached.

The moat is a closed loop: we cook the food, so the macro log is *true* rather
than self-reported. The scale talks to the browser over BLE. The coach
recalculates from your own numbers and shows the arithmetic. The kitchen has a
production engine and a franchise model behind it.

None of that is a landing-page argument. It is a surface someone opens three
times a day. **Design for the third open, not the first visit.**

---

## 2. Colour — unchanged, and not reopening

Near-black ground, lime accent. These are the only colours. Settled, and the
owner has said so directly. Do not propose a second chromatic, a warm ground,
a light mode, or a per-category palette. Not orange, not terracotta, not bone.

```
--ff-bg          #070707   page
--ff-panel       #050504   recessed band (darker, never lighter)
--ff-panel-2     #0c0c0a   hover / raised row
--ff-ink         #f7f7f5   18.8:1  AAA   headlines, key values
--ff-mute        #9a9a94    7.1:1  AAA   body copy
--ff-dim         #85857e    5.4:1  AA    metadata, captions
--ff-rule        #232320   the primary structural device, 1px
--ff-rule-2      #33332f   hover / emphasis
--ff-lime        #84cc16   10.2:1 AAA    THE accent
--ff-lime-light  #a3e635   one live/active value only
--ff-radius      0px
```

Derived, not new greys: `trough #1c1c1a` (bar troughs), `fat #5f5f59`,
`wash rgba(132,204,22,0.1)` (selected segment), `onLime #06140b` (9.6:1).

**Lime is a scalpel: one purpose per section**, never decorative. No
category-coded hues. Semantic danger is `#dc2626`; never encode meaning in
hue alone, pair it with a label.

Warmth for a food brand comes from the image grade (§5), not from the palette
and not from the headline face. That has been the answer since rev 2 and it is
still the answer; what is missing is the photography, not a second colour.

---

## 3. Type — three faces, two scales

Faces are unchanged and are not the problem. Loaded once via `next/font` in the
root layout. No `@import`, no `<link>`, no font loading in a CSS module.

- **Display** — Barlow Condensed 800/900, UPPERCASE, flush left, tight leading.
- **Body** — Archivo 400/500.
- **Data** — JetBrains Mono 500/700, `font-variant-numeric: tabular-nums`.
  Every number that sits in a column: macros, prices, times, weights.

### Two scales, and this is the part that was missing

The old file had one ramp — "display runs to ~11rem against ~15px body" — and
it was written for a marketing page. Applying it to a nutrition log is absurd;
*not* applying it left the Shop with a 46px fixed headline. Both failures came
from having one scale.

**Editorial scale** — homepage, plan pages, company pages, blog. Argues.

```
display   clamp(2.6rem, 7vw, 9rem)      900, lh 0.86, ls -0.035em
sub       clamp(1.6rem, 3.2vw, 2.8rem)  800
body      16px / 1.65, max 68ch
label     12px mono, 0.2em, dim
```

**App scale** — dashboard, nutrition, metrics, admin, driver, cart. Reports.

```
screen    22px  800   the one screen title
section   16px  800   a card or block heading
row       14px  500   a list row
body      14px / 1.55
figure    28–56px condensed 900, tabular   the number being reported
label     12px mono, 0.18em, dim
```

**12px is the floor on both scales.** Below that it is unreadable on the
mid-range Android phones our customers order from. This is legibility, not
taste.

A screen uses one scale. Never both.

---

## 4. Layout

- **Editorial**: max 1180px, asymmetric, offset columns. Full-bleed hairlines
  between sections, 96–140px rhythm. `clamp()` everything — a fixed-px headline
  on a marketing page is a bug.
- **App**: max 1280px, 12-column, 4/8px spacing rhythm, dense. Sidebar at
  ≥1024px, bottom tab bar below it, max 5 tabs. Persistent nav on every screen;
  never trap the user in a sub-flow.
- **Radius 0.** Still true, on both grounds. It is the one thing that has held
  across all six directions and it is the cheapest identity the site owns.
- Structure is 1px hairlines and recessed panels. Not shadows.

### Signature devices

1. **Readout bar** — full-bleed band welded to a section edge, hairline top,
   condensed 900 numerals over mono `dim` labels.
2. **Spec tables** — real `<table>`. Tabular data is never a grid of divs;
   assistive tech cannot parse the latter.
3. **Directory rows** — hairline-separated full-width rows, shift right and take
   a lime left border on hover. Replaces card grids for any index.
4. **Alternating full-bleed editorial blocks** — image one side, type the other.

---

## 5. Photography

The honest state: **8 photographs exist and 78 slots are empty**, on a site that
sells 48 named dishes. No palette or layout decision beats fixing that.

The pipeline is now built and verified, so filling those slots is a command
rather than a project:

    npm run images:status    what has landed, per folder
    npm run images:plan      what would be generated, spends nothing
    npm run images:fill      generate every slot still empty
    npm run images:check     fail if the slot names have drifted apart

Slot names and prompts live in `scripts/image-slots.mjs`, shared by the
generator and the coverage report. `lib/site-images.ts` stays the site's source
of truth and `images:check` fails if the two disagree, because they silently did
for months: the generator wrote `goal-fatloss` into a flat directory while the
resolver looked for `lose-fat` in `ai/goals/`, and every generated file was
invisible to the page.

Generation needs a key. `GEMINI_API_KEY` in `~/.claude/.env` is preferred and
has a free tier; `OPENAI_API_KEY` is the fallback and is currently out of
credits.

- One unified grade. Food keeps colour: `saturate(1.06) contrast(1.07)`.
  Nothing else. No brightening, no gradient vignette.
- People and places take the lime duotone: grayscale + `#84cc16` at
  `mix-blend-mode: color`.
- Shared grain overlay: `feTurbulence` data URI, `opacity ~0.055`,
  `mix-blend-mode: overlay`, fixed, `pointer-events: none`.
- **A stand-in may only hold a slot whose subject it actually matches.** A slot
  with no honest photograph renders type. Never a wrong picture, never a repeat,
  never a stock URL.

---

## 6. Motion

- Reveal: opacity 0→1 + translateY 12–16px, 0.6s, `cubic-bezier(.16,1,.3,1)`.
- App feedback: 150–300ms, ease-out entering, ease-in exiting.
- Anything that loads >300ms gets a skeleton, not a spinner.
- Respect `prefers-reduced-motion` on every transform.
- No parallax, no infinite loops, no autoplay hero video, no letter-spacing
  animation, no 3D perspective.

---

## 7. Code conventions

- Server components by default. `"use client"` only where there is real state.
- CSS Modules or inline `style={{}}` built from a theme module. **No Tailwind
  utilities or shadcn/Radix in page bodies.** Existing Tailwind in `/admin` and
  `/driver` is a migration target, not a licence.
- Colour comes from `--ff-*` variables. Never a hex literal in a component.
- One theme module per surface, re-exporting shared tokens. Not a new ramp.

---

## 8. Accessibility — part of the design

- Every text/background pair clears **AA**: 4.5:1 normal, 3:1 large. The ramps
  in §2 are pre-verified; do not introduce new greys.
- Functional (non-decorative) borders and control boundaries clear **3:1**.
- Touch targets **44×44 minimum**. Pad the hit area if the visual stays small.
- Never encode meaning in a glyph or hue alone.
- Overlays lock body scroll, move focus in, trap it, restore it on close.
- Sequential headings, one `<h1>`, focus moved to main on route change.

---

## 9. Machine readability

Every public page: `canonical`, real `<title>` and description, an entry in
`app/sitemap.ts`, semantic HTML. JSON-LD where the page states facts —
`Organization` + `LocalBusiness` on the homepage, `Product`/`Offer` on plans,
`FAQPage` on the FAQ. A page not in the sitemap does not exist.

App surfaces are `noindex` but still need real titles and deep-linkable URLs.

---

## 10. Copy

- No em dashes. Commas, colons, periods.
- Sentence case body, UPPERCASE display. English, Pune-first.
- Numbers over adjectives.
- **Never advertise a capability the product does not ship.** That is a
  prohibition on lying, *not* an instruction to narrate the backlog. Do not
  apologise on the page. Say what is true and stop.

---

## 11. Reject on sight

- Radius > 0. Pills. Rounded cards.
- Radial-gradient glows, coloured box-shadows, neon, gradient text,
  glassmorphism / backdrop-blur.
- Centred hero with a chip, a headline and two pill buttons.
- Uniform 3-up or 4-up icon+title+paragraph grids as a section's whole layout.
- The rhythm `kicker → headline → paragraph → three cards`, repeated.
- Serial-numbered sections (`01 —`), decorative eyebrow chips, spec codes,
  unit captions stacked on every element. Over-annotation is the house sin.
- Emoji as icons. Fake dashboards. Fake charts.
- Inter, Roboto, system-ui, Syne, DM Sans, Space Mono, Fraunces.
- Accent used decoratively, or a hue that means two things.
- A fixed-px type size on a marketing page.
- **Any palette advice from the generic `.claude/skills/` packages.** Tested
  2026-08-09: for this product they return tracking-blue + delivery-orange,
  Fira Code, and "alert pulse/glow." Use them for UX and accessibility
  reasoning, which is genuinely good. Not for visual tokens.

Run this list before calling any UI work done.
