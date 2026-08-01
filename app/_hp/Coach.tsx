// app/_hp/Coach.tsx
//
// THE AI COACH, SHOWING ITS WORKING.
//
// THE ONE THING FROM THE PROTOTYPE THAT IS NOT HERE, AND WHY. The design puts a
// chat console in this section: a message thread, prompt chips, a text input, an
// "Ask" button, and a floating dock in the corner of every page. It labels them
// "Model integration pending" and "Front end ready, model not yet connected".
//
// There is no LLM SDK in package.json. lib/ai-trainer is a context engine that
// assembles a structured snapshot of one user and serialises it into a cacheable
// prompt block; lib/coach is deterministic arithmetic and rules. A visitor who
// types a question into that box gets nothing back, and a caption admitting so
// does not fix it: DESIGN.md's rule is never advertise a capability the product
// does not ship, and an input field is not an advertisement, it is an offer.
//
// So the console keeps its shape and loses its dead half. The left panel is what
// the coach actually does, the right is what it is allowed to read, and the
// engine underneath is the recalibration running live on draggable weigh-ins.
//
// That is not a weaker pitch. Every competitor in this category claims AI and
// shows a chat bubble. Almost none will publish the constant, the cap and the
// floor. Showing the arithmetic is the differentiator, and it is the only
// version of this section that stays true when a customer asks how the number
// was reached.
//
// NO PER-ROW HUES. The prototype colour-codes the feed rows amber, sky and teal.
// Those are five feeds of one snapshot, not five categories, so they step down
// one lime ramp instead.
//
// SERVER COMPONENT. CoachEngine, the draggable part, is the client island.

import Link from "next/link";

import s from "./hp.module.css";
import v from "./v2.module.css";
import Idx from "./Idx";
import CoachEngine from "./CoachEngine";
import { WRAP, INK, MUTE, DIM, LIME, RULE_2, display, sub, body, label, figure } from "./theme";

/* The real fields of TrainerContext (lib/ai-trainer/types.ts), grouped, with the
   share of the snapshot each group contributes. */
const FEEDS: [string, string, number][] = [
  ["Profile", "age, sex, height, weight, goal, conditions", 100],
  ["Nutrition, 7 days", "kcal in and out, adherence, protein, ratings", 92],
  ["Training, 7 days", "scheduled against completed, burn, programme", 74],
  ["Body", "weight trend, body fat, muscle mass, BMI", 61],
  ["Consistency", "this week's score and its five components", 48],
];

/* What it does, from lib/coach. Four actions, no chat window. */
const JOBS: [string, string][] = [
  [
    "Detects the plateau before you do",
    "Two weigh-ins spanning at least a fortnight, moving less than half a kilo between them. Not a bad Tuesday: a real flat stretch.",
  ],
  [
    "Recalculates the target",
    "Your actual rate against the rate your goal needs, converted through 7,700 kcal per kg, capped at 300 and floored at 1,200.",
  ],
  [
    "Shows you the working",
    "Every proposal arrives with the arithmetic that produced it. You choose whether to apply it; the target never moves behind your back.",
  ],
  [
    "Writes the weekly review",
    "Eaten against target, trained against scheduled, weight trend, consistency score and its weakest component.",
  ],
  [
    "Adjusts for the training",
    "Sets and reps in from a 952-exercise library, one net-calorie figure out, folded into the same target.",
  ],
  [
    "Nudges on three triggers only",
    "Plateau, milestone, missed workouts. Eighteen templates, on WhatsApp and email, and you control every channel.",
  ],
];

/* The published constants from lib/coach/recalibration.ts. CoachEngine runs
   these same four numbers in the browser, so the table and the control cannot
   disagree. */
const MATHS: [string, string, string][] = [
  ["7,700", "kcal per kg", "The energy in a kilogram of body mass. Every adjustment starts here."],
  ["±300", "kcal per day, capped", "One recalibration can never swing your target further than this."],
  ["1,200", "kcal floor", "No recommendation goes below it, whatever the arithmetic says."],
  ["14", "days minimum", "A plateau needs two weigh-ins a fortnight apart moving under half a kilo."],
];

