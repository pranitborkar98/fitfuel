// app/_hp/Cost.tsx
//
// What it costs, and how the price is built.
//
// NO INVENTED PRICES. Rs 400 for the trial day is real and used site-wide;
// everything else links to /plans, where PlanPrice is the source of truth. The
// old page held this line carefully and it is worth keeping — a stale price on a
// homepage is a dispute at checkout.
//
// The decomposition (base + delivery + packaging, then 5% GST) comes from
// lib/pricing-decomposition.ts. Naming it before checkout is the trust play:
// every food business in India hides delivery and packaging until the last screen.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "./hp.module.css";
import { WRAP, SECTION, INK_3, GREEN, display, sub, body, label, figure } from "./theme";

export default function Cost() {
  return (
    <section aria-labelledby="hp-cost" style={SECTION}>
      <div style={WRAP}>
        <div className={s.reveal}>
          <span style={label(GREEN)}>No surprises at checkout</span>
          <h2 id="hp-cost" style={{ ...display("clamp(2.1rem,4.6vw,3.5rem)"), marginTop: 14, maxWidth: "16ch" }}>
            The receipt, before you pay
          </h2>
          <p style={{ ...body(17), marginTop: 18, maxWidth: "56ch" }}>
            Delivery and packaging are separated out and named rather than buried inside a
            headline price, and GST is stated at 5% instead of appearing on the last screen.
          </p>
        </div>

        <div className={s.prices}>
          <div className={`${s.price} ${s.priceFeat}`}>
            <span style={label(GREEN)}>Start here</span>
            <div style={{ ...figure("clamp(2.4rem,4.4vw,3.2rem)"), marginTop: 14 }}>Rs 400</div>
            <h3 style={{ ...sub("1.15rem"), marginTop: 12 }}>One trial day</h3>
            <p style={{ ...body(14.5), marginTop: 10 }}>
              Four meals, cooked and delivered, weighed to your macros. No subscription,
              no card on file, no commitment past tomorrow morning.
            </p>
            <div style={{ marginTop: 20 }}>
              <Link href="/plans?trial=true" className={s.btn}>Book a trial day</Link>
            </div>
          </div>

          <div className={s.price}>
            <span style={label(INK_3)}>Then</span>
            <div style={{ ...figure("clamp(1.7rem,2.8vw,2.1rem)"), marginTop: 14 }}>126 plans</div>
            <h3 style={{ ...sub("1.15rem"), marginTop: 12 }}>Weekly to three-month</h3>
            <p style={{ ...body(14.5), marginTop: 10 }}>
              Seven durations, four diets, two delivery windows. Prices vary by plan and
              length and every one of them is published, with this same breakdown at checkout.
            </p>
            <div style={{ marginTop: 20 }}>
              <Link href="/plans" className={s.btnGhost}>See real prices <ArrowRight size={16} /></Link>
            </div>
          </div>

          <div className={s.price}>
            <span style={label(INK_3)}>What a price is made of</span>
            <ul className={s.included} style={{ marginTop: 18 }}>
              <li>The food itself</li>
              <li>Delivery, six days a week</li>
              <li>Sealed compartment packaging</li>
              <li>5% GST, stated up front</li>
            </ul>
            <p style={{ ...body(13.5), color: INK_3, marginTop: 18 }}>
              Coupons and referral credit are applied and shown before you commit, not after.
              Cards, UPI and net banking clear through PayU; cash on delivery is handled by us.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
