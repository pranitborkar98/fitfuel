// app/_home/Refer.tsx
//
// THE REFERRAL LOOP, unvisualised until now.
//
// FitFuel runs a per-user referral system: each account gets a code
// (FF-NAME-XXXX), and when a referred friend's first order is CONFIRMED,
// a Rs 500 credit lands in both wallets via the CreditLedger. It was one
// link in the footer index. It is a growth loop and it deserves to be
// shown as one.
//
// The number is early (creditLedger count is 0 today), so this describes
// the mechanism, not a scale it has not reached. No fabricated totals.
//
// Mechanism 10: a connector line that draws left-to-right across the three
// steps as the section scrolls, so the loop visibly completes. Reuses the
// scaleX-on-a-rule idea from the strike, applied horizontally across a row.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, DIM, huge, mid, copy, tag } from "./theme";

const STEPS: [string, string][] = [
  ["Share your code", "Every account gets one: FF-NAME-XXXX. Send it to a friend."],
  ["They order", "Their first box is confirmed. Nothing for you to chase."],
  ["You both earn", "Rs 500 credit lands in both wallets, spendable on your next plan."],
];

export default function Refer() {
  return (
    <section aria-labelledby="refer-heading" style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}` }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div>
              <span style={tag(LIME)}>Refer and earn</span>
              <h2 id="refer-heading" style={{ ...huge("clamp(2.4rem,6vw,5rem)"), maxWidth: "13ch", marginTop: 16 }}>
                Feed a friend, feed your wallet
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, justifyContent: "flex-end" }}>
                <span style={{ ...huge("clamp(2.4rem,5vw,4rem)"), color: LIME, lineHeight: 0.8 }}>Rs 500</span>
              </div>
              <div style={{ ...mid("clamp(1rem,1.4vw,1.25rem)"), color: DIM, marginTop: 6 }}>to each of you</div>
            </div>
          </div>
        </Reveal>

        {/* Three steps with a lime connector that draws across them on
            scroll. The line lives behind the numbers and fills left to
            right; base state is fully drawn so the meaning survives if the
            timeline never activates. */}
        <div className="ff-refer" style={{ marginTop: "clamp(40px,5vw,68px)" }}>
          <span className="ff-refer-line" aria-hidden />
          <ol className="ff-refer-steps">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="ff-refer-step">
                <span aria-hidden className="ff-refer-dot" style={{ ...huge("clamp(1.4rem,2vw,1.8rem)"), color: "#000" }}>{i + 1}</span>
                <h3 style={{ ...mid("clamp(1.4rem,2.2vw,1.9rem)"), marginTop: 18 }}>{t}</h3>
                <p style={{ ...copy(15), marginTop: 10, maxWidth: "34ch" }}>{d}</p>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ marginTop: "clamp(30px,4vw,48px)" }}>
          <Link href="/dashboard/referrals" className="ff-btn">Get your code</Link>
        </div>
      </div>
    </section>
  );
}
