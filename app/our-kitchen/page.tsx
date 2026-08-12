// app/our-kitchen/page.tsx
//
// The kitchen, on the Instrument System.
//
// TWO THINGS CHANGED BEYOND STYLING.
//
// The three dashed "Kitchen photo" boxes are gone. Not one of the site's
// photographs exists yet, and a dashed empty rectangle labelled with the name
// of a missing image reads as a page that failed to load, not as a promise.
// Where the photos were, the page now states the facts it actually has: a
// readout of the morning, which is the device defined for exactly
// this. When real kitchen photography exists it goes in as a full-bleed
// alternating block, not back into three placeholder slots.
//
// The six standards are a real <table>. They are tabular — a standard and what
// it commits us to — and a grid of divs cannot be read by assistive tech.

import { Head, Spec, k } from "@/app/_ui/Kit";
import { Band, Masthead, Prose, Shell, Stack, Wrap, A } from "@/app/_ui/Page";
import { SECTION, body, figure, label } from "@/app/_ui/theme";

export const metadata = {
  alternates: { canonical: "/our-kitchen" },
  title: "Our Kitchen",
  description:
    "Inside the FitFuel kitchen: fresh daily prep, no deep frying, clean oils and FSSAI-licensed food safety in Pune.",
};

const STANDARDS = [
  { t: "No deep frying", d: "Ever. We steam, saute, grill and slow-cook. Flavour without the oil load." },
  { t: "Clean oils only", d: "Cold-pressed and heart-friendly oils used in measured amounts, never reused." },
  {
    t: "Cooked the same day",
    d: "Your food is prepared fresh each morning, not batch-cooked days ahead and reheated.",
  },
  {
    t: "Measured to the gram",
    d: "Portions are weighed so the macros on your dashboard match what is actually in the box.",
  },
  { t: "Fresh sourcing", d: "Vegetables and proteins sourced locally in Pune, chosen for the day's menu." },
  {
    t: "FSSAI licensed",
    d: "We operate under FSSAI licence 21523035002815, with hygiene and food-safety practices throughout.",
  },
];

const RHYTHM = [
  { time: "4:00", t: "Prep begins", d: "Fresh produce washed, cut and weighed for the day's menu." },
  { time: "5:30", t: "Cooking", d: "Meals cooked in small batches, no frying, portioned to plan." },
  { time: "7:00", t: "Pack and check", d: "Sealed, labelled with macros, and your Morning Boost added." },
  { time: "7:30", t: "Dispatch", d: "Bundled into your daily delivery window and on its way." },
];

export default function OurKitchenPage() {
  return (
    <Shell>
      <Masthead
        label="Our kitchen"
        title="Fresh, clean, every morning"
        deck="The dashboard is only as honest as the kitchen behind it. Here is how your food is actually made, and the standards we hold every single day."
        meta={[
          { k: "FSSAI", v: "21523035002815" },
          { k: "Prep starts", v: "04:00" },
          { k: "Deep frying", v: "Never" },
        ]}
      />

      <Stack>
        {/* The morning as a readout: the signature device, welded to the page
            by hairlines top and bottom. Condensed numerals, dim mono labels. */}
        <section>
          <div className={k.readout} style={{ ["--cells" as string]: 4 }}>
            {RHYTHM.map((r) => (
              <div key={r.time} className={k.cell}>
                <span style={label()}>{r.t}</span>
                <span style={figure("clamp(2.2rem,4.6vw,3.4rem)")}>{r.time}</span>
                <p style={{ ...body(14), maxWidth: "30ch" }}>{r.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={SECTION}>
          <Wrap>
            <Head
              label="Our standards"
              title="Six rules the kitchen runs on"
              deck="These are not aspirations. They are the operating constraints every day's menu is cooked inside."
              size="clamp(1.9rem,4.6vw,3.4rem)"
              max="16ch"
            />
            <div style={{ marginTop: "clamp(28px,4vw,46px)" }}>
              <Spec caption="FitFuel kitchen standards" head={["Standard", "What it commits us to"]}>
                {STANDARDS.map((s) => (
                  <tr key={s.t}>
                    <th scope="row">{s.t}</th>
                    <td>{s.d}</td>
                  </tr>
                ))}
              </Spec>
            </div>
          </Wrap>
        </section>

        <section style={SECTION}>
          <Wrap>
            <Head
              label="Photography"
              title="We have not shot it yet"
              size="clamp(1.7rem,4vw,2.8rem)"
              max="14ch"
              deck={
                <Prose>
                  <p>
                    This page used to hold three dashed boxes labelled “Kitchen photo”. We would
                    rather say plainly that the photographs do not exist yet than show you an empty
                    frame or licence a stock kitchen that is not ours. When we have photographed our
                    own room, our own prep and our own packing line, the pictures go here.
                  </p>
                  <p>
                    What is not waiting on a camera is the data. See{" "}
                    <A href="/our-ingredients">Our Ingredients</A> for what goes in, and the{" "}
                    <A href="/allergen-policy">Allergen Policy</A> for how a shared kitchen is
                    handled.
                  </p>
                </Prose>
              }
            />
          </Wrap>
        </section>
      </Stack>

      <Band
        title="Eat what we cook"
        body="One bundled delivery a day, in your Morning or Evening window, cooked that same morning."
        href="/plans"
        cta="See the plans"
        secondary={{ href: "/menu", label: "See the menu" }}
      />
    </Shell>
  );
}
