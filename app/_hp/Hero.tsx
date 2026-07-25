// app/_hp/Hero.tsx
//
// One headline, one promise, one primary action.
//
// The old hero was a five-layer CSS 3D diorama with an 8,000-particle WebGL field
// behind it. Impressive engineering, but it was doing the work of a screensaver:
// the thing a first-time visitor needs in the first three seconds is what this is,
// where it is, and what it costs. That is now the only thing here.
//
// SERVER COMPONENT. Zero client JS in the hero.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import s from "./hp.module.css";
import { WRAP, INK, INK_3, GREEN, display, body, label } from "./theme";

export default function Hero() {
  return (
    <section aria-labelledby="hp-hero" style={WRAP}>
      <div className={s.hero}>
        <div>
          <span style={label(GREEN)}>Pune · delivered by 8am, six days a week</span>

          <h1
            id="hp-hero"
            style={{ ...display("clamp(2.9rem,7.2vw,5.6rem)"), marginTop: 18, maxWidth: "13ch" }}
          >
            We cook it, we weigh it,
            <br />
            <span style={{ color: GREEN }}>it logs itself.</span>
          </h1>

          <p style={{ ...body(17.5), marginTop: 24, maxWidth: "46ch" }}>
            Chef-cooked meals portioned to your macros on a scale before they are sealed,
            then delivered to your door each morning. The tracking is not an app you
            have to remember to use. It is the same system that cooked your food.
          </p>

          <div className={s.actions} style={{ marginTop: 32 }}>
            <Link href="/plans?trial=true" className={s.btn}>
              Try one day, Rs 400
            </Link>
            <Link href="/plans" className={s.btnGhost}>
              See all 126 plans <ArrowRight size={16} />
            </Link>
          </div>

          <p style={{ ...body(14), color: INK_3, marginTop: 20 }}>
            No subscription to start. Every plan&rsquo;s full menu is public before you pay.
          </p>
        </div>

        <div className={s.heroMedia}>
          <Image
            src="/images/hero-bowl.jpg"
            alt="A FitFuel bowl of vegetables, chickpeas and avocado"
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
            priority
            quality={75}
          />
          <div className={s.heroStamp}>
            <span style={label(INK_3)}>Weighed, not estimated</span>
            <p style={{ ...body(14.5), color: INK, marginTop: 6 }}>
              Every portion hits a scale before it is sealed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
