"use client";

// app/about/AboutClient.tsx
//
// About, on the Instrument System.
//
// WHAT WAS HERE. Two radial-gradient glow orbs (320px and 400px circles of
// rgba(132,204,22,0.06)), gradient text on the headline, two "gradient rule"
// bars fading lime to transparent, radius 10/12/16/20/24, border-radius:50% on
// four separate elements, lime box-shadow glows that grew on hover, translateY
// lifts on every card, framer-motion fading each block in from blur(4px), and
// a 👨‍🍳 emoji standing in for a founder photograph. Every one of those is on
// the reject list, and the emoji is on it by name.
//
// THE BUG, and it is the same one /contact had, three times over. The trailing
// <style> block defined `.about-story-grid`, `.about-values-grid` and
// `.about-stats-grid` with mobile breakpoints. None of the three classes was
// applied to any element. So on a phone this page rendered a four-column stats
// row, a three-column values grid and a two-column story with an 80px gutter,
// all at desktop track widths. Three dead media queries on the company's
// primary credibility page.
//
// Everything responsive now lives in about.module.css, on classes that are
// actually attached.
//
// framer-motion is gone. Reveals are the CSS scroll-driven ones from the kit.

import { ChefHat, Heart, Shield, Star, Truck, Users } from "lucide-react";

import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { Head, Idx, Row, Spec, Tile, Tiles, k } from "@/app/_ui/Kit";
import { Band, Masthead, Prose, Shell, Stack, Wrap } from "@/app/_ui/Page";
import { SECTION, body, figure, label, sub } from "@/app/_ui/theme";
import s from "./about.module.css";

const STATS = [
  { value: "2019", label: "Founded" },
  { value: "145+", label: "Customers" },
  { value: "5.0", label: "Average rating" },
  { value: "FSSAI", label: "Licensed kitchen" },
];

const VALUES = [
  {
    icon: ChefHat,
    title: "Chef-cooked daily",
    desc: "Every meal is prepared fresh each morning in our FSSAI-certified kitchen in Kharadi. No frozen food, no reheating, ever.",
  },
  {
    icon: Heart,
    title: "Nutritionist-designed",
    desc: "Our meal plans are built around real nutrition science: the right macros for your specific goal, not just calorie counting.",
  },
  {
    icon: Shield,
    title: "FSSAI certified",
    desc: "We operate under FSSAI licence 21523035002815. Clean, hygienic, compliant, because your health depends on it.",
  },
  {
    icon: Truck,
    title: "Daily 07:00 to 10:00",
    desc: "Fresh meals delivered to your door every morning between 7 and 10. Consistent, reliable, on your schedule.",
  },
  {
    icon: Star,
    title: "Quality ingredients",
    desc: "We source locally and carefully. Natural ingredients, no artificial preservatives, no frying. Clean food that tastes good.",
  },
  {
    icon: Users,
    title: "Built for Pune",
    desc: "We understand Pune's lifestyle: working professionals, students, families, fitness enthusiasts. We cook for all of them.",
  },
];

const TIMELINE = [
  {
    year: "2019",
    title: "FitFuel is born",
    desc: "Pranit Borkar starts FitFuel out of a simple belief: nutritious food should be accessible, affordable, and actually delicious. Operations begin in Kharadi, Pune.",
  },
  {
    year: "2021",
    title: "Plans expand",
    desc: "Growing demand leads to the full suite of meal plans: Muscle Gain, Weight Loss, Balanced Diet, Office Employee and Jain Diet, each with its own menu.",
  },
  {
    year: "2024",
    title: "FSSAI certified kitchen",
    desc: "Official FSSAI certification secured. Kitchen operations formalised, delivery zones expanded across Kharadi and surrounding Pune areas.",
  },
  {
    year: "2026",
    title: "Full platform revamp",
    desc: "FitFuel moves beyond meal delivery, rebuilding from the ground up as a health platform with nutrition tracking, training and a matched supplement stack.",
  },
];

const KITCHEN = [
  { label: "Kitchen location", value: "Kharadi, Pune 412207" },
  { label: "FSSAI licence", value: "21523035002815" },
  { label: "Delivery hours", value: "07:00 to 10:00 daily" },
  { label: "Operating since", value: "2019" },
];

