// app/_hp/Conditions.tsx
//
// 70 of 126 plans are condition-specific. This is the hardest thing for a tiffin
// service to copy and the reason a diabetic or PCOS customer picks us over a
// cheaper box, so it gets a section — but one section, not the scrolling marquee
// that printed all 38 conditions twice.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "./hp.module.css";
import { WRAP, SECTION, INK_3, GREEN, display, body, label, figure } from "./theme";

const CONDITIONS = [
  "Diabetes", "Pre-diabetes", "Thyroid", "PCOS", "PCOD", "Hypertension",
  "Heart health", "Fatty liver", "Kidney health", "Gout", "Cholesterol",
  "Anaemia", "Vitamin D", "B12 deficiency", "Obesity", "Post-surgery",
  "Post-Covid", "Cancer recovery", "Postpartum", "Menopause", "Fertility",
  "PMS", "Hormonal acne", "Gut health", "Seniors", "Kids and teens",
  "Ramadan", "Navratri", "Shravan",
];

export default function Conditions() {
  return (
    <section aria-labelledby="hp-cond" style={SECTION}>
      <div style={WRAP}>
        <div className={s.reveal}>
          <span style={label(GREEN)}>70 of our 126 plans</span>
          <h2 id="hp-cond" style={{ ...display("clamp(2.1rem,4.6vw,3.5rem)"), marginTop: 14, maxWidth: "20ch" }}>
            We cook for the condition, not just the calorie
          </h2>

          <div style={{ display: "flex", gap: "clamp(24px,4vw,54px)", flexWrap: "wrap", marginTop: 26, alignItems: "flex-start" }}>
            <div>
              <div style={figure("clamp(2.4rem,5vw,3.6rem)", GREEN)}>38</div>
              <div style={{ ...body(14.5), marginTop: 8 }}>conditions cooked for</div>
            </div>
            <p style={{ ...body(17), maxWidth: "52ch" }}>
              A diabetic plan holds the glucose curve. A PCOS plan is built around insulin
              sensitivity. Cancer recovery, postpartum and kidney health are three different
              briefs cooked to three different specs, by a nutritionist, not by swapping rice
              for quinoa and calling it medical.
            </p>
          </div>
        </div>

        <div className={s.conds}>
          {CONDITIONS.map((c) => (
            <span key={c} className={s.cond}>{c}</span>
          ))}
        </div>

        <div className={s.actions} style={{ marginTop: 30 }}>
          <Link href="/plans?category=LIFESTYLE_MEDICAL" className={s.btnGhost}>
            See all 70 condition plans <ArrowRight size={16} />
          </Link>
        </div>

        <p style={{ ...body(13.5), color: INK_3, marginTop: 22, maxWidth: "70ch" }}>
          Condition plans are nutrition programmes, not medical treatment, and they do not
          replace your doctor. Read our{" "}
          <Link href="/medical-disclaimer" style={{ color: GREEN }}>medical disclaimer</Link>.
        </p>
      </div>
    </section>
  );
}
