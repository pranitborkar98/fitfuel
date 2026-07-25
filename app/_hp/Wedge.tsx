// app/_hp/Wedge.tsx
//
// The positioning, as a four-column comparison. This was the single best idea on
// the old page ("every app trusts you to log it, we already know") and it was
// buried under a wall of feature sections. It is the argument, so it sits third.

import s from "./hp.module.css";
import { WRAP, SECTION, PAPER, INK_3, GREEN, display, sub, body, label } from "./theme";

const COLS: { who: string; does: string; gap: string }[] = [
  { who: "A tiffin service", does: "Cooks your food", gap: "Never tracks a gram of it" },
  { who: "A fitness app", does: "Tracks your food", gap: "Only what you remember to type in" },
  { who: "A supplement brand", does: "Sells you pills", gap: "With no plan underneath them" },
];

export default function Wedge() {
  return (
    <section aria-labelledby="hp-wedge" style={{ ...SECTION, background: "#ebe6dc" }}>
      <div style={WRAP}>
        <div className={s.reveal}>
          <span style={label(GREEN)}>Why this is one system</span>
          <h2 id="hp-wedge" style={{ ...display("clamp(2.1rem,4.6vw,3.5rem)"), marginTop: 14, maxWidth: "20ch" }}>
            Every other app trusts you to log it. We already know.
          </h2>
          <p style={{ ...body(17), marginTop: 18, maxWidth: "56ch" }}>
            Self-reported food is where every diet app quietly fails: you guess the portion,
            you forget the chai, and the numbers flatter you. We own the plate, so the
            measurement happens in the kitchen instead of in your memory.
          </p>
        </div>

        <div className={s.wedge}>
          {COLS.map((c) => (
            <div key={c.who} className={s.wedgeCell}>
              <h3 style={{ ...sub("clamp(1.05rem,1.5vw,1.22rem)") }}>{c.who}</h3>
              <p style={{ ...body(14.5), marginTop: 12 }}>{c.does}</p>
              <p style={{ ...body(14.5), color: INK_3, marginTop: 8 }}>{c.gap}</p>
            </div>
          ))}

          <div className={`${s.wedgeCell} ${s.wedgeUs}`}>
            <h3 style={{ ...sub("clamp(1.05rem,1.5vw,1.22rem)"), color: PAPER }}>FitFuel</h3>
            <p style={{ ...body(14.5), color: "rgba(245,242,236,0.9)", marginTop: 12 }}>
              Cooks it, weighs it, logs it, and moves your target when you stall.
            </p>
            <p style={{ ...body(14.5), color: "rgba(245,242,236,0.72)", marginTop: 8 }}>
              Measured in our kitchen, not guessed at by you.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
