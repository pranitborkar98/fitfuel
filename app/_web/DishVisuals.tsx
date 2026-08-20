// app/_web/DishVisuals.tsx
//
// THE DISH CARD'S TWO GRAPHICS, SHARED.
//
// Both of these lived inside FitFuelApp.tsx and were therefore reachable by
// exactly one page. /menu was built alongside them and got neither — it used
// the same stylesheet but wrote its own classes, which is drift wearing the
// costume of consistency. A card with no image well and no macro ring is not
// the homepage card no matter which CSS file it imports.
//
// So they move here and BOTH pages import them. FitFuelApp keeps no copy;
// there is one definition of the ring and one of the colour field.
//
// Nothing about the rendering changed in the move — same ring geometry, same
// hues, same jitter. Only the address changed.
//
// NO "use client" DIRECTIVE, DELIBERATELY. MacroSplit holds no state and binds
// no handlers, and the field helpers are pure functions returning a style
// object — so this module is neither client nor server and both trees can use
// it. With the directive, /menu (a server component) calling slotField() fails
// the build outright: "Attempted to call slotField() from the server but
// slotField is on the client." Same boundary rule app/_web/services.ts carries
// its own note about. Do not add the directive to make an editor happy.

import type React from "react";

import type { ShopDish } from "@/app/_shop/catalog";
import sx from "./app.module.css";

const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;
/** Visual separation between arcs, in path units. Three gaps, so three×. */
const RING_GAP = 3.5;

export function MacroSplit({
  p,
  c,
  f,
  kcal,
  unit = "kcal",
  contrib,
}: {
  p: number;
  c: number;
  f: number;
  kcal?: number;
  unit?: string;
  /** What this dish does to the target the visitor picked, printed under the
   *  ring. Optional: a plan card has no single day to contribute to. */
  contrib?: string;
}) {
  const kp = p * 4, kc = c * 4, kf = f * 9;
  const total = kp + kc + kf;
  if (!total) return null;

  /* Shares are taken from the raw kcal fractions, not from the rounded
     percentages, so three roundings cannot leave the ring 1% short or long. */
  const segs = [
    { key: "protein", label: "P", g: p, share: kp / total, cls: sx.segP, arc: sx.arcP },
    { key: "carbs", label: "C", g: c, share: kc / total, cls: sx.segC, arc: sx.arcC },
    { key: "fat", label: "F", g: f, share: kf / total, cls: sx.segF, arc: sx.arcF },
  ];
  const usable = RING_C - RING_GAP * segs.length;
  let cursor = 0;
  const arcs = segs.map((sg) => {
    const len = sg.share * usable;
    const start = cursor;
    cursor += len + RING_GAP;
    return { ...sg, len, start };
  });

  const proteinPct = Math.round((kp / total) * 100);

  return (
    <div className={sx.macro}>
      {/* One sentence for the whole graphic. The ring is decorative so a screen
          reader is not read three unlabelled shapes. */}
      <span className="fk-sr-only">
        {`${p} grams protein, ${c} grams carbohydrate, ${f} grams fat. ${proteinPct} per cent of calories from protein.`}
      </span>

      <svg className={sx.donut} viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <circle className={sx.donutTrack} cx="32" cy="32" r={RING_R} />
        {arcs.map((a) => (
          <circle
            key={a.key}
            className={`${sx.donutArc} ${a.arc}`}
            cx="32"
            cy="32"
            r={RING_R}
            style={
              {
                "--len": a.len.toFixed(2),
                "--circ": RING_C.toFixed(2),
                strokeDashoffset: -a.start,
              } as React.CSSProperties
            }
          />
        ))}
        {/* The denominator, in the middle of the thing it is the denominator of.
            Printed without a thousands separator: a plan's daily figure is four
            digits, and "1,800" does not fit the 45px well inside the ring. The
            narrow class drops the size for those. */}
        {kcal ? (
          <>
            <text
              className={`${sx.donutNum} ${kcal >= 1000 ? sx.donutNumWide : ""}`}
              x="32"
              y="31"
            >
              {kcal}
            </text>
            <text className={sx.donutUnit} x="32" y="42">{unit}</text>
          </>
        ) : null}
      </svg>

      <span className={sx.macroKeys} aria-hidden="true">
        {segs.map((sg) => (
          <span key={sg.key} className={sx.macroKey}>
            <i className={sg.cls} />
            {sg.g}g {sg.label}
          </span>
        ))}
      </span>

      {contrib ? <span className={sx.macroContrib}>{contrib}</span> : null}
    </div>
  );
}

const COURSE_HUE: Record<string, number> = {
  bowls: 14,      // roast
  keto: 34,       // butter
  breakfast: 54,  // morning
  salads: 96,     // leaf
  juices: 168,    // cold-press
  bars: 344,      // berry
};
/** Half-width of the within-course spread, in degrees. */
const HUE_JITTER = 7;

/** Stable small integer from a string, for the within-course jitter. */
function hashOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 4096;
  return h;
}

export function field(hue: number): React.CSSProperties {
  const h = ((hue % 360) + 360) % 360;
  return {
    backgroundImage:
      `radial-gradient(120% 100% at 20% 0%, hsl(${h} 45% 22% / 0.85), transparent 62%),` +
      `radial-gradient(90% 90% at 90% 100%, hsl(${(h + 48) % 360} 40% 18% / 0.7), transparent 60%)`,
  };
}

/** Dishes: the course sets the family, the id sets the variation within it. */
export function dishField(d: ShopDish): React.CSSProperties {
  const base = COURSE_HUE[d.category] ?? 96;
  return field(base + (hashOf(d.id) % (HUE_JITTER * 2 + 1)) - HUE_JITTER);
}

/** Plans have no course, so they keep the hash. */
export function fieldStyle(id: string): React.CSSProperties {
  return field(hashOf(id) % 360);
}


/* ── A HUE FOR A DISH THAT HAS NO COURSE ──────────────────────────────────
   The week's recipes come from PlanScheduleSlot and carry a MEAL SLOT, not one
   of the six courses, so dishField() has nothing to read. The slot is the
   right family here anyway: a reader scanning a week is scanning by meal, and
   giving breakfast one ground and dinner another makes the column legible in
   the same way the course hue makes the catalogue legible.

   Same wheel as the courses — morning yellow through to evening roast, nothing
   in the blues — and the same ±jitter off the dish name so two breakfasts are
   not the identical rectangle. */
const SLOT_HUE: Record<string, number> = {
  BREAKFAST: 54,  // morning
  LUNCH: 96,      // leaf
  SNACK: 344,     // berry
  DINNER: 14,     // roast
};

export function slotField(slot: string, name: string): React.CSSProperties {
  const base = SLOT_HUE[slot] ?? 96;
  return field(base + (hashOf(name) % (HUE_JITTER * 2 + 1)) - HUE_JITTER);
}
