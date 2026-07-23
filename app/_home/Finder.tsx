"use client";

// app/_home/Finder.tsx
//
// Client island: the only stateful block on the page. Two exclusive
// choices resolve to a real plan slug (all 12 goal x diet combinations
// exist in the catalog).

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, DIM, huge, GOALS, DIETS, GOAL_NAME } from "./theme";

export default function Finder() {
  const [goal, setGoal] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const ready = goal && diet;
  const planName = ready ? `${GOAL_NAME[goal!]}, ${DIETS.find((d) => d.key === diet)!.label}` : "";

  const bs = (a: boolean, big: boolean): CSSProperties => ({
    background: a ? LIME : "transparent",
    color: a ? "#000" : "#d0d0ca",
    border: `1px solid ${a ? LIME : "#33332f"}`,
    padding: big ? "15px 30px" : "13px 26px",
    minHeight: 44,
    fontSize: big ? 23 : 19,
  });

  return (
    <section id="finder" style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <Reveal><h2 style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "15ch" }}>Find your plan in a minute</h2></Reveal>
        <Reveal delay={0.06} style={{ marginTop: "clamp(30px,4vw,52px)" }}>
          {/* Two radio groups, not two rows of loose buttons: the selection
              is exclusive, so assistive tech should announce it that way. */}
          <div role="radiogroup" aria-label="Your goal" style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            {GOALS.map((g) => (
              <button key={g.key} role="radio" aria-checked={goal === g.key} onClick={() => setGoal(g.key)} className="ff-choice" style={bs(goal === g.key, true)}>{g.label}</button>
            ))}
          </div>
          <div role="radiogroup" aria-label="Your diet" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {DIETS.map((d) => (
              <button key={d.key} role="radio" aria-checked={diet === d.key} onClick={() => setDiet(d.key)} className="ff-choice" style={bs(diet === d.key, false)}>{d.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginTop: 40, paddingTop: 28, borderTop: `1px solid ${RULE}` }}>
            {/* The idle prompt used to render at #2e2e2b, which is 1.48:1 on
                this background: the one line telling you what to do was the
                least visible thing in the section. DIM is 5.4:1. */}
            <span aria-live="polite" style={{ ...huge("clamp(1.9rem,4.5vw,3.4rem)"), color: ready ? INK : DIM }}>
              {ready ? planName : "Choose a goal and diet"}
            </span>
            {ready ? <Link href={`/plans/${goal}-${diet}`} className="ff-btn">See my plan</Link> : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
