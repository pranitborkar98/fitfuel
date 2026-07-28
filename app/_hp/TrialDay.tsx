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
    <section aria-labelledby="hp-trial" style={SECTION}>
      <div style={WRAP}>
        <Idx label="The trial day" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2
            id="hp-trial"
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

            <div className={s.dishes} style={{ marginTop: 1 }}>
              {dishes.map((d) => (
                <article key={d.slot + d.name} className={s.dish}>
                  <div className={s.dishHead}>
                    <span style={label(LIME)}>{SLOT_LABEL[d.slot] ?? d.slot}</span>
                    {d.cuisine && (
                      <span style={{ ...label(DIM), display: "inline" }}>{d.cuisine}</span>
                    )}
                  </div>
                  <h3 style={{ ...sub("clamp(1.15rem,1.9vw,1.45rem)"), marginTop: 16 }}>
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
