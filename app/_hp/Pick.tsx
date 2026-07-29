// app/_hp/Pick.tsx
//
// SELF-SEGMENTATION, now colour-coded and on the depth layer.
//
// A person cutting weight and a person managing PCOS have nothing in common
// except the delivery van, and the page listed 126 plans and 38 conditions and
// left the visitor to work out which row was theirs.
//
// The accents come from the locked design system's tier/category table, which
// already colour-codes goals and conditions across the plan surfaces (muscle
// #f59e0b, diabetic #2dd4bf, PCOS #f472b6 and the rest). Using them here is
// consistency rather than decoration: a visitor who met amber on the muscle
// plan page meets amber again here. This is the one place the homepage departs
// from DESIGN.md's "lime is the only chromatic value" rule, and deliberately —
// that rule was written for a page with no category structure, and this block
// IS category structure.
//
// Each card sits on the shared perspective and comes forward in sequence via
// --i, so the row reads as four physical planes rather than four rectangles.
//
// NO INVENTED PRICES. PlanPrice has 3,614 rows across durations and tiers, so
// a single "from Rs X" headline would be wrong for most of them.
//
// SERVER COMPONENT.

import type { CSSProperties } from "react";
import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, INK, DIM, LIME, display, sub, body } from "./theme";

type Door = {
  goal: string;
  who: string;
  what: string;
  href: string;
  accent: string;
  count: string;
};

const DOORS: Door[] = [
  {
    goal: "Lose fat",
    who: "You want the weight down without living on boiled eggs.",
    what: "Calorie-controlled, protein held high so you keep muscle while the weight comes off.",
    href: "/plans?category=WEIGHT_LOSS",
    accent: "#a3e635",
    count: "Weight loss plans",
  },
  {
    goal: "Build muscle",
    who: "You train, and eating enough is the part that keeps failing.",
    what: "Higher calories, protein spread across four meals so you actually hit the number.",
    href: "/plans?category=MUSCLE_GAIN",
    accent: "#f59e0b",
    count: "Muscle gain plans",
  },
  {
    goal: "Just eat well",
    who: "No target. You are tired of deciding what is for dinner.",
    what: "Balanced macros, varied cuisines, cooked properly. Nothing about it feels like a diet.",
    href: "/plans?category=BALANCED",
    accent: "#38bdf8",
    count: "Balanced plans",
  },
  {
    goal: "Eat for a condition",
    who: "Diabetes, PCOS, thyroid, fatty liver, postpartum, and 33 more.",
    what: "Seventy plans written for a diagnosis by a nutritionist, not a generic plan with the rice taken out.",
    href: "/plans?category=LIFESTYLE_MEDICAL",
    accent: "#2dd4bf",
    count: "70 condition plans",
  },
];

export default function Pick() {
  return (
    <section aria-labelledby="hp-pick" style={SECTION}>
      <div style={WRAP}>
        <Idx label="Find yours" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2 id="hp-pick" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "13ch" }}>
            Which one of these is you?
          </h2>
          <p style={{ ...body(16.5) }}>
            There are 126 plans, which is useless information until you know which four are
            yours. Pick the row that sounds like your life and the catalogue opens filtered.
          </p>
        </div>

        <div className={`${s.stats} ${s.deep}`} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {DOORS.map((d, i) => (
            <Link
              key={d.goal}
              href={d.href}
              className={`${s.stat} ${s.stagger} ${s.lift}`}
              style={
                {
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  borderTop: `2px solid ${d.accent}`,
                  "--i": i,
                } as CSSProperties
              }
            >
              <h3 style={{ ...sub("clamp(1.2rem,2vw,1.6rem)"), color: d.accent }}>{d.goal}</h3>
              <p style={{ ...body(15), color: INK, marginTop: 12 }}>{d.who}</p>
              <p style={{ ...body(14), marginTop: 10 }}>{d.what}</p>
              <span
                style={{
                  ...body(14),
                  color: d.accent,
                  marginTop: "auto",
                  paddingTop: 18,
                  fontWeight: 600,
                }}
              >
                {d.count} &rarr;
              </span>
            </Link>
          ))}
        </div>

        <p style={{ ...body(15), marginTop: 22, color: DIM }}>
          Not sure yet? Every plan&rsquo;s full menu is public before you pay, the{" "}
          <Link href="/tdee-calculator" style={{ color: LIME }}>
            TDEE calculator
          </Link>{" "}
          is free and needs no account, and the trial day is Rs 400 with nothing to cancel.
        </p>
      </div>
    </section>
  );
}
