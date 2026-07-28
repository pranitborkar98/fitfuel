// app/_hp/Coach.tsx
//
// THE ENGINE. What the system knows about you, and what it does with it.
//
// HONESTY NOTE, and it is the whole design of this section. There is no LLM SDK
// in package.json. lib/ai-trainer is a context engine: it assembles a structured
// snapshot of one user (profile, 7-day nutrition, 7-day training, body trend,
// consistency, plus derived flags for plateau, streak, biggest gap and momentum)
// and serialises it into a cacheable prompt block. lib/coach is deterministic:
// computeRecalibration is energy-balance arithmetic with a ±300 kcal cap and a
// 1200 kcal floor, and detectCoachNudges is rules. The conversational trainer is
// not shipped, so this section does not sell one.
//
// That is not a weaker pitch, it is a better one. Every competitor claims AI.
// Almost none will publish the constant, the cap and the floor. Showing the
// arithmetic is the differentiator, and it is the only version of this section
// that stays true when a customer asks how the number was reached.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, INK, DIM, LIME, display, sub, body } from "./theme";

/* The real fields of TrainerContext (lib/ai-trainer/types.ts), grouped. */
const READS: [string, string][] = [
  ["Profile", "Age, sex, height, weight, target, goal, activity level, diet, conditions, allergies, TDEE and the calorie target with its source"],
  ["Nutrition, 7 days", "Days tracked, kcal in, kcal out, net, adherence against target, average protein, and the meals you rated highest and lowest"],
  ["Training, 7 days", "Scheduled against completed, calories burned, last session, programme type"],
  ["Body", "Latest weight and how stale it is, weigh-ins in 30 days, genuine 30-day trend, body fat, muscle mass, BMI"],
  ["Consistency", "This week's score, its five components, and the last four weeks as a trend"],
  ["Derived", "Plateau detected, streak length, your biggest single gap, and momentum: improving, flat or declining"],
];

/* The published constants from lib/coach/recalibration.ts. */
const MATHS: [string, string, string][] = [
  ["7700", "kcal per kg", "The energy in a kilogram of body mass. Every adjustment starts here."],
  ["±300", "kcal per day, capped", "One recalibration can never swing your target further than this."],
  ["1200", "kcal floor", "No recommendation ever goes below it, whatever the arithmetic says."],
  ["14", "days minimum", "A plateau needs two weigh-ins a fortnight apart moving under half a kilo."],
];

const DOES: [string, string][] = [
  [
    "Detects the plateau before you do",
    "Two weigh-ins spanning at least a fortnight, moving less than half a kilo between them. Not a bad Tuesday: a real flat stretch.",
  ],
  [
    "Recalculates the target, and shows its working",
    "Your actual rate against the rate your goal needs, converted through 7700 kcal per kg, capped at 300 and floored at 1200. You are shown the rationale, and you choose whether to apply it.",
  ],
  [
    "Writes the weekly review",
    "Every week: eaten against target, trained against scheduled, weight trend, consistency score and its weakest component.",
  ],
  [
    "Nudges, on three triggers only",
    "Plateau, milestone, missed workouts. Eighteen message templates, sent on WhatsApp and email, and you control every channel.",
  ],
];

export default function Coach() {
  return (
    <section aria-labelledby="hp-coach" style={SECTION}>
      <div style={WRAP}>
        <Idx label="The engine" />

        <div className={s.reveal}>
          <h2 id="hp-coach" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "15ch" }}>
            The intelligence is arithmetic, and we will show you all of it
          </h2>
          <p style={{ ...body(16.5), marginTop: 20 }}>
            Everyone in this category says AI. Almost nobody will tell you the constant,
            the cap or the floor. Here they are. The engine reads a snapshot of your last
            thirty days, decides whether you are actually stalled, and proposes one number
            with the reasoning attached. It never changes your target behind your back.
          </p>
        </div>

        {/* The maths, as four published constants. */}
        <div className={s.stats} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {MATHS.map(([n, unit, note]) => (
            <div key={n} className={s.stat}>
              <div style={{ ...sub("clamp(1.7rem,3.2vw,2.5rem)"), color: LIME }}>{n}</div>
              <div style={{ ...body(14.5), color: INK, marginTop: 9, fontWeight: 500 }}>{unit}</div>
              <p style={{ ...body(13.5), marginTop: 10 }}>{note}</p>
            </div>
          ))}
        </div>

        <div className={s.cols} style={{ marginTop: "clamp(34px,4.6vw,60px)" }}>
          <div>
            <h3 style={{ ...sub("clamp(1.3rem,2.2vw,1.7rem)"), marginBottom: 16 }}>
              What it reads: one snapshot, assembled per user
            </h3>
            <div style={{ borderTop: "1px solid #232320" }}>
              {READS.map(([k, v]) => (
                <div key={k} style={{ padding: "13px 0", borderBottom: "1px solid #232320" }}>
                  <div style={{ ...body(15), color: INK, fontWeight: 600 }}>{k}</div>
                  <p style={{ ...body(14), marginTop: 7 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ ...sub("clamp(1.3rem,2.2vw,1.7rem)"), marginBottom: 16 }}>
              What it does: four actions, no chat window
            </h3>
            <div style={{ borderTop: "1px solid #232320" }}>
              {DOES.map(([k, v]) => (
                <div key={k} style={{ padding: "15px 0", borderBottom: "1px solid #232320" }}>
                  <div style={{ ...sub("clamp(1.02rem,1.5vw,1.15rem)") }}>{k}</div>
                  <p style={{ ...body(14), marginTop: 8 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 22, maxWidth: "72ch" }}>
          Straight answer on the roadmap: the context engine and the serialiser that feed a
          language model are built and running. The conversational trainer on top of them is
          not shipped yet, so we do not sell it. Everything described above runs today, in
          TypeScript, on your own numbers.
        </p>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/dashboard/progress" className={s.ghost}>
            See it on real data
          </Link>
          <Link href="/tdee-calculator" className={s.link}>
            Start with the free TDEE calculator
          </Link>
        </div>
      </div>
    </section>
  );
}
