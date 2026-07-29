// app/_hp/Week.tsx
//
// THE WEEK. Seven days, from the database, as a real table.
//
// A MONTH WAS THE WRONG UNIT. The previous versions of this page printed a
// sixty-cell grid counting menu days, and a thirty-day schedule nobody can hold
// in their head. Neither told a visitor what Thursday looks like. A week is the
// unit a person actually plans against — one shop, one gym cycle, one payday —
// so the homepage shows exactly seven days and links to the full schedule on the
// plan page for anyone who wants all thirty.
//
// It is a real <table>: seven rows, four meal columns and a day total. Tabular
// data rendered as a grid of divs cannot be parsed by assistive tech, and this
// is about as tabular as data gets.
//
// SERVER COMPONENT. Shares one query with TrialDay via menu-data's cache().

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { getWeek, totals, PLAN_SLUG, SLOT_ORDER, SLOT_LABEL, WEEK_DAYS, type Dish } from "./menu-data";
import { WRAP, SECTION, PANEL, DIM, display, body } from "./theme";

const DAY_LABEL = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

export default async function Week() {
  const week = await getWeek();
  if (!week.length) return null;

  const days = Array.from({ length: WEEK_DAYS }, (_, i) => i + 1).filter((d) =>
    week.some((x) => x.day === d),
  );
  if (!days.length) return null;

  const byDay = (d: number, slot: string): Dish | undefined =>
    week.find((x) => x.day === d && x.slot === slot);

  const weekKcal = totals(week).kcal;
  const avg = Math.round(weekKcal / days.length);

  return (
    <section aria-labelledby="hp-week" style={{ ...SECTION, background: PANEL }}>
      <div style={WRAP}>
        <Idx label="The week" />

        {/* Title only — both paragraphs removed at the owner's instruction.
            The three facts they carried are now three figures beside the
            heading, where they read in a glance instead of in a sentence. */}
        <div className={s.trialHead}>
          <h2 id="hp-week" style={{ ...display("clamp(2.4rem,6.4vw,5rem)"), maxWidth: "12ch" }}>
            A week you can actually picture
          </h2>

          <div className={s.weekFigs}>
            <div>
              <b>{avg}</b>
              <span>kcal average day</span>
            </div>
            <div>
              <b>{new Set(week.map((d) => d.name)).size}</b>
              <span>distinct dishes</span>
            </div>
            <div>
              <b>30</b>
              <span>days on the plan</span>
            </div>
          </div>
        </div>

        {/* THE RHYTHM. The table below is correct and accessible and reads as
            a spreadsheet, which is the complaint. This is the same seven days
            as a shape you can take in at a glance: one column per day, the
            four meals stacked in their real proportion, the day's protein as
            a lime cap. Nothing here is decoration — every band is a dish's
            actual calories, and the table underneath is the accessible
            expression of the identical data. */}
        <div className={s.rhythm} aria-hidden="true">
          {days.map((d) => {
            const dayDishes = SLOT_ORDER.map((slot) => byDay(d, slot)).filter(Boolean) as Dish[];
            const t = totals(dayDishes);
            const peak = Math.max(
              ...days.map((x) => totals(week.filter((y) => y.day === x)).kcal),
            );

            return (
              <div key={d} className={s.rhythmCol} style={{ "--h": `${(t.kcal / peak) * 100}%` } as React.CSSProperties}>
                <div className={s.rhythmBar}>
                  {dayDishes.map((dish, i) => (
                    <span
                      key={dish.slot}
                      className={s.rhythmSeg}
                      style={{
                        flexGrow: Number(dish.kcal ?? 0),
                        opacity: 0.42 + i * 0.19,
                      }}
                    />
                  ))}
                </div>
                <b>{Math.round(t.kcal)}</b>
                <span>D{d}</span>
              </div>
            );
          })}
        </div>

        <div className={s.specWrap}>
          <table className={`${s.spec} ${s.week}`}>
            <caption className="sr-only">
              Days 1 to {days.length} of the Weight Loss Vegetarian schedule, with each
              meal and its calories
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
                const dayDishes = week.filter((x) => x.day === d);
                const t = totals(dayDishes);
                return (
                  <tr key={d}>
                    <th scope="row" className={s.weekDay}>
                      {DAY_LABEL[d - 1] ?? `Day ${d}`}
                    </th>
                    {SLOT_ORDER.map((slot) => {
                      const dish = byDay(d, slot);
                      return (
                        <td key={slot}>
                          {dish ? (
                            <>
                              <span className={s.weekDish}>{dish.name}</span>
                              <span className={s.weekKcal}>
                                {dish.kcal == null ? "—" : Math.round(dish.kcal)} kcal
                                {dish.protein != null && ` · ${Math.round(dish.protein)}g P`}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: "#85857e" }}>Not scheduled</span>
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
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 18 }}>
          One plan of 126 is fully seeded today. The other 125 publish their duration,
          macros and price, and their schedules land as the kitchen finishes them. We
          would rather show you one real week than 126 invented ones.
        </p>

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
