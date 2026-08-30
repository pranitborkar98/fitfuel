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

import { ChefHat, Scale, Shield, Star, Truck, Users } from "lucide-react";

import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { Head, Idx, Row, Spec, Tile, Tiles, k } from "@/app/_ui/Kit";
import { Band, Masthead, Prose, Shell, Stack, Wrap } from "@/app/_ui/Page";
import { SECTION, body, figure, label, sub } from "@/app/_ui/theme";
import s from "./about.module.css";

const STATS = [
  { value: "1", label: "Kharadi kitchen" },
  { value: "2", label: "Delivery windows" },
  { value: TRIAL_TOTAL_GLYPH, label: "Trial, all-in" },
  { value: "FSSAI", label: "Licensed kitchen" },
];

const VALUES = [
  {
    icon: ChefHat,
    title: "Chef-cooked daily",
    desc: "Meals are prepared for the day's delivery run in our FSSAI-licensed kitchen in Kharadi.",
  },
  {
    icon: Scale,
    title: "Measured recipes",
    desc: "The plan schedule, kitchen quantities and member diary use the same recipe and serving data.",
  },
  {
    icon: Shield,
    title: "FSSAI certified",
    desc: "We operate under FSSAI licence 21523035002815. Clean, hygienic, compliant, because your health depends on it.",
  },
  {
    icon: Truck,
    title: "Daily 07:00 to 10:00",
    desc: "Choose the morning window from 7 to 10 or the evening window from 5 to 8 when that option is available at checkout.",
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
    desc: "Pranit Borkar starts FitFuel with a simple belief: nutritious food should be accessible, affordable and worth eating. Operations begin in Kharadi, Pune.",
  },
  {
    year: "2026",
    title: "Kitchen and diary connect",
    desc: "FitFuel connects the purchased plan to kitchen production and the member diary, so the serving cooked and the serving logged come from the same source.",
  },
];

const KITCHEN = [
  { label: "Kitchen location", value: "Kharadi, Pune 412207" },
  { label: "FSSAI licence", value: "21523035002815" },
  { label: "Delivery windows", value: "07:00–10:00 and 17:00–20:00" },
  { label: "Operating since", value: "2019" },
];

export default function AboutClient() {
  return (
    <Shell>
      <Masthead
        label="About"
        title="From a small kitchen to your doorstep"
        deck="FitFuel started in Pune with a belief that nutritious food should be accessible, affordable and worth eating. Today the kitchen, purchased plan and member diary work from one serving record."
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
                  as a small kitchen operation in Kharadi has grown into a meal delivery service with
                  its own connected planning and tracking system.
                </p>
                <p>
                  We have spent years honing recipes, building systems and listening to customers.
                  The current catalogue is deliberately honest about which plan concepts have a
                  complete kitchen schedule and price, and which ones are still being built.
                </p>
                <p>
                  The next step is not a bigger list of promises. It is a tighter loop: what you buy
                  determines what the kitchen portions, and confirming a meal logs that same serving
                  in your diary.
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
              title="Two points we can stand behind"
              deck="The origin of the kitchen, and the connected operating model customers can use now."
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
