# Homepage visualisations — shared accessibility / responsive contract

Every visualisation on the homepage (smart scale, macro bars, progress,
kitchen weighing, and whatever the graphics pass adds next) must meet
this contract. The enforceable parts are pinned in
`tests/homepage-viz-a11y-contracts.test.ts`; this file is the reasoning
behind the pins, so a future track can tell which rule it is breaking
before the test does.

History: the mobile + accessibility track (2026-11-10,
`finish/homepage-viz-a11y`) wrote this contract and built a reference
section on it, but its section duplicated the smart-scale band the scale
track had already built, so the coordinator kept the scale track's
section and this contract, and adapted the tests to the kept
implementation. The rules below are unchanged; only the file references
moved.

## 1. Labelling

- Every informative chart/gauge is an SVG with `viewBox`,
  `width="100%"`, `role="img"` and a real `aria-label` that states what
  it shows, including the values (start/end, band names) and the words
  "Example data" whenever the numbers are example data. Pattern copied
  from `app/dashboard/progress/ProgressClient.tsx` (TrendChart /
  CalorieChart). The kept components (`app/_web/HomeCharts.tsx`,
  `app/_web/WeightTrendChart.tsx`, the scale band in
  `app/_web/HomeExperience.tsx`) follow that pattern directly.
- An SVG is either informative or decorative, never both. Decorative
  drawings (the pre-existing step icons in `HomeExperience.tsx`) carry
  `aria-hidden="true"` and no label, because the numbers they stand for
  are printed as real text beside them.
- Every chart ships its data as real HTML text next to the SVG (a
  `<figcaption>` or a visible list). SVG axis labels are a visual aid,
  never the only copy of a number: at phone widths a 720-unit viewBox
  renders 12-unit labels at about 5px, so the text equivalent is what
  makes a chart readable at 360px.
- Meaning is never carried by colour alone. Every band, bar and segment
  has a word label. The BMI gauge's healthy band is lime and the others
  grey, but the band names and ranges are printed in words beside it.
- Exception, shared chart: `WeightTrendChart` is the dashboard's real
  `TrendChart` extracted verbatim, so its `aria-label` is data-agnostic
  (it must not say "Example" when the dashboard shows real readings).
  The example wording for the homepage use lives in the scale band's
  caption beside the chart, not in the chart's label.

## 2. Sizes

- Body copy 16px (`--fk-t-base`). Chart labels 12 units minimum in the
  SVG. No label below 12px in CSS.
- All interactive elements: 44px minimum target (`min-height: 44px`).
- No fixed pixel `width`/`height` attributes on any new SVG. Grids use
  `minmax(min(100%, 300px), 1fr)` / `minmax(0, 1fr)` with
  `min-width: 0` on children, so nothing overflows at 320px.
- Cap wide charts with `max-width` in CSS so SVG text does not blow up
  on desktop (trend chart 720px, BMI gauge and scale device 360px).

## 3. Contrast

- Every text/chart-label colour pair clears AA 4.5:1. Meaningful
  non-text graphics (gauge bands, trend line, marker) clear 3:1
  (WCAG 1.4.11). Pairs are pinned in `scripts/check-contrast.mjs`.
- No new colours: only `--fk-*` tokens from `app/_design/tokens.css`.

## 4. Motion

- Charts are static SVG: no animation at all. Any transition on new
  links is killed under `prefers-reduced-motion: reduce`.
- `data-reveal="up"` is allowed only because the existing `useReveal`
  hook bails entirely under reduced motion before hiding anything.
  Never hide content first and check motion second.

## 5. No hydration flash

- No `useMediaQuery`, no `matchMedia`, no `window.innerWidth` in any
  viz file. The server renders the full SVG; responsiveness is CSS-only
  (viewBox scaling + media-query grid collapse). Same rule the mobile
  track used for the dish caps.

## 6. Example data

- Example data is labelled where it appears ("Example live reading",
  "Example month", "Example data"). Never present example numbers as
  the visitor's own.
- The only numbers are the repo's own examples (78.2 kg live reading,
  COACH_WEEKS 78.4/78.1/78.0/78.1 kg, BMI bands from BodyMetricsClient
  PARAM_DEFS) plus labelled example series where the repo has no example
  to reuse (the six-week trend 80.4 to 78.2 kg against a 75 kg target,
  and the 30-day example calorie shape). A labelled example is allowed;
  an unlabelled invented number is not.
- An example BMI value is shown only with the example height stated
  beside it: the gauge shows 24.7 because the example is 78.2 kg at
  178 cm tall, and the caption says so. A BMI is never shown without
  the height behind it, because BMI needs a height and no example
  height existed in the repo before this pass stated one.
