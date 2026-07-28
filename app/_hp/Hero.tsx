// app/_hp/Hero.tsx
//
// One headline, one promise, one action — carried by type, not by a photograph.
//
// The 2026 move is that viewport-scaled kinetic type IS the hero: the display
// runs to 8.4vw, sits flush left, and tightens its tracking as it enters. The
// photograph is the smaller column and it is cropped tall so it reads as a
// plate in an instrument rather than a stock banner.
//
// Below the fold line sits the readout: four checkable facts welded to the
// hero's bottom edge as a hairline band. The licence number is one of them,
// because in food a licence does more work than an adjective, and the previous
// homepage buried it eleven sections down.
//
// SERVER COMPONENT. Zero client JS.

import Link from "next/link";
import Image from "next/image";

import s from "./hp.module.css";
import { WRAP, INK, MUTE, DIM, LIME, display, body, label, figure } from "./theme";

/* Every number here is checkable against the database or the licence.
   126 plans, 38 conditions, 15 areas, one FSSAI number.
   Two lines each, not three: the third line was a mono caption restating the
   second, which is the annotation habit the owner reads as machine-generated. */
const READOUT: [string, string][] = [
  ["126", "goal and condition plans, 70 of them built for a diagnosis"],
  ["04:00", "the kitchen starts, and it is at your door by 08:00"],
  ["15", "areas of east Pune, served by one kitchen"],
  ["FSSAI", "21523035002815, our own licence for our own kitchen"],
];

export default function Hero() {
  return (
    <section aria-labelledby="hp-hero">
      <div style={WRAP}>
        <div className={s.hero}>
          <div>
            <span style={label(LIME)}>Pune, six days a week</span>

            <h1
              id="hp-hero"
              style={{ ...display("clamp(2.9rem,8.4vw,7.2rem)"), marginTop: 18 }}
            >
              <span className={s.kin}>We cook it.</span>
              <span className={s.kin}>We weigh it.</span>
              <span className={s.kin} style={{ color: LIME }}>
                It logs itself.
              </span>
            </h1>

            <p style={{ ...body(17), color: MUTE, marginTop: 26, maxWidth: "46ch" }}>
              Chef-cooked meals portioned to your macros on a scale before they are
              sealed. The tracking is not another app you have to remember to open.
              It is the same system that cooked your food.
            </p>

            <div className={s.actions} style={{ marginTop: 30 }}>
              <Link href="/plans?trial=true" className={s.btn}>
                Try one day, Rs 400
              </Link>
              <Link href="/plans" className={s.ghost}>
                All 126 plans
              </Link>
            </div>

            <p style={{ ...body(14), color: DIM, marginTop: 20, maxWidth: "50ch" }}>
              No subscription to start, no card kept on file. Every plan&rsquo;s menu is
              public before you pay, with no signup wall.
            </p>
          </div>

          <div className={`${s.heroMedia} ${s.gradeFood}`}>
            <Image
              src="/images/hero-bowl.jpg"
              alt="A FitFuel bowl of vegetables, chickpeas and avocado"
              fill
              sizes="(max-width: 900px) 100vw, 40vw"
              priority
              quality={75}
            />
          </div>
        </div>
      </div>

      <div style={WRAP}>
        <div className={s.readout}>
          {READOUT.map(([big, rest]) => (
            <div key={big} className={s.readoutCell}>
              <div style={figure("clamp(1.5rem,3vw,2.3rem)", LIME)}>{big}</div>
              <div style={{ ...body(14), color: INK, marginTop: 10 }}>{rest}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
