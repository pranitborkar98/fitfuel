"use client";

// app/_web/HomeSections.tsx
//
// EVERYTHING BELOW THE CATALOG.
//
// The catalog answers "what can I eat tonight". These eight bands answer the
// questions a customer asks on the second visit and the third — where the food
// comes from, what the subscription costs, whether you cook for a diagnosis,
// what the coach actually does, and when it reaches my suburb.
//
// THEY SIT BELOW THE FOOD, always. AGENTS.md is explicit that nothing pushes
// the menu down the page, and each of these is a section someone scrolls TO,
// not one they scroll PAST.
//
// Every figure is either counted in app/page.tsx from the database or derived
// here from the seeded PlanPrice matrix. There is no price literal in this
// file — lib/trial-price.ts exists because seven surfaces once quoted a number
// checkout did not charge, and a plan calculator on the homepage is the single
// easiest place to reintroduce that bug.

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  DIETS,
  DURATIONS,
  MEALS,
  TIERS,
  getTierPrice,
  type DietKey,
  type DurationKey,
  type MealKey,
  type PriceRow,
  type Tier,
} from "@/lib/plan-tier-pricing";
import { decomposePrice } from "@/lib/pricing-decomposition";

import {
  AREA_DROPS,
  CONDITIONS,
  COACH_WEEKS,
  DAY_STEPS,
  FAQS,
  MINOR,
  TRIO,
  SURFACES,
  WEDGE_COLS,
  wedgeRows,
} from "./home-data";
import type { BandCounts, Quote } from "./HomeBands";
import { SLOT_LABEL, SLOT_ORDER, type Dish } from "@/app/_hp/menu-types";
import DeliveryMap from "./DeliveryMap";
import { useReveal } from "./useReveal";
import s from "./app.module.css";

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* NO EYEBROWS. Each band opened with a hairline and two or three words in lime
   — "The day", "The platform", "Clinical" — sitting above its own heading. The
   owner removed them on 2026-08-19, and they were saying twice what the heading
   says once: "The day" over "Between 4am and your door" is a label on a
   sentence that is already the label. Eight bands, eight of them. */

/* The four durations a homepage calculator should offer. The matrix carries
   seven, including TRIAL_DAY and the Mon–Fri month; the trial has its own panel
   two bands down and "Mon–Fri" is a variant of a month, not a length someone
   picks first. Both remain selectable on /plans. */
const BUILD_DURATIONS: DurationKey[] = [
  "WEEKLY",
  "BI_WEEKLY",
  "ONE_MONTH",
  "TWO_MONTH",
];

/** Meals actually cooked per day, per combo. Drives the per-meal arithmetic. */
const MEALS_PER_DAY: Record<MealKey, number> = {
  BREAKFAST_LUNCH: 2,
  SNACK_DINNER: 2,
  ALL_FOUR: 4,
};

export type HomeSectionsProps = {
  counts: BandCounts;
  /** Distinct subCategory values across the 126 plans — goals and conditions. */
  goalCount: number;
  /** The seeded PlanPrice matrix, one row per (diet × duration × meals). */
  prices: PriceRow[];
  /** The trial day, itemised by lib/pricing-decomposition. */
  trial: { rows: { k: string; v: string }[]; total: string };
  /** Suburbs in app/_hp/areas-data.ts, kitchen included. */
  areaCount: number;
  /** The order cutoff sentence, from lib/order-cutoff. */
  cutoffLabel: string;
  /** Featured Testimonial rows. Empty renders nothing at all — see ProofBand. */
  quotes: Quote[];
  /** Seven seeded days of weight-loss-veg. Empty renders nothing — see WeekBand. */
  week: Dish[];
};

export default function HomeSections({
  counts,
  goalCount,
  prices,
  trial,
  areaCount,
  cutoffLabel,
  quotes,
  week,
}: HomeSectionsProps) {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef}>
      <DayBand />
      <PlatformBand counts={counts} goalCount={goalCount} />
      <WedgeBand counts={counts} />
      <WeekBand week={week} recipes={counts.recipes} />
      <ServicesBand />
      <PlanBand prices={prices} />
      <ConditionsBand counts={counts} goalCount={goalCount} />
      <CoachBand trial={trial} />
      <AreasFaqBand areaCount={areaCount} cutoffLabel={cutoffLabel} />
      <SurfacesBand />
      <ProofBand quotes={quotes} />
      <CtaBand
        trialTotal={trial.total}
        planCount={counts.plans}
        cutoffLabel={cutoffLabel}
        areaCount={areaCount}
      />
    </div>
  );
}

