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
  HOMEPAGE_CONDITIONS,
  COACH_WEEKS,
  DAY_STEPS,
  FAQS,
  SURFACES,
  WEDGE_COLS,
  wedgeRows,
} from "./home-data";
import type { BandCounts } from "./home-data";
import { useReveal } from "./useReveal";
import HomeLaunchpad from "./HomeLaunchpad";
import HomeToday from "./HomeToday";
import { ExampleCalorieChart, SampleDayVisual, WeighingFlow } from "./HomeCharts";
import productStyles from "@/app/_kitchen/product-network.module.css";
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
  /** Distinct subCategory values across the seeded plans — goals and conditions. */
  goalCount: number;
  /** The seeded PlanPrice matrix, one row per (diet × duration × meals). */
  prices: PriceRow[];
  /** The trial day, itemised by lib/pricing-decomposition. */
  trial: { rows: { k: string; v: string }[]; total: string };
  /** The order cutoff sentence, from lib/order-cutoff. */
  cutoffLabel: string;
  /** Real retailer products with evidence entries and tracked buy routes. */
  retailProducts: RetailPreview[];
};

export type RetailPreview = {
  slug: string;
  name: string;
  category: string;
  imageUrl: string;
  linkCount: number;
  buy: {
    url: string;
    label: string;
    priceRs: number | null;
  };
};

export default function HomeSections({
  counts,
  goalCount,
  prices,
  trial,
  cutoffLabel,
  retailProducts,
}: HomeSectionsProps) {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef}>
      <DashboardBand counts={counts} />
      <TrialReceiptBand trial={trial} />
      <PlanBand prices={prices} />
      <ConditionsBand counts={counts} goalCount={goalCount} />
      <DigitalPlansBand counts={counts} />
      <DayBand />
      <WedgeBand counts={counts} />
      <RetailBand products={retailProducts} counts={counts} />
      <DeliveryFaqBand cutoffLabel={cutoffLabel} />
      <CtaBand
        trialTotal={trial.total}
        /* counts.plans is the concepts count (one card per concept in the
           catalogue), not the row total — see BandCounts in home-data.ts. */
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
              From your nutrition target to your door
            </h2>
          </div>
          <p className={s.bandLede}>
            Your live weight, profile and goal set the calorie target. Your
            nearest FitFuel kitchen turns that target into portion grams, weighs every
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

        {/* The weighing process itself, as steps: the timeline above says
            when, this says how a portion is weighed. Reuses the real
            weighing photograph; no meal is drawn as a diagram. */}
        <WeighingFlow />
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
   "why not an aggregator, a tiffin, or cooking at home" after the reader has
   already scrolled past the price is answering it too late.

   The desktop keeps the full table. A phone gets one complete capability at a
   time because horizontal panning hid the FitFuel answer off-screen. */
