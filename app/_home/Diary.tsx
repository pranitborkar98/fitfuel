// app/_home/Diary.tsx
//
// THE FOOD LOG NOBODY KNEW SHIPPED.
//
// FitFuel is not only a meal service that logs its own boxes: it carries a
// 154-item food database (verified: FoodItem count = 154) and a full diary
// that logs anything you eat against your macro goals, plus water tracking.
// That is a MyFitnessPal-shaped feature sitting inside the product, and the
// homepage never said the words "food log".
//
// The section shows a REAL diary row rather than describing one, because a
// working fragment is more convincing than an adjective. The numbers are a
// plausible day, presented as a sample (labelled as such), not a live feed.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, MUTE, DIM, huge, mid, copy, tag } from "./theme";

// name, kcal, protein g, carbs g, fat g, source
const ROWS: [string, string, string, string, string, string][] = [
  ["Masala oats, FitFuel", "310", "14", "48", "6", "From your box"],
  ["Banana, 1 medium", "105", "1", "27", "0", "You added"],
  ["Paneer bhurji, FitFuel", "420", "26", "12", "30", "From your box"],
  ["Chai, 1 cup with sugar", "90", "2", "13", "3", "You added"],
];

export default function Diary() {
  const kcal = ROWS.reduce((a, r) => a + Number(r[1]), 0);
  const protein = ROWS.reduce((a, r) => a + Number(r[2]), 0);

  return (
    <section aria-labelledby="diary-heading" style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}>
      <div style={WRAP}>
        <div className="ff-diary-cols">
          {/* Left: the pitch */}
          <div>
            <Reveal>
              <span style={tag(LIME)}>Not just your box</span>
              <h2 id="diary-heading" style={{ ...huge("clamp(2.2rem,5.6vw,4.4rem)"), maxWidth: "15ch", marginTop: 16 }}>
                Log the chai too
              </h2>
              <p style={{ ...copy(16.5), marginTop: 22, maxWidth: "46ch" }}>
                Your FitFuel meals arrive already logged. Everything else, the office
                samosa, the weekend biryani, the cup of chai, you add from a database of
                154 Indian foods. Water goes in with a tap. It all feeds the same
                net-calorie figure, so the number is honest, not flattering.
              </p>
            </Reveal>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,4vw,52px)", marginTop: "clamp(26px,3vw,40px)" }}>
              {[["154", "foods in the database"], ["Per gram", "logging, not portions"], ["Water", "tracked, daily"]].map(([f, l]) => (
                <div key={l}>
                  <div style={{ ...huge("clamp(1.8rem,3vw,2.6rem)"), color: LIME, lineHeight: 0.85 }}>{f}</div>
                  <div style={{ ...copy(13.5), color: DIM, marginTop: 8, maxWidth: "18ch" }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "clamp(28px,3vw,40px)" }}>
              <Link href="/dashboard/nutrition" className="ff-a">Open the diary <ArrowRight size={17} /></Link>
            </div>
          </div>

          {/* Right: a real diary readout */}
          <Reveal delay={0.08}>
            <div style={{ border: `1px solid ${RULE}`, background: BG_PANEL }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "16px clamp(16px,2vw,24px)", borderBottom: `1px solid ${RULE}` }}>
                <span style={tag(DIM)}>Today, sample</span>
                <span style={{ ...copy(13), color: DIM }}>Target 1,450 kcal</span>
              </div>

              <div role="table" aria-label="Sample food diary for one day">
                <div role="row" className="sr-only">
                  <span role="columnheader">Food</span><span role="columnheader">Calories</span>
                </div>
                {ROWS.map(([name, k, p, c, f, src]) => (
                  <div role="row" key={name} className="ff-diary">
                    <div>
                      <div style={{ ...copy(15), color: INK }}>{name}</div>
                      <div className="ff-diary-macros">
                        <span style={{ ...copy(12.5), color: DIM }}>P {p}</span>
                        <span style={{ ...copy(12.5), color: DIM }}>C {c}</span>
                        <span style={{ ...copy(12.5), color: DIM }}>F {f}</span>
                        <span style={{ ...tag(src === "From your box" ? LIME : DIM), fontSize: 12, letterSpacing: "0.12em" }}>{src}</span>
                      </div>
                    </div>
                    <div role="cell" className="ff-diary-kcal">{k}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "18px clamp(16px,2vw,24px)", borderTop: `1px solid ${RULE}` }}>
                <div>
                  <div style={{ ...tag(DIM) }}>Logged so far</div>
                  <div style={{ ...copy(13), color: DIM, marginTop: 4 }}>{protein} g protein</div>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ ...huge("clamp(2rem,3.4vw,2.8rem)"), color: LIME, lineHeight: 0.8 }}>{kcal.toLocaleString("en-IN")}</span>
                  <span style={{ ...mid("clamp(.9rem,1.2vw,1.1rem)"), color: MUTE }}>kcal</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const BG_PANEL = "#0c0c0a";
