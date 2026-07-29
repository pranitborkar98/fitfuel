// app/_hp/TrialDay.tsx
//
// THE TRIAL DAY. The strongest asset on the site, at position three.
//
// At Rs 400 the only question a visitor has is "what actually turns up", and the
// page argued about food for weeks without ever showing any. These are the real
// day-one dishes for weight-loss-veg, straight out of PlanScheduleSlot joined to
// Recipe, with the macros the kitchen weighed them to. Nothing here is written by
// hand, so when the schedule changes this changes with it.
//
// This is deliberately the FIRST food section and it shows exactly one day: the
// unit of the trial, the thing you can buy without a subscription. The week comes
// next, once the reader has agreed the day is real.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import DishImage from "./DishImage";
import { getDayOne, totals, PLAN_SLUG, SLOT_LABEL } from "./menu-data";
import { WRAP, SECTION, INK, DIM, LIME, display, sub, body, label, figure } from "./theme";

function Macro({ v, unit, name }: { v: number | null; unit: string; name: string }) {
  return (
    <div>
      <span className={s.macroV}>
        {v == null ? "—" : Math.round(v)}
        {v != null && unit}
      </span>
      <span className={s.macroL}>{name}</span>
    </div>
  );
}

export default async function TrialDay() {
  const dishes = await getDayOne();
  const { kcal, protein } = totals(dishes);

  return (
    <section id="hp-trial" aria-labelledby="hp-trial-h" style={SECTION}>
      <div style={WRAP}>
        <Idx label="The trial day" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2
            id="hp-trial-h"
            style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "14ch" }}
          >
            This is what turns up tomorrow morning
          </h2>
          <p style={{ ...body(16.5) }}>
            Not a render and not a stock photo. Day one of Weight Loss Vegetarian,
            pulled live from the kitchen&rsquo;s own schedule, with the macros each
            dish was weighed to. Buy the one day. Decide after you have eaten it.
          </p>
        </div>

        {dishes.length > 0 && (
          <>
            <div
              className={`${s.stats} ${s.stats3}`}
              style={{ marginTop: "clamp(26px,3.4vw,44px)" }}
            >
              <div className={s.stat}>
                <div style={figure("clamp(1.9rem,3.6vw,2.8rem)", LIME)}>{Math.round(kcal)}</div>
                <div style={{ ...body(14), color: INK, marginTop: 10 }}>kcal across the day</div>
              </div>
              <div className={s.stat}>
                <div style={figure("clamp(1.9rem,3.6vw,2.8rem)")}>{Math.round(protein)}g</div>
                <div style={{ ...body(14), color: INK, marginTop: 10 }}>
                  protein, weighed not estimated
                </div>
              </div>
              <div className={s.stat}>
                <div style={figure("clamp(1.9rem,3.6vw,2.8rem)")}>{dishes.length}</div>
                <div style={{ ...body(14), color: INK, marginTop: 10 }}>
                  meals, cooked from 04:00
                </div>
              </div>
            </div>

            <div className={`${s.dishes} ${s.deep}`} style={{ marginTop: 1 }}>
              {dishes.map((d, i) => (
                <article
                  key={d.slot + d.name}
                  className={`${s.dish} ${s.stagger} ${s.lift}`}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <div className={s.dishHead}>
                    <span style={label(LIME)}>{SLOT_LABEL[d.slot] ?? d.slot}</span>
                    {d.cuisine && (
                      <span style={{ ...label(DIM), display: "inline" }}>{d.cuisine}</span>
                    )}
                  </div>

                  {/* A photograph if one has been dropped in for this dish,
                      otherwise a fingerprint drawn from the same weighed macros
                      printed below. Adding photography needs no code change:
                      see DishImage for the lookup order. */}
                  <DishImage
                    name={d.name}
                    kcal={d.kcal}
                    protein={d.protein}
                    carbs={d.carbs}
                    fat={d.fat}
                  />

                  <h3 style={{ ...sub("clamp(1.15rem,1.9vw,1.45rem)"), marginTop: 4 }}>
                    {d.name}
                  </h3>
                  {d.blurb && <p style={{ ...body(14), marginTop: 10 }}>{d.blurb}</p>}
                  <div className={s.macros}>
                    <Macro v={d.kcal} unit="" name="kcal" />
                    <Macro v={d.protein} unit="g" name="Pro" />
                    <Macro v={d.carbs} unit="g" name="Carb" />
                    <Macro v={d.fat} unit="g" name="Fat" />
                    <Macro v={d.fibre} unit="g" name="Fib" />
                  </div>
                </article>
              ))}
            </div>

            {/* Colour is never the only channel: the ring is explained in
                words, and every figure it encodes is printed on the card
                underneath it anyway. */}
            <p className={s.glyphKey} style={{ marginTop: 18 }}>
              <span>
                <i style={{ background: "#84cc16" }} aria-hidden="true" />
                <b>Protein</b>
              </span>
              <span>
                <i style={{ background: "#9a9a94" }} aria-hidden="true" />
                <b>Carbohydrate</b>
              </span>
              <span>
                <i style={{ background: "#5f5f59" }} aria-hidden="true" />
                <b>Fat</b>
              </span>
              <span>Ring size = calories. Each mark is drawn from that dish&rsquo;s own weights.</span>
            </p>
          </>
        )}

        <div className={s.actions} style={{ marginTop: 30 }}>
          <Link href="/plans?trial=true" className={s.btn}>
            Book the trial day
          </Link>
          <Link href={`/plans/${PLAN_SLUG}`} className={s.ghost}>
            Read this plan in full
          </Link>
        </div>
      </div>
    </section>
  );
}
