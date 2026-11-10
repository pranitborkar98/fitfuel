// app/_web/HomeCharts.tsx
//
// VISUALISATION FOR THE HOMEPAGE — three places where text did all the work.
//
// Every figure here is one the page already shows, or is labelled as an
// example. Nothing is invented as a reading or a capability:
//
// 1. SampleDayVisual — the macro split and per-meal calories of the sample
//    day in app/dashboard-preview/sample-data.ts (SAMPLE_DAY), the same day
//    the dashboard preview renders. Totals are summed from its four meals,
//    never typed. The macro shares use FitFuelApp's own method (4 kcal/g for
//    protein and carbs, 9 for fat, normalised to 100). This lives in the
//    trial receipt, a plan/trial context — never on a dish card or any surface
//    where someone chooses what to eat. AGENTS.md bans macro rings, glyphs
//    and typographic stand-ins there, and this file is never imported by
//    FitFuelApp.
// 2. ExampleCalorieChart — the real CalorieChart from
//    app/dashboard/progress/ProgressClient.tsx, adapted, not reinvented. The
//    only changes: a 360-wide viewBox so the labels stay readable at phone
//    width (the original is 720 wide, which halves 12px labels on a phone),
//    and example data from home-data.ts (EXAMPLE_CALORIES), labelled as an
//    example shape. Bar colours, the dashed target line and the legend wording
//    are the original's.
// 3. WeighingFlow — the kitchen weighing process as steps, reusing the real
//    weighing photograph already on the page (DAY_STEPS, 06:30). Every line
//    is a sentence the day band or the FAQ already prints. A process
//    illustration, not a meal drawn as a diagram: no meal is diagrammed here.
//
// Every chart carries role="img" and a real aria-label, following
// ProgressClient's pattern. No chart uses a fixed pixel width that can
// overflow a phone: SVGs are viewBox-based at width 100%, the stacked bar
// is fluid HTML.

import Image from "next/image";
import Link from "next/link";

import { EXAMPLE_CALORIES, macroShares, sampleDayTotals } from "./home-data";
import { SAMPLE_DAY } from "@/app/dashboard-preview/sample-data";
import s from "./app.module.css";

/* ── 1. The sample day: macro split + calories by meal ─────────────────────
   In the trial receipt. Labelled as a sample full day, not the trial day:
   the trial is priced in the receipt above, this is what four sample meals
   add up to. */
