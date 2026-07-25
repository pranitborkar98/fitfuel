// app/_home/Recalibrate.tsx
//
// THE ADAPTIVE ENGINE, WITH ITS ACTUAL CONSTANTS ON THE PAGE.
//
// lib/coach/recalibration.ts is a pure function: it takes a WeeklySummary,
// compares your measured weight trend against the rate your goal expects, and
// moves your calorie target. No LLM, no black box, no "AI coach" claim the
// codebase cannot support. Every number below is a constant in that file:
//
//   KCAL_PER_KG = 7700     the energy in a kilo of body mass
//   MAX_DELTA   = 300      a single recalibration is capped at 300 kcal/day
//   FLOOR       = 1200     it will never recommend a target below this
//   EXPECTED_RATE          LOSE_WEIGHT -0.5 kg/wk, GAIN_MUSCLE +0.25 kg/wk
//   toleranceFor()         0.25 kg/wk band on those two, 0.3 on the rest
//
// It also refuses to act on thin data: fewer than two weigh-ins in the window
// returns `insufficient_data` and changes nothing.
//
// PUBLISHING THE CAPS IS THE POINT. Anyone can claim their app adapts. Almost
// nobody will tell you the size of the adjustment, the floor it will not go
// under, or the conditions where it declines to act, because those are the
// numbers that show whether the thing is safe. The homepage says "the target
// moves when you plateau" in one line of the app section; this is the
// mechanism behind that line, and it was nowhere.
//
// Mechanism: a specification table. Deliberately the plainest block on the
// page, because the argument here is precision and a decorated block would
// undercut it.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, DIM, huge, mid, copy, tag } from "./theme";

/* Straight out of lib/coach/recalibration.ts. If a constant changes there,
   it changes here. */
const SPEC: [string, string, string][] = [
  ["Energy basis", "7,700 kcal", "The accepted energy in one kilogram of body mass"],
  ["Adjustment cap", "±300 kcal/day", "One recalibration can never swing further than this"],
  ["Hard floor", "1,200 kcal/day", "No recommendation ever goes below it, whatever the trend"],
  ["Fat loss target", "−0.5 kg/week", "The rate a weight-loss goal is measured against"],
  ["Muscle target", "+0.25 kg/week", "The rate a muscle-gain goal is measured against"],
  ["Tolerance band", "0.25 kg/week", "Inside this, you are on track and nothing moves"],
];

export default function Recalibrate() {
  return (
    <section
      aria-labelledby="recal-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0" }}
    >
      <div style={WRAP}>
        <Reveal>
          <span style={tag(LIME)}>Arithmetic, not a black box</span>
          <h2 id="recal-heading" style={{ ...huge("clamp(2.4rem,6.4vw,5.2rem)"), maxWidth: "16ch", marginTop: 16 }}>
            When you stall, the target moves
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <p style={{ ...copy(16.5), maxWidth: "60ch", marginTop: 22 }}>
            Every week the system reads your actual weight trend against the rate your goal expects
            and adjusts your calorie target to close the gap. There is no model guessing at it.
            It is energy balance, and here are the exact limits it works inside.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <dl className="ff-rspec">
            {SPEC.map(([k, v, why]) => (
              <div key={k} className="ff-rspec-row">
                <dt className="ff-rspec-k">{k}</dt>
                <dd className="ff-rspec-v">{v}</dd>
                <dd className="ff-rspec-why">{why}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* The refusal case. This is the most trustworthy thing the engine
            does and the easiest to leave out of marketing. */}
        <Reveal delay={0.16}>
          <div className="ff-rspec-note">
            <h3 style={{ ...mid("clamp(1.2rem,1.9vw,1.5rem)"), color: INK }}>
              And when it does not know, it says so
            </h3>
            <p style={{ ...copy(15), marginTop: 12, maxWidth: "62ch" }}>
              Fewer than two weigh-ins in the window and it returns nothing at all. No adjustment,
              no confident-sounding number pulled out of one data point. It asks you to weigh in
              again and waits. An engine that always has an answer is an engine that is guessing.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div style={{ marginTop: "clamp(26px,3vw,38px)" }}>
            <Link href="/how-it-works" className="ff-a">
              The whole loop <ArrowRight size={17} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
