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
import { TRIAL_TOTAL_LABEL } from "@/lib/trial-price";
import { resolveFirst } from "@/lib/site-images";
import { waLink } from "@/lib/site";
import { WRAP, INK, MUTE, DIM, LIME, display, body, label, figure } from "./theme";

/* The homepage is prerendered, so it states the RULE rather than a live
   countdown ("2h 14m left" would be baked in at build time and be a lie by
   breakfast). The countdown belongs at checkout, where the page is dynamic and
   can read msUntilCutoff() per request. Both read the same constant. */
const CUTOFF = cutoffLabel();

const READOUT: [string, string][] = [
  ["08:00", "at your door, six mornings a week"],
  /* The TOTAL, not the subtotal. This tile sits beside "08:00" and "FSSAI",
     both of which survive being checked, so the price beside them has to be
     the one that appears on the payment screen. */
  [TRIAL_TOTAL_LABEL, "one full day, four meals, all in, nothing to cancel"],
  ["15", "areas of east Pune, from one kitchen in Kharadi"],
  ["FSSAI", "21523035002815, our own licence"],
];

export default function Hero() {
  /* Was hardcoded to /images/hero-bowl.jpg, which meant the brief's four hero
     generations had nowhere to land. Now the best available hero wins:
     an opened four-compartment box beats an overhead bowl beats the original
     photograph, and dropping a real shot into public/images/hero/ outranks
     everything without touching this file. */
  const hero = resolveFirst("hero", ["hero-box-open", "hero-bowl-overhead"], "hero-bowl");

  return (
    <section aria-labelledby="hp-hero">
      <div className={`${s.heroFull} ${s.gradeFood}`}>
        <Image
          src={hero?.src ?? "/images/hero-bowl.jpg"}
          alt="A FitFuel meal, cooked and weighed this morning in Kharadi"
          fill
          sizes="100vw"
          priority
          quality={80}
          className={s.kenburns}
        />
        {hero?.ai && (
          <p className="sr-only">
            Illustrative AI-generated image. Not a photograph of the meal as delivered. The
            macros and prices shown on this page are real.
          </p>
        )}
        <div className={s.heroWash} />

        <div className={s.heroBody}>
          <span style={label(LIME)}>Pune · cooked this morning</span>

          <h1 id="hp-hero" style={{ ...display("clamp(2.7rem,8vw,7rem)"), marginTop: 16, maxWidth: "16ch" }}>
            {/* The two spans are block-level so they LOOK like two lines, but
                textContent is what a screen reader announces and what Google
                indexes — and without this space it concatenated to "whatto".
                Invisible on screen, wrong everywhere the DOM is read as text. */}
            <span className={s.kin}>Never decide what </span>
            <span className={s.kin}>to eat again.</span>
          </h1>

          <p style={{ ...body(18), color: MUTE, marginTop: 22, maxWidth: "44ch" }}>
            Chef-cooked meals, weighed to your goals and at your door by 8am, six mornings a
            week. No cooking, no counting, no 7pm Swiggy decision.
          </p>

          <div className={s.actions} style={{ marginTop: 28 }}>
            <Link href="/plans?trial=true" className={s.btn}>
              Start with one day, {TRIAL_TOTAL_LABEL}
            </Link>
            {/* The second-cheapest order path in India, and it was missing
                from this page entirely. Not only a floating bubble: a real,
                equal-weight action, because plenty of people will send a
                message who will never fill in a checkout form. */}
            <a
              href={waLink(
                `Hi FitFuel, I'd like to order the ${TRIAL_TOTAL_LABEL} trial day. Do you deliver to my area?`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={s.ghost}
            >
              Order on WhatsApp
            </a>
            <Link href="#hp-trial" className={s.link}>
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

      <div style={WRAP} className={s.deep}>
        <div className={`${s.readout} ${s.tipUp}`}>
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
