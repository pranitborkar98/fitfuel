// app/_home/Scale.tsx
//
// THE MOAT NOBODY ELSE HAS, AND THE HOMEPAGE HAD NOT MENTIONED ONCE.
//
// app/dashboard/body-metrics/BodyMetricsClient.tsx speaks Bluetooth to a
// MEDITIVE scale over the FitDays protocol, from scratch. Not an SDK, not a
// third party app the customer installs, not a CSV import:
//
//   buildProfilePacket()   writes sex, height and age to characteristic ffb1
//   parseScalePacket()     hand-written binary parser: 0xAC header check,
//                          WEIGHT_OFFSET 6815754, impedance swept across byte
//                          positions [17,15,13,len-3], with big-endian AND
//                          little-endian fallback paths for scale firmware
//                          that disagrees about byte order
//   STABLE_THRESHOLD = 8   only commits a reading once the plate settles
//   computeAllMetrics()    a BIA engine turning TWO readings into EIGHTEEN
//
// That last number is the whole story and it tells itself: two values come off
// the hardware, sixteen more are derived, and all eighteen land in the same
// history the meals and the workouts write to. Every competitor in this
// category asks you to type your weight into a box.
//
// HONESTY, held deliberately. Web Bluetooth is Chrome and Edge only: no
// Safari, no Firefox, no iOS at all. That limit is PRINTED here rather than
// discovered by an iPhone owner who bought a scale on the strength of this
// section. The manual path is not a consolation prize either, it is the same
// eighteen fields and the same history, which is why it is stated as an equal
// route rather than a fallback.
//
// SERVER COMPONENT. The metric names are static; nothing here needs the client.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, DIM, huge, mid, copy, tag } from "./theme";

/* Two readings come off the plate. Weight is one of them AND one of the
   eighteen stored metrics; impedance is consumed by the BIA engine and never
   stored as a metric of its own. So Weight correctly appears on both sides
   below, and STORED is exactly eighteen long. Counting it as a nineteenth
   chip, or dropping it from the stored list to avoid the repeat, would make
   the headline number wrong in one direction or the other. */
const MEASURED = ["Weight", "Impedance"];

/* The eighteen METRIC_DEFS in BodyMetricsClient.tsx, in the order that file
   defines them. `measured` marks the one read directly rather than derived. */
const STORED: { name: string; measured?: true }[] = [
  { name: "Weight", measured: true },
  { name: "BMI" }, { name: "Body fat" }, { name: "Fat mass" },
  { name: "Fat-free weight" }, { name: "Subcutaneous fat" },
  { name: "Visceral fat" }, { name: "Body water" }, { name: "Water weight" },
  { name: "Skeletal muscle" }, { name: "Muscle mass" }, { name: "Muscle rate" },
  { name: "Bone mass" }, { name: "Protein" }, { name: "Protein mass" },
  { name: "BMR" }, { name: "Body age" }, { name: "Ideal weight" },
];

export default function Scale() {
  return (
    <section
      aria-labelledby="scale-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0", background: "#050504" }}
    >
      <div style={WRAP}>
        <Reveal>
          <span style={tag(LIME)}>Bluetooth, no app to install</span>
          <h2 id="scale-heading" style={{ ...huge("clamp(2.4rem,6.4vw,5.2rem)"), maxWidth: "15ch", marginTop: 16 }}>
            Step on the scale. <span style={{ color: LIME }}>It fills in eighteen numbers.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <p style={{ ...copy(16.5), maxWidth: "56ch", marginTop: 22 }}>
            Your scale talks to FitFuel directly in the browser. It sends your profile down,
            waits for the plate to settle, and writes the reading into the same history your
            meals and your workouts write to. Nothing is typed, and nothing is guessed.
          </p>
        </Reveal>

        {/* The arithmetic IS the argument, so it is set at display scale rather
            than described in a sentence. Two in, eighteen out. */}
        <Reveal delay={0.1}>
          <div className="ff-scale-eq">
            <div className="ff-scale-eq-cell">
              <span style={{ ...huge("clamp(3rem,6vw,4.6rem)"), color: INK, lineHeight: 0.8 }}>2</span>
              <span style={{ ...copy(14), color: DIM, display: "block", marginTop: 12 }}>
                readings off the hardware
              </span>
              <div style={{ marginTop: 14 }}>
                {MEASURED.map((m) => (
                  <span key={m} className="ff-scale-chip" data-measured="">{m}</span>
                ))}
              </div>
            </div>
            <div className="ff-scale-eq-cell">
              <span style={{ ...huge("clamp(3rem,6vw,4.6rem)"), color: LIME, lineHeight: 0.8 }}>18</span>
              <span style={{ ...copy(14), color: DIM, display: "block", marginTop: 12 }}>
                metrics stored, charted and tracked over time. Lime is measured, the rest is computed
              </span>
              <div style={{ marginTop: 14 }}>
                {STORED.map((m) => (
                  <span key={m.name} className="ff-scale-chip" data-measured={m.measured ? "" : undefined}>
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* What actually happens on the wire. Naming the characteristic is not
            showing off: it is the difference between "we support smart scales"
            and a thing that demonstrably exists. */}
        <Reveal delay={0.14}>
          <div className="ff-scale-steps">
            {[
              ["01", "It finds the scale", "The browser scans for the scale over Bluetooth. No pairing screen, no companion app, no cable."],
              ["02", "It sends you down", "Your sex, height and age go to the scale as a profile packet, so the impedance reading is interpreted against the right body."],
              ["03", "It waits for still", "Readings are ignored until the plate settles. A number that moves is not a measurement."],
              ["04", "It writes the history", "Eighteen metrics land next to your meals and your training, so a plateau is visible against what you actually ate."],
            ].map(([n, t, d]) => (
              <div key={n} className="ff-scale-step">
                <span style={{ ...tag(LIME), fontSize: 12 }}>{n}</span>
                <h3 style={{ ...mid("clamp(1.15rem,1.8vw,1.4rem)"), marginTop: 12 }}>{t}</h3>
                <p style={{ ...copy(14), marginTop: 10 }}>{d}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* The limit, printed. See the file header. */}
        <Reveal delay={0.18}>
          <div className="ff-scale-note">
            <p style={{ ...copy(14.5), margin: 0, maxWidth: "72ch" }}>
              <span style={{ color: INK }}>Bluetooth works in Chrome and Edge.</span>{" "}
              Safari and Firefox do not support it, and neither does any browser on iPhone. On
              those, the same eighteen fields are entered by hand into the same history, and
              every chart works identically. No scale? Weight and height alone still drive BMI,
              BMR and your ideal weight.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.22}>
          <div style={{ marginTop: "clamp(26px,3vw,38px)" }}>
            <Link href="/how-it-works" className="ff-a">
              See how tracking works <ArrowRight size={17} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
