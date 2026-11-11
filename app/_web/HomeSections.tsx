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
  DAY_STEPS,
  FAQS,
  WEDGE_COLS,
  wedgeRows,
} from "./home-data";
import type { BandCounts, Quote } from "./HomeBands";
import AppPreview, { MetricGrid } from "./AppPreview";
import CoachChat from "./CoachChat";
import WeightChart from "./WeightChart";
import { SLOT_LABEL } from "../_hp/menu-types";
import {
  BODY_METRICS_18,
  GOAL_BOXES,
  HERO_METRICS_6,
  TRIAL_MEAL_IMAGES,
  buildWeightSeries,
  coachWeekSeries,
} from "./homepage-v2-data";
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
  /** Trial-day kcal total, computed from getDayOne() in the shell. 0 when no
      day-1 menu is seeded, in which case the proof strip omits the figure. */
  dayOneKcal: number;
  /** The seeded PlanPrice matrix, one row per (diet × duration × meals). */
  prices: PriceRow[];
  /** The trial day, itemised by lib/pricing-decomposition. */
  trial: { rows: { k: string; v: string }[]; total: string };
  /** The order cutoff sentence, from lib/order-cutoff. */
  cutoffLabel: string;
  /** Featured Testimonial rows, already fetched in app/page.tsx. */
  quotes: Quote[];
  /** Real retailer products with evidence entries and tracked buy routes. */
  retailProducts: RetailPreview[];
  /** Day-1 trial meals (slot, name, kcal) from getDayOne(), for the builder
      food strip and the digital-plan fan. Empty when no day-1 menu is seeded. */
  dayOne: { slot: string; name: string; kcal: number }[];
  /** Live per-box plan counts, computed in the shell from the plan rows. */
  goalBoxCounts: Record<string, number>;
  /** What a goal box does: filter the catalog to that goal and scroll to it. */
  onGoalSelect: (filter: { cat: string; query: string }) => void;
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

/* The bands are exported individually and composed in v2 order by
   FitFuelApp (hero → day → proof → trial core → catalog → app → scale →
   coach → goals → digital → product map → comparison → retail → partners →
   FAQ → close). The reveal observer lives on FitFuelApp's root, which wraps
   them all. */

/* ── 1. The day ─────────────────────────────────────────────────────────────
   The single strongest thing we have and it was on no route: one kitchen, four
   hours, our own drivers. Every step now carries a photograph. */
/* The two AI illustrations in this band are the kitchen-portioning image and
   the delivery image (PLAN §1.14): one lives under /images/brand/, so the
   /images/ai/ prefix alone does not catch both. Both get the sr-only label
   and a visible "AI illustration" caption under the image. */
const isAiStepImage = (img?: string) =>
  !!img &&
  (img.startsWith("/images/ai/") ||
    img === "/images/brand/meals-weighed-in-kitchen.webp");