function WedgeBand({ counts }: { counts: BandCounts }) {
  const rows = wedgeRows(counts.exercises, counts.conditionPlans);

  return (
    <section className={`${s.band2} ${s.bandWarm}`} aria-labelledby="wedge-h">
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
            your target.
          </p>
        </div>

        <div className={`${s.specWrap} ${s.specDesktop}`} data-reveal="up">
          <table className={s.spec}>
            <caption className="fk-sr-only">
              What healthy options on Zomato/Swiggy, a local tiffin, cooking
              at home and FitFuel each do
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
                  <td>{r.aggregator}</td>
                  <td>{r.tiffin}</td>
                  <td>{r.home}</td>
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
                  <dt>Zomato/Swiggy</dt>
                  <dd>{row.aggregator}</dd>
                </div>
                <div>
                  <dt>Tiffin</dt>
                  <dd>{row.tiffin}</dd>
                </div>
                <div>
                  <dt>Cooking at home</dt>
                  <dd>{row.home}</dd>
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
function DigitalPlansBand({ counts }: { counts: BandCounts }) {
  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="digital-h">
      <div className={s.bandWrap}>
        <div className={s.digitalSplit}>
          <div className={s.digitalCopy} data-reveal="left">
            <span className={s.serviceSignal}>Available across India</span>
            <h2 id="digital-h" className={s.bandH2}>
              The full FitFuel plan, even when you cook at home
            </h2>
            <p>
              Choose a goal or condition and get 30 planned days, measured
              recipes, per-meal macros and weekly grocery lists. Your purchase
              stays in the FitFuel dashboard, ready to download whenever you
              need it.
            </p>
            <ul className={s.digitalProofs}>
              <li>30 days planned</li>
              <li>
                {counts.recipes > 0
                  ? `${counts.recipes.toLocaleString("en-IN")} recipes, measured in grams`
                  : "Recipes measured in grams"}
              </li>
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

          <div className={s.digitalPack} data-reveal="scale" data-tilt aria-label="Digital plan contents preview">
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

/* ── 2d. The dashboard, in one section ─────────────────────────────────────
   2026-11-10 conversion restructure: five dashboard sections became one.
   What merged where, so no purpose vanishes silently:

   - "Daily tools" (HomeLaunchpad, was in the hero) — the six tool links,
     now the first block below. Its "Explore all services" directory is
     GONE with the strip, not merged.
   - "Today at a glance" (HomeToday, was in the hero) — the live day widget,
     guest sample day included, now the second block.
   - "A dashboard for the days between orders" (the productFeature card in
     HomeExperience) — its copy, its three steps and its dashboard-preview
     link are the section intro. Its "Explore all FitFuel services" link is
     gone with the strip.
   - "Food, body, training and guidance" (this band's old four preview
     cards) — the body-measurements and training cards stay. The Today card
     is dropped because HomeToday above IS the today view, and the
     Supplements card is dropped because supplements get one slim strip
     (RetailBand below), not a second mention here. The "Also inside"
     directory stays.
   - "AI coach and weekly review" (CoachBand's left card) — the whole coach
     block, now the last block, keeping its id="coach-h" anchor.

   The trial receipt that shared CoachBand's grid is NOT dashboard content;
   it lives on as TrialReceiptBand directly below. */
function DashboardBand({ counts }: { counts: BandCounts }) {
  const more = SURFACES.filter(
    (surface) =>
      ![
        "/dashboard",
        "/dashboard/exercises",
        "/dashboard/body-metrics",
        "/dashboard/supplements",
      ].includes(surface.href),
  );
  /* Bars plot the loss from baseline, magnified so a 0.4 kg spread is
     readable: the stall in week 3 has to be visible, not implied. */
  const base = COACH_WEEKS[0].kg;

  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="inside-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="inside-h" className={s.bandH2}>
              Your dashboard for the days between orders
            </h2>
          </div>
          <p className={s.bandLede}>
            Your food diary, meals, workouts and measurements live together. Use the daily tools with or without a delivered meal plan.
          </p>
        </div>

        <div className={s.dashboardStack}>
          <div>
            <Link href="/dashboard-preview" className={s.bandPrimary}>Try the dashboard preview</Link>
          </div>
          <ol className={productStyles.featureSteps}>
            <li><b>Know what is next</b>See planned meals, delivery days and recent order status.</li>
            <li><b>Keep a daily record</b>Log food, water, workouts and weight in your account.</li>
            <li><b>Review before changing your target</b>Use your weekly review and coach to understand progress.</li>
          </ol>

          <HomeLaunchpad />

          <HomeToday />

          <ul className={s.productPreviewGrid}>
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
                  <small>Example session · {counts.exercises.toLocaleString("en-IN")} exercises</small>
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
          </ul>

          <nav className={s.moreSurfaces} aria-label="More FitFuel dashboard screens">
            <span>Also inside</span>
            <ul>
              {more.map((surface) => (
                <li key={surface.href}>
                  <Link href={surface.href}>
                    {surface.name}
                    <span>Open</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={s.coachCard}>
            <h3 id="coach-h" className={s.coachH}>
              AI coach and weekly review, connected to your progress
            </h3>
            <p className={s.coachLede}>
              Ask the AI coach about your logged meals, workouts and progress.
              The weekly review reads your weight trend against your goal and current target. You see
              the calculation before deciding whether to change anything. An
              example month:
            </p>

            <div className={s.bandActions}>
              <button type="button" className={s.bandPrimary} onClick={() => document.getElementById("fitfuel-coach-trigger")?.click()}>Open AI coach</button>
              <Link href="/dashboard/coach" className={s.bandSecondary}>Open weekly review</Link>
            </div>
            <ol className={s.weekRow}>
              {COACH_WEEKS.map((w, i) => {
                const lost = base - w.kg;
                const h = Math.max(10, Math.min(100, 12 + (lost / 0.5) * 88));
                const stall = i === 2;
                return (
                  <li key={w.w} data-reveal="up">
                    {/* The bar is decoration: the figure beside it prints the
                        same kilograms and the same change as text, so a
                        screen reader gets the numbers once, not a shape
                        with no data followed by the same data again. */}
                    <span className={s.weekBar} aria-hidden="true">
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

          {/* The progress screen's calorie chart, as a labelled example shape:
              the weight trend above is the coach's example month, this is the
              calorie half of the same screen. */}
          <ExampleCalorieChart />
        </div>
      </div>
    </section>
  );
}

/* ── 2e. Supplements, as one slim strip ────────────────────────────────────
   2026-11-10 conversion restructure: supplements appear once on the
   homepage, here. The old band was a four-card product grid with two big
   buttons; the strip keeps the same real products (name, retailer price,
   evidence link) as one row of links plus the single browse action. The
   other supplement mentions are gone: the preview card in the old
   dashboard band, the Nutrabay card inside PartnerNetwork, and the
   supplements card in the product map. The disclosure stays: it is an
   affiliate statement, not decoration. */
function RetailBand({
  products,
  counts,
}: {
  products: RetailPreview[];
  counts: BandCounts;
}) {
  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="retail-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="retail-h" className={s.bandH2}>
              Supplements from Nutrabay, with ingredient guidance
            </h2>
          </div>
          <p className={s.bandLede}>
            Nutrabay handles payment and fulfilment. FitFuel may earn
            a commission from qualifying purchases.
          </p>
        </div>

        <nav className={s.moreSurfaces} aria-label="Nutrabay products on FitFuel">
          <span>On Nutrabay</span>
          <ul>
            {products.map((product) => (
              <li key={product.slug}>
                <Link href={`/supplements#${product.slug}`}>
                  {product.name}
                  <span>
                    {product.buy.priceRs
                      ? `₹${product.buy.priceRs.toLocaleString("en-IN")}`
                      : "See retailer"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={s.bandActions}>
          <Link href="/products" className={s.bandPrimary}>Browse {counts.marketplaceProducts.toLocaleString("en-IN")} Nutrabay products</Link>
        </div>
        <p className={s.retailDisclosure}>
          Listed prices may change. Confirm price, stock and delivery on
          Nutrabay before purchase. Ingredient guidance is not medical advice.
        </p>
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
   somebody typed. Premium and Luxury have no MealPlan rows yet, so they are
   marked Coming soon, show no prices, and their button says so instead of
   taking money. */
/* planCount went with the "plans" eyebrow. The count is still on the page
   — the platform band leads with it, and the close offers "See the N plans". */
function PlanBand({ prices }: { prices: PriceRow[] }) {
  const [duration, setDuration] = useState<DurationKey>("ONE_MONTH");
  const [diet, setDiet] = useState<DietKey>("VEG");
  const [meals, setMeals] = useState<MealKey>("BREAKFAST_LUNCH");
  const [tier, setTier] = useState<Tier>("STANDARD");

  const sum = useMemo(() => {
    /* The matrix is keyed on the legacy diet enum, not the app's key. */
    const dietRows = prices.filter((p) => p.diet === DIET_ENUM[diet]);
    const rows = dietRows;

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
      <div className={s.axis} role="group" aria-label={opts.label}>
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
    <section className={`${s.band2} ${s.bandWarm}`} aria-labelledby="plan-h">
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
                    <b>{t.label}{!t.available ? " (Coming soon)" : ""}</b>
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

            {sum && tierMeta.available ? (
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

                <Link href={href} className={s.planCta}>
                  See {dietMeta.label.toLowerCase()} plans
                </Link>
                <span className={s.planFine}>
                  Delivery, packaging and 5% GST included. Pro-rata refund on unserved days.
                </span>
              </>
            ) : sum ? (
              /* Coming soon tiers show no prices: the per-meal rate and total
                 above are Standard figures, and a multiplier of Standard is
                 not a Premium or Luxury price. */
              <>
                <Link href={href} className={`${s.planCta} ${s.planCtaGhost}`}>
                  Compare available plans
                </Link>
                <span className={s.planFine}>
                  {`${tierMeta.label} is coming soon. Nothing is charged from here.`}
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
   diabetic or PCOS customer picks us over a cheaper box.

   2026-11-10 conversion restructure: the wall shows 8 chips, not all 29.
   HOMEPAGE_CONDITIONS (home-data.ts) already applies the rules: one chip
   per plan page, no Cancer recovery or Kidney health chips on the homepage
   wall. The stats beside the wall still count the whole catalogue. */
function ConditionsBand({ counts, goalCount }: { counts: BandCounts; goalCount: number }) {
  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="cond-h">
      <div className={`${s.bandWrap} ${s.splitWrap}`}>
        <div>
          <h2 id="cond-h" className={`${s.bandH2} ${s.bandH2Narrow}`}>
            Plans for your goals and dietary needs
          </h2>
          <p className={s.condLede}>
            Explore condition-focused menus alongside fitness and lifestyle
            plans. If you have a diagnosed condition, confirm suitability with
            your clinician before ordering. A meal plan does not replace treatment.
          </p>
          {/* counts.plans and counts.conditionPlans are concept counts,
              matching the catalogue cards — see BandCounts in home-data.ts. */}
          {counts.plans > 0 ? <div className={s.condStats}>
            <span>
              <b data-count={counts.conditionPlans}>{counts.conditionPlans}</b>
              <span>plans for a condition</span>
            </span>
            <span>
              <b data-count={goalCount}>{goalCount}</b>
              <span>goals and conditions</span>
            </span>
            <span>
              <b>{counts.plans}</b>
              <span>plans in the catalogue</span>
            </span>
          </div> : null}
        </div>
        <div>
          <ul className={s.condChips}>
            {HOMEPAGE_CONDITIONS.map((c) => (
              <li key={c.label} data-reveal="scale">
                {/* Straight to the plan. See the note in home-data.ts — the
                    `?q=` these used to carry was read by nothing. */}
                <Link href={`/plans/${c.slug}`}>{c.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/plans" className={s.condMore}>
                {goalCount > 0 ? `See all ${goalCount}` : "See every plan"}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── 6. One trial day, itemised ─────────────────────────────────────────────
   2026-11-10 conversion restructure: this is what is left of CoachBand
   after the coach moved into the single dashboard section (DashboardBand
   above). The receipt is NOT dashboard content, so it keeps its own band:
   the trial, itemised from lib/trial-price.ts, with the total a customer
   actually pays. The kicker is the section heading, so a screen reader
   lands on a named section instead of an unnamed card. */
function TrialReceiptBand({ trial }: { trial: HomeSectionsProps["trial"] }) {
  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="trial-h">
      <div className={s.bandWrap}>
        <div className={s.receiptCard}>
          <h2 id="trial-h" className={s.receiptKicker}>One trial day, itemised</h2>
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
            No aggregator takes a cut, so more of what you pay goes into the food.
          </span>

          {/* What a day of it adds up to, drawn from the sample day the
              dashboard preview already shows. Plan/trial context only: no
              macro visual goes on a dish card. */}
          <SampleDayVisual />
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
     day band's own morning window, and the trial
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
      n: "Morning",
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
            Breakfast and lunch, portioned to your target, with delivery
            availability confirmed for your address. {trialTotal} includes delivery, packaging and GST. No
            account needed to look, nothing to cancel afterwards.
          </p>
          <div className={s.closeActions}>
            <Link href="/plans?trial=true" className={s.closeCta}>
              Start the trial for {trialTotal}
            </Link>
            <Link href="/plans" className={s.closeGhost}>
              {planCount > 0 ? `See the ${planCount.toLocaleString("en-IN")} plans` : "Explore meal plans"}
            </Link>
          </div>
        </div>
        <span className={s.closeShot} data-tilt>
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
