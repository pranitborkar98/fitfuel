// app/_hp/Inside.tsx
//
// EVERY SURFACE, LISTED. The answer to "we built all this and the homepage
// never mentions it."
//
// The temptation is to give each of these a section, and that is exactly how the
// last homepage reached 39,708px and 35 headings. A directory solves it: one row
// per surface, hairline separated, the number that proves it is real on the
// right. Ten surfaces cost one screen here and would have cost ten screens as
// feature blocks.
//
// Signature device #3 (directory rows) — this is what replaces card
// grids for every index on the site. Every href was checked against app/.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, PANEL, INK, DIM, LIME, display, body, figure } from "./theme";

type Surface = { href: string; name: string; desc: string; stat: string };

const SURFACES: Surface[] = [
  {
    href: "/dashboard",
    name: "Today",
    desc: "Your day on one screen: what is being delivered, what is logged, what is left, and the delivery you confirm with one tap.",
    stat: "1",
  },
  {
    href: "/dashboard/nutrition",
    name: "The diary",
    desc: "FitFuel meals arrive pre-logged with weighed macros. Everything else you add per gram from an Indian food database, with water alongside it.",
    stat: "154",
  },
  {
    href: "/dashboard/exercises",
    name: "Training",
    desc: "Your programme for the day, the exercise library behind it, and sets, reps and load logged against each session.",
    stat: "952",
  },
  {
    href: "/dashboard/body-metrics",
    name: "Body metrics",
    desc: "Weight, body fat, muscle mass, visceral fat, BMI and twelve more, read straight off a Bluetooth scale in the browser. No companion app.",
    stat: "18",
  },
  {
    href: "/dashboard/progress",
    name: "Progress",
    desc: "Thirty-day charts, the consistency score with its five components, the weekly review, and the recalibration you approve or ignore.",
    stat: "30d",
  },
  {
    href: "/dashboard/supplements",
    name: "Supplements",
    desc: "A stack recommended from your goal and your gaps, not from what has the best margin. Educational first, links second.",
    stat: "46",
  },
  {
    href: "/dashboard/referrals",
    name: "Referrals",
    desc: "Your code, your link, who used it, and the credit ledger behind it. Rs 500 to you, Rs 500 to them.",
    stat: "Rs 500",
  },
  {
    href: "/dashboard/partners",
    name: "Partner console",
    desc: "For gyms, trainers, dieticians, doctors, offices and residences: referrals, conversions, rewards and payouts.",
    stat: "8",
  },
  {
    href: "/dashboard/notification-settings",
    name: "Notifications",
    desc: "Eighteen message templates across WhatsApp and email, every one of them switchable per channel. Nothing is sent that you did not leave on.",
    stat: "18",
  },
  {
    href: "/order",
    name: "Order tracking",
    desc: "Where today's box is, confirmed against the driver's own app rather than a status we typed in ourselves.",
    stat: "06:00",
  },
];

export default function Inside() {
  return (
    <section aria-labelledby="hp-inside" style={{ ...SECTION, background: PANEL }}>
      <div style={WRAP}>
        <Idx label="Inside the app" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2 id="hp-inside" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "14ch" }}>
            Ten screens come with the food
          </h2>
          <p style={{ ...body(16.5) }}>
            Not a companion app, not a second subscription, not a &ldquo;premium tier&rdquo;.
            The same account that receives your box runs all of this, which is the only
            reason the tracking can be automatic in the first place.
          </p>
        </div>

        <div className={s.svcList} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {SURFACES.map((x) => (
            <Link key={x.href} href={x.href} className={`${s.svc} ${s.svcPlain}`}>
              <span className={s.svcName}>{x.name}</span>
              <span className={s.svcDesc}>{x.desc}</span>
              <span className={s.svcStat} style={figure("clamp(1.15rem,1.9vw,1.6rem)", LIME)}>
                {x.stat}
              </span>
            </Link>
          ))}
        </div>

        <p style={{ ...body(14), color: DIM, marginTop: 20 }}>
          Signed-in surfaces. If you are not a customer yet, the{" "}
          <Link href="/tdee-calculator" style={{ color: INK }}>
            TDEE calculator
          </Link>{" "}
          and every plan menu are open without an account.
        </p>
      </div>
    </section>
  );
}
