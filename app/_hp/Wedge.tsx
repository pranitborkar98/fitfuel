// app/_hp/Wedge.tsx
//
// The positioning, as a comparison you can audit.
//
// "Every app trusts you to log it, we already know" was the single best line on
// the old page and it was buried under a wall of feature sections. It is the
// argument, so it sits right after the food.
//
// It is a <table> rather than four cards because a comparison IS a table: a
// screen reader can walk rows and columns, and a sighted reader can scan one
// column instead of reading four paragraphs. The four-card version forced
// everyone to hold three things in memory to spot the difference.
//
// SERVER COMPONENT.

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, MUTE, DIM, LIME, display, body } from "./theme";

type Row = { what: string; tiffin: string; app: string; supp: string; us: string };

const ROWS: Row[] = [
  {
    what: "Cooks your food",
    tiffin: "Yes, to one shared menu",
    app: "No",
    supp: "No",
    us: "Yes, to your macros",
  },
  {
    what: "Weighs the portion",
    tiffin: "No, ladled by eye",
    app: "No, you estimate it",
    supp: "Only the scoop",
    us: "On a scale, before sealing",
  },
  {
    what: "Logs what you ate",
    tiffin: "No",
    app: "Only what you type in",
    supp: "No",
    us: "Automatically, it is the same system",
  },
  {
    what: "Programmes your training",
    tiffin: "No",
    app: "Sometimes, sold separately",
    supp: "No",
    us: "59 programmes, 952 exercises",
  },
  {
    what: "Tracks the body, not the intent",
    tiffin: "No",
    app: "If you own the scale and remember",
    supp: "No",
    us: "18 metrics, read off your scale",
  },
  {
    what: "Moves the target when you stall",
    tiffin: "No",
    app: "No, it just keeps counting",
    supp: "No",
    us: "Recalculated from your own numbers",
  },
  {
    what: "Built for a diagnosis",
    tiffin: "No",
    app: "Generic macro maths",
    supp: "No",
    us: "70 condition plans, 38 conditions",
  },
];

export default function Wedge() {
  return (
    <section aria-labelledby="hp-wedge" style={SECTION}>
      <div style={WRAP}>
        <Idx label="Why one system" />

        <div className={s.reveal}>
          <h2 id="hp-wedge" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "16ch" }}>
            Every other app trusts you to log it. We already know.
          </h2>
          <p style={{ ...body(16.5), marginTop: 20 }}>
            Self-reported food is where every diet app quietly fails: you guess the
            portion, you forget the chai, and the numbers flatter you. We own the plate,
            so the measurement happens in the kitchen instead of in your memory. Here is
            the same claim as a table, so you can check it rather than believe it.
          </p>
        </div>

        <div className={s.specWrap} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          <table className={s.spec}>
            <caption className="sr-only">
              What a tiffin service, a fitness app, a supplement brand and FitFuel each do
            </caption>
            <thead>
              <tr>
                <th scope="col">Does it</th>
                <th scope="col">A tiffin service</th>
                <th scope="col">A fitness app</th>
                <th scope="col">A supplement brand</th>
                <th scope="col" style={{ color: LIME }}>
                  FitFuel
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.what}>
                  <th scope="row">{r.what}</th>
                  <td>{r.tiffin}</td>
                  <td>{r.app}</td>
                  <td>{r.supp}</td>
                  {/* Never a glyph alone: the answer is written out, so it survives a
                      screen reader and no 1.5:1 dot has to carry meaning. */}
                  <td style={{ color: "#f7f7f5", background: "#0c0c0a" }}>{r.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 16 }}>
          The middle three columns describe categories of service, not any named company.
        </p>

        <p style={{ ...body(16.5), color: MUTE, marginTop: 26, maxWidth: "60ch" }}>
          One subscription covers the whole right-hand column. Not a meal box plus an app
          plus a trainer plus a supplement order that none of them can see.
        </p>
      </div>
    </section>
  );
}
