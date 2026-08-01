// app/_hp/Week.tsx
//
// THE WEEK. Seven days, from the database, pickable.
//
// A MONTH WAS THE WRONG UNIT. Earlier versions printed a sixty-cell grid and a
// thirty-day schedule nobody can hold in their head, and neither told a visitor
// what Thursday looks like. A week is the unit a person plans against: one shop,
// one gym cycle, one payday. Thirty days publish on the plan page.
//
// TWO EXPRESSIONS OF ONE DATASET, on purpose:
//
//   WeekPicker   seven columns you can tap, the active day's dishes below. The
//                one interactive device on this page, and the one
//                DESIGN-FEEDBACK §5 said earns its keep.
//   the table    a real <table>, seven rows, four meal columns and a day total.
//                Server-rendered, always present. This is what a screen reader
//                and a crawler read, and it is why the picker is allowed to be
//                a client component at all: nothing depends on JavaScript to
//                reach the data.
//
// Tabular data rendered as a grid of divs cannot be parsed by assistive tech and
// this is about as tabular as data gets, so the table is not a fallback. It is
// the primary rendering; the picker is the view on top of it.
//
// SERVER COMPONENT. Shares one query with TrialDay via menu-data's cache().

import Link from "next/link";

import s from "./hp.module.css";
import v from "./v2.module.css";
import Idx from "./Idx";
import WeekPicker from "./WeekPicker";
import { getWeek, totals, PLAN_SLUG, SLOT_ORDER, SLOT_LABEL, WEEK_DAYS, type Dish } from "./menu-data";
import { WRAP, PANEL, DIM, display, body } from "./theme";

export default async function Week() {
  const week = await getWeek();
  if (!week.length) return null;

  const days = Array.from({ length: WEEK_DAYS }, (_, i) => i + 1).filter((d) =>
    week.some((x) => x.day === d),
  );
  if (!days.length) return null;

  const byDay = (d: number, slot: string): Dish | undefined =>
    week.find((x) => x.day === d && x.slot === slot);

  const avg = Math.round(totals(week).kcal / days.length);
  const distinct = new Set(week.map((d) => d.name)).size;

  return (
    <section
      aria-labelledby="hp-week"
      style={{ padding: "clamp(72px,10vw,150px) 0", background: PANEL, borderTop: "1px solid #232320" }}
    >
      <div style={WRAP}>
        <Idx label="The week" />

        <div className={v.head}>
          <div className={v.rise}>
            <h2 id="hp-week" style={{ ...display("clamp(2.4rem,6.6vw,5.4rem)"), maxWidth: "13ch" }}>
              Pick a day. See exactly what you eat.
            </h2>
          </div>
          <p className={v.rise} style={{ ...body(16.5), maxWidth: "48ch" }}>
            Seven days, {distinct} distinct dishes, an average of {avg.toLocaleString("en-IN")} kcal.
            The bars are real calories: tap one and the day below changes. Thirty days publish
            on the plan page.
          </p>
        </div>

        <WeekPicker week={week} days={days} />

        {/* The same seven days as a real table. Not a fallback: this is the
            accessible expression of the identical data, and it is server
            rendered whether or not the picker above ever hydrates. */}
        <details className={s.specWrap} style={{ marginTop: "clamp(20px,2.6vw,30px)" }}>
          <summary
            style={{
              ...body(13.5),
              color: DIM,
              cursor: "pointer",
              padding: "14px clamp(14px,2vw,20px)",
              maxWidth: "none",
            }}
          >
            All seven days as a table
          </summary>
          <table className={`${s.spec} ${s.week}`}>
            <caption className="sr-only">
              Days 1 to {days.length} of the Weight Loss Vegetarian schedule, with each meal
              and its calories
            </caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                {SLOT_ORDER.map((slot) => (
                  <th key={slot} scope="col">
                    {SLOT_LABEL[slot]}
                  </th>
                ))}
                <th scope="col">Day total</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d) => {
                const t = totals(week.filter((x) => x.day === d));
                return (
                  <tr key={d}>
                    <th scope="row" className={s.weekDay}>
                      Day {d}
                    </th>
                    {SLOT_ORDER.map((slot) => {
                      const dish = byDay(d, slot);
                      return (
                        <td key={slot}>
                          {dish ? (
                            <>
                              <span className={s.weekDish}>{dish.name}</span>
                              <span className={s.weekKcal}>
                                {dish.kcal == null ? "not stated" : `${Math.round(dish.kcal)} kcal`}
                                {dish.protein != null && ` · ${Math.round(dish.protein)}g P`}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: DIM }}>Not scheduled</span>
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <span className={s.weekTotal}>{Math.round(t.kcal)} kcal</span>
                      <span className={s.weekKcal}>{Math.round(t.protein)}g protein</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </details>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href={`/plans/${PLAN_SLUG}`} className={s.ghost}>
            See all 30 days
          </Link>
          <Link href="/plans" className={s.link}>
            Browse every plan
          </Link>
        </div>
      </div>
    </section>
  );
}
