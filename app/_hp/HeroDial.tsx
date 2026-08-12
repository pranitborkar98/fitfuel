"use client";

// app/_hp/HeroDial.tsx
//
// THE DIAL. The hero's right half was empty dark photograph; this puts the day
// itself there, drawn and moving.
//
// NOT DECORATION. Every arc, number and tick is a real figure for day one of
// Weight Loss Vegetarian, passed in from the same PlanScheduleSlot query
// TrialDay renders. The outer ring is the four meals sized by their calories,
// the inner ring is the day's protein/carbs/fat split by energy share, and the
// centre counts to the real day total. If the kitchen reschedules, this
// changes with it.
//
// WHY SVG AND CSS RATHER THAN A CANVAS. The old _home/HeroCanvas.tsx ran a
// requestAnimationFrame loop for a particle field — decorative, expensive on a
// mid-range Android, and invisible to a screen reader. This is ~2KB of markup,
// animates on the compositor via stroke-dashoffset and opacity only, and the
// figures are in the DOM as text, so the same information survives with images
// off, motion off, or a screen reader on.
//
// REDUCED MOTION IS HONOURED: with the media query set, everything renders in
// its final state immediately. Nothing draws, nothing counts, nothing is lost.
//
// CLIENT COMPONENT: it needs the count-up and the intersection trigger.

import { useEffect, useRef, useState } from "react";
import s from "./hp.module.css";

export type DialMeal = { slot: string; kcal: number };

const R_OUTER = 92;
const R_INNER = 62;
const C_OUTER = 2 * Math.PI * R_OUTER;
const C_INNER = 2 * Math.PI * R_INNER;
const GAP = 0.012; // fraction of the circle left blank between segments

/* Protein and carbohydrate are 4 kcal/g, fat is 9. The inner ring shows share
   of ENERGY, not share of grams — a gram ring makes fat look trivial when it
   is often a third of the calories. */
function energyShares(protein: number, carbs: number, fat: number) {
  const p = protein * 4;
  const c = carbs * 4;
  const f = fat * 9;
  const total = p + c + f || 1;
  return [p / total, c / total, f / total] as const;
}

export default function HeroDial({
  meals,
  kcal,
  protein,
  carbs,
  fat,
}: {
  meals: DialMeal[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [shown, setShown] = useState(0);

  /* Draw when it enters the viewport rather than on mount, so a visitor who
     lands mid-page does not miss the animation entirely.

     The reduced-motion branch lives INSIDE the observer callback rather than in
     the effect body: setState called synchronously while an effect runs
     triggers a cascading render, and the observer fires asynchronously anyway. */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setOn(true);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setShown(kcal);
        }
        io.disconnect();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [kcal]);

  /* The centre figure counts to the real total. Eased, ~1.1s, and it lands
     exactly on `kcal` rather than near it. */
  useEffect(() => {
    if (!on || !kcal) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const start = performance.now();
    const DUR = 1100;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(kcal * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on, kcal]);

  const totalKcal = meals.reduce((n, m) => n + m.kcal, 0) || 1;
  const shares = energyShares(protein, carbs, fat);

  /* Cumulative offsets without a mutable cursor: reassigning a variable across
     a render is exactly what the React compiler forbids, and a running total
     computed per item is the same arithmetic without the shared state. */
  const runningBefore = (arr: number[], i: number) =>
    arr.slice(0, i).reduce((n, x) => n + x, 0);

  /* Outer ring: one arc per meal, sized by that meal's calories. */
  const mealFracs = meals.map((m) => m.kcal / totalKcal);
  const mealArcs = meals.map((m, i) => ({
    slot: m.slot,
    kcal: m.kcal,
    len: Math.max(0, mealFracs[i]! - GAP) * C_OUTER,
    offset: -runningBefore(mealFracs, i) * C_OUTER,
  }));

  const macroArcs = shares.map((sh, i) => ({
    i,
    len: Math.max(0, sh - GAP) * C_INNER,
    offset: -runningBefore([...shares], i) * C_INNER,
  }));

  const MACRO_COLOUR = ["#84cc16", "#9a9a94", "#5f5f59"];

  return (
    <div ref={ref} className={`${s.dial} ${on ? s.dialOn : ""}`} aria-hidden="true">
      <svg viewBox="-120 -120 240 240" role="presentation" focusable="false">
        {/* The track both rings sit on, so an empty segment still reads as
            part of a dial rather than as a missing piece. */}
        <circle r={R_OUTER} className={s.dialTrack} />
        <circle r={R_INNER} className={s.dialTrack} />

        {mealArcs.map((a, i) => (
          <circle
            key={a.slot + i}
            r={R_OUTER}
            className={s.dialArc}
            style={{
              stroke: "#84cc16",
              strokeDasharray: `${a.len} ${C_OUTER}`,
              strokeDashoffset: a.offset,
              // @ts-expect-error -- custom property consumed by hp.module.css
              "--len": a.len,
              "--i": i,
            }}
          />
        ))}

        {macroArcs.map((a) => (
          <circle
            key={a.i}
            r={R_INNER}
            className={s.dialArc}
            style={{
              stroke: MACRO_COLOUR[a.i],
              strokeDasharray: `${a.len} ${C_INNER}`,
              strokeDashoffset: a.offset,
              // @ts-expect-error -- custom property consumed by hp.module.css
              "--len": a.len,
              "--i": a.i + 4,
            }}
          />
        ))}

        {/* Ticks: one per meal boundary, so the four meals are countable
            without reading the colour. */}
        {meals.map((m, i) => {
          const at = meals.slice(0, i).reduce((n, x) => n + x.kcal, 0) / totalKcal;
          const ang = at * 2 * Math.PI - Math.PI / 2;
          return (
            <line
              key={"t" + m.slot + i}
              x1={Math.cos(ang) * (R_OUTER - 11)}
              y1={Math.sin(ang) * (R_OUTER - 11)}
              x2={Math.cos(ang) * (R_OUTER + 11)}
              y2={Math.sin(ang) * (R_OUTER + 11)}
              className={s.dialTick}
              style={{ "--i": i } as React.CSSProperties}
            />
          );
        })}
      </svg>

      <div className={s.dialCentre}>
        <b>{shown.toLocaleString("en-IN")}</b>
        <span>kcal tomorrow</span>
        <i>
          {Math.round(protein)}P · {Math.round(carbs)}C · {Math.round(fat)}F
        </i>
      </div>
    </div>
  );
}
