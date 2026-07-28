// app/_hp/Why.tsx
//
// FOUR REASONS, and a deliberate refusal.
//
// Both outside reviews asked for trust signals this page does not have the
// right to make: "Rated 4.8/5 by 500+ Pune foodies", "Join 200+ Punekars",
// "500+ meals delivered every week", "Free delivery", "No preservatives".
//
// The database has 5 users and 8 testimonials. Delivery is Rs 50 a day and is
// itemised on the receipt further down this same page. Nobody has run a
// preservative test. Printing any of those numbers would be the single fastest
// way to make everything else here unbelievable — and on a food business it is
// also the kind of claim that gets a licence looked at.
//
// So this block only makes claims that survive being checked: the licence
// number, the kitchen, the scale, the published menu. Those are genuinely
// stronger than an invented rating, because a competitor can buy reviews and
// cannot buy a menu they are willing to publish before payment.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, INK, DIM, LIME, display, sub, body } from "./theme";

const REASONS: [string, string][] = [
  [
    "Cooked, not assembled",
    "Real Indian food from 30 seeded recipes across Maharashtrian, Chettinad, Punjabi, Bengali, Gujarati and more. Not five sad variations on grilled chicken and broccoli.",
  ],
  [
    "Weighed, not estimated",
    "Every portion hits your macros on a scale before the compartment is sealed. That single act is the reason the tracking can be automatic at all.",
  ],
  [
    "Our own licensed kitchen",
    "FSSAI 21523035002815, in Kharadi. Not a cloud kitchen we rent by the shift and not a partner restaurant cooking your food between other orders.",
  ],
  [
    "The menu is public before you pay",
    "Every dish, every macro, no signup wall. Most services show you a photo and a promise, and the actual menu after your card clears.",
  ],
];

export default function Why() {
  return (
    <section aria-labelledby="hp-why" style={SECTION}>
      <div style={WRAP}>
        <Idx label="Why this and not a tiffin" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2 id="hp-why" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "13ch" }}>
            Four things you can check before you trust us
          </h2>
          <p style={{ ...body(16.5) }}>
            We are not going to tell you five hundred people love us. There are eight
            reviews in our database and you can read all eight. Here is what we will put
            our name to instead.
          </p>
        </div>

        <div className={s.stats} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {REASONS.map(([h, p]) => (
            <div key={h} className={s.stat}>
              <h3 style={{ ...sub("clamp(1.1rem,1.8vw,1.4rem)"), color: LIME }}>{h}</h3>
              <p style={{ ...body(14.5), color: INK, marginTop: 12 }}>{p}</p>
            </div>
          ))}
        </div>

        <p style={{ ...body(14), color: DIM, marginTop: 20 }}>
          Recipe seeding is one plan of 126 so far. The rest publish duration, macros and
          price while their schedules are written. We would rather show you one real week
          than 126 invented ones.{" "}
          <Link href="/our-kitchen" style={{ color: LIME }}>
            See the kitchen
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
