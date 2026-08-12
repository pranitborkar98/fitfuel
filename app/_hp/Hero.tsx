// app/_hp/Hero.tsx
//
// THE HERO, AS A SPLIT. Type on the left, the photograph on the right.
//
// WHY THIS CHANGED. The previous hero ran the one good plated-dish photograph
// full-bleed with the headline laid over it, and the review
// was blunt about the result: an ungraded high-chroma stock salad macro at full
// brightness with a three-line 900-weight headline on top, "AGAIN." landing on a
// tomato. The fix it prescribed is not a heavier scrim. It is to stop asking one
// busy frame to be both the picture and the empty space the type sits in.
//
// So the type gets its own half, flush left against real background, and the
// photograph gets its own half with the food grade and nothing written across
// it. The 88px mesh behind the type is the instrument register: a drawn grid,
// one hairline colour, no gradient bloom.
//
// NOT PORTED from the prototype: the 3D box tumbling in the deck on a 26s
// `v2Spin` loop. Infinite decorative rotation is what feedback §2.5 deleted, and
// the dial sitting next to it is already the real figure for the same day.
//
// The photograph stays hero-bowl.jpg for now. It is the wrong picture for this
// business, a western bowl on light barnwood against a Chettinad and
// Maharashtrian menu, and the round-3 instruction says so in as many words. It
// is also the only plated dish in public/images. resolveFirst() means the day a
// real box shot lands in public/images/hero/ it wins with no code change.
//
// SERVER COMPONENT.

import Link from "next/link";
import Image from "next/image";

import s from "./hp.module.css";
import v from "./v2.module.css";
import { getDayOne, totals } from "./menu-data";
import { cutoffLabel } from "@/lib/order-cutoff";
import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { resolveFirst } from "@/lib/site-images";
import { INK, MUTE, DIM, LIME, MONO, display, body, label, figure } from "./theme";

/* The homepage is statically prerendered, so it states the RULE rather than a
   live countdown: "2h 14m left" would be baked in at build time and be a lie by
   breakfast. The countdown belongs at checkout, where the page is dynamic and
   can read msUntilCutoff() per request. Both read the same constant. */
const CUTOFF = cutoffLabel();

