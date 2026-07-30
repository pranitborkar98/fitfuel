# Feedback on "FitFuel Homepage v2.dc.html"

**Date:** 2026-07-30
**Reviewed:** the actual file in the Claude Design project (`163cdbd9`), against
`DESIGN.md` and the `fitfuel-design-system` skill.

Paste sections 0–6 into Claude Design as the next instruction. Section 0 is the
most important line in this document.

---

## 0. Rules of engagement for the next round

**Do not regenerate this page. Patch it.**

The art direction has already swung twice. Every full regeneration re-decides
radius, faces, colour and rhythm from scratch, and re-deciding is how it swings a
third time. The next round is a **diff**: change only the numbered items in
section 2, leave every other line of markup byte-identical.

If you believe something outside the list should change, say so in a sentence and
wait. Do not act on it.

---

## 1. What is already correct — do not touch any of it

This is not a failed design. Measured against the locked system, the bones pass:

- Radius 0 throughout. Zero `border-radius` declarations in 1,133 lines.
- Zero `box-shadow`, zero `text-shadow`, zero glow. Structure is 1px `#232320`
  hairlines, correctly.
- Three faces, no fourth: Barlow Condensed (46 uses), Archivo (40), JetBrains
  Mono (60). No Inter, no Syne, no DM Sans, no Space Mono, no Fraunces.
- Token ramp is exact: `#070707` page, `#050504` recessed band (darker than the
  page, which is right), `#f7f7f5` / `#9a9a94` / `#85857e` text, lime `#84cc16`.
  No category-coded hues anywhere.
- Real `<table>`s and `aria-labelledby` on every section. Semantics are good.
- The copy is specific and numeric: "eight reviews", "126 plans", "1,434 kcal
  average", "FSSAI 21523035002815". Numbers over claims, as specified.

Keep all of it.

---

## 2. The reject list — fix exactly these

### 2.1 Delete the section numbers

Ten sections open `01 — The trial day`, `02 — The week`, … `10 — Questions`.

Serial-numbered section headers are the single over-annotation habit this project
has rejected by name. Remove the number and the dash. The label alone, mono,
12px, uppercase, `#85857e`, one per section, then the hairline. Nothing else at
section level.

> `01 — The trial day` → `THE TRIAL DAY`

(Note: `DESIGN.md` line 125 still prescribes `[ 001 ] SECTION LABEL ───`. That
line is stale and is what produced this. It is being corrected. Follow the
instruction here.)

### 2.2 Remove all 38 em dashes

The copy rule is: no em dashes anywhere. Use commas, colons, periods. There are
38 in the file, including inside the section labels and the hero paragraph:

> "…at your door by **08:00 — six mornings a week**" → "…at your door by 08:00,
> six mornings a week."

> "Fifteen areas, one kitchen — we would rather serve…" → "Fifteen areas, one
> kitchen. We would rather serve…"

### 2.3 Kill the glassmorphism (2 instances)

- Line 135, fixed header: `backdrop-filter: blur(18px) saturate(160%)`
- Line 708, sticky bottom bar: `backdrop-filter: blur(...)`

Frosted glass is on the reject-on-sight list. Replace both with **solid**
`#070707` and a 1px `#232320` bottom (or top) hairline. No transparency, no blur.

### 2.4 Kill the lime gradient

Line 136, the scroll-progress bar: `linear-gradient(90deg,#84cc16,#a3e635)`.

Gradient fills are banned and `--ff-lime-light` is reserved for a single live
value, not for a ramp. Make the bar flat `#84cc16`, 1px tall, not 2px.

### 2.5 Cut the motion from eleven devices to one

There are 11 keyframe animations: `v2Deal`, `v2Kb`, `v2Kin`, `v2Marquee`,
`v2Pan`, `v2Pulse`, `v2Rise`, `v2Spin`, `v2Wipe`, `v2GrowX`, `v2GrowY`. Two run
`infinite`. This is where the page stops reading as an instrument.

The spec allows exactly one reveal: **opacity 0→1 plus translateY 12–18px, 0.6s,
`cubic-bezier(0.16, 1, 0.3, 1)`.** Nothing else.

Delete outright:
- `v2Deal` — a 3D card deal, `translateZ(-220px) rotateX(14deg)`. There is no
  perspective in this system.
- `v2Marquee` — a 34s infinite scrolling ticker.
- `v2Pulse` — a 2.4s infinite pulse. Nothing on this page should breathe forever.
- `v2Spin`, `v2Kb` (14s Ken Burns zoom on the hero photo), `v2Pan`, `v2Wipe`,
  `v2GrowX`, `v2GrowY`.
- `v2Kin` — animating `letter-spacing` from 0.08em to -0.03em. Type does not
  reflow on load.

Keep `v2Rise`, but correct it: `28px` → `16px`, `.9s` → `.6s`.

### 2.6 Ration the lime