export function SampleDayVisual() {
  const meals = SAMPLE_DAY.meals;
  const totals = sampleDayTotals();
  const shares = macroShares(totals.protein, totals.carbs, totals.fat);
  const fmt = (n: number) => n.toLocaleString("en-IN");

  /* Per-meal bars. 360-wide viewBox, so a 13px label renders at 13px on a
     360px phone instead of halving. */
  const W = 360, H = 196, TOP = 30, BASE = 168;
  const maxKcal = Math.max(...meals.map((m) => m.recipe.caloriesPerServing));
  const slotW = W / meals.length;
  const barW = 48;
  const y = (kcal: number) => BASE - (kcal / maxKcal) * (BASE - TOP);
  const mealLabel = meals
    .map((m) => `${m.label.toLowerCase()} ${fmt(m.recipe.caloriesPerServing)} kilocalories`)
    .join(", ");

  return (
    <div className={s.sampleDay}>
      <h3 className={s.vizH}>What a sample day adds up to</h3>
      <p className={s.vizLede}>
        A sample full day from the dashboard preview. Four meals,{" "}
        {fmt(totals.kcal)} kcal in total. The trial day is priced in the
        receipt above.
      </p>

      <div
        className={s.macroBar}
        role="img"
        aria-label={`Example macro split for the sample day: protein ${shares.protein} percent, carbs ${shares.carbs} percent, fat ${shares.fat} percent of calories`}
      >
        <span style={{ width: `${shares.protein}%`, background: "var(--fk-green)" }} />
        <span style={{ width: `${shares.carbs}%`, background: "var(--fk-ink-2)" }} />
        <span style={{ width: `${shares.fat}%`, background: "var(--fk-line-strong)" }} />
      </div>
      <ul className={s.macroLegend}>
        <li>
          <i aria-hidden="true" style={{ background: "var(--fk-green)" }} />
          Protein {totals.protein} g · {shares.protein}%
        </li>
        <li>
          <i aria-hidden="true" style={{ background: "var(--fk-ink-2)" }} />
          Carbs {totals.carbs} g · {shares.carbs}%
        </li>
        <li>
          <i aria-hidden="true" style={{ background: "var(--fk-line-strong)" }} />
          Fat {totals.fat} g · {shares.fat}%
        </li>
      </ul>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block" }}
        role="img"
        aria-label={`Example day calories by meal: ${mealLabel}. ${fmt(totals.kcal)} in total.`}
      >
        <line x1="0" y1={BASE} x2={W} y2={BASE} stroke="var(--fk-line-2)" strokeWidth="1" />
        {meals.map((m, i) => {
          const cx = i * slotW + slotW / 2;
          const top = y(m.recipe.caloriesPerServing);
          return (
            <g key={m.slotId}>
              <rect
                x={cx - barW / 2}
                y={top}
                width={barW}
                height={Math.max(0, BASE - top)}
                fill="var(--fk-green)"
              />
              <text
                x={cx}
                y={top - 8}
                fontSize="13"
                textAnchor="middle"
                fontFamily="var(--fk-sans), sans-serif"
                fontWeight="700"
                fill="var(--fk-ink)"
              >
                {fmt(m.recipe.caloriesPerServing)} kcal
              </text>
              <text
                x={cx}
                y={BASE + 22}
                fontSize="13"
                textAnchor="middle"
                fontFamily="var(--fk-sans), sans-serif"
                fill="var(--fk-ink-3)"
              >
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className={s.bandActions}>
        <Link className={s.bandSecondary} href="/dashboard-preview">
          See the sample day in the dashboard preview
        </Link>
      </div>
    </div>
  );
}

/* ── 2. Daily net calories, example shape ───────────────────────────────────
   Adapted from CalorieChart in app/dashboard/progress/ProgressClient.tsx.
   Same bar rule (lime at or under target, grey over), same dashed target
   line, same legend wording. Only the viewBox is narrower and the data is
   the labelled example in home-data.ts. */
export function ExampleCalorieChart() {
  const { days, target } = EXAMPLE_CALORIES;
  const W = 360, H = 200, padL = 40, padR = 10, padT = 12, padB = 22;
  const max =
    Math.max(target, ...days.map((d) => d.net), ...days.map((d) => d.in)) * 1.1 || 1;
  const bw = (W - padL - padR) / days.length;
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const over = days.filter((d) => d.net > target).length;

  return (
    <div className={s.vizPanel} data-reveal="up">
      <h3 className={s.vizH}>Daily net calories</h3>
      <p className={s.vizLede}>
        Thirty days of net calories against target, drawn the way the progress
        screen draws them. Example shape, not a customer&apos;s readings.
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block" }}
        role="img"
        aria-label={`Example shape: net calories per day for 30 days against a target of ${target.toLocaleString("en-IN")} kilocalories. A lime bar is at or under target, a grey bar is over. ${over} of the 30 days run over target. Not a customer's readings.`}
      >
        {[0, max / 2, max].map((g, i) => (
          <g key={i}>
            <line x1={padL} y1={y(g)} x2={W - padR} y2={y(g)} stroke="var(--fk-line)" strokeWidth="1" />
            <text x={4} y={y(g) + 4} fontSize="12" fontFamily="var(--fk-sans), sans-serif" fill="var(--fk-ink-3)">
              {Math.round(g)}
            </text>
          </g>
        ))}

        {days.map((d, i) => {
          if (d.net <= 0) return null;
          const top = y(d.net);
          return (
            <rect
              key={i}
              x={padL + i * bw + bw * 0.18}
              y={top}
              width={bw * 0.64}
              height={Math.max(0, H - padB - top)}
              fill={d.net > target ? "var(--fk-line-strong)" : "var(--fk-green)"}
            />
          );
        })}

        <line x1={padL} y1={y(target)} x2={W - padR} y2={y(target)}
              stroke="var(--fk-green)" strokeWidth="1" strokeDasharray="4 6" />
      </svg>
      <p className={s.vizNote}>
        Net is plan meals eaten plus anything in the diary, minus workout
        burn. A lime bar is at or under target, a grey bar is over. The dashed
        line is the target itself.
      </p>
      <div className={s.bandActions}>
        <Link className={s.bandSecondary} href="/dashboard/progress">
          Open progress
        </Link>
      </div>
    </div>
  );
}

/* ── 3. How every portion is weighed ────────────────────────────────────────
   The process, as steps, under the day timeline. The photograph is the real
   weighing photograph the 06:30 step already uses — reused, not generated.
   Every line is a sentence the day band or the FAQ already prints. */
const WEIGH_STEPS: { title: string; line: string }[] = [
  {
    title: "Your target sets the grams",
    line: "Your live weight, profile and goal set the calorie target. The kitchen turns that target into portion grams.",
  },
  {
    title: "Weighed before sealing",
    line: "Every meal is weighed in grams before sealing.",
  },
  {
    title: "Labelled to you",
    line: "Your name, meal slot and calculated macros stay with the tray through dispatch.",
  },
  {
    title: "Already in your diary",
    line: "Your meals arrive with their calories and macros already filled into your diary.",
  },
];

export function WeighingFlow() {
  return (
    <div className={s.weighFlow} data-reveal="up">
      <span className={s.weighPhoto}>
        <Image
          src="/images/brand/meals-weighed-in-kitchen.webp"
          alt="A meal tray being weighed on a kitchen scale"
          fill
          sizes="(min-width: 900px) 40vw, 100vw"
          style={{ objectFit: "cover" }}
          loading="lazy"
        />
      </span>
      <div>
        <h3 className={s.vizH}>How every portion is weighed</h3>
        <ol className={s.weighSteps}>
          {WEIGH_STEPS.map((step, i) => (
            <li key={step.title}>
              <span className={`${s.weighN} fk-num`} aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <b>{step.title}</b>
                <span>{step.line}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
