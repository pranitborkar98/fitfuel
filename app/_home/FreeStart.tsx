// app/_home/FreeStart.tsx
//
// TWO WAYS IN THAT ARE NOT A SUBSCRIPTION.
//
// The whole site funnelled to one action: buy a plan. Two shipped products sat
// outside that funnel with a single text link each, buried in a list near the
// footer.
//
// 1. THE TDEE CALCULATOR. app/tdee-calculator, public, no account, no email.
//    lib/tdee.ts computes a maintenance figure and macro targets across five
//    activity levels and eleven goals, including the condition goals (PCOS,
//    diabetic, manage_condition) that a generic online calculator will not
//    touch. This is the cheapest acquisition surface the business owns and it
//    was linked exactly once, in small text.
//
// 2. DIGITAL PLANS. lib/digital-plan.ts + lib/digital-plan-pdf.tsx render a
//    real PDF, sold through their own PayU route (app/api/payments/payu/digital)
//    with no delivery leg at all. That means it sells anywhere in India, not
//    just the fifteen Pune areas the kitchen reaches. An entire product line
//    with no geography constraint, represented on the homepage by one list item.
//
// Mechanism: two doors, side by side, weighted equally. Not cards with a
// shadow: two full-height panels split by a single rule, each with its own
// entry action, because the point is that these are alternatives to each other
// rather than steps in a sequence.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, DIM, huge, mid, copy, tag } from "./theme";

export default function FreeStart() {
  return (
    <section
      aria-labelledby="freestart-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0" }}
    >
      <div style={WRAP}>
        <Reveal>
          <span style={tag(LIME)}>You do not have to subscribe to start</span>
          <h2 id="freestart-heading" style={{ ...huge("clamp(2.4rem,6.4vw,5.2rem)"), maxWidth: "15ch", marginTop: 16 }}>
            Two doors that are not a plan
          </h2>
        </Reveal>

        <div className="ff-doors">
          <Reveal delay={0.06}>
            <div className="ff-door">
              <span style={{ ...tag(DIM), fontSize: 11.5 }}>Free, no account</span>
              <h3 style={{ ...mid("clamp(1.7rem,3vw,2.4rem)"), marginTop: 14 }}>
                Find your number
              </h3>
              <p style={{ ...copy(15), marginTop: 14, maxWidth: "38ch" }}>
                What you burn in a day, and the protein, carbs and fat that follow from it. Five
                activity levels and eleven goals, including PCOS, diabetic and general condition
                management, which most calculators will not go near.
              </p>
              <ul className="ff-door-list">
                {[
                  "No email, no signup, no paywall",
                  "Maintenance calories and a macro split",
                  "Feeds straight into onboarding if you continue",
                ].map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div style={{ marginTop: "auto", paddingTop: 26 }}>
                <Link href="/tdee-calculator" className="ff-btn">Calculate free</Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="ff-door">
              <span style={{ ...tag(DIM), fontSize: 11.5 }}>Anywhere in India</span>
              <h3 style={{ ...mid("clamp(1.7rem,3vw,2.4rem)"), marginTop: 14 }}>
                Take the plan, cook it yourself
              </h3>
              <p style={{ ...copy(15), marginTop: 14, maxWidth: "38ch" }}>
                The same plans as a PDF you keep: the full cycle, every dish, every macro, and the
                method. No kitchen, no delivery, no delivery area. If you are outside Pune, this is
                the whole system without the food.
              </p>
              <ul className="ff-door-list">
                {[
                  "A real document, not a login you rent",
                  "No delivery leg, so no delivery charge",
                  "Sold and delivered instantly, wherever you are",
                ].map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div style={{ marginTop: "auto", paddingTop: 26 }}>
                <Link href="/plans/digital" className="ff-a" style={{ fontSize: 16 }}>
                  Browse digital plans <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2}>
          <p style={{ ...copy(13.5), color: DIM, marginTop: 22, maxWidth: "62ch" }}>
            Both exist because not everyone who should be eating properly lives inside our delivery
            map, and nobody should have to buy a subscription to find out what their body needs.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