Above the fold the accent currently holds five jobs at once: the logo tile, the
"Kharadi kitchen · cooking now" kicker, the header `Order · ₹420` button, the
`Start with one day` button, and the countdown digits.

Lime is a scalpel: **one job per section.** In the hero it is the primary CTA
only. Kicker goes to `#85857e`. Countdown digits go to `#f7f7f5`. Header order
button becomes an outline: transparent fill, 1px `#232320` border, `#f7f7f5`
label. Logo mark loses the lime tile.

### 2.7 Drop the second hero button

`Start with one day · ₹420` (solid) next to `See tomorrow's four meals`
(outlined) is the exact "headline plus two buttons" pattern on the reject list.

Keep the priced CTA as a button. Demote the second to a plain lime text link with
a 1px underline, set below it. One button in the hero.

### 2.8 Break the alternating band rhythm

Every second section is `background:#050504; border-top:1px solid #232320`, at
`padding: clamp(64px,9vw,130px) 0`, for twelve sections. Identical container,
twelve times, is the "same rhythm section after section" failure at section
level rather than card level.

At least three sections must break it: one full-bleed with no side padding, one
welded readout bar with no top gap against the section above it, one that runs to
the viewport edge. Also vary the section padding, not just the background.

### 2.9 The 4-up grids

`grid-template-columns: repeat(4, 1fr)` appears 8 times. Uniform equal-column
grids are the pattern the four signature devices exist to replace. Convert at
least half to **directory rows** (hairline-separated full-width rows that shift
right and take a lime left border on hover) or to a real spec `<table>`.

---

## 3. The hero photograph is the actual problem

This is why the page feels cheap, and it is not a layout fault.

The hero is an ungraded, high-chroma stock salad macro at full brightness, with a
three-line 900-weight headline sitting on top of it. "AGAIN." lands on a tomato.
Two separate disclaimers on the page then admit the photography is stock and
AI-generated.

`DESIGN.md` has specified the fix since rev 2 and it has never shipped:

- **One unified grade across every image on the site.** Food keeps colour:
  `saturate(1.06) contrast(1.07)`, and nothing else. No brightening, no
  vignette-by-gradient.
- **Everything carries the shared grain overlay** — `feTurbulence` in a data URI,
  `opacity ~0.055`, `mix-blend-mode: overlay`, fixed, `pointer-events: none`.
- **People and places take the lime duotone**: grayscale plus `#84cc16` at
  `mix-blend-mode: color`.

For the hero specifically: choose a frame with a **quiet region where the type
sits** — a plate on a dark surface, negative space at the left. Do not solve
legibility with a heavier black scrim over a busy frame. Grade it, grain it, and
let the type sit in real empty space.

Warmth for a food brand comes from the image grade. It does not come from the
headline face, and the headline face is not up for discussion.

---

## 4. Stop apologising on the page

Seven separate passages explain what the product does not have yet:

1. "Photographs are illustrative while our own food shoot is outstanding…"
2. "One plan of 126 is fully seeded today. The other 125 publish their duration…"
3. "Illustrative daily split for this goal…"
4. "Straight answer on the roadmap: … the conversational trainer on top of them
   is not shipped, so we do not sell it."
5. "We are not going to tell you five hundred people love us. There are eight
   reviews in our database…"
6. "Results vary with adherence, starting point and medical history…"
7. Footer: "Food photographs are illustrative and include stock and AI-generated
   imagery."

The rule is *never advertise a capability the product does not ship*. That is a
prohibition on lying. It is not an instruction to narrate the backlog to a
first-time visitor. The page currently reads as a confession.

- **Keep** 6 (a real medical disclaimer) and one short photography line in the
  footer. Both belong in fine print at `#85857e`.
- **Delete** 1, 2, 3, 4 and the first two sentences of 5. Say what is true and
  stop: "Eight verified reviews. Read all eight." No preamble about the five
  hundred you do not claim.
- Nothing is being hidden by this. Every number on the page stays exactly as it
  is.

---

## 5. Interaction claims

The copy promises "Hover a plate", "tap one and the day below changes", and "Drag
a weigh-in and watch the recalibration run" — three separate interactive toys.

In the shipped implementation each of those is a client component, and this
system is server-components-by-default with zero JavaScript for animation. Pick
**one** and cut the other two. The week-bar day picker is the one that earns it,
because it shows real data the customer is buying. The drag-a-weigh-in
recalibration demo is a gimmick for a feature the same page admits is unshipped.

---

## 6. Implementation notes for the port to Next.js

The prototype loads the three faces from `fonts.googleapis.com` via `<link>`.
That is fine in the `.dc.html`, but in the repo the faces load once through
`next/font` in `app/layout.tsx`. No `@import`, no `<link>`, no font loading
inside a CSS module.

Everything else ports as CSS Modules or inline `style={{}}` built from
`app/_hp/theme.ts`. No Tailwind utilities in page bodies, no shadcn, no Radix, no
Framer Motion.

Run the section 11 anti-slop audit from the `fitfuel-design-system` skill before
calling it done.
