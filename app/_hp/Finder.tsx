"use client";

// app/_hp/Finder.tsx
//
// FOUR DOORS, THEN THE ARITHMETIC THAT SITS BEHIND THEM.
//
// "126 plans" is useless information until a visitor knows which are theirs, and
// the old version of this section answered that with four cards and a link. The
// prototype's improvement is that picking a door does not just filter a list, it
// shows you the number the plan builder would produce for you, live.
//
// THE ARITHMETIC IS THE REAL ONE. This does not reimplement Mifflin St Jeor with
// its own constants: it imports calculateBMR, calculateTDEE, getCalorieTarget
// and getMacroTargets from lib/tdee.ts, which is what the onboarding flow and
// the plan builder run. The prototype approximated the goal adjustment as a
// percentage of TDEE; the shipped engine uses flat kcal offsets and a floor that
// differs by sex, so the ledger below prints those, because a calculator on the
// homepage that disagrees with the one behind the login is worse than no
// calculator at all.
//
// THE DOOR ACCENTS ARE STRUCTURAL, NOT DECORATIVE, and they are the one non-lime
// hue on this page. They come from the catalogue's own goal taxonomy and Pick
// has shipped them since the plan surfaces were built: a visitor who met amber
// on the muscle-gain plan page meets amber again here. Dropping them would put
// the homepage out of step with every page it links to. Everywhere else on this
// page that the prototype reached for a second hue, it is gone.
//
// CLIENT COMPONENT: it is a control. Counts are queried server-side and passed
// in, so no number here is typed by hand.

import { useMemo, useState } from "react";
import Link from "next/link";

import s from "./hp.module.css";
import v from "./v2.module.css";
import {
  calculateBMR,
  calculateTDEE,
  getCalorieTarget,
  getMacroTargets,
  ACTIVITY_LEVEL_LABELS,
  type ActivityLevel,
  type FitnessGoal,
  type Gender,
} from "@/lib/tdee";
import { INK, MUTE, DIM, LIME, RULE, RULE_2, PANEL_2, BG, MONO, sub, body, label, figure } from "./theme";

export type DoorSpec = {
  goal: string;
  who: string;
  what: string;
  href: string;
  accent: string;
  fitnessGoal: FitnessGoal;
  /** Illustrative daily split for this goal, as percentages. */
  split: [string, number][];
  count: number;
};

const ACTS: ActivityLevel[] = [
  "SEDENTARY",
  "LIGHTLY_ACTIVE",
  "MODERATELY_ACTIVE",
  "VERY_ACTIVE",
  "EXTREMELY_ACTIVE",
];

const DIETS = ["Veg", "Eggetarian", "Non-veg", "Jain", "Vegan"];

/* The four meals, in eating order, as the share of the day each carries. These
   are the plan builder's own slot weights. */
const MEAL_SHARE: [string, number][] = [
  ["Breakfast", 0.25],
  ["Lunch", 0.32],
  ["Snack", 0.13],
  ["Dinner", 0.3],
];

