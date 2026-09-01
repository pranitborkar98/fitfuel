// app/corporate/page.tsx
//
// Corporate, on the Instrument System. The offerings were a radius-14 auto-fit
// grid and the close was the centred gradient card; both are gone.
//
// The offerings are directory rows rather than tiles because a company reading
// this is scanning for the one line that applies to it, and a hairline list
// scans faster than a grid. The close is the standard band, with the enquiry
// mail as its action.

import { Head, Row, Go, k } from "@/app/_ui/Kit";
import { Band, Masthead, Prose, Shell, Stack, Wrap } from "@/app/_ui/Page";
import { SECTION, body, sub } from "@/app/_ui/theme";

export const metadata = {
  alternates: { canonical: "/corporate" },
  title: "Corporate Plans",
  description:
    "Healthy, goal-based meals for your team. FitFuel corporate wellness and meal programmes are fulfilled by the kitchen serving your workplace.",
};

const OFFERINGS = [
  {
    t: "Team meal programs",
    d: "Daily healthy meals for your employees, personalised by goal and dietary preference, delivered to the office or to homes.",
  },
  {
    t: "Wellness as a benefit",
    d: "Offer FitFuel as a health benefit, with optional tracking and progress that supports a genuine wellness culture.",
  },
  {
    t: "Flexible billing",
    d: "Consolidated monthly invoicing, GST-compliant, with simple onboarding for your team.",
  },
  {
    t: "Tiered options",
    d: "Standard, Premium and Luxury tiers so each employee can choose the level that suits them.",
  },
];

const BENEFITS = [
  "Fewer sluggish afternoons and more steady energy across the workday",
  "A visible, practical investment in employee health and retention",
  "No kitchen or pantry logistics for you: we handle sourcing, cooking and delivery",
  "Personalised to each person, not a one-size-fits-all canteen menu",
];

const MAILTO = "mailto:contact@fitfuel.in?subject=FitFuel%20Corporate%20Enquiry";

export default function CorporatePage() {
  return (
    <Shell>
      <Masthead
        label="For companies"
        title="Fuel your whole team"
        deck="A healthy team is a sharper team. Bring FitFuel's goal-based, freshly cooked meals to your workplace, personalised for every employee and handled end to end by us."
      />

      <Stack>
        <section style={SECTION}>
          <Wrap>
            <Head
              label="What we offer"
              title="Four ways in"
              deck="Most companies start with one and add the others once the first cohort is running."
              size="clamp(2rem,5vw,3.6rem)"
            />
            <div className={k.rows} style={{ marginTop: "clamp(28px,4vw,46px)" }}>
              {OFFERINGS.map((o) => (
                <Row key={o.t} cols="minmax(0,1fr) minmax(0,1.5fr) 28px" href={MAILTO}>
                  <h3 style={sub("clamp(1.15rem,2vw,1.5rem)")}>{o.t}</h3>
                  <p style={{ ...body(15), maxWidth: "54ch" }}>{o.d}</p>
                  <Go />
                </Row>
              ))}
            </div>
          </Wrap>
        </section>

        <section style={SECTION}>
          <Wrap>
            <Head
              label="Why companies choose FitFuel"
              title="What changes in the first month"
              size="clamp(1.9rem,4.6vw,3.2rem)"
              max="18ch"
            />
            <Prose style={{ marginTop: "clamp(26px,3.6vw,40px)" }}>
              <ul>
                {BENEFITS.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Prose>
          </Wrap>
        </section>
      </Stack>

      <Band
        title="Let us build a program for your team"
        body="Tell us your team size and goals and we will put together a proposal."
        href={MAILTO}
        cta="Enquire now"
        secondary={{ href: "/contact", label: "Contact us" }}
      />
    </Shell>
  );
}
