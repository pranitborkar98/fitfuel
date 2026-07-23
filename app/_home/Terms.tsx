// app/_home/Terms.tsx
//
// THE OPERATIONAL TRUTH the site never spelled out.
//
// The backend carries a full commerce and logistics spine that the
// homepage never described: 7 plan durations (PlanDuration enum, trial day
// through three months), morning/evening delivery windows (DeliveryWindow
// enum), PayU plus cash on delivery (PaymentMethod enum), a driver network
// and delivery board, and a digital PDF product (DigitalBundle: Starter /
// Pro) for anyone outside the Pune delivery radius.
//
// This is the trust section: the answers to "how long do I commit", "when
// does it come", "how do I pay", "what if I'm not in Pune". Every line maps
// to a real enum or route, nothing is aspirational.
//
// Mechanism 11: a spec sheet whose hairline rules wipe in on scroll, so it
// assembles itself like an instrument readout being drawn. Uses the same
// scaleX-rule idea, staggered per row via nth-child delays baked into the
// animation-range.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, MUTE, DIM, huge, mid, copy, tag } from "./theme";

const SPECS: [string, string, string][] = [
  ["Length", "Trial day to three months", "Seven lengths: a single trial day, weekly, bi-weekly, monthly excluding weekends, one, two or three months."],
  ["Delivery", "Morning or evening", "Pick the window that fits your day. Cooked from 04:00, at your door by 08:00 on the morning window, six days a week."],
  ["Commitment", "None", "Pause or skip before your next box. No lock-in, no notice period, no cancellation fee."],
  ["Payment", "UPI, cards, or cash", "UPI, credit and debit cards and netbanking through PayU, or cash on delivery. GST and delivery are included in the price you see."],
  ["Outside Pune", "Digital PDF plans", "Not in our delivery radius yet? The same plans as a Starter or Pro PDF, with the recipes, macros and a grocery list."],
];

export default function Terms() {
  return (
    <section aria-labelledby="terms-heading" style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <h2 id="terms-heading" style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "12ch" }}>On your terms</h2>
            <Link href="/plans" className="ff-a">Build your plan <ArrowRight size={17} /></Link>
          </div>
        </Reveal>

        {/* A five-row spec sheet. Each row: label, the short answer at
            display scale, the detail. The hairline above each row wipes in
            on scroll. */}
        <dl className="ff-spec" style={{ marginTop: "clamp(36px,4vw,60px)" }}>
          {SPECS.map(([label, answer, detail], i) => (
            <div key={label} className="ff-spec-row" style={{ ["--r" as string]: i }}>
              <span className="ff-spec-rule" aria-hidden />
              <dt className="ff-spec-label" style={tag(DIM)}>{label}</dt>
              <dd className="ff-spec-answer" style={{ ...mid("clamp(1.5rem,3vw,2.4rem)"), color: INK, margin: 0 }}>{answer}</dd>
              <dd className="ff-spec-detail" style={{ ...copy(15), margin: 0 }}>{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
