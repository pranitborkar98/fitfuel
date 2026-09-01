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
  CONDITIONS,
  COACH_WEEKS,
  DAY_STEPS,
  FAQS,
  TRIO,
  SURFACES,
  WEDGE_COLS,
  wedgeRows,
} from "./home-data";
import type { BandCounts } from "./HomeBands";
import { useReveal } from "./useReveal";
import s from "./app.module.css";
import r from "./refresh.module.css";

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
  /** The order cutoff sentence, from lib/order-cutoff. */
  cutoffLabel: string;
};

export default function HomeSections({
  counts,
  goalCount,
  prices,
  trial,
  cutoffLabel,
}: HomeSectionsProps) {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef}>
      <DayBand />
      <PlatformBand counts={counts} goalCount={goalCount} />
      <WedgeBand counts={counts} />
      <DigitalPlansBand />
      <ProductPreviewBand counts={counts} />
      <ServicesBand />
      <PlanBand prices={prices} />
      <ConditionsBand counts={counts} goalCount={goalCount} />
      <CoachBand trial={trial} />
      <DeliveryFaqBand cutoffLabel={cutoffLabel} />
      <CtaBand
        trialTotal={trial.total}
        planCount={counts.plans}
        cutoffLabel={cutoffLabel}
      />
    </div>
  );
}

/* ── 1. The day ─────────────────────────────────────────────────────────────
   The single strongest thing we have and it was on no route: one kitchen, four
   hours, our own drivers. Every step now carries a photograph. */
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
            Your live weight, profile and goal set the calorie target. Your
            assigned kitchen turns that target into portion grams, weighs every
            meal, labels it to you and sends it with the local delivery team.
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
                {step.img?.startsWith("/images/ai/") ? (
                  <span className="fk-sr-only">
                    Illustrative AI-generated image; not a photograph of FitFuel staff or a customer.
                  </span>
                ) : null}
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
      note: "A 60-day cycle with portion sizes set from your calorie target, diet, meals and tier.",
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
          Your plan links each weighed meal to live scale readings, your
          exercise diary and the coach. When the measured weight trend moves
          away from the goal, the new calculation is shown before you accept a
          target change.
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

   The desktop keeps the full table. A phone gets one complete capability at a
   time because horizontal panning hid the FitFuel answer off-screen. */
