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
} from "./home-data";
import type { BandCounts } from "./HomeBands";
import { useReveal } from "./useReveal";
import s from "./app.module.css";

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** The eyebrow every band opens with: a hairline, then four words in lime. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className={s.eyebrow}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}

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
};

export default function HomeSections({
  counts,
  goalCount,
  prices,
  trial,
  areaCount,
  cutoffLabel,
}: HomeSectionsProps) {
  const revealRef = useReveal<HTMLDivElement>();

  return (
    <div ref={revealRef}>
      <DayBand />
      <PlatformBand counts={counts} goalCount={goalCount} />
      <ServicesBand />
      <PlanBand prices={prices} planCount={counts.plans} />
      <ConditionsBand counts={counts} goalCount={goalCount} />
      <CoachBand trial={trial} />
      <AreasFaqBand areaCount={areaCount} cutoffLabel={cutoffLabel} />
      <CtaBand trialTotal={trial.total} planCount={counts.plans} />
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
            <Eyebrow>The day</Eyebrow>
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
                    <span>kcal logged for you</span>
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
        <Eyebrow>The platform</Eyebrow>
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

/* ── 3. Beyond the menu ─────────────────────────────────────────────────────
   Three destinations with a photograph, four without. The seven were the
   "Everything else the kitchen runs" row; they are the same seven, laid out so
   the three we can actually show a picture of get one. */
function ServicesBand() {
  return (
    <section className={`${s.band2} ${s.bandSurface}`} aria-labelledby="services-h">
      <div className={s.bandWrap}>
        <Eyebrow>Beyond the menu</Eyebrow>
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
function PlanBand({ prices, planCount }: { prices: PriceRow[]; planCount: number }) {
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

  const href =
    `/plans?dur=${durMeta.legacy}&meal=${mealMeta.legacy}` +
    `&diet=${dietMeta.legacy}&tier=${tier}`;

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
            <Eyebrow>{planCount.toLocaleString("en-IN")} plans</Eyebrow>
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
                    Start this plan
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
          <Eyebrow>Clinical</Eyebrow>
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
              <li key={c} data-reveal="scale">
                <Link href={`/plans?q=${encodeURIComponent(c)}`}>{c}</Link>
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
          <Eyebrow>The coach</Eyebrow>
          <h2 id="coach-h" className={s.coachH}>
            When the scale disagrees, the target moves
          </h2>
          <p className={s.coachLede}>
            Four weigh-ins, read against what you actually ate. No verdict, no
            nagging — a sum you can check. An example month:
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
            <span className="fk-num">160 kcal</span>
            <i aria-hidden="true">=</i>
            <b className="fk-num">1,840 kcal</b>
            <span className={s.coachSumNote}>
              Two 80-kcal steps after a three-week stall.
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
      <div className={`${s.bandWrap} ${s.splitWrap}`}>
        <div>
          <Eyebrow>Where and when</Eyebrow>
          <h2 id="faq-h" className={`${s.bandH2} ${s.bandH2Narrow}`}>
            Eight morning drops, one kitchen
          </h2>
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
            Breakfast drop times. Lunch runs 12:15–13:30 across all eight, and we
            deliver to {areaCount} suburbs in all —{" "}
            <Link href="/locations">see the map</Link>.
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
    </section>
  );
}

/* ── 8. Eat one day of it ───────────────────────────────────────────────────
   The close. One price, both actions, and the only photograph on the page
   whose job is simply to make someone hungry. */
function CtaBand({ trialTotal, planCount }: { trialTotal: string; planCount: number }) {
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
            Nothing to cancel afterwards.
          </p>
          <div className={s.closeActions}>
            <Link href="/checkout" className={s.closeCta}>
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
    </section>
  );
}
