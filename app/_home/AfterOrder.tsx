// app/_home/AfterOrder.tsx
//
// WHAT HAPPENS AFTER YOU PAY. Two shipped systems, told as one story.
//
// 1. DELIVERY TRACKING. prisma DeliveryStatus is a real five-state machine
//    (PREPARING, PACKED, OUT_FOR_DELIVERY, DELIVERED, FAILED_DELIVERY) with a
//    named driver on the row, a tokenised driver portal at /driver/[token]
//    that needs no login, and customerConfirmedAt: the customer taps "received"
//    and closes the loop from their side. app/api/user/deliveries.
//
// 2. THE RATING LOOP. app/api/user/active-plan/meals/rate takes a rating and a
//    note on a logged meal, then re-aggregates and writes Recipe.avgRating.
//    That is the part worth saying out loud: rating a dish does not go into a
//    support inbox, it moves a number attached to the recipe, and the kitchen
//    cooks against that number. A tiffin service finds out a dish is bad when
//    people cancel.
//
// Both have been live for weeks with no mention anywhere on the site.
//
// Mechanism: a five-stop rail for the delivery states, then the rating loop
// drawn as the return arrow that feeds the kitchen. Nothing else on the page
// is a linear rail, which is the point.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, DIM, huge, mid, copy, tag } from "./theme";

/* The four states a customer sees, in order. FAILED_DELIVERY is the fifth
   enum value and is deliberately not drawn as a stop on the happy path: it is
   named in the copy below instead, because a rail that ends in "failed" reads
   as a warning rather than a promise. */
const STOPS: [string, string][] = [
  ["Preparing", "Cooked to your macros from 04:00"],
  ["Packed", "Weighed, sealed and labelled for your box"],
  ["Out for delivery", "Your driver is named, with a number that works"],
  ["Delivered", "You tap received, and we know it landed"],
];

export default function AfterOrder() {
  return (
    <section
      aria-labelledby="afterorder-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0" }}
    >
      <div style={WRAP}>
        <Reveal>
          <span style={tag(LIME)}>After you pay</span>
          <h2 id="afterorder-heading" style={{ ...huge("clamp(2.4rem,6.4vw,5.2rem)"), maxWidth: "17ch", marginTop: 16 }}>
            You can see where your food is
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <p style={{ ...copy(16.5), maxWidth: "58ch", marginTop: 22 }}>
            Not a text saying it is on the way. Four states, a named driver, and a tap from you
            when it arrives. If a delivery fails, that is a state too, and it opens a note rather
            than disappearing.
          </p>
        </Reveal>

        {/* The rail. Four stops, a line running through them. */}
        <Reveal delay={0.1}>
          <ol className="ff-rail">
            {STOPS.map(([t, d], i) => (
              <li key={t} className="ff-rail-stop">
                <span className="ff-rail-dot" aria-hidden />
                <span style={{ ...tag(DIM), fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</span>
                <h3 style={{ ...mid("clamp(1.1rem,1.7vw,1.35rem)"), marginTop: 10 }}>{t}</h3>
                <p style={{ ...copy(13.5), marginTop: 8 }}>{d}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        {/* The loop that closes back into the kitchen. */}
        <Reveal delay={0.16}>
          <div className="ff-loopback">
            <div>
              <span style={{ ...tag(LIME), fontSize: 11.5 }}>And then it goes back the other way</span>
              <h3 style={{ ...mid("clamp(1.5rem,2.6vw,2.1rem)"), marginTop: 14, maxWidth: "20ch" }}>
                Rate the dish. The kitchen cooks against that number.
              </h3>
            </div>
            <p style={{ ...copy(15), maxWidth: "46ch" }}>
              A rating on a meal is not a support ticket. It re-averages onto the recipe itself, so
              a dish that people stop enjoying shows up as a falling score on the recipe the kitchen
              is cooking from. Most kitchens learn a dish is bad when subscriptions get cancelled.
              <span style={{ color: INK }}> We learn on the day.</span>
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div style={{ marginTop: "clamp(26px,3vw,38px)" }}>
            <Link href="/how-it-works" className="ff-a">
              How the system works <ArrowRight size={17} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
