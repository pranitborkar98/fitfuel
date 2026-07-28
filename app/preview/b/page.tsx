// app/preview/b/page.tsx — DIRECTION B: POSTER
//
// The bet: you sell a hard, measurable outcome, and the site has never once
// sounded like it. This is the drop-culture register — type at 18vw, acid on
// black, colour fields that run edge to edge, one sentence per screen and the
// numbers used as headlines rather than as evidence.
//
// It is the furthest thing from a spec sheet on purpose. There is no body-copy
// column anywhere, one photograph in the whole page, and every hierarchy
// decision is made by size rather than by weight, colour or a label.
//
// Real day-one dishes from the database, same query the live page uses.

import Link from "next/link";
import Image from "next/image";

import { getDayOne, totals, SLOT_LABEL } from "@/app/_hp/menu-data";
import s from "./b.module.css";

const BAND = [
  "126 plans",
  "38 conditions",
  "952 exercises",
  "46 supplements",
  "154 foods",
  "18 metrics",
];

const NUMBERS: { n: string; t: string; href: string }[] = [
  { n: "04:00", t: "The kitchen starts. Your food is on a scale before the city is awake.", href: "/our-kitchen" },
  { n: "08:00", t: "At your door, across fifteen areas of east Pune, six days a week.", href: "/locations" },
  { n: "126", t: "Plans. Seventy of them built for a diagnosis, not a calorie target.", href: "/plans" },
  { n: "0", t: "Things you have to log. It already knows, because it cooked it.", href: "/how-it-works" },
];

export default async function PreviewB() {
  const dishes = await getDayOne();
  const { kcal, protein } = totals(dishes);

  return (
    <main className={s.page}>
      {/* ── the shout ──────────────────────────────────────────────── */}
      <section className={`${s.fieldBlack} ${s.block}`} style={{ paddingTop: "clamp(80px,12vw,150px)" }}>
        <div className={s.inner}>
          <h1 className={s.shout}>
            <span className={`${s.snap} ${s.acidText}`}>We cook it.</span>
            <span className={s.snap}>We weigh it.</span>
            <span className={`${s.snap} ${s.hollow}`}>It logs itself.</span>
          </h1>
          <p className={s.say}>
            Chef-cooked meals weighed to your macros before they are sealed. The tracking is
            not another app. It is the kitchen.
          </p>
          <div className={s.row}>
            <Link href="/plans?trial=true" className={`${s.btn} ${s.btnFill}`}>
              One day · Rs 400
            </Link>
            <Link href="/plans" className={s.btn}>
              126 plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── kinetic band ───────────────────────────────────────────── */}
      <section className={`${s.fieldAcid} ${s.band}`} aria-label="FitFuel by the numbers">
        <div className={s.bandTrack}>
          <div style={{ display: "flex" }}>
            {BAND.map((b) => (
              <span key={b} className={s.bandItem}>
                {b} <span aria-hidden="true">✱</span>
              </span>
            ))}
          </div>
          <div style={{ display: "flex" }} aria-hidden="true">
            {BAND.map((b) => (
              <span key={b} className={s.bandItem}>
                {b} <span>✱</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── the numbers as headlines ───────────────────────────────── */}
      <section className={`${s.fieldBone} ${s.block}`}>
        <div className={s.inner}>
          <h2 className={`${s.shoutSm} ${s.snap}`}>The whole day, already decided</h2>
          <div className={s.rows} style={{ marginTop: "clamp(28px,4vw,52px)" }}>
            {NUMBERS.map((x) => (
              <Link key={x.n} href={x.href} className={s.rowLine}>
                <span className={s.rowN}>{x.n}</span>
                <span className={s.rowT}>{x.t}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── the plate, one photograph only ─────────────────────────── */}
      <section className={`${s.fieldBlack} ${s.block}`}>
        <div className={s.inner}>
          <div className={s.plate}>
            <Image
              src="/images/chef-hands.jpg"
              alt="Ingredients being weighed on a prep board"
              fill
              sizes="100vw"
              quality={75}
            />
          </div>
          <h2 className={`${s.shoutSm} ${s.snap}`} style={{ marginTop: "clamp(30px,4vw,54px)" }}>
            Weighed. <span className={s.hollow}>Not guessed.</span>
          </h2>
          <p className={`${s.say} ${s.sayDim}`}>
            Every other app trusts you to remember the chai. We own the plate, so the
            measurement happens in the kitchen instead of in your memory.
          </p>
        </div>
      </section>

      {/* ── day one ────────────────────────────────────────────────── */}
      <section className={`${s.fieldAcid} ${s.block}`}>
        <div className={s.inner}>
          <h2 className={`${s.shoutSm} ${s.snap}`}>Tomorrow, 8am</h2>
          <p className={s.say}>
            Day one of Weight Loss Vegetarian, straight off the kitchen schedule.{" "}
            {dishes.length > 0 && (
              <>
                {Math.round(kcal)} kcal, {Math.round(protein)}g protein, {dishes.length}{" "}
                meals.
              </>
            )}
          </p>

          {dishes.length > 0 && (
            <div className={s.cells}>
              {dishes.map((d) => (
                <article key={d.slot + d.name} className={s.cell}>
                  <h3 className={s.cellSlot}>{SLOT_LABEL[d.slot] ?? d.slot}</h3>
                  <p className={s.cellDish}>{d.name}</p>
                  <p className={s.cellMac}>
                    {d.kcal == null ? "—" : Math.round(d.kcal)}
                    <span className={s.cellMacSub}> kcal</span>
                    {d.protein != null && (
                      <>
                        {" / "}
                        {Math.round(d.protein)}
                        <span className={s.cellMacSub}>g pro</span>
                      </>
                    )}
                  </p>
                </article>
              ))}
            </div>
          )}

          <div className={s.row}>
            <Link href="/plans?trial=true" className={`${s.btn} ${s.btnFillDark}`}>
              Book it
            </Link>
            <Link href="/plans/weight-loss-veg" className={s.btn}>
              The whole week
            </Link>
          </div>
        </div>
      </section>

      {/* ── close ──────────────────────────────────────────────────── */}
      <section className={`${s.fieldBlack} ${s.block}`}>
        <div className={s.inner}>
          <h2 className={s.shout}>
            <span className={s.snap}>Stop</span>
            <span className={`${s.snap} ${s.acidText}`}>guessing</span>
          </h2>
          <div className={s.row}>
            <Link href="/plans?trial=true" className={`${s.btn} ${s.btnFill}`}>
              One day · Rs 400
            </Link>
            <Link href="/preview" className={s.btn}>
              Back to the three
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
