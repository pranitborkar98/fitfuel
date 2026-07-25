// app/_home/Pricing.tsx
//
// WHAT YOU ACTUALLY PAY. The receipt, before you are asked for money.
//
// lib/pricing-decomposition.ts (Decision #189) is the single source of truth
// for the price model, and it is genuinely unusual: the seeded
// PlanPrice.priceRs is the real GST-exclusive subtotal and never moves, and
// the lib only reshapes how that one number is PRESENTED:
//
//   card:      MRP (struck)  ->  base
//   checkout:  base + delivery + packaging = subtotal  (+) 5% GST = total
//
// Every food business in India hides delivery and packaging until the last
// screen. This one has a pure, deterministic function that splits them out,
// and the site never mentioned it. Naming the split is the trust play: a
// customer who sees the breakdown before checkout does not feel ambushed at
// checkout.
//
// Also surfaced here, both shipped and both invisible until now:
//   lib/coupons.ts        PERCENT, FLAT and FREE_DELIVERY discount types
//   CreditLedger          store credit, which is where the Rs 500 referral
//                         reward actually lands and gets spent
//   /api/checkout/credit-preview  applies credit before you commit
//
// NUMBERS ARE ILLUSTRATIVE AND SAID TO BE. The example column uses a round
// Rs 6,000 subtotal to show the SHAPE of the receipt, not a real plan price,
// and the copy says so. Printing a specific plan's total here would go stale
// the moment PlanPrice changes, and a stale price on a homepage is a dispute.
//
// Mechanism: an actual receipt. Nothing else on this page is right-aligned
// figures over a rule with a total underneath.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, DIM, huge, mid, copy, tag } from "./theme";

/* Shape only. See the header: these demonstrate the decomposition, they are
   not a quote. GST is the one hard number here and it is the real 5%. */
const LINES: [string, string, string][] = [
  ["Food", "The meals themselves", "base"],
  ["Delivery", "Six days a week, to your door", "+"],
  ["Packaging", "Compartment boxes, sealed", "+"],
];

export default function Pricing() {
  return (
    <section
      aria-labelledby="pricing-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0", background: "#050504" }}
    >
      <div style={WRAP}>
        <div className="ff-price-split">
          <div>
            <Reveal>
              <span style={tag(LIME)}>No surprises at checkout</span>
              <h2 id="pricing-heading" style={{ ...huge("clamp(2.4rem,6vw,4.8rem)"), maxWidth: "13ch", marginTop: 16 }}>
                The receipt, before you pay
              </h2>
            </Reveal>

            <Reveal delay={0.05}>
              <p style={{ ...copy(16.5), maxWidth: "50ch", marginTop: 22 }}>
                Delivery and packaging are separated out and named rather than buried in a headline
                price, and GST is stated at 5% instead of appearing on the last screen. The plan
                price itself never changes. Only how honestly it is broken up.
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="ff-price-extras">
                <div>
                  <h3 style={{ ...mid("1.15rem") }}>Coupons</h3>
                  <p style={{ ...copy(14), marginTop: 8 }}>
                    Three kinds, all real: a percentage off, a flat amount off, or free delivery.
                    Validated before you commit, not after.
                  </p>
                </div>
                <div>
                  <h3 style={{ ...mid("1.15rem") }}>Store credit</h3>
                  <p style={{ ...copy(14), marginTop: 8 }}>
                    Referral rewards land as credit on your account and come off the next order.
                    You see the credit applied before you pay, not as a promise.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginTop: "clamp(26px,3vw,36px)" }}>
                <Link href="/plans" className="ff-a">See real plan prices <ArrowRight size={17} /></Link>
                <Link href="/refund-policy" className="ff-a">Refund policy <ArrowRight size={17} /></Link>
              </div>
            </Reveal>
          </div>

          {/* The receipt. */}
          <Reveal delay={0.08}>
            <div className="ff-receipt">
              <div className="ff-receipt-head">
                <span style={{ ...tag(DIM), fontSize: 11 }}>How a price is built</span>
              </div>
              {LINES.map(([label, note, mark]) => (
                <div key={label} className="ff-receipt-row">
                  <div>
                    <span className="ff-receipt-label">{label}</span>
                    <span className="ff-receipt-note">{note}</span>
                  </div>
                  <span className="ff-receipt-mark">{mark}</span>
                </div>
              ))}
              <div className="ff-receipt-row" data-sub="">
                <span className="ff-receipt-label">Subtotal</span>
                <span className="ff-receipt-mark">=</span>
              </div>
              <div className="ff-receipt-row">
                <div>
                  <span className="ff-receipt-label">GST</span>
                  <span className="ff-receipt-note">On meal plans</span>
                </div>
                <span className="ff-receipt-mark" data-real="">5%</span>
              </div>
              <div className="ff-receipt-total">
                <span style={{ ...mid("clamp(1.3rem,2vw,1.6rem)"), color: INK }}>What you pay</span>
                <span style={{ ...mid("clamp(1.3rem,2vw,1.6rem)"), color: LIME }}>Total</span>
              </div>
              <p className="ff-receipt-foot">
                Shape, not a quote. Real prices vary by plan, diet and duration, and every one of
                them is published on the plans page with this same breakdown at checkout.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
