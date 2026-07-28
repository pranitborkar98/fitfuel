// app/_hp/Close.tsx
//
// The ask, then the whole directory.
//
// DESIGN.md requires that every service the business runs is reachable from the
// homepage. The last three versions each failed that differently: one gave every
// service a chapter and reached 39,708px, the next cut them to eight links and
// dropped half the site. A four-column directory is the resolution — twenty-odd
// destinations for the cost of one screen, in the order a reader would want
// them, after the argument is finished rather than competing with it.
//
// Every href below was checked against app/. There is no /franchise route, so
// the operator door points at /contact, which is where that conversation
// actually happens.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import { WRAP, INK, MUTE, DIM, LIME, display, body, label } from "./theme";

const DIRECTORY: { head: string; links: [string, string][] }[] = [
  {
    head: "Eat",
    links: [
      ["/plans", "All 126 plans"],
      ["/plans?trial=true", "Trial day, Rs 400"],
      ["/plans/digital", "Digital plans, no delivery"],
      ["/our-ingredients", "What is in the food"],
      ["/allergen-policy", "Allergen policy"],
      ["/our-kitchen", "Inside the kitchen"],
    ],
  },
  {
    head: "Track",
    links: [
      ["/dashboard", "Your dashboard"],
      ["/dashboard/nutrition", "Food and water diary"],
      ["/dashboard/exercises", "Training programme"],
      ["/dashboard/body-metrics", "Body metrics"],
      ["/dashboard/progress", "Progress and review"],
      ["/tdee-calculator", "Free TDEE calculator"],
    ],
  },
  {
    head: "Work with us",
    links: [
      ["/corporate", "Corporate plans"],
      ["/partners", "Gyms, trainers, clinics"],
      ["/partners/apply", "Apply to partner"],
      ["/dashboard/referrals", "Refer a friend, Rs 500"],
      ["/supplements", "Supplements and Nutrabay"],
      ["/contact", "Run a FitFuel kitchen"],
    ],
  },
  {
    head: "Company",
    links: [
      ["/about", "About FitFuel"],
      ["/our-team", "The team"],
      ["/how-it-works", "How it works"],
      ["/results", "Results"],
      ["/blog", "Journal"],
      ["/locations", "Delivery areas"],
    ],
  },
];

export default function Close() {
  return (
    <>
      <section aria-labelledby="hp-close" className={s.close}>
        <div style={WRAP}>
          <div className={s.closeGrid}>
            <div>
              <span style={label(LIME)}>One day. Rs 400. Tomorrow morning.</span>
              <h2
                id="hp-close"
                className={s.kin}
                style={{ ...display("clamp(2.4rem,7.4vw,6rem)"), color: INK, marginTop: 18, maxWidth: "12ch" }}
              >
                Stop guessing what you ate
              </h2>
            </div>

            <div>
              <p style={{ ...body(16.5), color: MUTE, maxWidth: "42ch" }}>
                Four meals, cooked from 04:00, weighed to your macros and at your door by
                08:00. It logs itself, it watches the week, and it moves your target when
                you stall. If it is not for you, that is the end of it: there is nothing to
                cancel.
              </p>
              <div className={s.actions} style={{ marginTop: 26 }}>
                <Link href="/plans?trial=true" className={s.btn}>
                  Book your trial day
                </Link>
                <Link href="/plans" className={s.ghost}>
                  Browse all plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Everything else on this site" style={{ ...WRAP, paddingTop: 0 }}>
        <div style={{ padding: "clamp(40px,5vw,68px) 0 clamp(30px,4vw,52px)" }}>
          <div className={s.dir}>
            {DIRECTORY.map((col) => (
              <nav key={col.head} className={s.dirCol} aria-label={col.head}>
                <span style={{ ...label(DIM), marginBottom: 8 }}>{col.head}</span>
                {col.links.map(([href, text]) => (
                  <Link key={href} href={href} className={s.dirLink}>
                    {text}
                  </Link>
                ))}
              </nav>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
