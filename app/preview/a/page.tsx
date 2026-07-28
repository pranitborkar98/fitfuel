// app/preview/a/page.tsx — DIRECTION A: CINEMATIC
//
// The bet: your photography is the most under-used asset you own. There are
// eight art-directed images in /public/images and the live homepage puts them
// in boxes 400px wide. Here each one is a full-viewport scene with the type
// laid over it, one line at a time, and the page reads as a film rather than
// as a document.
//
// Everything the instrument look leaned on is deliberately absent: no mono, no
// hairline rules, no index labels, no spec tables, no unit captions. Warmth
// comes from Fraunces at display size and a single cinematic grade applied to
// every photograph so eight sources read as one shoot.
//
// Real day-one dishes from the database, same query the live page uses.

import Link from "next/link";
import Image from "next/image";

import { getDayOne, totals, SLOT_LABEL } from "@/app/_hp/menu-data";
import s from "./a.module.css";

export default async function PreviewA() {
  const dishes = await getDayOne();
  const { kcal, protein } = totals(dishes);

  return (
    <main className={s.page}>
      {/* ── scene one: the promise ─────────────────────────────────── */}
      <section className={`${s.scene} ${s.grade}`}>
        <Image
          src="/images/hero-bowl.jpg"
          alt="A FitFuel bowl of vegetables, chickpeas and avocado"
          fill
          sizes="100vw"
          priority
          quality={75}
          className={s.kenburns}
        />
        <div className={s.wash} />
        <div className={s.inner}>
          <p className={s.kicker}>Pune · at your door by 8am, six days a week</p>
          <h1 className={s.huge}>
            We cook it. We weigh it.{" "}
            <span className={s.italic}>It logs itself.</span>
          </h1>
          <p className={s.lede}>
            Chef-cooked meals portioned to your macros on a scale before they are sealed.
            The tracking is not another app you have to remember to open. It is the same
            system that cooked your food.
          </p>
          <div className={s.row}>
            <Link href="/plans?trial=true" className={s.cta}>
              Try one day, Rs 400
            </Link>
            <Link href="/plans" className={s.ghost}>
              All 126 plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── scene two: the kitchen ─────────────────────────────────── */}
      <section className={`${s.scene} ${s.sceneShort} ${s.grade}`}>
        <Image
          src="/images/kitchen.jpg"
          alt="The FitFuel kitchen before dawn"
          fill
          sizes="100vw"
          quality={75}
          className={s.kenburns}
        />
        <div className={s.wash} />
        <div className={s.inner}>
          <h2 className={`${s.big} ${s.rise}`}>
            At four in the morning, someone is weighing your lunch
          </h2>
          <p className={`${s.lede} ${s.rise}`}>
            Not portioned by eye into a shared tiffin. Every plate is cooked to one person&rsquo;s
            numbers and checked on a scale before the compartment is sealed.
          </p>
        </div>
      </section>

      {/* ── the day, as plates ─────────────────────────────────────── */}
      <section className={s.rest}>
        <div className={s.restInner}>
          <p className={`${s.kicker} ${s.rise}`}>Day one, Rs 400, no subscription</p>
          <h2 className={`${s.big} ${s.rise}`}>This is what turns up tomorrow morning</h2>
          <p className={`${s.lede} ${s.rise}`}>
            Not a render and not a stock photo. Day one of Weight Loss Vegetarian, pulled
            live from the kitchen&rsquo;s own schedule, with the macros each dish was weighed
            to.
          </p>

          {dishes.length > 0 && (
            <>
              <div className={s.figures}>
                <div className={s.rise}>
                  <span className={s.figure}>{Math.round(kcal)}</span>
                  <p className={s.figureNote}>kcal across the day</p>
                </div>
                <div className={s.rise}>
                  <span className={s.figure} style={{ color: "#f6f1e8" }}>
                    {Math.round(protein)}g
                  </span>
                  <p className={s.figureNote}>protein, weighed not estimated</p>
                </div>
                <div className={s.rise}>
                  <span className={s.figure} style={{ color: "#f6f1e8" }}>
                    {dishes.length}
                  </span>
                  <p className={s.figureNote}>meals, cooked from 04:00</p>
                </div>
              </div>

              <div className={s.plates}>
                {dishes.map((d) => (
                  <article key={d.slot + d.name} className={`${s.plate} ${s.rise}`}>
                    <p className={s.slot}>{SLOT_LABEL[d.slot] ?? d.slot}</p>
                    <h3 className={s.dish}>{d.name}</h3>
                    {d.blurb && <p className={s.dishNote}>{d.blurb}</p>}
                    <p className={s.macro}>
                      <b>{d.kcal == null ? "—" : Math.round(d.kcal)}</b> kcal
                      {d.protein != null && (
                        <>
                          {" · "}
                          <b>{Math.round(d.protein)}g</b> protein
                        </>
                      )}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}

          <div className={s.row}>
            <Link href="/plans?trial=true" className={s.cta}>
              Book the trial day
            </Link>
            <Link href="/plans/weight-loss-veg" className={s.ghost}>
              See the whole week
            </Link>
          </div>
        </div>
      </section>

      {/* ── scene three: the close ─────────────────────────────────── */}
      <section className={`${s.scene} ${s.grade}`}>
        <Image
          src="/images/chef-hands.jpg"
          alt="Ingredients being weighed on a prep board"
          fill
          sizes="100vw"
          quality={75}
          className={s.kenburns}
        />
        <div className={s.wash} />
        <div className={s.inner}>
          <h2 className={`${s.huge} ${s.rise}`}>
            Stop guessing <span className={s.italic}>what you ate</span>
          </h2>
          <p className={`${s.lede} ${s.rise}`}>
            One day. Rs 400. Tomorrow morning. If it is not for you, that is the end of it:
            there is nothing to cancel.
          </p>
          <div className={s.row}>
            <Link href="/plans?trial=true" className={s.cta}>
              Book your trial day
            </Link>
            <Link href="/preview" className={s.ghost}>
              Back to the three directions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
