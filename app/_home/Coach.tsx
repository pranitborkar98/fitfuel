// app/_home/Coach.tsx
//
// THE MISSING PRODUCT.
//
// The homepage described a kitchen, an app and a supplement stack. It said
// nothing about the largest thing FitFuel actually runs: a coach that reads
// your week and moves your targets, plus a scheduled comms loop that reaches
// you twice a day. All of it ships today. None of it was on the site.
//
// Everything stated here maps to real code:
//   07:00  app/api/cron/morning-preview   -> `morning_meal_preview`
//   21:00  app/api/cron/evening-recap     -> `evening_recap` + log nudge
//   weekly lib/coach/weekly-review.ts     -> headline, what's working, focus
//   weekly lib/coach/recalibration.ts     -> measured trend vs goal rate,
//                                            returns a calorie-target delta
//   daily  lib/coach/nudges.ts            -> plateau / milestone / missed
//   daily  app/api/cron/snapshot-consistency -> the 0-100 score
//
// Deliberately NOT called an "AI trainer chat". That specific feature does
// not exist and was removed from the pricing table earlier. What does exist
// is a deterministic coaching spine (Sense -> Summarise -> Reason -> Act)
// whose Reason layer is rules-based today; `WeeklyReview.source` is typed
// `"rules" | "llm"` precisely so a model can be swapped in without changing
// the contract. The copy below describes the behaviour, not the plumbing,
// and claims nothing that is not running.
//
// SERVER COMPONENT. The counter is pure CSS.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, MUTE, DIM, huge, mid, copy, tag } from "./theme";

// The recalibration demo: a real before/after of the kind
// computeRecalibration() returns when a plateau is detected.
const TARGET_FROM = 1850;
const TARGET_TO = 1720;

const SENDS: [string, string, string][] = [
  ["07:00", "Morning preview", "Today's meals, already logged against your targets."],
  ["21:00", "Evening recap", "What you actually ate, and tomorrow's plan."],
];

const WATCHES: [string, string][] = [
  ["Plateau", "Weight flat for a week against your goal rate. Targets move."],
  ["Milestone", "You hit a number worth knowing about. You hear about it."],
  ["Missed sessions", "Training slipped while everything else held. One nudge, not ten."],
];

export default function Coach() {
  return (
    <section
      aria-labelledby="coach-heading"
      style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}
    >
      <div style={WRAP}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <h2 id="coach-heading" style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "15ch" }}>
              It watches the week so you do not have to
            </h2>
            <Link href="/how-it-works" className="ff-a">How the coach works <ArrowRight size={17} /></Link>
          </div>
        </Reveal>

        {/* ── The recalibration, performed ──────────────────────────────
            The number counts down as you scroll, which is exactly what
            the recalibration engine does: measure the trend, move the
            target. The animated figure is aria-hidden and a plain
            sentence carries the same fact for assistive tech. */}
        <Reveal delay={0.05}>
          <div className="ff-recal" style={{ marginTop: "clamp(38px,5vw,64px)", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: "clamp(28px,4vw,52px) 0" }}>
            <div className="ff-recal-grid">
              <div>
                <div style={tag(DIM)}>Your target, week 3</div>
                <div style={{ ...huge("clamp(2.6rem,6vw,4.6rem)"), color: DIM, marginTop: 12, lineHeight: 0.85 }}>
                  {TARGET_FROM.toLocaleString("en-IN")}
                </div>
              </div>

              <div aria-hidden className="ff-recal-arrow" style={{ ...mid("clamp(1.4rem,2.4vw,2rem)"), color: RULE }}>
                <span className="ff-recal-track" />
              </div>

              <div>
                <div style={tag(LIME)}>Week 4, recalibrated</div>
                {/* The counting figure. CSS-generated content is not
                    reliably exposed to screen readers, so it is hidden
                    and the sr-only line below states the value. */}
                <div
                  aria-hidden
                  className="ff-count"
                  style={{ ...huge("clamp(2.6rem,6vw,4.6rem)"), color: LIME, marginTop: 12, lineHeight: 0.85 }}
                />
                <span className="sr-only">
                  Recalibrated to {TARGET_TO.toLocaleString("en-IN")} calories per day.
                </span>
                {/* No-JS / no-@property fallback: if the counter cannot
                    render, this static figure is what shows. */}
                <div className="ff-count-fallback" style={{ ...huge("clamp(2.6rem,6vw,4.6rem)"), color: LIME, marginTop: 12, lineHeight: 0.85 }}>
                  {TARGET_TO.toLocaleString("en-IN")}
                </div>
              </div>

              <p style={{ ...copy(15.5), maxWidth: "40ch", alignSelf: "end" }}>
                Your weight went flat for seven days against the rate your goal needs.
                The target moved on its own. You did not have to ask, and nobody had
                to guess: it is energy-balance arithmetic on numbers we already hold.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="ff-coach-cols" style={{ marginTop: "clamp(40px,5vw,70px)" }}>
          {/* ── Twice a day, on a clock ─────────────────────────────── */}
          <div>
            <h3 style={{ ...mid("clamp(1.5rem,2.6vw,2.1rem)") }}>Twice a day, in your inbox</h3>
            <ol className="ff-sends">
              {SENDS.map(([t, name, what]) => (
                <li key={t} className="ff-send">
                  <span className="ff-send-time" style={{ ...mid("clamp(1.5rem,2.4vw,2rem)"), color: LIME }}>{t}</span>
                  <span>
                    <span style={{ ...copy(15.5), color: INK, display: "block", fontWeight: 500 }}>{name}</span>
                    <span style={{ ...copy(14.5), display: "block", marginTop: 4 }}>{what}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p style={{ ...copy(14), color: DIM, marginTop: 18 }}>
              Plus a weekly digest, and delivery alerts when your box goes out.
              All of it switchable, per channel, in your settings.
            </p>
          </div>

          {/* ── What it watches for ─────────────────────────────────── */}
          <div>
            <h3 style={{ ...mid("clamp(1.5rem,2.6vw,2.1rem)") }}>What it watches for</h3>
            <dl className="ff-watch">
              {WATCHES.map(([k, v]) => (
                <div key={k} className="ff-watch-row">
                  <dt style={{ ...mid("clamp(1.1rem,1.6vw,1.35rem)"), color: INK }}>{k}</dt>
                  <dd style={{ ...copy(14.5), margin: 0 }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
