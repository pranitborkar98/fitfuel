"use client";

// app/_hp/WeekPicker.tsx
//
// THE ONE INTERACTION ON THIS PAGE, and it is the one the review approved.
//
// The prototype promised three interactive toys
// and the instruction was to pick one and cut the other two, "because the
// week-bar day picker shows real data the customer is buying". This is it. Every
// other section on the page is a server component.
//
// WHAT IT DRAWS. Seven columns, one per day, each stacked from that day's four
// real meals in eating order and sized by their real calories. Tap a column and
// the panel below swaps to that day's dishes with their weighed macros.
//
// COLUMNS ARE SCALED FROM A FLOOR, NOT FROM ZERO. A seven-day spread of roughly
// 1,300 to 1,600 kcal drawn from zero is seven near-identical bars, which tells
// a reader nothing. Scaling from a floor makes the variation legible, and the
// floor is printed beside the chart, because a truncated axis that does not say
// so is the oldest chart lie there is.
//
// NO PER-SLOT HUE. The four meals step down one lime ramp by position rather
// than taking four different colours, and the legend names the order. The dish
// rows underneath carry every figure as text, so the colour is never load-bearing.
//
// CLIENT COMPONENT: it is a control. The table in Week.tsx is the same data,
// rendered server-side, and is what assistive tech and crawlers read.

import { useState } from "react";

import v from "./v2.module.css";
import { SLOT_ORDER, SLOT_LABEL, type Dish } from "./menu-types";
import { INK, DIM, MUTE, LIME, RULE, sub, body, label } from "./theme";

/* One lime ramp, four steps, breakfast lightest to dinner darkest. All four are
   the accent at different strengths rather than four accents. */
const STEP = ["#d9f99d", "#bef264", "#a3e635", "#84cc16"];

export default function WeekPicker({ week, days }: { week: Dish[]; days: number[] }) {
  const [active, setActive] = useState(days[0] ?? 1);

  const dayDishes = (d: number): Dish[] =>
    SLOT_ORDER.map((slot) => week.find((x) => x.day === d && x.slot === slot)).filter(
      Boolean,
    ) as Dish[];

  const dayKcal = (d: number) => dayDishes(d).reduce((n, x) => n + (x.kcal ?? 0), 0);

  const totals = days.map(dayKcal);
  const peak = Math.max(...totals, 1);
  /* The floor is a round number just under the lightest day, so the axis break
     is honest AND legible rather than merely honest. */
  const floor = Math.max(0, Math.floor((Math.min(...totals) - 120) / 100) * 100);
  const height = (kcal: number) =>
    peak === floor ? 100 : ((kcal - floor) / (peak - floor)) * 100;

  const current = dayDishes(active);
  const sum = (k: keyof Dish) =>
    Math.round(current.reduce((n, x) => n + (Number(x[k]) || 0), 0));

  return (
    <>
      <div className={v.legend} style={{ marginTop: "clamp(18px,2.4vw,28px)" }}>
        {SLOT_ORDER.map((slot, i) => (
          <span key={slot}>
            <i aria-hidden="true" style={{ background: STEP[i] }} />
            {SLOT_LABEL[slot]}
          </span>
        ))}
        <span style={{ marginLeft: "auto", color: DIM }}>
          Columns scaled from {floor.toLocaleString("en-IN")} kcal, not from zero
        </span>
      </div>

      <div className={v.week} style={{ marginTop: "clamp(14px,1.8vw,22px)" }} role="tablist" aria-label="Pick a day">
        {days.map((d) => {
          const dishes = dayDishes(d);
          const kcal = dayKcal(d);
          const on = d === active;
          return (
            <button
              key={d}
              type="button"
              role="tab"
              id={`hp-day-tab-${d}`}
              aria-selected={on}
              aria-controls="hp-day-panel"
              className={v.weekBtn}
              onClick={() => setActive(d)}
            >
              <span className={v.weekColWrap}>
                <span
                  className={v.weekCol}
                  style={{
                    height: `${height(kcal)}%`,
                    borderTop: `3px solid ${on ? LIME : RULE}`,
                  }}
                >
                  {dishes.map((dish, i) => (
                    <span
                      key={dish.slot}
                      className={v.weekSeg}
                      title={`${SLOT_LABEL[dish.slot] ?? dish.slot}: ${dish.name}`}
                      style={{
                        flexGrow: Math.max(1, Number(dish.kcal ?? 0)),
                        background: STEP[i] ?? LIME,
                        opacity: on ? 1 : 0.42,
                      }}
                    />
                  ))}
                </span>
              </span>
              <b className={v.weekKcal} style={{ color: on ? INK : DIM }}>
                {Math.round(kcal)}
              </b>
              <span className={v.weekLabel} style={{ color: on ? LIME : DIM }}>
                Day {d}
              </span>
            </button>
          );
        })}
      </div>

      <div
        className={v.dayPanel}
        id="hp-day-panel"
        role="tabpanel"
        aria-labelledby={`hp-day-tab-${active}`}
        style={{ marginTop: "clamp(20px,2.6vw,30px)" }}
      >
        <div className={v.dayPanelHead}>
          <h3 style={sub("clamp(1.4rem,2.6vw,2.1rem)")}>Day {active}</h3>
          <div
            style={{
              display: "flex",
              gap: "clamp(14px,2.4vw,28px)",
              ...label(DIM),
              fontSize: 12,
              letterSpacing: "0.14em",
            }}
          >
            <span>
              <b style={{ color: LIME, fontWeight: 700 }}>{sum("kcal")}</b> kcal
            </span>
            <span>
              <b style={{ color: INK, fontWeight: 700 }}>{sum("protein")}g</b> protein
            </span>
            <span>
              <b style={{ color: INK, fontWeight: 700 }}>{sum("fibre")}g</b> fibre
            </span>
          </div>
        </div>

        <div>
          {current.map((dish) => (
            <div key={dish.slot} className={`${v.row} ${v.dishRow}`}>
              <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.2em" }}>
                {SLOT_LABEL[dish.slot] ?? dish.slot}
              </span>
              <h4 style={sub("clamp(1.05rem,1.6vw,1.28rem)")}>{dish.name}</h4>
              <p className={v.hideSm} style={{ ...body(13), color: MUTE, maxWidth: "none" }}>
                {dish.blurb ?? ""}
              </p>
              <div className={v.macros}>
                {/* Words, not a dash: a glyph carrying "no figure" is meaning
                    encoded in a character, and it reads at 1.5:1 besides. */}
                <b>{dish.kcal == null ? "not stated" : Math.round(dish.kcal)}</b>
                <span>{Math.round(dish.protein ?? 0)}g P</span>
                <span>{Math.round(dish.carbs ?? 0)}g C</span>
                <span>{Math.round(dish.fat ?? 0)}g F</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
