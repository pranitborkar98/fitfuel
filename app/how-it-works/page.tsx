// app/how-it-works/page.tsx
//
// Six steps, one loop. Rebuilt onto the Instrument System: the page previously
// carried its own `const C` palette (#080808, #a3e635, #111111 cards), radius
// 16 tiles in a uniform three-up grid, and a centred gradient CTA — the exact
// object DESIGN.md's slop list rejects by name.
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
    d: "Share your body, goal, dietary preference and any health condition. It takes two minutes and powers everything that follows.",
  },
  {
    n: "02",
    t: "We build your plan",
    d: "We calculate your exact calorie and macro targets and match you to a 30-day rotating menu personalised to your goal.",
  },
  {
    n: "03",
    t: "We cook fresh, daily",
    d: "Prepared every morning in our Pune kitchen. No deep frying, fresh-sourced ingredients, cooked the same day it reaches you.",
  },
  {
    n: "04",
    t: "Delivered to your door",
    d: "One bundled delivery a day in your chosen Morning or Evening window, in eco-conscious packaging.",
  },
  {
    n: "05",
    t: "Track every gram",
    d: "Tap “I ate this” and your meal auto-logs its macros. Watch your calories, protein and progress update in real time.",
  },
  {
    n: "06",
    t: "Adjust and evolve",
    d: "Rate meals, request swaps, and let the system recalibrate your targets as your body changes. The plan grows with you.",
  },
];

const MOAT = [
  { t: "Track every gram", d: "Per-gram macro logging, not guesswork." },
  { t: "No dish repeats in 30 days", d: "A full rotating month of variety." },
  { t: "Personalised to your body", d: "Targets built from your metrics, not a template." },
];

export default function HowItWorksPage() {
  return (
    <Shell>
      <Masthead
        label="How it works"
        title="Your goal to your door"
        deck="FitFuel is not just a meal box. It is a system that learns your body, feeds it right, and tracks every step. Here is exactly how it runs, every single day."
        meta={[
          { k: "Steps", v: "6" },
          { k: "Menu cycle", v: "30 days" },
          { k: "Deliveries", v: "1 a day" },
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
                  <span style={{ ...figure("2rem", "#84cc16") }}>{s.n}</span>
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
              title="Three things a tiffin cannot do"
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
                  Every calorie and macro figure on this site comes from our own weighed kitchen
                  records, not from a database estimate. Read the{" "}
                  <A href="/terms#imagery">note on imagery and data</A> for exactly what is
                  photographed and what is measured.
                </p>
              </Prose>
            </Note>
          </Wrap>
        </section>
      </Stack>

      <Band
        title="Start eating right tomorrow"
        body="Not next Monday. See the plan, or try a single trial day with no lock-in."
        href="/plans"
        cta="See the plans"
        secondary={{ href: "/plans?trial=true", label: "Try one day" }}
      />
    </Shell>
  );
}
