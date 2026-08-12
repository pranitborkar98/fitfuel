// app/_hp/Conditions.tsx
//
// 70 of 126 plans are condition-specific. This is the hardest thing on the site
// for a tiffin service to copy and the reason a diabetic or PCOS customer picks
// us over a cheaper box, so it gets a section — one section, not the scrolling
// marquee that printed all 38 conditions twice.
//
// The chips are square and set in mono so 38 of them read as a manifest rather
// than as decoration. A pill-shaped tag cloud is the 2021 version of this.
//
// SERVER COMPONENT.

import Link from "next/link";
import Image from "next/image";

import s from "./hp.module.css";
import Idx from "./Idx";
import { slot } from "@/lib/site-images";
import { WRAP, SECTION, DIM, LIME, display, body, label, figure } from "./theme";

const CONDITIONS = [
  "Diabetes", "Pre-diabetes", "Thyroid", "PCOS", "PCOD", "Hypertension",
  "Heart health", "Fatty liver", "Kidney health", "Gout", "Cholesterol",
  "Anaemia", "Vitamin D", "B12 deficiency", "Obesity", "Post-surgery",
  "Post-Covid", "Cancer recovery", "Postpartum", "Menopause", "Fertility",
  "PMS", "Hormonal acne", "Gut health", "Seniors", "Kids and teens",
  "Ramadan", "Navratri", "Shravan",
];

export default function Conditions() {
  /* Was hardcoded to /images/produce.jpg, which bypassed the resolver entirely
     — the sections/conditions asset could have landed and this section would
     never have shown it, which is the exact bug lib/site-images.ts exists to
     kill. It also put produce.jpg on the homepage a third time, captioned as
     ingredients weighed for a condition-specific plan, which is not what that
     photograph shows. Until the real frame lands the type carries the section
     on its own. */
  const img = slot("sections", "conditions");

  return (
    <section aria-labelledby="hp-cond" style={SECTION}>
      <div style={WRAP}>
        <Idx label="Cooked for a diagnosis" />

        <div className={`${s.split} ${img ? "" : s.splitSolo} ${s.reveal}`}>
          <div>
            <h2 id="hp-cond" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "13ch" }}>
              We cook for the condition, not just the calorie
            </h2>
            <p style={{ ...body(16.5), marginTop: 20 }}>
              A diabetic plan holds the glucose curve. A PCOS plan is built around insulin
              sensitivity. Cancer recovery, postpartum and kidney health are three different
              briefs cooked to three different specs, by a nutritionist, not by swapping rice
              for quinoa and calling it medical.
            </p>

            <div
              style={{
                display: "flex",
                gap: "clamp(22px,4vw,48px)",
                marginTop: 28,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={figure("clamp(2.2rem,4.4vw,3.4rem)", LIME)}>38</div>
                <div style={{ ...label(DIM), marginTop: 10 }}>conditions</div>
              </div>
              <div>
                <div style={figure("clamp(2.2rem,4.4vw,3.4rem)")}>70</div>
                <div style={{ ...label(DIM), marginTop: 10 }}>plans built for one</div>
              </div>
              <div>
                <div style={figure("clamp(2.2rem,4.4vw,3.4rem)")}>4</div>
                <div style={{ ...label(DIM), marginTop: 10 }}>diet variants each</div>
              </div>
            </div>
          </div>

          {img && (
            <figure className={`${s.splitMedia} ${s.gradeFood}`} style={{ margin: 0 }}>
              <Image
                src={img.src}
                alt="Ingredients for a condition-specific plan, weighed out"
                fill
                sizes="(max-width: 820px) 100vw, 46vw"
                quality={75}
              />
              {img.ai && (
                <figcaption className="sr-only">
                  Illustrative AI-generated image. The plan counts shown are real.
                </figcaption>
              )}
            </figure>
          )}
        </div>

        <div className={s.chips} style={{ marginTop: "clamp(28px,3.6vw,46px)" }}>
          {CONDITIONS.map((c) => (
            <span key={c} className={s.chip}>
              {c}
            </span>
          ))}
        </div>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/plans?category=LIFESTYLE_MEDICAL" className={s.ghost}>
            All 70 condition plans
          </Link>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 22 }}>
          Condition plans are nutrition programmes, not medical treatment, and they do not
          replace your doctor. Read our{" "}
          <Link href="/medical-disclaimer" style={{ color: LIME }}>
            medical disclaimer
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
