// app/_hp/Hero.tsx
//
// FULL-BLEED. The photograph is the page, not a column beside the type.
//
// Two rewrites got the WORDS right — food, then convenience, then the thing
// nobody else can say — and left the layout arguing against them: a 40vw
// image in a box next to a wall of text still reads as a document about food
// rather than as food. So the one genuinely good plated-dish photograph now
// runs the full viewport with the type laid over it.
//
// THE HONEST CONSTRAINT: /public/images holds eight photographs and exactly
// ONE of them is a plated dish. That is the real reason every version of this
// page has been made of words. This layout is built so that when real
// photography of real FitFuel boxes exists, it drops into a slot that is
// already carrying the page, instead of being pasted into a small card.
//
// No invented social proof. The trust line states the licence, the kitchen and
// the published menu, all of which survive being checked.
//
// SERVER COMPONENT.

import Link from "next/link";
import Image from "next/image";

import s from "./hp.module.css";
import { cutoffLabel } from "@/lib/order-cutoff";
import { WRAP, INK, MUTE, DIM, LIME, display, body, label, figure } from "./theme";

/* The homepage is prerendered, so it states the RULE rather than a live
   countdown ("2h 14m left" would be baked in at build time and be a lie by
   breakfast). The countdown belongs at checkout, where the page is dynamic and
   can read msUntilCutoff() per request. Both read the same constant. */
const CUTOFF = cutoffLabel();

const READOUT: [string, string][] = [
  ["08:00", "at your door, six mornings a week"],
  ["Rs 400", "one full day, four meals, nothing to cancel"],
  ["15", "areas of east Pune, from one kitchen in Kharadi"],
  ["FSSAI", "21523035002815, our own licence"],
];

export default function Hero() {
  return (
    <section aria-labelledby="hp-hero">
      <div className={`${s.heroFull} ${s.gradeFood}`}>
        <Image
          src="/images/hero-bowl.jpg"
          alt="A FitFuel bowl of vegetables, chickpeas and avocado"
          fill
          sizes="100vw"
          priority
          quality={80}
          className={s.kenburns}
        />
        <div className={s.heroWash} />

        <div className={s.heroBody}>
          <span style={label(LIME)}>Pune · cooked this morning</span>

          <h1 id="hp-hero" style={{ ...display("clamp(2.7rem,8vw,7rem)"), marginTop: 16, maxWidth: "16ch" }}>
            <span className={s.kin}>Never decide what</span>
            <span className={s.kin}>to eat again.</span>
          </h1>

          <p style={{ ...body(18), color: MUTE, marginTop: 22, maxWidth: "44ch" }}>
            Chef-cooked meals, weighed to your goals and at your door by 8am, six mornings a
            week. No cooking, no counting, no 7pm Swiggy decision.
          </p>

          <div className={s.actions} style={{ marginTop: 28 }}>
            <Link href="/plans?trial=true" className={s.btn}>
              Start with one day, Rs 400
            </Link>
            <Link href="#hp-trial" className={s.ghost}>
              See tomorrow&rsquo;s food
            </Link>
          </div>

          <p style={{ ...body(15), color: INK, marginTop: 18, maxWidth: "50ch" }}>
            Order by <b style={{ color: LIME, fontWeight: 700 }}>{CUTOFF}</b> tonight and
            breakfast is at your door by 8am tomorrow.
          </p>

          <p style={{ ...body(14), color: DIM, marginTop: 12, maxWidth: "54ch" }}>
            Cooked in our own FSSAI-licensed kitchen in Kharadi. Every plan&rsquo;s full menu
            is public before you pay.
          </p>
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
