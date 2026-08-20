// app/our-ingredients/page.tsx
//
// What goes in, and what deliberately does not. On the Instrument System now:
// the four "what goes in" cards were a radius-14 auto-fit grid, and the
// exclusion list used a lime × as its bullet, which encoded meaning in a glyph.
//
// The two halves are set differently on purpose. What goes in is a hairline
// tile grid; what we leave out is a plain measured list. A page where every
// block has the same shape is the rhythm to avoid.

import { Head, Tiles, Tile } from "@/app/_ui/Kit";
import { Band, Masthead, Note, Prose, Shell, Stack, Wrap, A } from "@/app/_ui/Page";
import { SECTION, body, label } from "@/app/_ui/theme";

export const metadata = {
  alternates: { canonical: "/our-ingredients" },
  title: "Our Ingredients",
  description:
    "What goes into a FitFuel meal: fresh local sourcing, clean oils, real proteins, and what we deliberately leave out.",
};

const GROUPS = [
  {
    t: "Fresh, locally sourced",
    d: "Vegetables and produce sourced in Pune and chosen for each day's menu, so they reach you fresh rather than stored for weeks.",
  },
  {
    t: "Real proteins",
    d: "Paneer, dals and legumes, eggs, chicken and fish depending on your plan. Lean cuts, measured for your macro target.",
  },
  {
    t: "Clean oils, used sparingly",
    d: "Cold-pressed and heart-friendly oils in measured amounts. No deep frying, no reused oil.",
  },
  {
    t: "Whole grains and complex carbs",
    d: "Rotis, millets, brown and hand-pounded rice and oats, chosen to keep energy steady through the day.",
  },
];

const AVOID = [
  "No deep frying, anywhere on the menu",
  "No reused or hydrogenated oils",
  "No added refined sugar where it can be avoided; natural sweeteners in moderation",
  "No artificial preservatives or colours added by us",
  "No mystery portions: every ingredient is weighed and reflected in your macros",
];

export default function OurIngredientsPage() {
  return (
    <Shell>
      <Masthead
        label="Our ingredients"
        title="Real food, nothing hidden"
        deck="Good macros start with good ingredients. We keep the list simple, fresh and honest, so the food on your plate matches the numbers on your dashboard."
      />

      <Stack>
        <section style={SECTION}>
          <Wrap>
            <Head
              label="What goes in"
              title="Four things, sourced properly"
              deck="Every plan is built from these. The proportions change with your target; the sourcing does not."
              size="clamp(1.9rem,4.6vw,3.4rem)"
              max="16ch"
            />
            <Tiles cols={2} style={{ marginTop: "clamp(28px,4vw,46px)" }}>
              {GROUPS.map((g) => (
                <Tile key={g.t}>
                  <span style={label()}>{g.t}</span>
                  <p style={{ ...body(15.5), marginTop: 4 }}>{g.d}</p>
                </Tile>
              ))}
            </Tiles>
          </Wrap>
        </section>

        {/* The exclusions read as running copy, not as tiles. Each line states
            its own negative in words, so nothing depends on a glyph. */}
        <section style={SECTION}>
          <Wrap>
            <Head
              label="What we leave out"
              title="And five things that never do"
              size="clamp(1.9rem,4.6vw,3.4rem)"
              max="18ch"
            />
            <Prose style={{ marginTop: "clamp(26px,3.6vw,40px)" }}>
              <ul>
                {AVOID.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </Prose>

            <Note style={{ marginTop: "clamp(30px,4vw,48px)" }}>
              <Prose>
                <p>
                  <strong>A note on allergens.</strong> Our meals are prepared in a shared kitchen
                  that handles common allergens, so cross-contact is possible. Please read our{" "}
                  <A href="/allergen-policy">Allergen Policy</A> and declare any allergies in your
                  profile before your first delivery.
                </p>
              </Prose>
            </Note>
          </Wrap>
        </section>
      </Stack>

      <Band
        title="See it on a plate"
        body="Every dish on the menu prints its own weighed calories, protein, carbs and fat."
        href="/menu"
        cta="See this week’s menu"
        secondary={{ href: "/our-kitchen", label: "Our kitchen" }}
      />
    </Shell>
  );
}
