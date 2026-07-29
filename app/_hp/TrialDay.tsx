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
import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
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

        {/* Title only. The explanatory paragraph is gone: it argued the food
            was real instead of showing it, which is the page's whole problem in
            miniature. The price and the CTA carry the offer now. */}
        <div className={s.trialHead}>
          <h2
            id="hp-trial-h"
            style={{ ...display("clamp(2.4rem,6.4vw,5rem)"), maxWidth: "13ch" }}
          >
            This is what turns up tomorrow morning
          </h2>

          <Link href="/plans?trial=true" className={s.btnBig}>
            Order the trial day
            <b>{TRIAL_TOTAL_GLYPH}</b>
          </Link>
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

            {/* Cards 1 and 4 are wide and lay the media beside the copy; 2 and
                3 are narrow and stack it above. Two shapes, not one shape at
                two widths — the layout carries the size of the meal. */}
            <div className={`${s.dishesAsym} ${s.deep}`} style={{ marginTop: 1 }}>
              {dishes.map((d, i) => {
                const wide = i === 0 || i === 3;

                return (
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

                    <div className={wide ? s.dishWide : undefined}>
                      {/* A photograph if one has been dropped in for this dish,
                          otherwise a fingerprint drawn from the same weighed
                          macros printed below. Adding photography needs no code
                          change: see DishImage for the lookup order. */}
                      <DishImage
                        name={d.name}
                        kcal={d.kcal}
                        protein={d.protein}
                        carbs={d.carbs}
                        fat={d.fat}
                      />

                      <div className={s.dishCopy}>
                        {/* Explicit `margin` rather than spreading a style that
                            sets `margin: 0` and then adding `marginTop` — React
                            warns when a rerender drops one of a shorthand/
                            longhand pair for the same property. */}
                        <h3
                          style={{
                            ...sub(wide ? "clamp(1.3rem,2.3vw,1.75rem)" : "clamp(1.15rem,1.9vw,1.45rem)"),
                            margin: "4px 0 0",
                          }}
                        >
                          {d.name}
                        </h3>
                        {d.blurb && <p style={{ ...body(14), margin: "10px 0 0" }}>{d.blurb}</p>}
                        <div className={s.macros}>
                          <Macro v={d.kcal} unit="" name="kcal" />
                          <Macro v={d.protein} unit="g" name="Pro" />
                          <Macro v={d.carbs} unit="g" name="Carb" />
                          <Macro v={d.fat} unit="g" name="Fat" />
                          <Macro v={d.fibre} unit="g" name="Fib" />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
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
