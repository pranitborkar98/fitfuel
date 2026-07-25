// app/_hp/Facts.tsx
//
// Four checkable facts, immediately under the hero. The old page put its
// credibility layer (FSSAI, PayU, aggregators) eleven sections down behind
// eight blocks of FitFuel talking about FitFuel. In food, the licence number
// does more work than the copy, so it goes above the fold-and-a-bit.

import s from "./hp.module.css";
import { WRAP, INK_3, GREEN, figure, body, label } from "./theme";

const FACTS: [string, string, string][] = [
  ["126", "goal and condition plans", "70 of them condition-specific"],
  ["04:00", "the kitchen starts", "at your door by 08:00"],
  ["15", "areas in east Pune", "one kitchen, served properly"],
  ["FSSAI", "21523035002815", "our own licence, our own kitchen"],
];

export default function Facts() {
  return (
    <section aria-label="FitFuel at a glance" style={WRAP}>
      <div className={s.facts}>
        {FACTS.map(([big, mid_, note]) => (
          <div key={big} className={s.fact}>
            <div style={figure("clamp(1.6rem,3vw,2.5rem)", GREEN)}>{big}</div>
            <div style={{ ...body(14.5), marginTop: 10, fontWeight: 500 }}>{mid_}</div>
            <div style={{ ...label(INK_3), fontSize: 11, letterSpacing: "0.12em", marginTop: 6 }}>
              {note}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
