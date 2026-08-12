// app/_hp/TrialDay.tsx
//
// THE FOUR PLATES. What actually turns up tomorrow morning.
//
// Straight out of PlanScheduleSlot joined to Recipe, with the macros the kitchen
// weighed them to. Nothing here is written by hand, so when the schedule changes
// this changes with it.
//
// THE SHAPE, from the prototype: the first plate is 1.4fr against three 1fr
// siblings. Two shapes rather than one shape at four widths, so the layout
// carries which meal is the anchor of the day instead of presenting four
// interchangeable cards. That is also what keeps this off the "uniform 3-up card
// grid" reject list.
//
// EACH PLATE CARRIES ITS OWN MACRO BARS. Protein, carbohydrate and fat as three
// meters against the dish's own weighed grams, with kcal and fibre on the
// footer rule. The bars are the dish's real split, not a plan average, and the
// numbers are printed beside every one of them: colour is never the only channel.
//
// NO PER-SLOT ACCENT. The prototype gives breakfast lime-light, lunch amber,
// snack sky and dinner lime. A meal slot is not category structure and those
// hues carry no meaning, so the slot tag is lime throughout and the four are
// told apart by their label and their position. The goal doors further down keep
// their accents because those DO encode the catalogue's taxonomy.
//
// PHOTOGRAPHS: DishImage resolves per recipe and falls back to a fingerprint
// drawn from the same weighed macros printed below. There are no dish
// photographs in public/images yet, so all four render the glyph today. The
// prototype illustrated moong dal chilla with a photograph of a kitchen; the
// round-3 instruction deleted exactly that, and this is the shipped rule.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import v from "./v2.module.css";
import Idx from "./Idx";
import DishImage from "./DishImage";
import { getDayOne, totals, PLAN_SLUG, SLOT_LABEL } from "./menu-data";
import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { WRAP, DIM, MUTE, LIME, display, sub, body, label, figure } from "./theme";

/* One bar per macro. Percentages are of the dish's own gram total, so the three
   always sum to the whole and a reader can check them against the grams. */
function MacroBars({
  protein,
  carbs,
  fat,
}: {
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}) {
  const rows: [string, number, string][] = [
    ["Protein", protein ?? 0, LIME],
    ["Carbohydrate", carbs ?? 0, MUTE],
    ["Fat", fat ?? 0, DIM],
  ];
  const sum = rows.reduce((n, [, g]) => n + g, 0);
  if (sum <= 0) return null;

  return (
    <>
      {rows.map(([name, g, colour]) => (
        <div key={name}>
          <div className={v.barHead}>
            <span>{name}</span>
            <b>{Math.round(g)}g</b>
          </div>
          <div className={v.barTrack}>
            <span
              className={v.meter}
              style={{ width: `${(g / sum) * 100}%`, background: colour }}
            />
          </div>
        </div>
      ))}
    </>
  );
}

export default async function TrialDay() {
  const dishes = await getDayOne();
  const { kcal, protein } = totals(dishes);

  return (
    <section id="hp-plates" aria-labelledby="hp-plates-h" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
      <div style={WRAP}>
        <Idx label="The trial day" />

        <div className={v.head}>
          <div className={v.rise}>
            <h2
              id="hp-plates-h"
              style={{ ...display("clamp(2.4rem,6.6vw,5.4rem)"), maxWidth: "14ch" }}
            >
              This is what turns up tomorrow morning
            </h2>
          </div>

          <div className={v.rise}>
            <p style={{ ...body(16.5), maxWidth: "48ch" }}>
              Four real dishes from the Weight Loss (Veg) schedule, with the macros the
              kitchen weighs them to. Protein, carbohydrate and fat are each dish&rsquo;s own
              weighed figures, not a plan average.
            </p>

            {dishes.length > 0 && (
              <div className={v.figs} style={{ marginTop: 24 }}>
                <div>
                  <b style={figure("clamp(26px,3.6vw,40px)", LIME)}>{Math.round(kcal)}</b>
                  <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.16em" }}>
                    kcal across the day
                  </span>
                </div>
                <div>
                  <b style={figure("clamp(26px,3.6vw,40px)")}>{Math.round(protein)}g</b>
                  <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.16em" }}>
                    protein, weighed
                  </span>
                </div>
                <div>
                  <b style={figure("clamp(26px,3.6vw,40px)")}>04:00</b>
                  <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.16em" }}>
                    cook starts
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {dishes.length > 0 && (
          <div className={v.plates} style={{ marginTop: "clamp(30px,4vw,52px)" }}>
            {dishes.map((d, i) => (
              <article key={d.slot + d.name} className={`${v.plate} ${v.rise}`}>
                <div className={v.plateMedia}>
                  <DishImage
                    name={d.name}
                    kcal={d.kcal}
                    protein={d.protein}
                    carbs={d.carbs}
                    fat={d.fat}
                  />
                  <span className={v.plateSlot}>{SLOT_LABEL[d.slot] ?? d.slot}</span>
                  <b className={v.plateNum} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </b>
                </div>

                <div className={v.plateBody}>
                  {d.cuisine && (
                    <span style={{ ...label(LIME), fontSize: 12, letterSpacing: "0.18em", marginBottom: 9 }}>
                      {d.cuisine}
                    </span>
                  )}
                  <h3 style={sub(i === 0 ? "clamp(1.25rem,2vw,1.6rem)" : "clamp(1.1rem,1.7vw,1.35rem)")}>
                    {d.name}
                  </h3>
                  {d.blurb && <p style={{ ...body(13.5), margin: "10px 0 0" }}>{d.blurb}</p>}

                  <div className={v.plateBars}>
                    <MacroBars protein={d.protein} carbs={d.carbs} fat={d.fat} />
                    <div className={v.plateFoot}>
                      <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        {/* Real words, never a dash. A glyph standing in for
                            "we have not weighed this yet" is meaning encoded in
                            a character, which is rejected by name. */}
                        {d.kcal == null ? (
                          <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>
                            not yet weighed
                          </span>
                        ) : (
                          <>
                            <b style={figure("clamp(1.5rem,2.4vw,2rem)", LIME)}>
                              {Math.round(d.kcal)}
                            </b>
                            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>
                              kcal
                            </span>
                          </>
                        )}
                      </span>
                      {d.fibre != null && (
                        <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.1em" }}>
                          {Math.round(d.fibre)}g fibre
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className={s.actions} style={{ marginTop: 30 }}>
          <Link href="/plans?trial=true" className={s.btn}>
            Order the trial day, {TRIAL_TOTAL_GLYPH}
          </Link>
          <Link href={`/plans/${PLAN_SLUG}`} className={s.ghost}>
            Read this plan in full
          </Link>
        </div>

        <p style={{ ...body(13), color: DIM, marginTop: 18, maxWidth: "80ch" }}>
          The glyph on each plate is drawn from that dish&rsquo;s own weights: ring size is
          calories, the three arcs are protein, carbohydrate and fat. Every figure it
          encodes is printed on the card underneath it.
        </p>
      </div>
    </section>
  );
}