function WedgeBand({ counts }: { counts: BandCounts }) {
  const rows = wedgeRows(counts.exercises, counts.conditionPlans);

  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="wedge-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="wedge-h" className={s.bandH2}>
              Your body sets the target. Our kitchen weighs the result.
            </h2>
          </div>
          <p className={s.bandLede}>
            A supported Bluetooth scale reads your weight live. FitFuel uses
            the saved trend with your profile, activity and goal to calculate
            and recalibrate the target. The kitchen then weighs each portion to
            the accepted number.
          </p>
        </div>

        <div className={`${s.specWrap} ${s.specDesktop}`} data-reveal="up">
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

        <ul className={s.wedgeCards} aria-label="How FitFuel compares" data-reveal="up">
          {rows.map((row) => (
            <li key={row.what}>
              <div className={s.wedgeCardHead}>
                <h3>{row.what}</h3>
                <span>FitFuel</span>
              </div>
              <p className={s.wedgeCardAnswer}>{row.us}</p>
              <dl className={s.wedgeAlternatives}>
                <div>
                  <dt>Tiffin</dt>
                  <dd>{row.tiffin}</dd>
                </div>
                <div>
                  <dt>Fitness app</dt>
                  <dd>{row.app}</dd>
                </div>
                <div>
                  <dt>Supplement</dt>
                  <dd>{row.supp}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 2c. The nationwide product ────────────────────────────────────────────
   Digital plans are not a fallback for an uncovered postcode. They are a
   product FitFuel can sell everywhere in India today, so they get a complete
   sales block instead of one small card under local kitchen services. */
function DigitalPlansBand() {
  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="digital-h">
      <div className={s.bandWrap}>
        <div className={s.digitalSplit}>
          <div className={s.digitalCopy} data-reveal="left">
            <span className={s.serviceSignal}>Available across India</span>
            <h2 id="digital-h" className={s.bandH2}>
              The full FitFuel plan, even when you cook at home.
            </h2>
            <p>
              Choose a goal or condition and get 30 planned days, measured
              recipes, per-meal macros and weekly grocery lists. Your purchase
              stays in the FitFuel dashboard, ready to download whenever you
              need it.
            </p>
            <ul className={s.digitalProofs}>
              <li>30 days planned</li>
              <li>Recipes measured in grams</li>
              <li>Macros for every meal</li>
              <li>Four weekly grocery lists</li>
            </ul>
            <div className={s.bandActions}>
              <Link className={s.bandPrimary} href="/plans/digital#digital-options">
                Explore digital plans
              </Link>
              <Link className={s.bandSecondary} href="/plans">
                Compare delivered plans
              </Link>
            </div>
          </div>

          <div className={s.digitalPack} data-reveal="scale" aria-label="Digital plan contents preview">
            <div className={s.digitalPackHead}>
              <span>
                <small>Your digital plan</small>
                <b>30-day personalised programme</b>
              </span>
              <span className={s.digitalReady}>Ready in your dashboard</span>
            </div>
            <div className={s.digitalDay}>
              <span className={s.digitalDayNo}>Day 01</span>
              <span className={s.digitalTarget}>Your calorie and macro target</span>
            </div>
            <ol className={s.digitalMeals}>
              <li>
                <span>Breakfast</span>
                <b>Measured recipe</b>
                <small>Ingredients in grams</small>
              </li>
              <li>
                <span>Lunch</span>
                <b>Per-meal macros</b>
                <small>Calories, protein, carbs and fat</small>
              </li>
              <li>
                <span>Dinner</span>
                <b>Cooking method</b>
                <small>Steps and practical substitutions</small>
              </li>
            </ol>
            <div className={s.digitalPackFoot}>
              <span><b>4 weeks</b> of grocery lists</span>
              <span><b>PDF</b> kept on your account</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 2d. Show the product ──────────────────────────────────────────────────
   The old directory named nine dashboard routes but never showed a reader
   what any of them looked like. Four compact, honest examples make the joined
   up product visible without turning the homepage into nine more screens. */
function ProductPreviewBand({ counts }: { counts: BandCounts }) {
  const more = SURFACES.filter(
    (surface) =>
      ![
        "/dashboard",
        "/dashboard/exercises",
        "/dashboard/body-metrics",
        "/dashboard/supplements",
      ].includes(surface.href),
  );

  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="inside-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="inside-h" className={s.bandH2}>
              Food, body, training and guidance in one place.
            </h2>
          </div>
          <p className={s.bandLede}>
            This is the product behind the delivery. Meals arrive pre-filled,
            scale readings build the trend, training changes the day&apos;s net
            calories and supplement research stays separate from selling stock.
          </p>
        </div>

        <ul className={s.productPreviewGrid}>
          <li data-reveal="up">
            <Link href="/dashboard" className={`${s.productPreviewCard} ${s.previewToday}`}>
              <span className={s.productPreviewHead}>
                <span>Today dashboard</span>
                <small>Example member day</small>
              </span>
              <h3>Everything for today, already joined up.</h3>
              <dl className={s.todayNumbers}>
                <div><dt>Eaten</dt><dd className="fk-num">1,430 kcal</dd></div>
                <div><dt>Exercise</dt><dd className="fk-num">280 kcal</dd></div>
                <div><dt>Net left</dt><dd className="fk-num">850 kcal</dd></div>
              </dl>
              <span className={s.todayTrack} aria-hidden="true"><i /></span>
              <span className={s.previewFoot}>Meals, delivery, water and progress on one screen</span>
            </Link>
          </li>

          <li data-reveal="up">
            <Link href="/dashboard/body-metrics" className={`${s.productPreviewCard} ${s.previewScale}`}>
              <span className={s.productPreviewHead}>
                <span>Body measurements</span>
                <small className={s.liveReading}><i aria-hidden="true" /> Example live reading</small>
              </span>
              <span className={`${s.scaleNumber} fk-num`}>78.2 <small>kg</small></span>
              <h3>Your actual weight enters the loop.</h3>
              <p>
                Weight is measured directly from a supported Bluetooth scale.
                The saved trend drives weekly recalculation. Other composition
                figures are clearly marked as estimates.
              </p>
            </Link>
          </li>

          <li data-reveal="up">
            <Link href="/dashboard/exercises" className={`${s.productPreviewCard} ${s.previewTraining}`}>
              <span className={s.productPreviewHead}>
                <span>Training</span>
                <small>{counts.exercises.toLocaleString("en-IN")} exercises</small>
              </span>
              <h3>Your session is already programmed.</h3>
              <ul className={s.trainingRows}>
                <li><span>Goblet squat</span><b>3 × 10</b></li>
                <li><span>Dumbbell press</span><b>3 × 12</b></li>
                <li><span>Plank</span><b>3 × 45 sec</b></li>
              </ul>
              <span className={s.previewFoot}>Sets, reps, load and rest feed into today</span>
            </Link>
          </li>

          <li data-reveal="up">
            <Link href="/dashboard/supplements" className={`${s.productPreviewCard} ${s.previewSupplements}`}>
              <span className={s.productPreviewHead}>
                <span>Supplements</span>
                <small>{counts.supplements.toLocaleString("en-IN")} researched</small>
              </span>
              <h3>Evidence first. Retailer choice stays yours.</h3>
              <ul className={s.supplementRows}>
                <li><span>Creatine monohydrate</span><b>Evidence</b></li>
                <li><span>Omega-3</span><b>Goal match</b></li>
                <li><span>Retailer comparison</span><b>6 stores</b></li>
              </ul>
              <span className={s.previewFoot}>FitFuel holds no supplement stock</span>
            </Link>
          </li>
        </ul>

        <nav className={s.moreSurfaces} aria-label="More FitFuel dashboard screens">
          <span>Also inside</span>
          <ul>
            {more.map((surface) => (
              <li key={surface.href}>
                <Link href={surface.href}>
                  {surface.name}
                  <span className="fk-num">{surface.stat}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ── 3. Beyond the menu ─────────────────────────────────────────────────────
   Three destinations with a photograph. Digital plans and the member product
   now have full sections above, so the old four-card text directory is removed
   rather than selling the same services twice. */
function ServicesBand() {
  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="services-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="services-h" className={s.bandH2}>
              More ways to use FitFuel.
            </h2>
          </div>
          <p className={s.bandLede}>
            Personal training, labelled office lunches and partner referrals
            connect to the same meals, targets and member account.
          </p>
        </div>

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
            Four choices make the plan. The per-meal rate, what the length saves
            you and the total all move as you pick.
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

          <div className={`${s.planSum} ${r.planSummary}`}>
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
                      {sum.saved > 0 ? `− ${rs(sum.saved)}` : "₹0"}
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
            A weight trend read against your goal and current target. You see
            the calculation before deciding whether to change anything. An
            example month:
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

/* ── 7. Delivery and the six questions ──────────────────────────────────────
   Coverage belongs to the selected address, not to a city baked into the
   homepage. The locations route owns the operational list as kitchens open. */
function DeliveryFaqBand({ cutoffLabel }: { cutoffLabel: string }) {
  const [open, setOpen] = useState(0);

  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="faq-h">
      <div className={s.bandWrap}>
        <div className={s.mapHead}>
          <h2 id="faq-h" className={`${s.bandH2} ${s.bandH2Narrow}`}>
            Check delivery near you
          </h2>
          <p className={s.bandLede}>
            Enter your address to see the FitFuel kitchen, menu and delivery
            window available in your area. New kitchens appear as they open.
          </p>
        </div>

        <div className={s.splitWrap}>
          <div data-reveal="up">
            <h3 className={s.areaH3}>What your address decides</h3>
            <ul className={s.areaList}>
              <li>
                <span>
                  <i aria-hidden="true" />
                  Kitchen
                </span>
                <b className={s.areaValue}>Nearest available</b>
              </li>
              <li>
                <span>
                  <i aria-hidden="true" />
                  Menu
                </span>
                <b className={s.areaValue}>Available locally</b>
              </li>
              <li>
                <span>
                  <i aria-hidden="true" />
                  Delivery
                </span>
                <b className={s.areaValue}>Shown before checkout</b>
              </li>
            </ul>
            <p className={s.areaNote}>
              Availability depends on the selected address.{" "}
              <Link href="/locations">
                Check current service areas and delivery windows
              </Link>
              .
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
                    <span
                      className={isOpen ? s.faqSignOn : s.faqSign}
                      aria-hidden="true"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen ? (
                    <p id={`faq-a-${i}`} className={s.faqA}>
                      {f.a}
                      {i === 0 ? (
                        <span className={s.faqCut}>{cutoffLabel}</span>
                      ) : null}
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
}: {
  trialTotal: string;
  planCount: number;
  cutoffLabel: string;
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
      line: "Your nearest FitFuel kitchen cooks from the recipe sheet and weighs every portion.",
    },
    {
      n: "By 08:00",
      label: "Breakfast and lunch, at your door",
      line: "Your delivery window is confirmed for your address. Your macros are ready in the diary.",
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
            morning. {trialTotal} includes delivery, packaging and GST. No
            account needed to look, nothing to cancel afterwards.
          </p>
          <div className={s.closeActions}>
            <Link href="/plans?trial=true" className={s.closeCta}>
              Start the trial for {trialTotal}
            </Link>
            <Link href="/plans" className={s.closeGhost}>
              See the {planCount.toLocaleString("en-IN")} plans
            </Link>
          </div>
        </div>
        <span className={s.closeShot}>
          <Image
            src="/images/brand/weekly-meal-delivery.webp"
            alt="Illustration of a weekly Indian meal delivery with four prepared meals"
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
            <span>Listed on the dish from the production sheet.</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
