// app/_hp/Steps.tsx
//
// HOW IT WORKS, in three steps, from the customer's side of the counter.
//
// This replaces the 4am-kitchen film as the explanation of the business. The
// film is a good piece of work and it is still on the page, but it explains
// OUR day — the cook sheet, the scale, the dispatch — and a person deciding
// what to eat tomorrow needs THEIR day: choose, receive, eat. Two outside
// reviews and the owner all independently said the same thing.
//
// Three steps, no more. Every version of this that grew to five or eight
// became a process diagram again.
//
// SERVER COMPONENT.

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, PANEL, INK, display, sub, body } from "./theme";

const STEPS: [string, string, string][] = [
  [
    "Pick your goal",
    "Lose fat, build muscle, eat well, or eat for a condition",
    "Four doors, not 126. You see the full menu and every macro before you pay, with no signup wall in the way.",
  ],
  [
    "We cook it and weigh it",
    "From 04:00, in our own licensed kitchen in Kharadi",
    "Your portions hit your numbers on a scale before the box is sealed. At your door by 08:00, six mornings a week.",
  ],
  [
    "Eat. That is the whole job",
    "No logging, no counting, no deciding",
    "The meal arrives already in your diary with the macros it was weighed to, because the kitchen and the tracker are the same system.",
  ],
];

export default function Steps() {
  return (
    <section aria-labelledby="hp-steps" style={{ ...SECTION, background: PANEL }}>
      <div style={WRAP}>
        <Idx label="How it works" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2 id="hp-steps" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "12ch" }}>
            Three steps, then never think about it again
          </h2>
          <p style={{ ...body(16.5) }}>
            The real competition is not another healthy meal service. It is deciding, at
            7pm, whether to order from Swiggy again. This removes the decision.
          </p>
        </div>

        <div className={s.steps} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {STEPS.map(([h, sub_, p], i) => (
            <div key={h} className={s.step}>
              <span className={s.stepN}>{String(i + 1).padStart(2, "0")}</span>
              <h3 style={sub("clamp(1.2rem,2vw,1.55rem)")}>{h}</h3>
              <p style={{ ...body(15), color: INK, marginTop: 10 }}>{sub_}</p>
              <p style={{ ...body(14.5), marginTop: 10 }}>{p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
