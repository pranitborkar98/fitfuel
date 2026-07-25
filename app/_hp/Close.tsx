// app/_hp/Close.tsx
//
// The close, plus one line of doors.
//
// Partners, franchise, corporate, digital plans, the TDEE tool and the supplement
// stack each had a full chapter on the old homepage — four separate audiences
// competing with the person who just wants dinner. They all have their own pages,
// which is where a B2B reader is going anyway, so here they get a link each.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "./hp.module.css";
import { WRAP, PAPER, display, body, label } from "./theme";

// Every href here was checked against app/ — there is no /franchise or /refer
// route, so those point where the old sections actually pointed.
const DOORS: [string, string][] = [
  ["/partners", "Gyms, offices and clinics"],
  ["/contact", "Run a FitFuel kitchen"],
  ["/supplements", "The supplement stack"],
  ["/tdee-calculator", "Free TDEE calculator"],
  ["/plans", "Digital plans, no delivery"],
  ["/our-kitchen", "Inside the kitchen"],
  ["/results", "People who stopped guessing"],
  ["/dashboard/referrals", "Refer a friend, Rs 500"],
];

export default function Close() {
  return (
    <>
      <section aria-label="Other ways to work with us" style={WRAP}>
        <div className={s.doors}>
          {DOORS.map(([href, text]) => (
            <Link key={href} href={href} className={s.door}>{text}</Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="hp-close" className={s.close}>
        <div style={WRAP}>
          <div className={s.closeGrid}>
            <div>
              <span style={label("rgba(245,242,236,0.6)")}>One day. Rs 400. Tomorrow morning.</span>
              <h2
                id="hp-close"
                style={{ ...display("clamp(2.4rem,6vw,4.4rem)"), color: PAPER, marginTop: 16, maxWidth: "14ch" }}
              >
                Stop guessing what you ate.
              </h2>
            </div>

            <div>
              <p style={{ ...body(16.5), color: "rgba(245,242,236,0.78)", maxWidth: "42ch" }}>
                Four meals, cooked from 04:00, weighed to your macros and at your door by 08:00.
                If it is not for you, that is the end of it — there is nothing to cancel.
              </p>
              <div className={s.actions} style={{ marginTop: 26 }}>
                <Link href="/plans?trial=true" className={s.btn}>Book your trial day</Link>
                <Link
                  href="/plans"
                  className={s.btnGhost}
                  style={{ color: PAPER, borderBottomColor: "rgba(245,242,236,0.4)" }}
                >
                  Browse all plans <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