export default function Finder({ doors }: { doors: DoorSpec[] }) {
  const [door, setDoor] = useState(0);
  const [sex, setSex] = useState<Gender>("MALE");
  const [age, setAge] = useState(31);
  const [height, setHeight] = useState(172);
  const [weight, setWeight] = useState(78);
  const [act, setAct] = useState<ActivityLevel>("LIGHTLY_ACTIVE");
  const [diet, setDiet] = useState("Veg");

  const active = doors[door]!;

  const plan = useMemo(() => {
    const profile = {
      weightKg: weight,
      heightCm: height,
      age,
      gender: sex,
      activityLevel: act,
    };
    const bmr = Math.round(calculateBMR(profile));
    const tdee = calculateTDEE(profile);
    const target = getCalorieTarget(tdee, active.fitnessGoal, sex);
    const macros = getMacroTargets(target, active.fitnessGoal, weight);
    /* getCalorieTarget's own floor, restated so the ledger can say whether it
       bit. 1200 for women, 1500 for men, per lib/tdee.ts. */
    const floor = sex === "FEMALE" ? 1200 : 1500;
    return { bmr, tdee, target, macros, floor };
  }, [weight, height, age, sex, act, active.fitnessGoal]);

  const seg = (on: boolean) => ({
    background: on ? LIME : BG,
    color: on ? BG : MUTE,
  });

  return (
    <>
      <div role="radiogroup" aria-label="Your goal" style={{ marginTop: "clamp(28px,3.6vw,46px)", borderTop: `1px solid ${RULE}` }}>
        {doors.map((d, i) => {
          const on = i === door;
          return (
            <button
              key={d.goal}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setDoor(i)}
              className={`${v.row} ${v.rowBtn} ${v.doorRow}`}
              style={{
                background: on ? PANEL_2 : BG,
                borderLeftColor: on ? d.accent : "transparent",
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", color: DIM }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 style={{ ...sub("clamp(1.25rem,2.1vw,1.7rem)"), color: d.accent }}>{d.goal}</h3>
              <p className={v.hideSm} style={{ ...body(14), maxWidth: "none" }}>
                {d.who}
              </p>
              <span className={v.mini} aria-hidden="true">
                {d.split.map(([k, pctv], j) => (
                  <span
                    key={k}
                    style={{
                      width: `${pctv}%`,
                      background: j === 0 ? d.accent : j === 1 ? MUTE : RULE_2,
                    }}
                  />
                ))}
              </span>
              <span
                style={{
                  textAlign: "right",
                  fontFamily: MONO,
                  fontSize: 12,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: d.accent,
                  whiteSpace: "nowrap",
                }}
              >
                {d.count} {d.count === 1 ? "plan" : "plans"}
              </span>
            </button>
          );
        })}
      </div>

      <div className={v.panels}>
        <div className={v.panelIn}>
          <div>
            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.2em" }}>Your numbers</span>
            <p style={{ ...body(15), color: INK, margin: "12px 0 0", maxWidth: "52ch" }}>
              {active.what}
            </p>
          </div>

          <div className={v.field}>
            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.18em" }}>
              Sex, for the resting figure
            </span>
            <div role="radiogroup" aria-label="Sex" className={v.seg}>
              {(["MALE", "FEMALE"] as Gender[]).map((o) => (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={sex === o}
                  onClick={() => setSex(o)}
                  style={seg(sex === o)}
                >
                  {o === "MALE" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>

          {(
            [
              ["Age", age, setAge, 16, 80, 1, `${age} years`],
              ["Height", height, setHeight, 140, 205, 1, `${height} cm`],
              ["Weight", weight, setWeight, 40, 150, 1, `${weight} kg`],
            ] as const
          ).map(([name, value, set, min, max, step, shown]) => (
            <div key={name}>
              <div className={v.dialHead}>
                <label htmlFor={`hp-dial-${name}`} style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.18em" }}>
                  {name}
                </label>
                <b style={figure("clamp(1.3rem,2.2vw,1.9rem)")}>{shown}</b>
              </div>
              <input
                id={`hp-dial-${name}`}
                className={v.range}
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                aria-valuetext={shown}
                onChange={(e) => (set as (n: number) => void)(Number(e.target.value))}
              />
              <div className={v.rangeEnds}>
                <span>{min}</span>
                <span>{max}</span>
              </div>
            </div>
          ))}

          <div className={v.field}>
            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.18em" }}>
              How your week actually moves
            </span>
            <div role="radiogroup" aria-label="Activity" className={v.seg}>
              {ACTS.map((o) => (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={act === o}
                  onClick={() => setAct(o)}
                  style={{ ...seg(act === o), minWidth: 104 }}
                >
                  {ACTIVITY_LEVEL_LABELS[o].replace(" (Athlete)", "").replace("ly Active", "")}
                </button>
              ))}
            </div>
          </div>

          <div className={v.field}>
            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.18em" }}>
              Diet, as the plans are named
            </span>
            <div role="radiogroup" aria-label="Diet" className={v.seg}>
              {DIETS.map((o) => (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={diet === o}
                  onClick={() => setDiet(o)}
                  style={seg(diet === o)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={v.panelOut}>
          <div
            style={{
              padding: "clamp(22px,3vw,38px) clamp(22px,3vw,38px) clamp(16px,2vw,22px)",
              borderBottom: `1px solid ${RULE}`,
            }}
          >
            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.2em" }}>
              Your target, computed live
            </span>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "clamp(14px,2vw,24px)", marginTop: 14, flexWrap: "wrap" }}>
              <b style={{ ...figure("clamp(3.4rem,8vw,6rem)", active.accent), lineHeight: 0.8 }}>
                {plan.target.toLocaleString("en-IN")}
              </b>
              <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.16em", paddingBottom: 8 }}>
                kcal per day
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(12px,2vw,22px)", marginTop: 16 }}>
              {(
                [
                  ["Protein", plan.macros.proteinG, active.accent],
                  ["Carbohydrate", plan.macros.carbsG, MUTE],
                  ["Fat", plan.macros.fatG, DIM],
                ] as const
              ).map(([name, g, colour]) => (
                <span key={name} style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 88 }}>
                  <b style={{ ...figure("clamp(1.2rem,2vw,1.7rem)", colour) }}>{g}g</b>
                  <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>{name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* The working. This is the part a visitor can check, and the reason
              the section is a calculator rather than four cards. */}
          <ol className={v.ledger}>
            {(
              [
                [`Resting figure, Mifflin St Jeor`, `${plan.bmr.toLocaleString("en-IN")} kcal`, MUTE],
                [`Activity, ${ACTIVITY_LEVEL_LABELS[act].toLowerCase()}`, `${plan.tdee.toLocaleString("en-IN")} kcal`, MUTE],
                [`Goal adjustment, ${active.goal.toLowerCase()}`, `${plan.target - plan.tdee >= 0 ? "+" : ""}${(plan.target - plan.tdee).toLocaleString("en-IN")} kcal`, MUTE],
                [
                  plan.target === plan.floor
                    ? `Held at the ${plan.floor.toLocaleString("en-IN")} kcal floor`
                    : `Above the ${plan.floor.toLocaleString("en-IN")} kcal floor`,
                  plan.target === plan.floor ? "floor applied" : "no floor needed",
                  plan.target === plan.floor ? LIME : DIM,
                ],
              ] as const
            ).map(([k, val, colour]) => (
              <li key={k} className={v.ledgerRow}>
                <span style={{ ...body(13.5), maxWidth: "none" }}>{k}</span>
                <b style={{ fontFamily: MONO, fontSize: 13, color: colour, whiteSpace: "nowrap", fontWeight: 500 }}>
                  {val}
                </b>
              </li>
            ))}
          </ol>

          <div style={{ padding: "clamp(20px,2.6vw,30px) clamp(22px,3vw,38px)", display: "flex", flexDirection: "column", gap: 14 }}>
            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.2em" }}>
              The four meals it is spent on
            </span>
            <div className={v.mealSplit} aria-hidden="true">
              {MEAL_SHARE.map(([name, share], i) => (
                <span
                  key={name}
                  title={name}
                  style={{
                    flexGrow: share * 100,
                    background: i === MEAL_SHARE.length - 1 ? LIME : PANEL_2,
                    color: i === MEAL_SHARE.length - 1 ? BG : MUTE,
                  }}
                >
                  {Math.round(plan.target * share)}
                </span>
              ))}
            </div>
            <span className="sr-only">
              {MEAL_SHARE.map(([name, share]) => `${name} ${Math.round(plan.target * share)} kcal`).join(", ")}
            </span>

            <div className={s.actions} style={{ marginTop: 6 }}>
              <Link href={`${active.href}&diet=${encodeURIComponent(diet)}`} className={s.btn}>
                See {active.count} {active.goal.toLowerCase()} plans
              </Link>
              <Link href="/tdee-calculator" className={s.link}>
                The full calculator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
