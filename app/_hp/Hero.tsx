// app/_hp/Hero.tsx
//
// One headline, one promise, one primary action — but not a plain one.
//
// The first pass was correct in structure and flat in execution: a text column
// beside a modest image, both sitting inside the same hairline grid as every
// other section. Three things fix that without adding sections:
//
//   1. The display face is a serif now (theme.ts), so the headline reads
//      editorial rather than athletic.
//   2. The photograph is bigger, taller than the text column, and the stat card
//      OVERLAPS it. Overlap is what makes a layout feel composed instead of
//      poured into a grid.
//   3. A warm fill sits behind the type so the page has two tones, not one.
//
// SERVER COMPONENT. Zero client JS.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import s from "./hp.module.css";
import { WRAP, INK, INK_3, GREEN, CLAY, display, body, label, figure, quote } from "./theme";

export default function Hero() {
  return (
    <section aria-labelledby="hp-hero" className={s.heroWrap}>
      <div style={WRAP}>
        <div className={s.hero}>
          <div className={s.heroText}>
            <span style={label(CLAY)}>Pune · at your door by 8am, six days a week</span>

            <h1 id="hp-hero" style={{ ...display("clamp(2.7rem,6.4vw,4.9rem)"), marginTop: 20 }}>
              We cook it. We weigh it.
              <br />
              <em style={{ ...quote("clamp(2.7rem,6.4vw,4.9rem)"), color: GREEN }}>
                It logs itself.
              </em>
            </h1>

            <p style={{ ...body(17.5), marginTop: 26, maxWidth: "44ch" }}>
              Chef-cooked meals portioned to your macros on a scale before they are
              sealed. The tracking is not another app you have to remember to open —
              it is the same system that cooked your food.
            </p>

            <div className={s.actions} style={{ marginTop: 34 }}>
              <Link href="/plans?trial=true" className={s.btn}>
                Try one day, Rs 400
              </Link>
              <Link href="/plans" className={s.btnGhost}>
                See all 126 plans <ArrowRight size={16} />
              </Link>
            </div>

            <p style={{ ...body(14), color: INK_3, marginTop: 22 }}>
              No subscription to start. Every plan&rsquo;s full 60-day menu is public
              before you pay — no signup wall.
            </p>
          </div>

          <div className={s.heroMediaWrap}>
            <div className={s.heroMedia}>
              <Image
                src="/images/hero-bowl.jpg"
                alt="A FitFuel bowl of vegetables, chickpeas and avocado"
                fill
                sizes="(max-width: 900px) 100vw, 52vw"
                priority
                quality={75}
              />
            </div>

            {/* Overlaps the photograph's lower-left corner. */}
            <div className={s.heroCard}>
              <div style={figure("clamp(1.9rem,3vw,2.5rem)", GREEN)}>81g</div>
              <div style={{ ...body(13.5), color: INK, marginTop: 6, fontWeight: 500 }}>
                protein in day one
              </div>
              <div style={{ ...label(INK_3), fontSize: 10.5, letterSpacing: "0.12em", marginTop: 4 }}>
                weighed, not estimated
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
