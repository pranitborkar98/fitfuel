// app/_hp/Pick.tsx
//
// SELF-SEGMENTATION. Missing from every version of this homepage so far.
//
// A person cutting weight and a person managing PCOS have nothing in common
// except the delivery van, and until now the page spoke to neither. It listed
// 126 plans and 38 conditions and left the visitor to work out which row was
// theirs, which is work they will not do.
//
// Four doors, each landing on the filtered catalogue. This is deliberately
// four and not 126: the job of this block is to get someone out of "is this
// for me" and into a list where everything is for them.
//
// NO INVENTED PRICES. Each card states the trial day (Rs 400, real and used
// site-wide) rather than a per-day figure for the plan behind it, because
// PlanPrice varies by duration, tier and diet and a single headline number
// would be wrong for most of the 3,614 rows. If a "from Rs X/day" line is
// wanted here, it needs to come from a real query, not from a copywriter.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, INK, LIME, display, sub, body } from "./theme";

type Door = { goal: string; who: string; what: string; href: string };

const DOORS: Door[] = [
  {
    goal: "Lose fat",
    who: "You want the weight down without living on boiled eggs.",
    what: "Calorie-controlled, protein held high so you keep muscle while the weight comes off.",
    href: "/plans?category=WEIGHT_LOSS",
  },
  {
    goal: "Build muscle",
    who: "You train, and eating enough is the part that keeps failing.",
    what: "Higher calories, protein spread across four meals so you actually hit the number.",
    href: "/plans?category=MUSCLE_GAIN",
  },
  {
    goal: "Just eat well",
    who: "No target. You are tired of deciding what is for dinner.",
    what: "Balanced macros, varied cuisines, cooked properly. Nothing about it feels like a diet.",
    href: "/plans?category=BALANCED",
  },
  {
    goal: "Eat for a condition",
    who: "Diabetes, PCOS, thyroid, fatty liver, postpartum, and 33 more.",
    what: "Seventy plans written for a diagnosis by a nutritionist, not a generic plan with the rice removed.",
    href: "/plans?category=LIFESTYLE_MEDICAL",
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

        <div className={s.stats} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {DOORS.map((d) => (
            <Link
              key={d.goal}
              href={d.href}
              className={s.stat}
              style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}
            >
              <h3 style={{ ...sub("clamp(1.2rem,2vw,1.6rem)"), color: LIME }}>{d.goal}</h3>
              <p style={{ ...body(15), color: INK, marginTop: 12 }}>{d.who}</p>
              <p style={{ ...body(14), marginTop: 10 }}>{d.what}</p>
              <span
                style={{ ...body(14.5), color: LIME, marginTop: "auto", paddingTop: 18, fontWeight: 600 }}
              >
                See these plans
              </span>
            </Link>
          ))}
        </div>

        <p style={{ ...body(15), marginTop: 22 }}>
          Not sure yet? Every plan&rsquo;s full menu is public before you pay, and the trial
          day is Rs 400 with nothing to cancel.
        </p>
      </div>
    </section>
  );
}
