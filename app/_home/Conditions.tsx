// app/_home/Conditions.tsx
//
// THE BIGGEST UNTOLD STORY ON THE SITE.
//
// 70 of the 126 meal plans are condition-specific, across 38 distinct
// conditions (verified against the live DB: category = LIFESTYLE_MEDICAL,
// 38 distinct subCategory values). The homepage said "Medical and
// lifestyle" once, as one link. This is a nutrition company that cooks
// differently for a diabetic, a PCOS patient and someone in cancer
// recovery, and that was invisible.
//
// The form is a marquee, because the argument is abundance: the list is
// long, it is specific, and several entries are India-specific in a way no
// generic meal service is (Ramadan, Navratri, Shravan, Diwali detox). A
// marquee that runs on is the right shape for "we cook for all of these".
//
// Mechanism 8, different from the seven before it: a pure-CSS infinite
// marquee (translateX loop), two rows travelling opposite directions.
// This one is NOT scroll-driven; it is an ambient loop, so it is gated on
// prefers-reduced-motion and pauses on hover.
//
// SERVER COMPONENT. Zero JavaScript.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, DIM, huge, mid, copy, tag } from "./theme";

// Curated from the 38 live subCategory values, grouped so each marquee row
// reads as a coherent band rather than a random stream.
const ROW_A = [
  "Diabetes", "Pre-diabetes", "Thyroid", "PCOS", "PCOD", "Hypertension",
  "Heart health", "Fatty liver", "Kidney health", "Gout", "Cholesterol",
  "Anaemia", "Vitamin D", "B12 deficiency", "Obesity",
];
const ROW_B = [
  "Post-surgery", "Post-COVID", "Cancer recovery", "Postpartum", "Menopause",
  "Fertility", "PMS", "Hormonal acne", "Hair fall", "Skin glow", "Eczema",
  "Gut health", "Liver detox", "Seniors", "Kids and teens",
  "Ramadan", "Navratri", "Shravan", "Diwali detox", "Quit smoking",
];

function Track({ items, reverse }: { items: string[]; reverse?: boolean }) {
  // The list is rendered twice so the loop is seamless: when the first copy
  // has fully scrolled off, the second is exactly in its place. The second
  // copy is aria-hidden so a screen reader hears each condition once.
  return (
    <div className={`ff-marq ${reverse ? "ff-marq-rev" : ""}`}>
      <ul className="ff-marq-track">
        {items.map((c) => (
          <li key={c} className="ff-marq-item">
            <span className="ff-marq-slash" aria-hidden>/</span>{c}
          </li>
        ))}
      </ul>
      <ul className="ff-marq-track" aria-hidden>
        {items.map((c) => (
          <li key={c} className="ff-marq-item">
            <span className="ff-marq-slash" aria-hidden>/</span>{c}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Conditions() {
  return (
    <section aria-labelledby="cond-heading" style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}` }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <span style={tag(LIME)}>70 of our 126 plans</span>
              <h2 id="cond-heading" style={{ ...huge("clamp(2.4rem,6.4vw,5.2rem)"), maxWidth: "16ch", marginTop: 16 }}>
                We cook for the condition, not just the calorie
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...huge("clamp(3.2rem,7vw,5.6rem)"), color: LIME, lineHeight: 0.8 }}>38</div>
              <div style={{ ...mid("clamp(1rem,1.5vw,1.3rem)"), color: DIM, marginTop: 6 }}>conditions, cooked for</div>
            </div>
          </div>
        </Reveal>

        <p style={{ ...copy(16.5), maxWidth: "58ch", marginTop: "clamp(22px,3vw,34px)" }}>
          A diabetic plan holds the glucose curve. A PCOS plan is built around insulin
          sensitivity. Cancer recovery, postpartum, kidney health, each is a different
          brief, cooked to a different spec. Including the ones a generic service never
          touches: Ramadan, Navratri, Shravan, the Diwali detox.
        </p>
      </div>

      {/* The marquee sits full-bleed, edge to edge, so it reads as a band
          running past rather than a boxed widget. */}
      <div style={{ marginTop: "clamp(34px,4vw,56px)", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
        <Track items={ROW_A} />
        <div style={{ height: 1, background: RULE }} />
        <Track items={ROW_B} reverse />
      </div>

      <div style={{ ...WRAP, marginTop: "clamp(30px,4vw,48px)" }}>
        <Link href="/plans?category=LIFESTYLE_MEDICAL" className="ff-btn">
          See all 70 condition plans
        </Link>
        <p style={{ ...copy(13), color: DIM, marginTop: 16, maxWidth: "60ch" }}>
          Condition plans are nutrition programs, not medical treatment. They do not
          replace your doctor. See our <Link href="/medical-disclaimer" style={{ color: DIM, textDecoration: "underline" }}>medical disclaimer</Link>.
        </p>
      </div>
    </section>
  );
}
