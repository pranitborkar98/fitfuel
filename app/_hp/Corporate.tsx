// app/_hp/Corporate.tsx
//
// CORPORATE. The second revenue line, which the homepage had never once shown.
//
// ON THE LOGO WALL. Every professional B2B page carries one, and the pattern is
// worth having, so the grid is here. But the marks are drawn as generic
// wordmarks and each one is captioned PLACEHOLDER in the tile itself, because an
// invented-but-plausible company name on a logo wall is a fabricated client
// list, not a mockup — and it is the kind of thing that ends up in a screenshot
// long after anyone remembers it was a placeholder. When real logos arrive with
// written permission, swap the array and delete the caption line.
//
// SERVER COMPONENT.

import Link from "next/link";
import Image from "next/image";

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, PANEL, INK, DIM, LIME, display, sub, body } from "./theme";

/* Fictional. Not a client list. See the header note. */
const MARKS = [
  "Meridian Systems",
  "Altitude Labs",
  "Northbridge",
  "Parabola",
  "Sixth Avenue",
  "Karve Works",
];

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
  return (
    <section aria-labelledby="hp-corp" style={{ ...SECTION, background: PANEL }}>
      <div style={WRAP}>
        <Idx label="Corporate" />

        <div className={s.split}>
          <div className={`${s.splitMedia} ${s.gradeDuo}`}>
            <Image
              src="/images/corporate.jpg"
              alt="An office team at lunch"
              fill
              sizes="(max-width: 820px) 100vw, 46vw"
              quality={75}
            />
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

        <div style={{ marginTop: "clamp(30px,4vw,50px)" }}>
          <h3 style={{ ...sub("clamp(1.2rem,2vw,1.5rem)"), marginBottom: 16 }}>
            Where a client wall goes, once there is one
          </h3>

          <div className={s.logos}>
            {MARKS.map((m) => (
              <div key={m} className={s.logo}>
                <span className={s.logoMark}>{m}</span>
                <span className={s.logoSub}>Placeholder</span>
              </div>
            ))}
          </div>

          <p style={{ ...body(13.5), color: DIM, marginTop: 14, maxWidth: "76ch" }}>
            These are layout placeholders, not customers. We will not print a company&rsquo;s
            name or mark here until they have given us written permission to, because a logo
            wall is a claim about who trusts you and an invented one is worth less than an
            empty grid. If you would like your mark in one of these six,{" "}
            <Link href="/contact" style={{ color: LIME }}>
              talk to us
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
