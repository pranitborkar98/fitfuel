// app/how-it-works/page.tsx
//
// Six steps, one loop. Rebuilt onto the Instrument System: the page previously
// carried its own `const C` palette (#080808, var(--fk-green-deep), var(--fk-surface) cards), radius
// 16 tiles in a uniform three-up grid, and a centred gradient CTA — the exact
// object the slop list rejects by name.
//
// The steps are now a directory: a numbered hairline-separated list you read
// straight down, which is what the content actually is. A day is a sequence,
// not six parallel cards.

import { Head, Row, Tiles, Tile, k } from "@/app/_ui/Kit";
import { Band, Masthead, Note, Prose, Shell, Stack, Wrap, A } from "@/app/_ui/Page";
import { SECTION, body, figure, label, sub } from "@/app/_ui/theme";

export const metadata = {
  alternates: { canonical: "/how-it-works" },
  title: "How It Works",
  description:
    "From your goal to your door: how FitFuel personalises, cooks, delivers and tracks your nutrition every day.",
};

const STEPS = [
  {
    n: "01",
    t: "Tell us about you",
    d: "Share your goal, dietary preference and optional body details. These set your starting targets; you can review them in the app.",
  },
  {
    n: "02",
    t: "We build your plan",
    d: "Choose a plan whose full kitchen schedule and active price are ready. Your profile can adjust the serving target without inventing a different menu.",
  },
  {
    n: "03",
    t: "We cook fresh, daily",
    d: "The production sheet rolls up the scheduled recipes and each member's serving factor into the quantities the Kharadi kitchen prepares.",
  },
  {
    n: "04",
    t: "Delivered to your door",
    d: "One bundled delivery a day in your chosen Morning or Evening window, in eco-conscious packaging.",
  },
  {
    n: "05",
    t: "Track every gram",
    d: "Tap “I ate this” and the serving assigned to your plan is logged to your diary with its matching macros.",
  },
  {
    n: "06",
    t: "Adjust and evolve",
    d: "Rate meals, log progress and review a weekly recommendation. Any target change is shown before you choose to apply it.",
  },
];

const MOAT = [
  { t: "One serving record", d: "The kitchen quantity and diary entry use the same portion factor." },
  { t: "Only ready plans sell", d: "A plan needs a complete schedule and active price before checkout opens." },
  { t: "Progress can change the target", d: "Weekly data produces a reviewable recommendation, never a hidden adjustment." },
];

export default function HowItWorksPage() {
  return (
    <Shell>
      <Masthead
        label="How it works"
        title="Your goal to your door"
        deck="FitFuel connects the plan you buy, the portion the kitchen prepares and the meal you log. Here is where each hand-off happens."
        meta={[
          { k: "Steps", v: "6" },
          { k: "Kitchen source", v: "Plan schedule" },
          { k: "Diary source", v: "Same serving" },
        ]}
      />

      <Stack>
        {/* The loop, as a directory rather than a card grid. Reading order is
            the point: each row is the step after the one above it. */}
        <section style={SECTION}>
          <Wrap>
            <Head
              label="The daily loop"
              title={
                <>
                  Six steps,
                  <br />
                  every day
                </>
              }
              deck="Two of them you do once. The other four run every morning, whether or not you think about them."
            />
            <div className={k.rows} style={{ marginTop: "clamp(30px,4vw,48px)" }}>
              {STEPS.map((s) => (
                <Row key={s.n} cols="72px minmax(0,1fr) minmax(0,1.35fr)">
                  <span style={{ ...figure("2rem", "var(--fk-green)") }}>{s.n}</span>
                  <h3 style={{ ...sub("clamp(1.15rem,2vw,1.5rem)") }}>{s.t}</h3>
                  <p style={{ ...body(15), maxWidth: "52ch" }}>{s.d}</p>
                </Row>
              ))}
            </div>
          </Wrap>
        </section>

        {/* Three claims, three tiles — the hairline grid, where the 1px gap is
            the rule. Not a card each with its own border and radius. */}
        <section style={SECTION}>
          <Wrap>
            <Head
              label="What makes us different"
              title="Three parts of the connected loop"
              size="clamp(1.9rem,4.6vw,3.4rem)"
              max="18ch"
            />
            <Tiles cols={3} style={{ marginTop: "clamp(28px,4vw,44px)" }}>
              {MOAT.map((m) => (
                <Tile key={m.t}>
                  <span style={label()}>{m.t}</span>
                  <p style={{ ...body(15.5), marginTop: 4 }}>{m.d}</p>
                </Tile>
              ))}
            </Tiles>

            <Note style={{ marginTop: "clamp(28px,4vw,44px)" }}>
              <Prose>
                <p>
                  Recipe macros and serving quantities are stored with the plan and reused by the
                  kitchen and diary. They are planning data, not medical measurements. Read the{" "}
                  <A href="/terms#imagery">note on imagery and data</A> for exactly what is
                  photographed and what is measured.
                </p>
              </Prose>
            </Note>
          </Wrap>
        </section>
      </Stack>

      <Band
        title="Start with one delivery day"
        body="Not next Monday. See the plan, or try a single trial day with no lock-in."
        href="/plans"
        cta="See the plans"
        secondary={{ href: "/plans?trial=true", label: "Try one day" }}
      />
    </Shell>
  );
}
