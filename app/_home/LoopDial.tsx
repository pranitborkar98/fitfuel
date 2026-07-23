// app/_home/LoopDial.tsx
//
// THE LOOP, AS AN ACTUAL LOOP.
//
// The section is called "the loop that runs your day" and it was rendered as
// a list. A list is not a loop. This puts the eight steps on a ring in real
// 3D space and rotates it as you scroll, so you travel forward through the
// day: 04:00 cook comes round, then 08:00 deliver, then log, train, weigh in.
// The form is the argument.
//
// SERVER COMPONENT. Zero JavaScript ships for this.
//
// It runs on native CSS scroll-driven animations (`animation-timeline`),
// which reached ~90% support and, critically, run on the compositor rather
// than the main thread. That is the whole reason this is affordable: a
// three.js scene for the same effect would cost ~150KB gzipped before a
// single frame renders, on a page whose customers order from mid-range
// Android phones in Pune over mobile data.
//
// Degradation is real, not theoretical, and there are three tiers:
//   1. No `animation-timeline` support  -> the flat row list, full content.
//   2. `prefers-reduced-motion`         -> the flat row list, full content.
//   3. Narrow viewports                 -> the flat row list, full content.
// The fallback is not a downgrade; it is the layout that shipped before.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, DIM, huge, mid, copy, tag } from "./theme";

export type Step = { name: string; when: string; what: string };

export const LOOP_STEPS: Step[] = [
  { name: "Onboard",     when: "Once",       what: "Height, weight, goal, condition, diet. We compute your targets." },
  { name: "Cook",        when: "04:00",      what: "Your portions are weighed to your macros before they are sealed." },
  { name: "Deliver",     when: "08:00",      what: "At your door across east Pune, six days a week." },
  { name: "Log",         when: "As you eat", what: "The meals arrive already logged. Nothing to type in." },
  { name: "Train",       when: "Evening",    what: "Pick from 952 exercises. The burn feeds your net figure." },
  { name: "Weigh in",    when: "Morning",    what: "Weight, waist, body fat. Thirty seconds on the app." },
  { name: "Recalibrate", when: "Weekly",     what: "Plateau detected, targets move. You do not have to ask." },
  { name: "Score",       when: "Daily",      what: "One consistency figure, zero to a hundred. No vanity metrics." },
];

export default function LoopDial() {
  const n = LOOP_STEPS.length;
  // Angles are computed here, not in a CSS calc(). The first version used
  // `calc(-360deg / var(--n) * (var(--n) - 1))` and it silently resolved to
  // +45deg instead of -315deg, so the ring rotated a twelfth of the way the
  // wrong direction. Plain numbers cannot do that.
  const stepAngle = 360 / n;              // 45deg between neighbours
  const turnAngle = -stepAngle * (n - 1); // -315deg, step 1 through step 8

  return (
    <section id="loop" className="ff-dial-sec" style={{ scrollMarginTop: 70, background: "#050504", borderTop: `1px solid ${RULE}` }}>
      {/* ── The 3D dial. Tall runway, sticky stage inside it: the page keeps
             scrolling while the ring turns in place. ─────────────────────── */}
      <div className="ff-dial-runway">
        <div className="ff-dial-stage">
          <div style={WRAP}>
            <div className="ff-dial-head">
              <h2 style={{ ...huge("clamp(2.2rem,5.2vw,4.2rem)"), maxWidth: "14ch" }}>The loop that runs your day</h2>
              <Link href="/how-it-works" className="ff-a">The full method <ArrowRight size={17} /></Link>
            </div>

            <div className="ff-dial-scene">
              {/* The ring. Each node sits at its own angle on the cylinder;
                  the ring counter-rotates on scroll to bring them forward. */}
              <ol
                className="ff-dial-ring"
                style={{
                  ["--n" as string]: n,
                  ["--turn" as string]: `${turnAngle}deg`,
                  ["--step" as string]: `${stepAngle}deg`,
                }}
              >
                {LOOP_STEPS.map((s, i) => (
                  <li key={s.name} className="ff-dial-node" style={{ ["--i" as string]: i }}>
                    <span aria-hidden className="ff-dial-num" style={{ ...tag(DIM), fontSize: 12.5 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="ff-dial-when" style={{ ...mid("clamp(1rem,1.5vw,1.35rem)"), color: LIME }}>{s.when}</span>
                    <h3 className="ff-dial-name" style={mid("clamp(2rem,4.4vw,3.6rem)")}>{s.name}</h3>
                    <p className="ff-dial-what" style={copy(15.5)}>{s.what}</p>
                  </li>
                ))}
              </ol>

              {/* Fixed sight-line marking the front of the dial. It is the
                  "now" mark: whatever sits on it is the current step. */}
              <span aria-hidden className="ff-dial-line" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Fallback: the full list, for no-support / reduced-motion / narrow.
             Same content, no information withheld. ──────────────────────── */}
      <div className="ff-dial-flat">
        <div style={WRAP}>
          <Reveal>
            <div className="ff-dial-head">
              <h2 style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "14ch" }}>The loop that runs your day</h2>
              <Link href="/how-it-works" className="ff-a">The full method <ArrowRight size={17} /></Link>
            </div>
          </Reveal>
          <ol style={{ marginTop: "clamp(34px,4vw,56px)", listStyle: "none", margin: 0, padding: 0, position: "relative" }}>
            {LOOP_STEPS.map((s, i) => (
              <li key={s.name} className="ff-loop-row">
                <span className="ff-loop-rail" aria-hidden><span className="ff-loop-dot" /></span>
                <span aria-hidden className="ff-loop-n" style={tag(DIM)}>{String(i + 1).padStart(2, "0")}</span>
                <span className="ff-loop-when" style={{ ...mid("clamp(1.05rem,1.5vw,1.3rem)"), color: LIME }}>{s.when}</span>
                <h3 className="ff-loop-name" style={mid("clamp(1.5rem,2.6vw,2.2rem)")}>{s.name}</h3>
                <p className="ff-loop-what" style={copy(15)}>{s.what}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