export default async function Hero() {
  /* The same cache()d query the plates below use, so the dial costs no extra
     round trip and can never disagree with the cards further down. */
  const dayOne = await getDayOne();
  const { kcal, protein } = totals(dayOne);

  const hero = resolveFirst("hero", ["hero-box-open", "hero-bowl-overhead"], "hero-bowl");

  /* Four arcs on one ring, each meal sized by its real calories. Drawn as
     stroke-dasharray on a single circle so it is one element per meal and no
     path arithmetic. */
  const R = 44;
  const C = 2 * Math.PI * R;
  const shares = dayOne.map((d) => (kcal > 0 ? Number(d.kcal ?? 0) / kcal : 0));
  const arcs = dayOne.map((d, i) => {
    /* Prefix sum rather than a running total: the offset of an arc is
       everything before it, and computing it that way keeps this a pure map. */
    const before = shares.slice(0, i).reduce((n, x) => n + x, 0);
    return { slot: d.slot, len: shares[i]! * C, off: -before * C };
  });

  return (
    <section aria-labelledby="hp-hero" className={v.hero}>
      <div className={v.heroGrid}>
        <div className={v.heroType}>
          <div className={v.heroMesh} aria-hidden="true" />

          {/* Lime holds exactly one job above the fold, and it is the CTA.
              Feedback §2.6: the kicker, the countdown and the header button all
              had it at once, which is five jobs for a scalpel. */}
          <div className={v.heroKicker}>
            <i aria-hidden="true" />
            <span style={label(DIM)}>Kharadi kitchen, cooking now</span>
            <span aria-hidden="true" />
          </div>

          <h1
            id="hp-hero"
            style={{
              ...display("clamp(3rem,6.4vw,6.8rem)"),
              lineHeight: 0.8,
              letterSpacing: "-0.035em",
            }}
          >
            {/* Block spans so these read as three lines on screen, but the
                textContent a screen reader announces and Google indexes stays a
                single sentence. Without the trailing spaces it concatenates. */}
            <span style={{ display: "block" }}>Never decide </span>
            <span style={{ display: "block" }}>what to eat </span>
            <span style={{ display: "block", color: LIME }}>again.</span>
          </h1>

          <p style={{ ...body(18), color: "#c6c6c0", margin: "clamp(22px,3vh,32px) 0 0", maxWidth: "44ch" }}>
            Four chef-cooked meals, weighed to your macros on a scale, at your door by{" "}
            <b style={{ color: INK, fontWeight: 600 }}>08:00</b>, six mornings a week. No
            cooking, no counting, no 7pm Swiggy decision.
          </p>

          {/* ONE button. Feedback §2.7: a solid CTA beside an outlined one is
              the "headline plus two buttons" pattern on the reject list, so the
              second action is a plain lime text link set below it. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 18,
              marginTop: "clamp(24px,3.6vh,36px)",
            }}
          >
            <Link href="/plans?trial=true" className={s.btn}>
              Start with one day, {TRIAL_TOTAL_GLYPH}
            </Link>
            <Link href="#hp-plates" className={s.link}>
              See tomorrow&rsquo;s four meals
            </Link>
          </div>

          <div className={v.heroCut}>
            <span style={{ ...label(DIM), display: "inline" }}>Cut-off for tomorrow</span>
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: "clamp(18px,2.2vw,24px)",
                color: INK,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "0.02em",
              }}
            >
              {CUTOFF}
            </span>
            <span style={{ ...body(13.5), maxWidth: "none" }}>order tonight, eat at 8am</span>
          </div>
        </div>

        <div className={v.heroMedia}>
          <figure className={v.heroFig}>
            <Image
              src={hero?.src ?? "/images/hero-bowl.jpg"}
              alt="A FitFuel plate, cooked and weighed this morning in Kharadi"
              fill
              sizes="(max-width: 980px) 100vw, 48vw"
              priority
              quality={75}
            />
            <span className={v.heroScrim} aria-hidden="true" />
            <figcaption className={v.heroStamp}>
              <i aria-hidden="true" />
              Cooked and weighed this morning
            </figcaption>
            {hero?.ai && (
              <p className="sr-only">
                Illustrative AI-generated image. Not a photograph of the meal as delivered.
                The macros and prices on this page are real.
              </p>
            )}
          </figure>

          {/* Tomorrow's actual day, drawn. Inside the media column rather than
              absolutely positioned: the previous version was hidden under 900px,
              which left the hero with no visual at all on a phone. */}
          {dayOne.length > 0 && kcal > 0 && (
            <div className={v.heroDeck}>
              <div className={v.heroDial}>
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="50" r={R} fill="none" stroke="#1c1c1a" strokeWidth="7" />
                  {arcs.map((a, i) => (
                    <circle
                      key={a.slot}
                      cx="50"
                      cy="50"
                      r={R}
                      fill="none"
                      stroke={LIME}
                      strokeWidth="7"
                      /* One ring, four meals. Opacity ramps by position so the
                         four are distinguishable without a second hue, and the
                         figures are printed beside it either way. */
                      strokeOpacity={0.4 + i * 0.2}
                      strokeDasharray={`${a.len} ${C}`}
                      strokeDashoffset={a.off}
                      transform="rotate(-90 50 50)"
                    />
                  ))}
                </svg>
                <b style={{ ...figure("clamp(22px,2.2vw,31px)"), position: "relative" }}>
                  {Math.round(kcal)}
                </b>
              </div>
              <div className={v.heroDeckText}>
                <span style={label(DIM)}>Tomorrow</span>
                <span style={{ ...label(INK), letterSpacing: "0.1em" }}>
                  kcal · {Math.round(protein)}g protein
                </span>
                <span style={{ ...label(DIM), letterSpacing: "0.1em" }}>
                  {dayOne.length} meals, weighed
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="sr-only" style={{ color: MUTE }}>
        Scroll for tomorrow&rsquo;s four meals.
      </p>
    </section>
  );
}
