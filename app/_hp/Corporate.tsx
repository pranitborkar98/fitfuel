// app/_hp/Corporate.tsx
//
// CORPORATE. The second revenue line, which the homepage had never once shown.
//
// ON THE LOGO WALL. There is no longer one. Six invented wordmarks captioned
// PLACEHOLDER were meant to be honest, and the caption was — but the grid read
// as a fabricated client list for the half-second before anyone got to the
// caption, and that is the half-second a screenshot captures. An empty wall
// states the same fact and cannot be misread. When real marks arrive with
// written permission, the grid comes back with them in it.
//
// SERVER COMPONENT.

import Link from "next/link";
import Image from "next/image";

import s from "./hp.module.css";
import Idx from "./Idx";
import { slot } from "@/lib/site-images";
import { WRAP, SECTION, PANEL, INK, LIME, display, sub, body } from "./theme";

const OFFER: [string, string][] = [
  [
    "Team meal programmes",
    "Daily meals for your people, personalised per employee by goal, diet and condition, delivered to the office or to their homes. Not one canteen menu with a salad added.",
  ],
  [
    "Wellness that produces a number",
    "Every employee on the programme has a consistency score, a weight trend and a nutrition record. You get participation and outcome reporting in aggregate, never individual health data.",
  ],
  [
    "Billing that finance will accept",
    "Consolidated monthly invoicing, GST compliant at 5%, one PO, one line item. Onboarding is a spreadsheet of names, not 40 individual signups.",
  ],
  [
    "Three tiers, employee choice",
    "Standard, Premium and Luxury sit on the same plan catalogue, so an employee picks their own level and their own diet inside the budget you set.",
  ],
];

export default function Corporate() {
  const corporate = slot("sections", "corporate");

  return (
    <section aria-labelledby="hp-corp" style={{ ...SECTION, background: PANEL }}>
      <div style={WRAP}>
        <Idx label="Corporate" />

        <div className={s.split}>
          <div className={`${s.splitMedia} ${s.gradeDuo}`}>
            <Image
              src={corporate?.src ?? "/images/corporate.jpg"}
              alt="Sealed FitFuel meal boxes set out for a team lunch"
              fill
              sizes="(max-width: 820px) 100vw, 46vw"
              quality={75}
            />
            {corporate?.ai && (
              <p className="sr-only">
                Illustrative AI-generated image. Not a photograph of a FitFuel delivery.
              </p>
            )}
          </div>

          <div className={s.reveal}>
            <h2 id="hp-corp" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "13ch" }}>
              Feed the whole floor, not the whole floor the same thing
            </h2>
            <p style={{ ...body(16.5), marginTop: 20 }}>
              The reason corporate food fails is that it is cooked to an average, and no
              one is average. We already run 126 plans and 38 conditions per person: a
              company is just that, at forty seats, on one invoice.
            </p>
            <div className={s.actions} style={{ marginTop: 24 }}>
              <Link href="/corporate" className={s.btn}>
                Corporate plans
              </Link>
              <Link href="/contact" className={s.ghost}>
                Request a proposal
              </Link>
            </div>
          </div>
        </div>

        <div className={s.stats} style={{ marginTop: "clamp(28px,3.6vw,46px)" }}>
          {OFFER.map(([h, d]) => (
            <div key={h} className={s.stat}>
              <div style={{ ...sub("clamp(1.05rem,1.6vw,1.22rem)"), color: INK }}>{h}</div>
              <p style={{ ...body(14), marginTop: 11 }}>{d}</p>
            </div>
          ))}
        </div>

        {/* THE LOGO WALL IS GONE, DELIBERATELY.
            Six invented company names under a "Placeholder" caption was the
            worst of both worlds: at a glance it reads as a fabricated client
            list, and on a careful read it advertises that we have no clients.
            The caption was doing honest work that the grid itself undid. An
            empty wall states the same fact without the first half-second of
            misreading, so what stands here is the invitation alone. */}
        <div style={{ marginTop: "clamp(30px,4vw,50px)" }}>
          <h3 style={{ ...sub("clamp(1.2rem,2vw,1.5rem)"), marginBottom: 14 }}>
            No client wall yet
          </h3>
          <p style={{ ...body(15), maxWidth: "68ch" }}>
            We will not print a company&rsquo;s name or mark here until they have given us
            written permission to, and no one has yet, so there is nothing to show. A logo
            wall is a claim about who trusts you; an invented one is worth less than an empty
            space. Be the first mark on it &mdash;{" "}
            <Link href="/contact" style={{ color: LIME }}>
              talk to us about a team programme
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
