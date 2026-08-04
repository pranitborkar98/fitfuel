"use client";

// app/tdee-calculator/TdeeCalculator.tsx
//
// The TDEE calculator, on the Instrument System.
//
// THE THING THAT HAD TO GO. Each goal carried its own accent hue, piped
// through a `--ac` custom property that then coloured the eyebrow, every
// segmented button, the progress ring, the protein bar, the input focus state
// and the CTA. Lose fat was #a3e635, Maintain was sky #38bdf8 and Build muscle
// was orange #f97316 — two of the three are named in DESIGN.md's reject list,
// and the mechanism itself is exactly what "no per-category accent hues"
// exists to prevent. Goals are distinguished by label and rule weight now.
//
// Also removed: the radial-gradient glow behind the results panel, radius
// 6/7/10 on every control, the 99px macro bar, and the 124px circular ring
// whose stroke offset was hardcoded to 18% and therefore never moved with the
// numbers — it was a decorative dial reporting nothing.
//
// The calorie target is set as a display figure instead. It is the answer the
// page exists to give, and on this system the data is the hero.
//
// The maths is untouched: Mifflin-St Jeor, same activity factors, same protein
// per kg, same 25% fat split.

import { useMemo, useState } from "react";
import Link from "next/link";

import { k } from "@/app/_ui/Kit";
import { Masthead, Shell, Wrap } from "@/app/_ui/Page";
import { SECTION } from "@/app/_ui/theme";
import s from "./tdee.module.css";

type Sex = "male" | "female";
type Goal = "lose" | "maintain" | "build";
type Activity = "sedentary" | "light" | "moderate" | "active" | "athlete";

const ACTIVITY: { key: Activity; label: string; sub: string; factor: number }[] = [
  { key: "sedentary", label: "Sedentary", sub: "Desk job, little exercise", factor: 1.2 },
  { key: "light", label: "Light", sub: "1 to 3 workouts a week", factor: 1.375 },
  { key: "moderate", label: "Moderate", sub: "3 to 5 workouts a week", factor: 1.55 },
  { key: "active", label: "Active", sub: "6 to 7 workouts a week", factor: 1.725 },
  { key: "athlete", label: "Athlete", sub: "Physical job or twice a day", factor: 1.9 },
];

/* No `accent` field. A goal changes the numbers, not the palette. */
const GOALS: { key: Goal; label: string; sub: string; delta: number; proteinPerKg: number }[] = [
  { key: "lose", label: "Lose fat", sub: "20% deficit", delta: -0.2, proteinPerKg: 2.0 },
  { key: "maintain", label: "Maintain", sub: "Hold steady", delta: 0, proteinPerKg: 1.8 },
  { key: "build", label: "Build muscle", sub: "10% surplus", delta: 0.1, proteinPerKg: 2.0 },
];