export default function Coach() {
  return (
    <section id="hp-coach" aria-labelledby="hp-coach-h" style={{ padding: "clamp(56px,8vw,112px) 0" }}>
      <div style={WRAP}>
        <Idx label="The AI coach" />

        <div className={v.head}>
          <div className={v.rise}>
            <h2 id="hp-coach-h" style={{ ...display("clamp(2.4rem,6.6vw,5.4rem)"), maxWidth: "14ch" }}>
              Your <span style={{ color: LIME }}>AI coach</span> shows its working
            </h2>
          </div>
          <p className={v.rise} style={{ ...body(16.5), maxWidth: "48ch" }}>
            Three numbers govern every change to your target: the constant, the cap and the
            floor. Here is the arithmetic, run on a real fortnight of weigh-ins. Drag any one
            of them.
          </p>
        </div>

        <div className={v.console} style={{ marginTop: "clamp(30px,4vw,52px)" }}>
          <div className={v.consoleMain}>
            <div style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.18em" }}>
              What it does, and all of it ships today
            </div>
            <div style={{ borderTop: `1px solid ${RULE_2}` }}>
              {JOBS.slice(0, 3).map(([k, p]) => (
                <div key={k} style={{ padding: "15px 0", borderBottom: "1px solid #232320" }}>
                  <div style={sub("clamp(1.02rem,1.5vw,1.15rem)")}>{k}</div>
                  <p style={{ ...body(14), marginTop: 8 }}>{p}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={v.consoleSide}>
            <div style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.18em" }}>
              What it is allowed to read
            </div>
            {FEEDS.map(([k, val, w], i) => (
              <div key={k}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: 10,
                    fontFamily: "var(--font-mono), monospace",
                    fontSize: 12,
                    letterSpacing: "0.04em",
                    color: "#c6c6c0",
                  }}
                >
                  {k}
                  <span style={{ color: DIM }}>{val.split(",")[0]}</span>
                </div>
                <span className={v.feedTrack}>
                  <span
                    className={v.meter}
                    style={{ width: `${w}%`, background: i === 0 ? LIME : MUTE, opacity: 1 - i * 0.12 }}
                  />
                </span>
              </div>
            ))}
            <p style={{ ...body(12.5), color: DIM, margin: "auto 0 0" }}>
              The coach never invents a number. Every answer is drawn from the rows above and
              shows the arithmetic that produced it.
            </p>
          </div>
        </div>

        <div className={v.jobs}>
          {JOBS.slice(3).map(([k, p]) => (
            <div key={k} className={v.job}>
              <b style={sub("clamp(1.05rem,1.7vw,1.35rem)")}>{k}</b>
              <p style={{ ...body(13), maxWidth: "none" }}>{p}</p>
            </div>
          ))}
        </div>

        {/* THE ENGINE RUNNING. Real formula, real cap, real floor, in the
            browser. This is the section's visual, and it is interactive
            precisely because a customer can check it. */}
        <div style={{ marginTop: "clamp(30px,4vw,52px)" }}>
          <CoachEngine />
        </div>

        <div style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          <div className={v.subHead} style={{ borderBottom: 0, paddingBottom: 12 }}>
            <span>The constants, as shipped</span>
          </div>
          <dl className={v.consts}>
            {MATHS.map(([n, unit, note]) => (
              <div key={n} className={v.constRow}>
                <dt style={{ ...figure("clamp(1.7rem,3.2vw,2.8rem)"), margin: 0 }}>{n}</dt>
                <dd style={{ ...label(LIME), fontSize: 12, letterSpacing: "0.14em", margin: 0 }}>
                  {unit}
                </dd>
                <dd style={{ ...body(13.5), margin: 0, maxWidth: "none" }}>{note}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 22, maxWidth: "72ch" }}>
          The context engine and the serialiser that would feed a language model are built and
          running. The conversational trainer on top of them is not, so we do not sell one.
          Everything above runs today, in TypeScript, on your own numbers.
        </p>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/dashboard/progress" className={s.ghost}>
            See it on real data
          </Link>
          <Link href="/tdee-calculator" className={s.link}>
            Start with the free TDEE calculator
          </Link>
        </div>

        <span className="sr-only" style={{ color: INK }}>
          Coach constants: {MATHS.map(([n, u]) => `${n} ${u}`).join("; ")}.
        </span>
      </div>
    </section>
  );
}
