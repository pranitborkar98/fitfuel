// app/menu/WeekMenu.tsx
//
// THIS WEEK'S MENU. Seven days, four meals a day, from the database.
//
// WHAT THIS REPLACED AND WHY. /menu was a second copy of the catalogue: all 48
// à la carte dishes, grouped by course, with a basket. `/` is already that —
// searchable, filterable, with the same basket and the same 48 dishes — so the
// two pages answered the same question and only one of them was the front door.
//
// This answers the question `/` cannot: not "what can I buy" but "what are you
// actually cooking". Those are different, and they are different in the DATA
// too, which is the part worth understanding before editing this file:
//
//   the 48 à la carte dishes   lib/menu-alacarte.ts — sold singly, priced,
//                              addable to a basket. Still on `/`, unchanged.
//   this week's rotation       Recipe rows reached through PlanScheduleSlot —
//                              what the PLAN cooks, on a 60-day no-repeat
//                              cycle. Not sold singly, so there is no price
//                              and no Add button here, and putting one here
//                              would sell something the kitchen does not sell.
//
// They barely overlap. "Maharashtrian Moong Dal Chilla" is a plan recipe and is
// not one of the 48. So this page does not carry a basket, and the way to buy
// what is on it is the plan — which is what the close says.
//
// ONE SEEDED PLAN OF 126. weight-loss-veg is the only MealPlan with
// PlanScheduleSlot rows, so this is its week. When more are seeded this page
// takes a plan picker; until then naming the plan in the copy is the honest
// version, rather than implying every plan eats this.
//
// RENDERS NOTHING WHEN THE QUERY IS EMPTY — see the page, which shows a plain
// explanation instead. A weekly menu carrying invented dish names would
// falsify the no-repeat claim it exists to demonstrate.
//
// STYLE: app/_web/app.module.css, the same stylesheet `/` uses. Not a copy of
// its look — literally the same module, so the two cannot drift.

import Link from "next/link";

import { SLOT_LABEL, SLOT_ORDER, type Dish } from "@/app/_hp/menu-types";
import Breadcrumb from "@/components/Breadcrumb";
import s from "@/app/_web/app.module.css";

export default function WeekMenu({
  week,
  planName,
  planSlug,
  trialTotal,
  cutoff,
}: {
  week: Dish[];
  planName: string;
  planSlug: string;
  trialTotal: string;
  cutoff: string;
}) {
  const days = [...new Set(week.map((d) => d.day))].sort((a, b) => a - b);
  const at = (day: number, slot: string) =>
    week.find((d) => d.day === day && d.slot === slot);

  /* Counted off the rows, never asserted. If the seed ever repeats a dish this
     figure drops and the page says so rather than keeping a stale claim. */
  const distinct = new Set(week.map((d) => d.name)).size;
  const dayKcal = (day: number) =>
    week.filter((d) => d.day === day).reduce((n, d) => n + (d.kcal ?? 0), 0);
  const avgKcal = days.length
    ? Math.round(days.reduce((n, d) => n + dayKcal(d), 0) / days.length)
    : 0;

  return (
    <div className={s.pad}>
      <Breadcrumb
        trail={[{ href: "/", label: "Order" }]}
        current="This week's menu"
      />

      <div className={s.lede}>
        <h1 className={s.claim}>This week&apos;s menu.</h1>
        <p className={s.claimDeck}>
          Seven days of the {planName} plan, exactly as the kitchen will cook
          it. {distinct} different dishes across {days.length} days — every
          recipe carries a rotation group, so nothing repeats inside a 60-day
          cycle.
        </p>
      </div>

      <ul className={s.weekStats} aria-label="This week at a glance">
        <li>
          <b className="fk-num">{distinct}</b>
          <span>different dishes</span>
        </li>
        <li>
          <b className="fk-num">{days.length}</b>
          <span>days</span>
        </li>
        <li>
          <b className="fk-num">{avgKcal.toLocaleString("en-IN")}</b>
          <span>kcal a day, average</span>
        </li>
        <li>
          <b className="fk-num">{SLOT_ORDER.length}</b>
          <span>meals a day</span>
        </li>
      </ul>

      {/* ── THE WEEK ──────────────────────────────────────────────────────
          One section per day rather than the homepage band's single table.
          The band is a glance — proof that a week exists — and it lives among
          eleven other bands, so it has to be small. This is the page the
          reader came to, so each day gets room for the dish's own blurb and
          its macros. Same tokens, same card, different density.

          A <section> per day with an <h2>, so the whole week is navigable by
          heading rather than being one undifferentiated table to a screen
          reader. */}
      {days.map((day) => {
        const meals = SLOT_ORDER.map((slot) => ({ slot, dish: at(day, slot) })).filter(
          (m) => m.dish,
        );
        if (!meals.length) return null;
        return (
          <section key={day} className={s.weekDay} aria-labelledby={`day-${day}`}>
            <div className={s.weekDayHead}>
              <h2 id={`day-${day}`} className={s.weekDayN}>
                Day {String(day).padStart(2, "0")}
              </h2>
              <span className={`${s.weekDayKcal} fk-num`}>
                {dayKcal(day).toLocaleString("en-IN")} kcal
              </span>
            </div>

            <ul className={s.weekMeals}>
              {meals.map(({ slot, dish }) => (
                <li key={slot}>
                  <span className={s.weekSlot}>{SLOT_LABEL[slot] ?? slot}</span>
                  <b className={s.weekDishName}>{dish!.name}</b>
                  {dish!.cuisine ? (
                    <span className={s.weekCuisine}>{dish!.cuisine}</span>
                  ) : null}
                  {dish!.blurb ? (
                    <span className={s.weekBlurb}>{dish!.blurb}</span>
                  ) : null}
                  {dish!.kcal ? (
                    <span className={`${s.weekMacros} fk-num`}>
                      {Math.round(dish!.kcal)} kcal
                      {dish!.protein != null ? ` · ${Math.round(dish!.protein)}g P` : ""}
                      {dish!.carbs != null ? ` · ${Math.round(dish!.carbs)}g C` : ""}
                      {dish!.fat != null ? ` · ${Math.round(dish!.fat)}g F` : ""}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {/* The way to actually get this. No basket on this page — see the note
          at the top of the file: these are plan recipes, not the à la carte
          dishes, and the kitchen does not sell them singly. */}
      <div className={s.weekClose}>
        <h2 className={s.weekCloseH}>Eat this week.</h2>
        <p className={s.weekCloseP}>
          These are the {planName} recipes, cooked to your macros and delivered
          across Kharadi. Order by {cutoff} and the first day arrives tomorrow
          morning. A single trial day is {trialTotal}, all in.
        </p>
        <div className={s.closeActions}>
          <Link href="/checkout" className={s.closeCta}>
            Start the trial — {trialTotal}
          </Link>
          <Link href={`/plans/${planSlug}`} className={s.closeGhost}>
            See the full plan
          </Link>
        </div>
      </div>
    </div>
  );
}