const clampNum = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function TdeeCalculator() {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(172); // cm
  const [weight, setWeight] = useState(74); // kg
  const [activity, setActivity] = useState<Activity>("moderate");
  const [goal, setGoal] = useState<Goal>("lose");

  const result = useMemo(() => {
    const a = clampNum(age, 14, 90);
    const h = clampNum(height, 120, 230);
    const w = clampNum(weight, 30, 250);
    // Mifflin-St Jeor
    const bmr = 10 * w + 6.25 * h - 5 * a + (sex === "male" ? 5 : -161);
    const factor = ACTIVITY.find((x) => x.key === activity)!.factor;
    const tdee = bmr * factor;
    const g = GOALS.find((x) => x.key === goal)!;
    const calories = Math.round(tdee * (1 + g.delta));

    const proteinG = Math.round(w * g.proteinPerKg);
    const fatG = Math.round((calories * 0.25) / 9);
    const carbG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
    const total = proteinG * 4 + carbG * 4 + fatG * 9 || 1;

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories,
      proteinG,
      carbG,
      fatG,
      pPct: (proteinG * 4 / total) * 100,
      cPct: (carbG * 4 / total) * 100,
      fPct: (fatG * 9 / total) * 100,
    };
  }, [sex, age, height, weight, activity, goal]);

  const n = (v: number) => v.toLocaleString("en-IN");

  /* The three macro bands are one hue at three weights, not three hues. Lime
     for protein because that is the figure the plans are sold on; the other
     two are greys from the ramp, and every share is printed as a percentage
     beside its bar. */
  const MACROS = [
    { name: "Protein", g: result.proteinG, pct: result.pPct, fill: "#84cc16" },
    { name: "Carbs", g: result.carbG, pct: result.cPct, fill: "#5c5c56" },
    { name: "Fat", g: result.fatG, pct: result.fPct, fill: "#33332f" },
  ];

  return (
    <Shell>
      <Masthead
        label="Free tool"
        title="TDEE and calorie calculator"
        deck="Find your maintenance calories and the protein, carb and fat split for your goal. Then let FitFuel deliver meals that hit them, every day."
        meta={[
          { k: "Equation", v: "Mifflin-St Jeor" },
          { k: "Cost", v: "Free" },
        ]}
      />

      <section style={{ ...SECTION, paddingTop: 0 }}>
        <Wrap>
          <div className={s.grid}>
            {/* ── inputs ────────────────────────────────────────────────── */}
            <div className={s.panel}>
              <span className={s.lbl}>Your stats</span>

              <div className={s.seg} role="group" aria-label="Sex">
                {(["male", "female"] as Sex[]).map((x) => (
                  <button
                    key={x}
                    type="button"
                    className={sex === x ? s.on : undefined}
                    aria-pressed={sex === x}
                    onClick={() => setSex(x)}
                  >
                    {x === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>

              <div className={s.field}>
                <label htmlFor="tdee-age">Age</label>
                <input
                  id="tdee-age"
                  type="number"
                  value={age}
                  min={14}
                  max={90}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
              </div>
              <div className={s.field}>
                <label htmlFor="tdee-height">Height in cm</label>
                <input
                  id="tdee-height"
                  type="number"
                  value={height}
                  min={120}
                  max={230}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </div>
              <div className={s.field}>
                <label htmlFor="tdee-weight">Weight in kg</label>
                <input
                  id="tdee-weight"
                  type="number"
                  value={weight}
                  min={30}
                  max={250}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
              </div>

              <span className={s.lbl} style={{ marginTop: 28 }}>
                Activity
              </span>
              <div className={s.opt} role="group" aria-label="Activity level">
                {ACTIVITY.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    className={activity === a.key ? s.on : undefined}
                    aria-pressed={activity === a.key}
                    onClick={() => setActivity(a.key)}
                  >
                    <span>{a.label}</span>
                    <small>{a.sub}</small>
                  </button>
                ))}
              </div>

              <span className={s.lbl}>Goal</span>
              <div className={s.opt} role="group" aria-label="Goal">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    className={goal === g.key ? s.on : undefined}
                    aria-pressed={goal === g.key}
                    onClick={() => setGoal(g.key)}
                  >
                    <span>{g.label}</span>
                    <small>{g.sub}</small>
                  </button>
                ))}
              </div>
            </div>

            {/* ── result ────────────────────────────────────────────────── */}
            <div className={`${s.panel} ${s.panelOut}`}>
              <div>
                <span className={s.lbl}>Your daily target</span>
                {/* aria-live so a screen reader hears the number change when
                    an input moves, rather than silently re-rendering. */}
                <div aria-live="polite">
                  <span className={s.figure}>{n(result.calories)}</span>
                  <span className={s.figureUnit}>kcal per day</span>
                </div>
              </div>

              <div className={s.reads}>
                <div className={s.read}>
                  <span className={s.macName}>BMR</span>
                  <span className={s.readVal}>{n(result.bmr)}</span>
                </div>
                <div className={s.read}>
                  <span className={s.macName}>Maintenance</span>
                  <span className={s.readVal}>{n(result.tdee)}</span>
                </div>
              </div>

              <div>
                <span className={s.lbl}>Macros</span>
                <div className={s.macbar} aria-hidden="true">
                  {MACROS.map((m) => (
                    <span key={m.name} style={{ width: `${m.pct}%`, background: m.fill }} />
                  ))}
                </div>
                <div className={s.macrow}>
                  {MACROS.map((m) => (
                    <div key={m.name} className={s.mac}>
                      <span className={s.macName}>{m.name}</span>
                      <span className={s.macVal}>{m.g}g</span>
                      <span className={s.macPct}>{Math.round(m.pct)}% of kcal</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={s.cta}>
                <Link href="/plans" className={k.btn}>
                  <span>See plans at {n(result.calories)} kcal</span>
                </Link>
                <p className={s.note}>
                  Estimates use the Mifflin-St Jeor equation. Individual needs vary, so treat this
                  as a starting point rather than a prescription.
                </p>
              </div>
            </div>
          </div>
        </Wrap>
      </section>
    </Shell>
  );
}