export function DayBand() {
  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="day-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="day-h" className={s.bandH2}>
              Your day, hour by hour
            </h2>
          </div>
          <p className={s.bandLede}>
            Your live weight, profile and goal set the calorie target. Your
            assigned kitchen turns that target into portion grams, weighs every
            meal, labels it to you and sends it with the local delivery team.
          </p>
        </div>

        {/* Grows to full width as the band arrives — the four hours, drawn,
            with a dot at each step boundary. */}
        <span aria-hidden="true" className={s.dayRail}>
          <span data-rail="100%" />
          <span className={s.dayDot} style={{ left: "0%" }} />
          <span className={s.dayDot} style={{ left: "33.333%" }} />
          <span className={s.dayDot} style={{ left: "66.666%" }} />
          <span className={s.dayDot} style={{ left: "100%" }} />
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
                {isAiStepImage(step.img) ? (
                  <span className="fk-sr-only">
                    Illustrative AI-generated image; not a photograph of FitFuel staff or a customer.
                  </span>
                ) : null}
              </span>
              {isAiStepImage(step.img) ? (
                <span className={s.dayAi}>AI illustration</span>
              ) : null}
              <span className={s.dayBody}>
                <b className={s.dayAt}>{step.at}</b>
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
/* Desktop short answers for the matrix (≤4 words). The phone cards keep
   the full sentences from wedgeRows, verbatim. Order matches wedgeRows. */
const WEDGE_SHORTS: { tiffin: string; app: string; supp: string }[] = [
  { tiffin: "No", app: "Yes, no cooking", supp: "No" },
  { tiffin: "Yes, one menu", app: "No", supp: "No" },
  { tiffin: "No, by eye", app: "You estimate", supp: "Only the scoop" },
  { tiffin: "No", app: "What you type", supp: "No" },
  { tiffin: "No", app: "Sometimes, separate", supp: "No" },
  { tiffin: "No", app: "If you remember", supp: "No" },
  { tiffin: "No", app: "No", supp: "No" },
  { tiffin: "No", app: "Generic maths", supp: "No" },
];

/** Competitor cell mark: a yes, a no, or a partial (dash). Never the sole
    signal — the short answer always sits beside it. */
function wedgeMark(short: string): { mark: string; cls: string } {
  if (short.startsWith("Yes")) return { mark: "✓", cls: s.wedgeYes };
  if (short === "No") return { mark: "✕", cls: s.wedgeNo };
  return { mark: "–", cls: s.wedgePart };
}

export function WedgeBand({ counts }: { counts: BandCounts }) {
  const rows = wedgeRows(counts.exercises, counts.conditionPlans);

  return (
    <section className={`${s.band2} ${s.gSand}`} aria-labelledby="wedge-h">
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

        {/* Icon matrix on desktop: the question on the left, a short
            answer per competitor, the full FitFuel sentence in green. The
            phone cards below keep every full sentence. */}
        <div
          className={`${s.wedgeMatrix} ${s.specDesktop}`}
          data-reveal="up"
          role="table"
          aria-label="What a tiffin service, a fitness app, a supplement brand and FitFuel each do"
        >
          <div className={s.wedgeMatrixHead} role="row">
            <span role="columnheader">Does it</span>
            {WEDGE_COLS.map((c) => (
              <span key={c} role="columnheader">
                {c}
              </span>
            ))}
            <span role="columnheader" className={s.wedgeMatrixUs}>
              FitFuel
            </span>
          </div>
          {rows.map((r, i) => {
            const short = WEDGE_SHORTS[i] ?? { tiffin: r.tiffin, app: r.app, supp: r.supp };
            return (
              <div className={s.wedgeMatrixRow} role="row" key={r.what}>
                <span role="rowheader" className={s.wedgeMatrixQ}>
                  {r.what}
                </span>
                {(["tiffin", "app", "supp"] as const).map((k) => {
                  const m = wedgeMark(short[k]);
                  return (
                    <span role="cell" className={s.wedgeMatrixCell} key={k}>
                      <i aria-hidden="true" className={m.cls}>
                        {m.mark}
                      </i>
                      {short[k]}
                    </span>
                  );
                })}
                <span role="cell" className={`${s.wedgeMatrixCell} ${s.wedgeMatrixMine}`}>
                  <i aria-hidden="true" className={s.wedgeYes}>
                    ✓
                  </i>
                  {r.us}
                </span>
              </div>
            );
          })}
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
export function DigitalPlansBand({ dayOne }: { dayOne: HomeSectionsProps["dayOne"] }) {
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

          {/* Two fanned pages, not a diagram: the front page shows the
              real Day 01 rows from the seeded weight-loss-veg menu; the
              second page sits behind it. When no day-1 menu is seeded, the
              slots render with the honest "menu coming" note instead of
              invented dishes. */}
          <div className={s.digitalFan} data-reveal="scale" aria-label="Digital plan contents preview">
            <div className={s.digitalPageBack} aria-hidden="true">
              <span>Day 02</span>
              <span>4 weeks of grocery lists</span>
              <span>PDF kept on your account</span>
            </div>
            <div className={s.digitalPageFront}>
              <div className={s.digitalPackHead}>
                <span>
                  <small>Your digital plan</small>
                  <b>Weight loss · Veg</b>
                </span>
                <span className={s.digitalReady}>Ready in your dashboard</span>
              </div>
              <div className={s.digitalDay}>
                <span className={s.digitalDayNo}>Day 01</span>
                <span className={s.digitalTarget}>Your calorie and macro target</span>
              </div>
              {dayOne.length > 0 ? (
                <ol className={s.digitalMeals}>
                  {dayOne.map((m) => (
                    <li key={m.slot}>
                      <span>{SLOT_LABEL[m.slot as keyof typeof SLOT_LABEL] ?? m.slot}</span>
                      <b>{m.name}</b>
                      <small className="fk-num">{m.kcal} kcal</small>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className={s.planFine}>
                  The 30-day menu for this plan is published monthly and is
                  not seeded here yet.
                </p>
              )}
              <div className={s.digitalPackFoot}>
                <span><b>4 weeks</b> of grocery lists</span>
                <span><b>PDF</b> kept on your account</span>
              </div>
            </div>
            <p className={s.digitalFanLabel}>
              Preview — your plan is personalised after purchase
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Proof, restored ────────────────────────────────────────────────────────
   The three featured testimonials were fetched in app/page.tsx all along and
   only quotes[0] ever reached the screen, as the single proof line in
   HomeExperience. The other two were fetched and dropped. This band renders
   all three, verbatim — quotes, names, locations, plan and result labels —
   in the position the old proof band held, directly after the partner
   network and before the product preview. The single proof line is removed
   with it; keeping both would duplicate quotes[0] on one page. The
   Conditions half of HomeBands stays unrendered: it duplicates the
   conditions band below. */
export function ProofBand({
  quotes,
  counts,
  goalCount,
  dayOneKcal,
}: {
  quotes: Quote[];
  counts: BandCounts;
  goalCount: number;
  dayOneKcal: number;
}) {
  if (quotes.length === 0) return null;

  /* Four headline figures, all live numbers. The fourth is the summed day-1
     total from getDayOne() — shown only when a day-1 menu is seeded, never a
     typed 1,859. */
  const figures = [
    { n: counts.plans, label: "plans in the catalogue" },
    { n: goalCount, label: "goals and conditions" },
    { n: counts.conditionPlans, label: "condition plans" },
    ...(dayOneKcal > 0
      ? [{ n: dayOneKcal, label: "kcal on the trial day" }]
      : []),
  ];

  return (
    <section className={`${s.band2} ${s.bandPaper} ${s.gSand}`} aria-labelledby="proof-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="proof-h" className={s.bandH2}>
              From people eating it
            </h2>
          </div>
        </div>

        {counts.plans > 0 ? (
          <div className={s.proofNumbers}>
            {figures.map((f) => (
              <span key={f.label}>
                <b data-count={f.n}>{f.n.toLocaleString("en-IN")}</b>
                <span>{f.label}</span>
              </span>
            ))}
          </div>
        ) : null}

        <ul className={s.proofGrid}>
          {quotes.map((q) => (
            <li key={q.id} className={s.proofCard} data-reveal="up">
              <span aria-hidden="true" className={s.proofMark}>
                &ldquo;
              </span>
              <span className={s.proofResult}>{q.resultLabel}</span>
              <blockquote className={s.proofQuote}>
                &ldquo;{q.quote}&rdquo;
              </blockquote>
              <p className={s.proofWho}>
                <b>{q.name}</b>
                <span>{q.location}</span>
              </p>
              <p className={s.proofMeta}>{q.planLabel}</p>
            </li>
          ))}
        </ul>

        <div className={s.proofMore}>
          <Link href="/testimonials" className={s.bandSecondary}>
            More stories
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── 6. The app, live ─────────────────────────────────────────────────────
   MERGE A. The standalone dashboard-feature section, the product-preview
   band's four cards, HomeLaunchpad, HomeToday and the "Also inside" pill row
   were four descriptions of one product. They are all folded into the one
   working tabbed widget in AppPreview.tsx. This section is the dark band:
   the light app window inside it is the brightest thing on the page. */
export function AppSection({ counts }: { counts: BandCounts }) {
  return (
    <section className={`${s.band2} ${s.gForest}`} aria-labelledby="app-h">
      <div className={s.bandWrap}>
        <div className={s.appHead}>
          <h2 id="app-h" className={s.appH2}>
            Food, body, training and guidance in one place.
          </h2>
          <p className={s.appLede}>
            Meals arrive pre-filled, scale readings build the trend, training
            changes the day&apos;s net calories and supplement research stays
            separate from selling stock.
          </p>
        </div>

        <div data-reveal="up">
          <AppPreview counts={counts} />
        </div>

        <ol className={s.appSteps}>
          <li>
            <b>Know what is next</b>
            <span>See planned meals, delivery days and recent order status.</span>
          </li>
          <li>
            <b>Keep a daily record</b>
            <span>Log food, water, workouts and weight in your account.</span>
          </li>
          <li>
            <b>Review before changing your target</b>
            <span>Use your weekly review and coach to understand progress.</span>
          </li>
        </ol>

        <p className={s.appLinks}>
          <Link href="/dashboard-preview">Try the dashboard preview</Link>
          <Link href="/services">Explore all FitFuel services</Link>
        </p>
      </div>
    </section>
  );
}

/* ── 7. Your weight, measured ─────────────────────────────────────────────
   Split out from the old product-preview "Body measurements" card into its
   own chart-led section. The chart is the visual; the 18 readings are a tile
   grid, never a table. Until a scale-device photograph exists, no placeholder
   box is rendered. */
export function ScaleSection() {
  const [open, setOpen] = useState(false);
  return (
    <section className={`${s.band2} ${s.bandPaper}`} aria-labelledby="scale-h">
      <div className={s.bandWrap}>
        <div className={s.scaleSplit}>
          <div data-reveal="left">
            <h2 id="scale-h" className={s.bandH2}>
              Your weight enters the loop.
            </h2>
            <p className={s.bandLede}>
              Weight is measured directly from a supported Bluetooth scale.
              The saved trend drives weekly recalculation. Other composition
              figures are clearly marked as estimates.
            </p>
            <ol className={s.scaleSteps}>
              <li>
                <b>Scale</b>
                <span>Step on, in the morning</span>
              </li>
              <li>
                <b>Phone</b>
                <span>Reading lands in your diary</span>
              </li>
              <li>
                <b>Trend</b>
                <span>Thirty days draw the line</span>
              </li>
              <li>
                <b>Target</b>
                <span>Recalculated from the trend</span>
              </li>
            </ol>
            <p className={s.scaleFine}>
              Nutrition programmes, not medical treatment.{" "}
              <Link href="/medical-disclaimer">Read the medical disclaimer</Link>.
            </p>
          </div>

          <div data-reveal="up">
            <WeightChart
              series={buildWeightSeries()}
              stallDay={-10}
              label="Example member day: weight over the last 30 days."
            />
          </div>
        </div>

        <div className={s.readingsHead}>
          <h3>Body measurements</h3>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            {open ? "Show fewer readings" : "See all 18 readings"}
          </button>
        </div>
        <MetricGrid tiles={open ? BODY_METRICS_18 : HERO_METRICS_6} />
        <p className={s.metricFine}>
          Weight is the measured value. The other readings are estimates from
          the scale, labelled as estimates.
        </p>
      </div>
    </section>
  );
}

export function RetailBand({
  products,
  counts,
}: {
  products: RetailPreview[];
  counts: BandCounts;
}) {
  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="retail-h">
      <div className={s.bandWrap}>
        <div className={s.bandHead}>
          <div>
            <h2 id="retail-h" className={s.bandH2}>
              Supplements from Nutrabay, with ingredient guidance.
            </h2>
          </div>
          <p className={s.bandLede}>
            Browse the Nutrabay catalogue and read ingredient guidance where
            available. Nutrabay handles payment and fulfilment. FitFuel may earn
            a commission from qualifying purchases.
          </p>
        </div>

        <div className={s.bandActions}>
          <Link href="/products" className={s.bandPrimary}>Browse {counts.marketplaceProducts.toLocaleString("en-IN")} Nutrabay products</Link>
          <Link href="/supplements" className={s.bandSecondary}>Read the ingredient guide</Link>
        </div>
        {products.length === 0 ? (
          <p className={s.bandLede}>
            Supplement prices are confirmed on Nutrabay.
          </p>
        ) : (
        <ul className={s.retailGrid}>
          {products.map((product) => (
            <li key={product.slug} data-reveal="up">
              <article className={s.retailCard}>
                <Link
                  href={`/supplements#${product.slug}`}
                  className={s.retailImage}
                  aria-label={`Read the evidence for ${product.name}`}
                >
                  <Image
                    src={product.imageUrl}
                    alt={`Nutrabay product listed for ${product.name}`}
                    fill
                    sizes="(min-width: 1100px) 25vw, (min-width: 640px) 48vw, 100vw"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                </Link>
                <div className={s.retailBody}>
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.buy.label}</p>
                  <div className={s.retailFoot}>
                    <span>
                      <b>
                        {product.buy.priceRs
                          ? `₹${product.buy.priceRs.toLocaleString("en-IN")}`
                          : "See retailer"}
                      </b>
                      <small>
                        {product.linkCount} option{product.linkCount === 1 ? "" : "s"}
                      </small>
                    </span>
                  </div>
                  <a
                    className={s.retailBuy}
                    href={product.buy.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                  >
                    Buy
                  </a>
                  <Link className={s.retailEvidence} href={`/supplements#${product.slug}`}>
                    Evidence
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
        )}
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
   somebody typed. Premium and Luxury have no MealPlan rows yet, so they price
   as estimates and their button says so instead of taking money. */
/* planCount went with the "126 plans" eyebrow. The count is still on the page
   — the platform band leads with it, and the close offers "See the N plans". */
export function TrialCore({
  prices,
  trial,
  dayOne,
}: {
  prices: PriceRow[];
  trial: HomeSectionsProps["trial"];
  dayOne: HomeSectionsProps["dayOne"];
}) {
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
              Start with one day
            </h2>
          </div>
          <p className={s.bandLede}>
            The trial is the first step, not a summary. You get the real tray,
            the real portions, the real numbers. Then build the plan the trial
            leads into.
          </p>
        </div>

        <div className={s.trialGrid}>
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
              <b>{trial.total}</b>
            </span>
            <span className={s.receiptNote}>
              No aggregator sits in the middle, so the cut that usually leaves the
              rupee stays in the food.
            </span>
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
                    <b>{t.label}{!t.available ? " (estimate)" : ""}</b>
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

                <span className={s.planTotal} key={sum.total}>
                  <b className={s.numTween}>{rs(sum.total)}</b>
                  <span className="fk-num">{rs(sum.perDay)} a day</span>
                </span>

                {/* The day-1 food strip: what the built plan actually cooks
                    on day 1. Veg is the only seeded day-1 menu; other diets
                    get the honest "menu coming" sentence, verbatim from
                    PlanSheet, never invented dishes. */}
                {diet === "VEG" && dayOne.length > 0 ? (
                  <span className={s.foodStrip}>
                    <span className={s.foodStripLabel}>Day 1 on this diet</span>
                    {dayOne.map((m) => (
                      <span key={m.slot} className={s.foodStripItem}>
                        {TRIAL_MEAL_IMAGES[m.slot] ? (
                          <Image
                            src={TRIAL_MEAL_IMAGES[m.slot]}
                            alt=""
                            width={56}
                            height={42}
                          />
                        ) : null}
                        <span>
                          <b>{SLOT_LABEL[m.slot as keyof typeof SLOT_LABEL] ?? m.slot}</b>
                          <span>{m.name}</span>
                          <span className="fk-num">{m.kcal} kcal</span>
                        </span>
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className={s.planFine}>
                    The 30-day menu for this plan is published monthly and is
                    not seeded here yet. The macros you picked above are the
                    daily target the kitchen cooks to.
                  </span>
                )}

                {tierMeta.available ? (
                  <Link href={href} className={s.planCta}>
                    See {dietMeta.label.toLowerCase()} plans
                  </Link>
                ) : (
                  <Link href={href} className={`${s.planCta} ${s.planCtaGhost}`}>
                    Compare available plans
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

/* ── 9. Find your plan ───────────────────────────────────────────────────────
   The hardest thing here for a tiffin service to copy, and the reason a
   diabetic or PCOS customer picks us over a cheaper box. Photo goal boxes
   on top (live counts, click to filter the catalogue), the condition chips
   below. */
export function GoalsBand({
  counts,
  goalCount,
  goalBoxCounts,
  onGoalSelect,
}: {
  counts: BandCounts;
  goalCount: number;
  goalBoxCounts: Record<string, number>;
  onGoalSelect: (filter: { cat: string; query: string }) => void;
}) {
  return (
    <section className={`${s.band2} ${s.gSand}`} aria-labelledby="cond-h">
      <div className={s.bandWrap}>
        <h2 id="cond-h" className={s.bandH2}>
          Find your plan
        </h2>
        <p className={s.bandLede}>
          Explore condition-focused menus alongside fitness and lifestyle
          plans. If you have a diagnosed condition, confirm suitability with
          your clinician before ordering. A meal plan does not replace treatment.
        </p>

        <ul className={s.goalBoxes}>
          {GOAL_BOXES.map((box) => (
            <li key={box.key} data-reveal="up">
              <button
                type="button"
                className={s.goalBox}
                onClick={() => onGoalSelect(box.filter)}
              >
                <span className={s.goalBoxImg}>
                  <Image
                    src={box.img}
                    alt=""
                    width={640}
                    height={400}
                    loading="lazy"
                  />
                </span>
                <span className={s.goalBoxBody}>
                  <b>{box.label}</b>
                  <span className="fk-num">
                    {goalBoxCounts[box.key] ?? 0} plans
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

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

        <div className={s.splitWrap}>
          <div>
            <p className={s.condCount}>{CONDITIONS.length} conditions</p>
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
      </div>
    </section>
  );
}

/* ── 8. Coach ─────────────────────────────────────────────────────────────────
   Rebuilt as a real chat transcript (CoachChat) with the weight line chart
   below it. The week bars are gone — the chart carries the same weeks. The
   receipt moved to TrialCore (Merge B). */
export function CoachBand() {
  return (
    <section
      id="coach"
      className={`${s.band2} ${s.bandSurface}`}
      aria-labelledby="coach-h"
    >
      <div className={s.bandWrap}>
        <div className={s.coachSplit}>
          <div data-reveal="left">
            <h2 id="coach-h" className={s.coachH}>
              AI coach and weekly review, connected to your progress
            </h2>
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
          </div>

          <div data-reveal="up">
            <CoachChat />
            <div className={s.coachChart}>
              <WeightChart
                series={coachWeekSeries()}
                stallDay={2}
                compact
                label="Example member month: weekly weight, weeks 1 to 4."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 7. Delivery and the six questions ──────────────────────────────────────
   Coverage belongs to the selected address, not to a city baked into the
   homepage. The locations route owns the operational list as kitchens open. */
export function DeliveryFaqBand({ cutoffLabel }: { cutoffLabel: string }) {
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
                <li key={f.q} data-reveal="left" className={isOpen ? s.faqOpen : undefined}>
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
export function CtaBand({
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
    <section className={`${s.close} ${s.gForest2}`} aria-labelledby="close-h">
      <div className={s.closeWrap}>
        <div className={s.closeCopy}>
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
        <span className={s.closeShot}>
          <Image
            src="/images/brand/weekly-meal-delivery.webp"
            alt="Illustration of a weekly Indian meal delivery with four prepared meals"
            fill
            sizes="(min-width: 900px) 50vw, 100vw"
            style={{ objectFit: "cover" }}
            loading="lazy"
          />
        </span>
      </div>

      <ol className={s.closeSteps}>
        {steps.map((st) => (
          <li key={st.n} data-reveal="up">
            <b className={s.closeStepN}>{st.n}</b>
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
