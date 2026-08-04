// app/results/page.tsx
//
// Results, on the Instrument System.
//
// The page's whole argument is that it will not fake anything, so the styling
// that undercut it is gone: the radius-14 measure cards, the lime-tinted
// promise box, and the centred gradient CTA that made an empty page look like
// a sales page.
//
// The four measures are a real <table>. They are what the system tracks and
// how, which is tabular, and setting them as a spec table rather than four
// cards is the difference between a claim and an instrument reading.

import BeforeAfterSlot, { type Story } from "@/components/BeforeAfter";
import { Head, Spec } from "@/app/_ui/Kit";
import { Band, Masthead, Note, Prose, Shell, Stack, Wrap } from "@/app/_ui/Page";
import { SECTION } from "@/app/_ui/theme";

/* Real stories go here as they are consented. An empty array renders three
   honest reserved frames; adding one entry replaces a frame with a story and
   needs no other edit. Photographs live in public/images/people/<slug>-before
   and -after — real directory only, never the AI one. See BeforeAfter.tsx. */
const STORIES: Story[] = [];

export const metadata = {
  alternates: { canonical: "/results" },
  title: "Results",
  description:
    "How FitFuel measures real progress, and an honest invitation to become one of our first transformation stories.",
};

const MEASURES = [
  {
    t: "Weight trend",
    m: "The line over weeks",
    d: "Not a single weigh-in, so a bad day never looks like failure.",
  },
  {
    t: "Consistency score",
    m: "0 to 100, weekly",
    d: "From meals logged, workouts done, water and weigh-ins.",
  },
  {
    t: "Macro adherence",
    m: "Percent of target",
    d: "How closely your protein, carbs and fat tracked to your personalised target.",
  },
  {
    t: "Body metrics",
    m: "Weight, composition, tape",
    d: "Measurements over time, beyond just the scale.",
  },
];

export default function ResultsPage() {
  return (
    <Shell>
      <Masthead
        label="Results"
        title="Real progress, measured honestly"
        deck="We are just getting started, and we would rather show you nothing than show you stock photos and invented numbers. Here is how FitFuel measures progress, and an open invitation to be one of the first real stories on this page."
        meta={[
          { k: "Published stories", v: String(STORIES.length) },
          { k: "Stock photos used", v: "0" },
        ]}
      />

      <Stack>
        <section style={{ paddingTop: "clamp(20px,3vw,36px)" }}>
          <Wrap>
            <Note>
              <Prose>
                <p>
                  <strong>Our promise.</strong> Every testimonial we ever publish here will be from
                  a real FitFuel member, with their consent. No fabricated results, no rented faces,
                  and every figure taken from that member&rsquo;s own logged data rather than
                  recalled.
                </p>
              </Prose>
            </Note>
          </Wrap>
        </section>

        <section style={SECTION}>
          <Wrap>
            <Head
              label="What we actually track"
              title="Four measures, all of them yours"
              deck="These run whether or not anyone ever publishes a story. They are what the app shows you every week."
              size="clamp(1.9rem,4.6vw,3.4rem)"
              max="17ch"
            />
            <div style={{ marginTop: "clamp(28px,4vw,46px)" }}>
              <Spec
                caption="What FitFuel measures, and how"
                head={["Measure", "Unit", "What it tells you"]}
              >
                {MEASURES.map((m) => (
                  <tr key={m.t}>
                    <th scope="row">{m.t}</th>
                    <td>{m.m}</td>
                    <td>{m.d}</td>
                  </tr>
                ))}
              </Spec>
            </div>
          </Wrap>
        </section>

        <section style={SECTION}>
          <Wrap>
            <Head
              label="Transformation stories"
              title={STORIES.length > 0 ? "Members who did it" : "Three frames, still empty"}
              size="clamp(1.9rem,4.6vw,3.4rem)"
              max="16ch"
              deck={
                STORIES.length > 0
                  ? undefined
                  : "The shape of what goes here is legible before anything fills it. That is deliberate: an empty frame you can see the size of is more honest than a page that simply omits the section."
              }
            />
            <div style={STORY_GRID}>
              {(STORIES.length > 0 ? STORIES : [undefined, undefined, undefined]).map((st, i) => (
                <BeforeAfterSlot key={st?.slug ?? `reserved-${i}`} story={st} />
              ))}
            </div>
          </Wrap>
        </section>
      </Stack>

      <Band
        title="Be one of the first"
        body="Start your plan, track your weeks, and your real numbers could be the story on this page."
        href="/plans"
        cta="Start your plan"
        secondary={{ href: "/how-it-works", label: "How it works" }}
      />
    </Shell>
  );
}

const STORY_GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 18,
  marginTop: "clamp(28px,4vw,46px)",
} as const;