export default function AboutClient() {
  return (
    <Shell>
      <Masthead
        label="About"
        title="From a small kitchen to your doorstep"
        deck="FitFuel was founded in Pune in 2019 on a belief that nutritious food should be accessible, affordable and worth eating. Here is how it has gone."
      />

      {/* The readout: signature device 1, welded to the page by hairlines. */}
      <div className={k.readout} style={{ ["--cells" as string]: 4 }}>
        {STATS.map((x) => (
          <div key={x.label} className={k.cell}>
            <span style={label()}>{x.label}</span>
            <span style={figure("clamp(2.2rem,4.8vw,3.6rem)")}>{x.value}</span>
          </div>
        ))}
      </div>

      <Stack>
        {/* ── mission ──────────────────────────────────────────────────── */}
        <section style={SECTION}>
          <Wrap>
            <Idx label="Mission" />
            <blockquote className={s.quote}>
              To revolutionise the way people nourish themselves: convenient access to wholesome,
              nutritious meals, delivered daily, so that eating well stops being the hard part.
            </blockquote>
            <div className={s.byline}>
              <span style={label("var(--fk-green)")}>Pranit Borkar</span>
              <span style={{ ...body(14) }}>Founder, FitFuel</span>
            </div>
          </Wrap>
        </section>

        {/* ── story ────────────────────────────────────────────────────── */}
        <section style={SECTION}>
          <Wrap>
            <Idx label="How it started" />
            <div className={s.story}>
              <Prose>
                <p>
                  FitFuel was founded by Pranit Borkar in 2019 with a passion for healthy living and
                  a belief that nutritious food should be both accessible and enjoyable. What started
                  as a small kitchen operation in Kharadi has grown into a full meal delivery service
                  trusted by hundreds of Pune residents.
                </p>
                <p>
                  We have spent years honing recipes, building systems and listening to customers.
                  Every meal plan, from Muscle Gain to Jain Diet, was built from real feedback, real
                  nutrition science and real kitchen experience.
                </p>
                <p>
                  Now in 2026 we are going further. The same kitchen quality and the same daily
                  delivery promise, on a platform that tracks your nutrition, supports your training
                  and grows with your goals.
                </p>
              </Prose>

              {/* The founder card lost its 72px circular avatar holding a
                  chef emoji. No photograph of Pranit exists yet, and an emoji
                  in a lime-tinted circle is a placeholder pretending to be a
                  portrait. The facts are a spec table instead. */}
              <div>
                <Spec caption="FitFuel kitchen and operations" head={["Detail", "Value"]}>
                  {KITCHEN.map((x) => (
                    <tr key={x.label}>
                      <th scope="row">{x.label}</th>
                      <td className={k.specNum}>{x.value}</td>
                    </tr>
                  ))}
                </Spec>
              </div>
            </div>
          </Wrap>
        </section>

        {/* ── timeline ─────────────────────────────────────────────────── */}
        <section style={SECTION}>
          <Wrap>
            <Head
              label="Timeline"
              title="Seven years, four turns"
              deck="Each of these changed what FitFuel could actually deliver, rather than what it said about itself."
              size="clamp(2rem,5vw,3.6rem)"
            />
            <div className={k.rows} style={{ marginTop: "clamp(28px,4vw,46px)" }}>
              {TIMELINE.map((t) => (
                <Row key={t.year} cols="96px minmax(0,1fr) minmax(0,1.35fr)">
                  <span style={figure("clamp(1.7rem,3vw,2.3rem)", "var(--fk-green)")}>{t.year}</span>
                  <h3 style={sub("clamp(1.15rem,2vw,1.5rem)")}>{t.title}</h3>
                  <p style={{ ...body(14.5), maxWidth: "52ch" }}>{t.desc}</p>
                </Row>
              ))}
            </div>
          </Wrap>
        </section>

        {/* ── values ───────────────────────────────────────────────────── */}
        <section style={SECTION}>
          <Wrap>
            <Head
              label="What we hold to"
              title="Six commitments"
              size="clamp(2rem,5vw,3.6rem)"
              max="14ch"
            />
            <Tiles cols={3} style={{ marginTop: "clamp(28px,4vw,46px)" }}>
              {VALUES.map((v) => {
                const Icon = v.icon;
                return (
                  <Tile key={v.title}>
                    <Icon size={16} color="var(--fk-ink-3)" aria-hidden="true" />
                    <span style={{ ...label(), marginTop: 4 }}>{v.title}</span>
                    <p style={{ ...body(14.5), marginTop: 2 }}>{v.desc}</p>
                  </Tile>
                );
              })}
            </Tiles>
          </Wrap>
        </section>
      </Stack>

      <Band
        title={`Try a day for ${TRIAL_TOTAL_GLYPH}`}
        body="No commitment, no subscription. One trial day to see what fresh, goal-based meals delivered to your door actually feel like."
        href="/plans?trial=true"
        cta="Order trial day"
        secondary={{ href: "/contact", label: "Contact us" }}
      />
    </Shell>
  );
}
