// app/our-team/page.tsx
//
// The team, on the Instrument System.
//
// The two people were radius-16 cards each opening with a 76px rounded avatar
// holding lime initials. Initials-in-a-square is a stand-in for a photograph
// that does not exist, and dressing it in lime made a placeholder the loudest
// thing on the page. Both people are now set as editorial entries: name at
// display scale, role as a mono label, biography in a measured column.
//
// The nutritionist entry is still unfilled. It says so in words, in the entry
// itself, rather than shipping "[Nutritionist name]" inside a card that looks
// finished.

import { Masthead, Note, Prose, Shell, Stack, Wrap, A, p } from "@/app/_ui/Page";
import { Idx } from "@/app/_ui/Kit";
import { SECTION, display, label } from "@/app/_ui/theme";

export const metadata = {
  alternates: { canonical: "/our-team" },
  title: "Our Team",
  description: "The people behind FitFuel and the nutrition principles that shape every plan.",
};

export default function OurTeamPage() {
  return (
    <Shell>
      <Masthead
        label="Our team"
        title="The people behind your plate"
        deck="FitFuel was built by people who got tired of choosing between food that tastes good and food that works. So we built a system that does both."
      />

      <Stack>
        <section style={SECTION}>
          <Wrap>
            <Idx label="Founder" />
            <div className={p.pair}>
              <div>
                <h2 style={display("clamp(2.2rem,5.4vw,4rem)")}>Pranit Borkar</h2>
                <span style={{ ...label("#84cc16"), marginTop: 14 }}>Founder</span>
              </div>
              <Prose>
                <p>
                  Pranit founded FitFuel in Pune to turn meal delivery into something more than a
                  tiffin service: a personal health system that cooks for you, tracks every gram,
                  and adapts as your body changes.
                </p>
                <p>
                  He leads product, kitchen and technology, and personally tests every part of the
                  experience before it reaches a customer.
                </p>
              </Prose>
            </div>
          </Wrap>
        </section>

        <section style={SECTION}>
          <Wrap>
            <Idx label="Nutrition" />
            <div className={p.pair}>
              <div>
                {/* Deliberately not a name in brackets. The role exists, the
                    appointment is not announced, and the page says which. */}
                <h2 style={display("clamp(2.2rem,5.4vw,4rem)")}>Not yet appointed</h2>
                <span style={{ ...label(), marginTop: 14 }}>Qualified nutritionist / dietitian</span>
              </div>
              <Prose>
                <p>
                  Our plans are built on established nutrition principles, and every calorie and
                  macro figure on this site comes from weighed kitchen records.
                </p>
                <p>
                  A qualified nutritionist has not yet been appointed. Their name and credentials
                  will be published here, and that appointment is a hard requirement before any
                  condition-specific medical plan goes live.
                </p>
              </Prose>
            </div>
          </Wrap>
        </section>

        <section style={{ paddingBottom: "clamp(40px,6vw,80px)" }}>
          <Wrap>
            <Note>
              <Prose>
                <p>
                  FitFuel provides food and general nutrition guidance, not medical advice. Please
                  read our <A href="/medical-disclaimer">Medical Disclaimer</A> before starting a
                  condition-specific plan.
                </p>
              </Prose>
            </Note>
          </Wrap>
        </section>
      </Stack>
    </Shell>
  );
}