/* ── 1. The day ─────────────────────────────────────────────────────────────
   The single strongest thing we have and it was on no route: one kitchen, four
   hours, our own drivers. Three of the four steps carry a real photograph. */
function DayBand() {
  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="day-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="day-h" className={s.bandH2}>
              Between 4am and your door
            </h2>
          </div>
          <p className={s.bandLede}>
            One kitchen in Kharadi, our own drivers, and four hours between the
            produce arriving and breakfast on your desk.
          </p>
        </div>

        {/* Grows to full width as the band arrives — the four hours, drawn. */}
        <span aria-hidden="true" className={s.dayRail}>
          <span data-rail="100%" />
        </span>

        <ol className={s.dayGrid}>
          {DAY_STEPS.map((step) => (
            <li key={step.at} data-reveal="up">
              <span className={s.dayShot}>
                {step.img ? (
                  <Image
                    src={step.img}
                    alt={step.alt ?? ""}
                    fill
                    sizes="(min-width: 900px) 25vw, 100vw"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                ) : (
                  /* No photograph of a number landing in a diary exists, so
                     this step gets the figure itself on a colour ground rather
                     than a borrowed picture of a kitchen. */
                  <span className={s.dayLogged}>
                    <b className="fk-num" data-count="1430">
                      1,430
                    </b>
                    <span>kcal ready to confirm</span>
                  </span>
                )}
              </span>
              <span className={s.dayBody}>
                <b className={`${s.dayAt} fk-num`}>{step.at}</b>
                <b className={s.dayLabel}>{step.label}</b>
                <span className={s.dayLine}>{step.line}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 2. The platform ────────────────────────────────────────────────────────
   Four figures, counted in page.tsx. The point of the band is that the menu is
   the front door and not the product. */
function PlatformBand({ counts, goalCount }: { counts: BandCounts; goalCount: number }) {
  const cols = [
    {
      n: counts.plans,
      label: "Meal plans",
      note: "A 60-day cycle cooked to your macros, configured by duration, diet, meals and tier.",
    },
    {
      n: counts.conditionPlans,
      label: "Cooked for a diagnosis",
      note: `PCOS, thyroid, diabetic, fatty liver and the rest, across ${goalCount} goals and conditions.`,
    },
    {
      n: counts.exercises,
      label: "Exercises",
      note: "Programmed into your week, with the burn fed back into today's net calories.",
    },
    {
      n: counts.supplements,
      label: "Supplements",
      note: "Researched against your plan and priced across six retailers. We hold no stock.",
    },
  ];

  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="platform2-h">
      <div className={s.bandWrap}>
        <h2 id="platform2-h" className={s.bandH2}>
          The food is the front door
        </h2>
        <p className={`${s.bandLede} ${s.bandLedeWide}`}>
          Behind the menu is the thing you actually keep using: plans cooked for
          a diagnosis, training that feeds back into the day, and a coach that
          moves your target when the scale disagrees with it.
        </p>
        <ul className={s.statRow}>
          {cols.map((c) => (
            <li key={c.label} data-reveal="up">
              <b className={s.statN} data-count={c.n}>
                {c.n.toLocaleString("en-IN")}
              </b>
              <b className={s.statLabel}>{c.label}</b>
              <span className={s.statNote}>{c.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 2b. The wedge ──────────────────────────────────────────────────────────
   app/_hp/Wedge.tsx, on no route since it was written, and it holds the single
   strongest distinction the old page had: the diary starts from food this
   kitchen actually prepared, and the member confirms what they ate.

   It sits HERE, directly after the platform band, because that band says what
   we run and this one says why none of the cheaper things does it. Answering
   "why not a tiffin service" after the reader has already scrolled past the
   price is answering it too late.

   A table, not four cards, and every cell a sentence rather than a tick. Both
   choices are Wedge's own and both are right — see the note in home-data.ts. */
function WedgeBand({ counts }: { counts: BandCounts }) {
  const rows = wedgeRows(counts.exercises, counts.conditionPlans);

  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="wedge-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="wedge-h" className={s.bandH2}>
              Your meals start filled in. You confirm what you ate.
            </h2>
          </div>
          <p className={s.bandLede}>
            Four things you could buy instead, and what each of them actually
            does. The same claim as a table, so you can check it rather than
            believe it.
          </p>
        </div>

        {/* Scrolls sideways on a phone rather than shrinking to five illegible
            columns. The row header is sticky inside that scroll, so the thing
            being compared never leaves the screen. */}
        <div className={s.specWrap} data-reveal="up">
          <table className={s.spec}>
            <caption className="fk-sr-only">
              What a tiffin service, a fitness app, a supplement brand and
              FitFuel each do
            </caption>
            <thead>
              <tr>
                <th scope="col">Does it</th>
                {WEDGE_COLS.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
                <th scope="col" className={s.specUs}>
                  FitFuel
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.what}>
                  <th scope="row">{r.what}</th>
                  <td>{r.tiffin}</td>
                  <td>{r.app}</td>
                  <td>{r.supp}</td>
                  <td className={s.specMine}>{r.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ── 7b. Proof ──────────────────────────────────────────────────────────────
   THE ONE THING THE IMPORTED REDESIGN DROPPED, put back.

   app/page.tsx has been querying three featured Testimonial rows the whole
   time; the design had no band to render them in, so they were fetched and
   thrown away. This is app/_hp/Proof.tsx's shape at app density: the result,
   the plan, and the AREA — which matters more than it looks, because "Kharadi"
   tells a Kharadi reader this is a real local business, and that is the single
   hardest thing for a national brand to fake.

   RENDERS NOTHING WHEN THE TABLE IS EMPTY. This is one of the few sections
   where disappearing is correct: an empty testimonials block is worse than no
   testimonials block, and a placeholder quote would be a lie. */
function ProofBand({ quotes }: { quotes: Quote[] }) {
  if (!quotes.length) return null;

  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="proof-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="proof-h" className={s.bandH2}>
              From people eating it
            </h2>
          </div>
          <p className={s.bandLede}>
            Every one of these is a row in the database with a result and a plan
            attached, not a line a copywriter wrote for a stock photograph.
          </p>
        </div>

        <ul className={s.quotes}>
          {quotes.map((q) => (
            <li key={q.id} data-reveal="up">
              <blockquote className={s.quoteText}>{q.quote}</blockquote>
              <p className={s.quoteWho}>
                <b>{q.name}</b>
                <span>{q.location}</span>
              </p>
              <p className={s.quoteMeta}>
                <span className={s.quoteResult}>{q.resultLabel}</span>
                <span>{q.planLabel}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 2c. The rotation ────────────────────────────────────────────────
   app/_web/Behind.tsx has argued "nothing repeats for sixty days" in prose
   since it was written, and no surface has ever shown a single day of it. This
   is seven real days of the one plan of 126 with a seeded schedule.

   A <table>, and not as a fallback. This is about as tabular as data gets —
   seven days down, four meals across — and a grid of divs cannot be walked by
   assistive tech. app/_hp/Week.tsx makes the same call for the same reason.

   RENDERS NOTHING WHEN THE QUERY COMES BACK EMPTY. A rotation band carrying
   invented dish names would falsify the exact claim it exists to prove. */
function WeekBand({ week, recipes }: { week: Dish[]; recipes: number }) {
  if (!week.length) return null;

  const days = [...new Set(week.map((d) => d.day))].sort((a, b) => a - b);
  if (!days.length) return null;

  const at = (day: number, slot: string) =>
    week.find((d) => d.day === day && d.slot === slot);
  /* Counted, not claimed: how many DIFFERENT dishes these seven days hold. If
     the seed ever repeats one, this figure drops and says so. */
  const distinct = new Set(week.map((d) => d.name)).size;
  const dayKcal = (day: number) =>
    week.filter((d) => d.day === day).reduce((n, d) => n + (d.kcal ?? 0), 0);

  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="week-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="week-h" className={s.bandH2}>
              A week you can read before you buy it
            </h2>
          </div>
          <p className={s.bandLede}>
            Seven real days of the weight-loss plan, out of the database.{" "}
            {distinct} different dishes across {days.length} days — every recipe
            carries a rotation group, so a plan cannot serve you the same lunch
            twice in two months.
          </p>
        </div>

        <div className={s.specWrap} data-reveal="up">
          <table className={s.spec}>
            <caption className="fk-sr-only">
              Seven days of the weight-loss vegetarian plan, four meals a day,
              with each day&apos;s total calories.
            </caption>
            <thead>
              <tr>
                <th scope="col">Day</th>
                {SLOT_ORDER.map((slot) => (
                  <th key={slot} scope="col">
                    {SLOT_LABEL[slot] ?? slot}
                  </th>
                ))}
                <th scope="col" className={s.specUs}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <th scope="row">Day {day}</th>
                  {SLOT_ORDER.map((slot) => {
                    const dish = at(day, slot);
                    return (
                      <td key={slot}>
                        {dish ? (
                          <>
                            <b className={s.weekDish}>{dish.name}</b>
                            {dish.kcal ? (
                              <span className={`${s.weekKcal} fk-num`}>
                                {Math.round(dish.kcal)} kcal
                              </span>
                            ) : null}
                          </>
                        ) : (
                          /* An em dash, never a plausible dish name. */
                          <span aria-label="not scheduled">—</span>
                        )}
                      </td>
                    );
                  })}
                  <td className={`${s.specMine} fk-num`}>
                    {dayKcal(day).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className={s.weekNoteFoot}>
          {recipes.toLocaleString("en-IN")} recipes are written this way so far —
          each one a production sheet carrying its station, its numbered steps,
          its temperatures and its allergens, which is also how a second kitchen
          in a second city cooks food that tastes the same.{" "}
          <Link href="/plans">See the full thirty days</Link>.
        </p>
      </div>
    </section>
  );
}

/* ── 7c. Every surface, listed ────────────────────────────────────────
   app/_hp/Inside.tsx — and also the content the redesign quietly dropped:
   Platform.tsx carried eight of these as rows and was replaced by four stat
   columns, so `/` went from naming eleven dashboard screens to naming none.

   A DIRECTORY, not eleven feature blocks. Inside's own comment: giving each of
   these a section is exactly how the last homepage reached 39,708px and 35
   headings. Ten rows cost one screen; ten cards would have cost ten. */
function SurfacesBand() {
  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="inside-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="inside-h" className={s.bandH2}>
              What you get after you order
            </h2>
          </div>
          <p className={s.bandLede}>
            Ordering lunch is the smallest thing here. Every one of these is a
            screen that already exists, with the figure that proves it beside it.
          </p>
        </div>

        <ul className={s.surfaces}>
          {SURFACES.map((sv) => (
            <li key={sv.href} data-reveal="left">
              <Link href={sv.href}>
                <b className={`${s.surfaceStat} fk-num`}>{sv.stat}</b>
                <span className={s.surfaceBody}>
                  <b>{sv.name}</b>
                  <span>{sv.desc}</span>
                </span>
                <svg
                  className={s.surfaceGo}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 3. Beyond the menu ─────────────────────────────────────────────────────
   Three destinations with a photograph, four without. The seven were the
   "Everything else the kitchen runs" row; they are the same seven, laid out so
   the three we can actually show a picture of get one. */
function ServicesBand() {
  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="services-h">
      <div className={s.bandWrap}>
        <h2 id="services-h" className={s.bandH2}>
          Everything else the kitchen runs
        </h2>

        <div className={s.trioGrid}>
          {TRIO.map((t) => (
            <Link key={t.href} href={t.href} className={s.trioCard} data-tilt data-reveal="up">
              <Image
                src={t.img}
                alt=""
                fill
                sizes="(min-width: 900px) 33vw, 100vw"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
              <span className={s.trioScrim} aria-hidden="true" />
              <span className={s.trioBody}>
                <span className={`${s.trioStat} fk-num`}>{t.stat}</span>
                <b className={s.trioLabel}>{t.label}</b>
                <span className={s.trioBlurb}>{t.blurb}</span>
              </span>
            </Link>
          ))}
        </div>

        <ul className={s.minorGrid}>
          {MINOR.map((m) => (
            <li key={m.href} data-reveal="up">
              <Link href={m.href} className={s.minorCard}>
                <span aria-hidden="true" className={s.minorIdx}>
                  {m.idx}
                </span>
                <span className={`${s.minorStat} fk-num`}>{m.stat}</span>
                <b className={s.minorLabel}>{m.label}</b>
                <span className={s.minorBlurb}>{m.blurb}</span>
                <span className={s.minorRows}>
                  {m.rows.map((r) => (
                    <span key={r}>
                      <i aria-hidden="true" />
                      {r}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 4. Build the plan ──────────────────────────────────────────────────────
   FOUR CHOICES, AND THE ARITHMETIC IN THE OPEN.

   Every rupee here comes from the seeded PlanPrice matrix passed down from the
   server, run through lib/pricing-decomposition for GST — the same two modules
   /plans and checkout use. The saving row is measured against the one-week rate
   for the same meal combo, so it is a real comparison rather than a percentage
   somebody typed. Premium and Luxury have no MealPlan rows yet, so they price
   as estimates and their button says so instead of taking money. */
/* planCount went with the "126 plans" eyebrow. The count is still on the page
   — the platform band leads with it, and the close offers "See the N plans". */
function PlanBand({ prices }: { prices: PriceRow[] }) {
  const [duration, setDuration] = useState<DurationKey>("ONE_MONTH");
  const [diet, setDiet] = useState<DietKey>("VEG");
  const [meals, setMeals] = useState<MealKey>("BREAKFAST_LUNCH");
  const [tier, setTier] = useState<Tier>("STANDARD");

  const sum = useMemo(() => {
    /* The matrix is keyed on the legacy diet enum, not the app's key. */
    const dietRows = prices.filter((p) => p.diet === DIET_ENUM[diet]);
    const rows = dietRows.length ? dietRows : prices;

    const price = getTierPrice(rows, tier, duration, meals);
    const weekly = getTierPrice(rows, tier, "WEEKLY", meals);
    const days = DURATIONS.find((d) => d.key === duration)?.days ?? 30;
    const perDayMeals = MEALS_PER_DAY[meals];
    const mealCount = days * perDayMeals;

    if (price === null) return null;

    const money = decomposePrice({ subtotalRs: price, duration });
    const perMeal = Math.round(price / mealCount);
    /* A week is 7 days of the same combo, so its per-meal rate is the honest
       "no commitment" baseline the longer lengths are cheaper than. */
    const weeklyPerMeal = weekly === null ? null : Math.round(weekly / (7 * perDayMeals));
    const saved = weeklyPerMeal === null ? 0 : Math.max(0, (weeklyPerMeal - perMeal) * mealCount);

    return {
      perMeal,
      mealCount,
      subtotal: price,
      gst: money.gstRs,
      total: money.totalRs,
      perDay: Math.round(money.totalRs / days),
      saved,
      days,
    };
  }, [prices, diet, duration, meals, tier]);

  const tierMeta = TIERS.find((t) => t.key === tier)!;
  const dietMeta = DIETS.find((d) => d.key === diet)!;
  const mealMeta = MEALS.find((m) => m.key === meals)!;
  const durMeta = DURATIONS.find((d) => d.key === duration)!;

  /* ONLY `diet` SURVIVES THE JOURNEY. app/plans/page.tsx reads `diet` and
     `trial` and nothing else, so the dur / meal / tier this link used to carry
     were dropped on arrival — a URL that looks like it hands over the
     configuration and does not. Sending the one parameter that is actually
     read, and the button says "see the plans" rather than implying the build
     travels with it. Carrying the rest properly means a plan has to be chosen
     first, which is what /plans is for. */
  const href = `/plans?diet=${dietMeta.legacy}`;

  /* A render HELPER, not a component. Declaring a component inside render gives
     it a new identity every pass, so React unmounts and remounts the whole axis
     on each click — replaying entrance animations and dropping the pressed
     button out from under the pointer. Returning nodes from a plain function
     has none of that. */
  function axisRow<K extends string>(opts: {
    label: string;
    options: { key: K; label: string }[];
    value: K;
    onPick: (k: K) => void;
    render?: (key: K, label: string) => React.ReactNode;
  }) {
    return (
      <div className={s.axis}>
        <span className={s.axisLabel}>{opts.label}</span>
        <div className={s.axisOpts}>
          {opts.options.map((o) => (
            <button
              key={o.key}
              type="button"
              className={`${s.axisBtn} ${opts.value === o.key ? s.axisOn : ""}`}
              onClick={() => opts.onPick(o.key)}
              aria-pressed={opts.value === o.key}
            >
              {opts.render ? opts.render(o.key, o.label) : o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="plan-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="plan-h" className={s.bandH2}>
              Build the plan, see the arithmetic
            </h2>
          </div>
          <p className={s.bandLede}>
            Four choices make the plan. Nothing is hidden until checkout — the
            per-meal rate, what the length saves you and the total all move as
            you pick.
          </p>
        </div>

        <div className={s.planGrid}>
          <div className={s.planAxes}>
            {axisRow({
              label: "01 · Length",
              options: DURATIONS.filter((d) => BUILD_DURATIONS.includes(d.key)).map((d) => ({
                key: d.key,
                label: d.label,
              })),
              value: duration,
              onPick: setDuration,
            })}
            {axisRow({
              label: "02 · Diet",
              options: DIETS.map((d) => ({ key: d.key, label: d.label })),
              value: diet,
              onPick: setDiet,
              /* FSSAI colour convention, and never the sole signal — the dot
                 always sits beside its word. */
              render: (key, label) => (
                <>
                  <i
                    aria-hidden="true"
                    className={s.dietDot}
                    style={{ background: DIETS.find((d) => d.key === key)?.dot }}
                  />
                  {label}
                </>
              ),
            })}
            {axisRow({
              label: "03 · Meals a day",
              options: MEALS.map((m) => ({ key: m.key, label: m.label })),
              value: meals,
              onPick: setMeals,
            })}

            <div className={s.axis}>
              <span className={s.axisLabel}>04 · Tier</span>
              <div className={s.tierOpts}>
                {TIERS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`${s.tierBtn} ${tier === t.key ? s.tierOn : ""}`}
                    onClick={() => setTier(t.key)}
                    aria-pressed={tier === t.key}
                  >
                    <b>{t.label}</b>
                    <span>{t.tagline}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={s.planSum}>
            <span className={s.planSumKicker}>Your plan</span>
            <b className={s.planSumLine}>
              {tierMeta.label} · {dietMeta.label} · {mealMeta.label} · {durMeta.label}
            </b>
            <span className={s.planSumNote}>{tierMeta.tagline}</span>

            {sum ? (
              <>
                <span className={s.planRows}>
                  <span>
                    Per meal
                    <b className="fk-num">{rs(sum.perMeal)}</b>
                  </span>
                  <span>
                    Meals cooked
                    <b className="fk-num">{sum.mealCount.toLocaleString("en-IN")}</b>
                  </span>
                  <span>
                    Subtotal
                    <b className="fk-num">{rs(sum.subtotal)}</b>
                  </span>
                  <span>
                    GST 5%
                    <b className="fk-num">{rs(sum.gst)}</b>
                  </span>
                  <span>
                    {sum.saved > 0 ? "Saved against the 1-week rate" : "No length saving at 1 week"}
                    <b className={`${s.planSave} fk-num`}>
                      {sum.saved > 0 ? `− ${rs(sum.saved)}` : "—"}
                    </b>
                  </span>
                </span>

                <span className={s.planTotal}>
                  <b className="fk-num">{rs(sum.total)}</b>
                  <span className="fk-num">{rs(sum.perDay)} a day</span>
                </span>

                {tierMeta.available ? (
                  <Link href={href} className={s.planCta}>
                    See {dietMeta.label.toLowerCase()} plans
                  </Link>
                ) : (
                  <Link href={href} className={`${s.planCta} ${s.planCtaGhost}`}>
                    Join the {tierMeta.label} waitlist
                  </Link>
                )}
                <span className={s.planFine}>
                  {tierMeta.available
                    ? "Delivery, packaging and 5% GST included. Pro-rata refund on unserved days."
                    : `${tierMeta.label} is priced as an estimate against Standard until those plans are cooking. Nothing is charged from here.`}
                </span>
              </>
            ) : (
              /* The matrix is missing this combination rather than the page
                 being broken. Says which, and offers the catalogue. */
              <span className={s.planFine}>
                {mealMeta.label} is not priced for {durMeta.label} yet.{" "}
                <Link href="/plans">See what is</Link>.
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** App diet key → the enum the PlanPrice rows are stored under. */
const DIET_ENUM: Record<DietKey, string> = {
  VEG: "VEGETARIAN",
  EGG: "EGGETARIAN",
  NON_VEG: "NON_VEGETARIAN",
  JAIN: "JAIN",
  VEGAN: "VEGAN",
};

/* ── 5. Cooked for a diagnosis ──────────────────────────────────────────────
   The hardest thing here for a tiffin service to copy, and the reason a
   diabetic or PCOS customer picks us over a cheaper box. */
function ConditionsBand({ counts, goalCount }: { counts: BandCounts; goalCount: number }) {
  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="cond-h">
      <div className={`${s.bandWrap} ${s.splitWrap}`}>
        <div>
          <h2 id="cond-h" className={`${s.bandH2} ${s.bandH2Narrow}`}>
            Cooked for a diagnosis
          </h2>
          <p className={s.condLede}>
            {counts.conditionPlans} of the {counts.plans} plans are built for a
            condition, across {goalCount} goals. Bring the prescription; the
            kitchen cooks to it and a dietitian reviews the plan every month.
          </p>
          <div className={s.condStats}>
            <span>
              <b data-count={counts.conditionPlans}>{counts.conditionPlans}</b>
              <span>plans for a condition</span>
            </span>
            <span>
              <b data-count={goalCount}>{goalCount}</b>
              <span>goals and conditions</span>
            </span>
            <span>
              <b>1</b>
              <span>monthly review</span>
            </span>
          </div>
        </div>
        <div>
          <ul className={s.condChips}>
            {CONDITIONS.map((c) => (
              <li key={c.label} data-reveal="scale">
                {/* Straight to the plan. See the note in home-data.ts — the
                    `?q=` these used to carry was read by nothing. */}
                <Link href={`/plans/${c.slug}`}>{c.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/plans" className={s.condMore}>
                See every plan
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── 6. The coach, and one trial day itemised ───────────────────────────────
   Left: what lib/coach/recalibration.ts does, drawn. Right: the trial receipt,
   every line of it from lib/trial-price.ts. */
function CoachBand({ trial }: { trial: HomeSectionsProps["trial"] }) {
  /* Bars plot the loss from baseline, magnified so a 0.4 kg spread is
     readable: the stall in week 3 has to be visible, not implied. */
  const base = COACH_WEEKS[0].kg;

  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="coach-h">
      <div className={`${s.bandWrap} ${s.coachWrap}`}>
        <div className={s.coachCard}>
          <h2 id="coach-h" className={s.coachH}>
            When the scale disagrees, the target moves
          </h2>
          <p className={s.coachLede}>
            A weight trend read against your goal and current target. No
            verdict, no nagging — a sum you can check. An example month:
          </p>

          <ol className={s.weekRow}>
            {COACH_WEEKS.map((w, i) => {
              const lost = base - w.kg;
              const h = Math.max(10, Math.min(100, 12 + (lost / 0.5) * 88));
              const stall = i === 2;
              return (
                <li key={w.w} data-reveal="up">
                  <span className={s.weekBar}>
                    <span
                      className={stall ? s.weekFillStall : s.weekFill}
                      style={{ height: `${h}%` }}
                    />
                  </span>
                  <span className={s.weekFig}>
                    <b className="fk-num">{w.kg.toFixed(1)} kg</b>
                    <span className="fk-num">
                      {i === 0 ? "baseline" : lost > 0 ? `−${lost.toFixed(1)} kg` : "+0.1 kg"}
                    </span>
                  </span>
                  <span className={s.weekName}>{w.w}</span>
                  <span className={s.weekNote}>{w.note}</span>
                </li>
              );
            })}
          </ol>

          <p className={s.coachSum}>
            <span className="fk-num">2,000 kcal</span>
            <i aria-hidden="true">−</i>
            <span className="fk-num">300 kcal</span>
            <i aria-hidden="true">=</i>
            <b className="fk-num">1,700 kcal</b>
            <span className={s.coachSumNote}>
              The engine&apos;s maximum single change after the trend leaves its goal range.
            </span>
          </p>
        </div>

        <div className={s.receiptCard}>
          <span className={s.receiptKicker}>One trial day, itemised</span>
          <b className={s.receiptH}>{trial.total}, nothing added later</b>
          <span className={s.receiptRows}>
            {trial.rows.map((r) => (
              <span key={r.k}>
                {r.k}
                <b className="fk-num">{r.v}</b>
              </span>
            ))}
          </span>
          <span className={s.receiptTotal}>
            <span>You pay</span>
            <b className="fk-num">{trial.total}</b>
          </span>
          <span className={s.receiptNote}>
            No aggregator sits in the middle, so the cut that usually leaves the
            rupee stays in the food.
          </span>
        </div>
      </div>
    </section>
  );
}

/* ── 7. Where, when, and the six questions ──────────────────────────────────
   The drop schedule is the morning run, not the whole footprint — the map
   behind the location chip plots all of it, and the link says so. */
function AreasFaqBand({ areaCount, cutoffLabel }: { areaCount: number; cutoffLabel: string }) {
  const [open, setOpen] = useState(0);

  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="faq-h">
      <div className={s.bandWrap}>
        {/* ── THE MAP, ON THE PAGE ────────────────────────────────────────
            "Do we deliver to you" is the first question a cold visitor has and
            the map that answers it was reachable only by tapping the location
            chip — a full-screen sheet most people never open. It leads the band
            now, and the drop times and questions sit under it. */}
        <div className={s.mapHead}>
          <h2 id="faq-h" className={`${s.bandH2} ${s.bandH2Narrow}`}>
            Do we deliver to you?
          </h2>
          <p className={s.bandLede}>
            Cooked from 04:00 in Kharadi, at your door by 08:00. {areaCount} areas,
            one kitchen. We would rather serve east Pune properly than the whole
            city badly.
          </p>
        </div>

        <div data-reveal="up">
          <DeliveryMap />
        </div>

        <div className={s.splitWrap} style={{ marginTop: "var(--fk-s-6)" }}>
        <div>
          <h3 className={s.areaH3}>The morning run</h3>
          <ul className={s.areaList}>
            {AREA_DROPS.map((a) => (
              <li key={a.a}>
                <span>
                  <i aria-hidden="true" />
                  {a.a}
                </span>
                <b className="fk-num">{a.t}</b>
              </li>
            ))}
          </ul>
          <p className={s.areaNote}>
            Breakfast drop times for the eight busiest. Lunch runs 12:15–13:30
            across all of them — <Link href="/locations">every area and its
            times</Link>.
          </p>
        </div>

        <ul className={s.faqList}>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} data-reveal="left">
                <button
                  type="button"
                  className={s.faqBtn}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                >
                  <span className={`${s.faqN} fk-num`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={s.faqQ}>{f.q}</span>
                  <span className={isOpen ? s.faqSignOn : s.faqSign} aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <p id={`faq-a-${i}`} className={s.faqA}>
                    {f.a}
                    {/* The cutoff is modelled in lib/order-cutoff and printed at
                        the top of the page; repeating the real sentence here
                        keeps the skip answer from drifting from it. */}
                    {i === 0 ? <span className={s.faqCut}>{cutoffLabel}</span> : null}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
        </div>
      </div>
    </section>
  );
}

/* ── 8. Eat one day of it ───────────────────────────────────────────────────
   The close. One price, both actions, and the only photograph on the page
   whose job is simply to make someone hungry. */
function CtaBand({
  trialTotal,
  planCount,
  cutoffLabel,
  areaCount,
}: {
  trialTotal: string;
  planCount: number;
  cutoffLabel: string;
  areaCount: number;
}) {
  /* ── WHAT ACTUALLY HAPPENS, IN ORDER ──────────────────────────────────────
     The close was a headline, a paragraph, two buttons and a photograph — the
     shape of a landing page that has run out of things to say. Eight bands of
     evidence sat above it and it asked for the sale without naming a single
     step of what the reader is agreeing to.

     Every line below is a fact stated somewhere else on this page or modelled
     in a real module: the cutoff is lib/order-cutoff, the drop window is the
     day band's own 04:00→08:00, the area count is areas-data, and the trial
     total is lib/trial-price. Nothing here is a new promise. */
  const steps: { n: string; label: string; line: string }[] = [
    {
      n: "Tonight",
      label: "Tell us your numbers and pick two meals",
      line: `Order by ${cutoffLabel}. The target you set at the top of this page is the sheet the kitchen cooks to.`,
    },
    {
      n: "04:00",
      label: "Produce lands and your tray is weighed",
      line: "Cooked to your macros in Kharadi, on a scale, against the recipe sheet — not an eyeballed ladle.",
    },
    {
      n: "By 08:00",
      label: "Breakfast and lunch, at your door",
      line: `Our own riders across ${areaCount} areas. Your macros are ready to confirm in the diary.`,
    },
  ];

  return (
    <section className={s.close} aria-labelledby="close-h">
      <span aria-hidden="true" className={s.closeGlow} />
      <span aria-hidden="true" className={s.closeGrain} />
      <div className={s.closeWrap}>
        <div>
          <h2 id="close-h" className={s.closeH}>
            Eat one day of it before you decide.
          </h2>
          <p className={s.closeP}>
            Breakfast and lunch, weighed to your macros, delivered tomorrow
            morning. {trialTotal} all in — delivery, packaging and GST included.
            No account needed to look, nothing to cancel afterwards.
          </p>
          <div className={s.closeActions}>
            <Link href="/plans?trial=true" className={s.closeCta}>
              Start the trial — {trialTotal}
            </Link>
            <Link href="/plans" className={s.closeGhost}>
              See the {planCount.toLocaleString("en-IN")} plans
            </Link>
          </div>
        </div>
        <span className={s.closeShot}>
          <Image
            src="/images/hero-bowl.jpg"
            alt="A FitFuel plate, cooked and weighed this morning in Kharadi"
            fill
            sizes="(min-width: 900px) 320px, 60vw"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </span>
      </div>

      <ol className={s.closeSteps}>
        {steps.map((st) => (
          <li key={st.n} data-reveal="up">
            <b className={`${s.closeStepN} fk-num`}>{st.n}</b>
            <b className={s.closeStepLabel}>{st.label}</b>
            <span className={s.closeStepLine}>{st.line}</span>
          </li>
        ))}
      </ol>

      {/* The three answers people look for before paying, and each is a link to
          the page that carries the whole answer rather than a reassurance. */}
      <ul className={s.closeAssure}>
        <li>
          <Link href="/refund-policy">
            <b>Pro-rata refund</b>
            <span>Unserved days come back, on any plan length.</span>
          </Link>
        </li>
        <li>
          <Link href="/faq">
            <b>Skip any day</b>
            <span>Until the cutoff the night before. Skipped days extend the plan.</span>
          </Link>
        </li>
        <li>
          <Link href="/allergen-policy">
            <b>Allergens declared</b>
            <span>On the dish, from the production sheet — not remembered by a cook.</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
