"use client";

// app/_hp/CoachEngine.tsx
//
// THE ENGINE, DRAWN. The AI section was 419 words of two-column definition
// lists and not one visual — the owner scrolled past it repeatedly and read it
// as "there is no AI section", which was a fair reading of what was on screen.
//
// This is the recalibration actually running. It is not a mock and not a loop
// of canned frames: the arithmetic below is lib/coach/recalibration.ts's real
// formula, executed in the browser against a worked example, with the ±300 cap
// and the 1200 floor applied where they genuinely apply. Drag the weeks and
// you watch a plateau get detected and a new target proposed — including the
// cases where the cap bites and the answer stops moving.
//
// WHY THIS IS THE RIGHT VISUAL FOR THIS SECTION. Every competitor claims AI and
// shows a chat bubble. We do not ship a conversational trainer, so a chat
// mock-up would be a lie. What we DO have that nobody else publishes is the
// constant, the cap and the floor — so the visual is the arithmetic, and it is
// interactive precisely because a customer can check it.
//
// CLIENT COMPONENT: it is a control.

import { useMemo, useState } from "react";
import s from "./hp.module.css";
import { MONO } from "./theme";

/* The published constants. Kept in sync with lib/coach/recalibration.ts —
   Coach.tsx prints the same four numbers directly above this. */
const KCAL_PER_KG = 7700;
const MAX_SWING = 300;
const FLOOR = 1200;

/** The real shape of the calculation, minus the database. */
function recalibrate(currentTarget: number, actualKgPerWeek: number, goalKgPerWeek: number) {
  /* How far off the required rate we are, converted to a daily energy gap
     through the 7700 kcal/kg constant. */
  const gapKgPerWeek = goalKgPerWeek - actualKgPerWeek;
  const raw = (gapKgPerWeek * KCAL_PER_KG) / 7;

  const capped = Math.max(-MAX_SWING, Math.min(MAX_SWING, raw));
  const proposed = Math.max(FLOOR, Math.round(currentTarget - capped));

  return {
    raw: Math.round(raw),
    capped: Math.round(capped),
    proposed,
    capBit: Math.abs(raw) > MAX_SWING,
    floorBit: Math.round(currentTarget - capped) < FLOOR,
  };
}

const TARGET = 1800;
const GOAL_RATE = 0.5; // kg/week the customer's goal needs

export default function CoachEngine() {
  /* Weight over four weigh-ins, in kg. The default is a genuine plateau: two
     weigh-ins a fortnight apart moving under half a kilo. */
  const [w, setW] = useState([78.4, 77.9, 77.7, 77.6]);

  const actualRate = useMemo(() => {
    /* Over the last fortnight: kg moved per week. */
    const moved = w[1]! - w[3]!;
    return moved / 2;
  }, [w]);

  const plateau = Math.abs(w[1]! - w[3]!) < 0.5;
  const r = useMemo(() => recalibrate(TARGET, actualRate, GOAL_RATE), [actualRate]);

  const max = Math.max(...w) + 0.4;
  const min = Math.min(...w) - 0.4;
  const y = (kg: number) => 96 - ((kg - min) / (max - min || 1)) * 82;

  return (
    <div className={s.engine}>
      <div className={s.engineHead}>
        <span style={{ fontFamily: MONO }}>Live · drag any weigh-in</span>
        <span className={plateau ? s.enginePlateau : s.engineMoving}>
          {plateau ? "Plateau detected" : "Moving — no change proposed"}
        </span>
      </div>

      {/* The trend. A real polyline over the four weigh-ins the sliders set. */}
      <svg viewBox="0 0 320 110" className={s.engineChart} role="img" aria-label={`Four weigh-ins: ${w.join(", ")} kilograms`}>
        <line x1="0" y1={y(w[0]!)} x2="320" y2={y(w[0]!)} className={s.engineBase} />
        <polyline
          points={w.map((kg, i) => `${16 + i * 96},${y(kg)}`).join(" ")}
          className={s.engineLine}
        />
        {w.map((kg, i) => (
          <g key={i}>
            <circle cx={16 + i * 96} cy={y(kg)} r="5" className={s.engineDot} />
            <text x={16 + i * 96} y={y(kg) - 13} className={s.engineVal}>
              {kg.toFixed(1)}
            </text>
          </g>
        ))}
      </svg>

      <div className={s.engineSliders}>
        {w.map((kg, i) => (
          <label key={i}>
            <span>Week {i + 1}</span>
            <input
              type="range"
              min={74}
              max={82}
              step={0.1}
              value={kg}
              onChange={(e) => {
                const next = [...w];
                next[i] = Number(e.target.value);
                setW(next);
              }}
            />
          </label>
        ))}
      </div>

      {/* The working, shown. This is the part no competitor publishes. */}
      <ol className={s.engineSteps}>
        <li>
          <b>{actualRate >= 0 ? "−" : "+"}{Math.abs(actualRate).toFixed(2)} kg/wk</b>
          <span>your actual rate over the fortnight</span>
        </li>
        <li>
          <b>{GOAL_RATE.toFixed(2)} kg/wk</b>
          <span>the rate your goal needs</span>
        </li>
        <li>
          <b>{r.raw > 0 ? "−" : "+"}{Math.abs(r.raw)} kcal</b>
          <span>the gap through {KCAL_PER_KG.toLocaleString("en-IN")} kcal/kg</span>
        </li>
        <li className={r.capBit ? s.engineHit : undefined}>
          <b>{r.capped > 0 ? "−" : "+"}{Math.abs(r.capped)} kcal</b>
          <span>{r.capBit ? `capped at ±${MAX_SWING} — the cap is biting` : `inside the ±${MAX_SWING} cap`}</span>
        </li>
      </ol>

      <div className={s.engineOut}>
        <div>
          <span>Target now</span>
          <b>{TARGET.toLocaleString("en-IN")}</b>
        </div>
        <div aria-hidden className={s.engineArrow}>→</div>
        <div>
          <span>{plateau ? "Proposed" : "Unchanged"}</span>
          <b className={s.engineNew}>{(plateau ? r.proposed : TARGET).toLocaleString("en-IN")}</b>
        </div>
      </div>

      <p className={s.engineNote}>
        {r.floorBit
          ? `Held at the ${FLOOR.toLocaleString("en-IN")} kcal floor. No recommendation goes below it, whatever the arithmetic says.`
          : "You are shown this rationale and you choose whether to apply it. The target never changes behind your back."}
      </p>
    </div>
  );
}
