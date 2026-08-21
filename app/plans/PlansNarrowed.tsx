// app/plans/PlansNarrowed.tsx
//
// /plans, narrowed to three choices and one number.
//
// WHAT THIS REPLACES. PlansCatalog was a configurator, a three-tier price
// table with two waitlist CTAs, a search box, four category filters and a
// 114-card grid, each card carrying its own price. Five decisions before the
// food, and a per-card price that made the page look like the plan was what
// you were buying. It is not: diet, length and meals a day are the only three
// inputs the seeded matrix reads, and every plan in the kitchen costs the same
// once those three are set.
//
// So the three inputs sit in one hairline-jointed block, the number sits
// welded to its bottom edge with its own receipt, and the food is four columns
// underneath at that one price. Three goal archetypes fill three of them; the
// fourth is a dropdown over every plan written for a condition or a sport,
// which is where the other ~50 rows went. Nothing is hidden: the full index is
// one toggle below.
//
// The tier table is gone with the rest. Premium and Luxury are unbuilt and
// their waitlist still lives on every plan detail page, which is where someone
// reading a specific plan asks for them.
//
// Pricing is untouched: the same seeded PlanPrice rows, the same
// decomposePrice(), and buildCheckoutUrl() carries the exact combination shown
// through to checkout.
"use client";

import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";

import { decomposePrice } from "@/lib/pricing-decomposition";
import {
  DIETS,
  DURATIONS,
  MEALS,
  buildCheckoutUrl,
  type DietKey,
  type DurationKey,
  type MealKey,
} from "@/lib/plan-tier-pricing";
import { k } from "@/app/_ui/Kit";
import { DIM, INK, LIME, LIME_LIGHT, MONO, body, display, figure, label, num, sub } from "@/app/_ui/theme";
import s from "./plans.module.css";

/* ── the catalogue row, as the server sends it ──────────────────────────── */
export interface PlanRow {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  tagline: string | null;
  category: "STANDARD" | "LIFESTYLE_MEDICAL" | "SPORTS";
  subCategory: string;
  diet: DietKey;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  cycleDays: number;
}

interface Props {
  plans: PlanRow[];
  /** `${diet}|${duration}|${meal}` → the real, GST-exclusive PlanPrice.priceRs. */
  priceByCombo: Record<string, number>;
  initialDiet?: DietKey;
  initialDuration?: DurationKey;
  cutoff: string;
}

/* Chip copy. The lib labels are the admin's ("Non-Vegetarian", "Trial Day",
   "All 4 Meals"); these are the ones a customer picks between. Keys and dots
   stay with lib/plan-tier-pricing so there is still one source for both. */
const DIET_LABEL: Partial<Record<DietKey, string>> = { NON_VEG: "Non-veg" };
const DUR_LABEL: Record<DurationKey, string> = {
  TRIAL_DAY: "1 day",
  WEEKLY: "1 week",
  BI_WEEKLY: "2 weeks",
  MONTHLY_EXCL_WEEKENDS: "Mon–Fri",
  ONE_MONTH: "1 month",
  TWO_MONTH: "2 months",
  THREE_MONTH: "3 months",
};
const MEAL_LABEL: Record<MealKey, string> = {
  BREAKFAST_LUNCH: "Breakfast + lunch",
  SNACK_DINNER: "Snack + dinner",
  ALL_FOUR: "All four",
};
const MEAL_COUNT: Record<MealKey, number> = {
  BREAKFAST_LUNCH: 2,
  SNACK_DINNER: 2,
  ALL_FOUR: 4,
};

/* The three archetypes most of the goal-based rows are variations of. Accents
   are two lime values and a grey: category is never carried by hue here. */
const ARCHETYPES: { sub: string; tag: string; title: string; accent: string }[] = [
  { sub: "weight_loss", tag: "Lose fat", title: "Weight loss", accent: LIME_LIGHT },
  { sub: "muscle_gain", tag: "Build muscle", title: "Muscle gain", accent: LIME },
  { sub: "maintenance", tag: "Hold steady", title: "Balanced", accent: "var(--fk-ink-3)" },
];

/* The one amber on the site, and it is not decoration: it marks a plan our
   kitchen writes vegetarian and adapts to the selected diet on request, rather
   than cooking natively. It always sits on top of the words that say so. */
const ADAPTED = "#a3853f";

const money = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/* A row's displayName carries its diet: "PCOS / PCOD — Vegetarian", and a
   comma in the older rows. The columns and the index want the condition alone,
   because the diet is already a chip at the top of the page and repeating it
   fifty times is noise. Split on the separator only, never on a bare en dash:
   "Kids & Teen Nutrition (8–17)" and "Youth Athlete (14–18)" carry one inside
   the name itself, and a greedier pattern truncates both to "(8". This is also
   what takes the em dashes off the page. */
const concept = (displayName: string) => displayName.split(/\s+—\s+|,\s*/)[0].trim();

/* ── a chip rail, as a real radiogroup ──────────────────────────────────── */
function ChipRail<T extends string>({
  name,
  options,
  value,
  onPick,
}: {
  name: string;
  options: { key: T; label: string; dot?: string }[];
  value: T;
  onPick: (k: T) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const at = options.findIndex((o) => o.key === value);

  // Roving tabindex: a radiogroup is one tab stop and the arrows move inside
  // it. Without this the diet rail alone costs five tabs to walk past.
  function onKeyDown(e: KeyboardEvent) {
    const step =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!step) return;
    e.preventDefault();
    const next = (at + step + options.length) % options.length;
    onPick(options[next].key);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={name} className={s.chips} onKeyDown={onKeyDown}>
      {options.map((o, i) => {
        const on = o.key === value;
        return (
          <button
            key={o.key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onPick(o.key)}
            className={on ? `${s.chip} ${s.chipOn}` : s.chip}
          >
            {o.dot && <span aria-hidden="true" className={s.dot} style={{ background: o.dot }} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── a figure with its unit under it ────────────────────────────────────── */
function Readout({ value, unit, colour = INK }: { value: string; unit: string; colour?: string }) {
  return (
    <div>
      <b style={{ ...figure("clamp(1.5rem,3vw,2.2rem)", colour), display: "block", lineHeight: 1 }}>{value}</b>
      <span style={{ ...label(DIM), marginTop: 6, letterSpacing: "0.12em" }}>{unit}</span>
    </div>
  );
}

/* ── the shared bottom half of a column ─────────────────────────────────── */
function ColumnFoot({
  kcal,
  parts,
  p,
  c,
  f,
  href,
  price,
  primary,
}: {
  kcal: string;
  parts: { pct: number; colour: string; name: string }[];
  p: string;
  c: string;
  f: string;
  href: string | null;
  price: string;
  primary?: boolean;
}) {
  return (
    <div className={s.colFoot}>
      <div className={s.kcal}>
        <b style={figure("clamp(1.8rem,3.2vw,2.4rem)")}>{kcal}</b>
        <span style={{ ...label(DIM), letterSpacing: "0.12em" }}>kcal / day</span>
      </div>

      <span className={s.bar} aria-hidden="true">
        {parts.map((m) => (
          <span key={m.name} title={m.name} style={{ width: `${m.pct}%`, background: m.colour }} />
        ))}
      </span>
      <div className={s.macros}>
        <span>P {p}</span>
        <span>C {c}</span>
        <span>F {f}</span>
      </div>

      {href ? (
        <Link
          href={href}
          className={primary ? k.btn : k.ghost}
          style={{
            width: "100%",
            marginTop: 18,
            minHeight: 48,
            padding: 0,
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: "0.1em",
          }}
        >
          <span>Start this · {price}</span>
        </Link>
      ) : (
        <p style={{ ...body(13), color: DIM, marginTop: 18 }}>Not sold in this combination.</p>
      )}
    </div>
  );
}

/* ── the page ───────────────────────────────────────────────────────────── */
export default function PlansNarrowed({
  plans,
  priceByCombo,
  initialDiet = "VEG",
  initialDuration = "ONE_MONTH",
  cutoff,
}: Props) {
  const [diet, setDiet] = useState<DietKey>(initialDiet);
  const [dur, setDur] = useState<DurationKey>(initialDuration);
  const [meal, setMeal] = useState<MealKey>("ALL_FOUR");
  const [pick, setPick] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const priceRef = useRef<HTMLElement | null>(null);

  const dietMeta = DIETS.find((d) => d.key === diet)!;
  const durMeta = DURATIONS.find((d) => d.key === dur)!;
  const dietLabel = DIET_LABEL[diet] ?? dietMeta.label;
  const mealCount = MEAL_COUNT[meal];
  const days = durMeta.days;

  const priceFor = (d: DietKey, u: DurationKey, m: MealKey): number | null =>
    priceByCombo[`${d}|${u}|${m}`] ?? priceByCombo[`VEG|${u}|${m}`] ?? null;

  const subtotal = priceFor(diet, dur, meal);
  const b = subtotal === null ? null : decomposePrice({ subtotalRs: subtotal, duration: dur });
  const total = b ? money(b.totalRs) : "n/a";

  /* One day, all four meals, GST in: the figure the trial band advertises has
     to be the figure checkout collects, so it is derived, never typed. */
  const trialSubtotal = priceFor(diet, "TRIAL_DAY", "ALL_FOUR");
  const trialTotal =
    trialSubtotal === null
      ? null
      : decomposePrice({ subtotalRs: trialSubtotal, duration: "TRIAL_DAY" }).totalRs;

  const macroBar = (p: PlanRow) => {
    const tot = p.protein * 4 + p.carbs * 4 + p.fat * 9 || 1;
    return [
      { pct: Math.round(((p.protein * 4) / tot) * 100), colour: LIME_LIGHT, name: `Protein ${p.protein} g` },
      { pct: Math.round(((p.carbs * 4) / tot) * 100), colour: "var(--fk-ink-3)", name: `Carbohydrate ${p.carbs} g` },
      { pct: Math.round(((p.fat * 9) / tot) * 100), colour: "var(--fk-line-strong)", name: `Fat ${p.fat} g` },
    ];
  };

  /* Jain and vegan carry a handful of native rows and share the rest with the
     vegetarian kitchen, so a column falls back to the plan it is cooked from
     rather than going blank. Some of those native rows file themselves under
     their own subCategory ("jain", "vegan_muscle"), hence goalOf(). */
  const goalOf = (p: PlanRow) => {
    const t = `${p.subCategory} ${p.displayName}`;
    if (/muscle|bulk|gain/i.test(t)) return "muscle_gain";
    if (/loss|lean|cut|fat/i.test(t)) return "weight_loss";
    return "maintenance";
  };
  const forDiet = (subCat: string): PlanRow | undefined =>
    plans.find((p) => p.subCategory === subCat && p.diet === diet) ??
    plans.find((p) => p.category === "STANDARD" && p.diet === diet && goalOf(p) === subCat) ??
    plans.find((p) => p.subCategory === subCat && p.diet === "VEG") ??
    plans.find((p) => p.subCategory === subCat);

  /* One row per condition or sport: the row cooked for this diet if it exists,
     otherwise the vegetarian one it is adapted from. */
  const rest = useMemo(() => {
    const byConcept = new Map<string, PlanRow>();
    for (const p of plans) {
      if (p.category === "STANDARD") continue;
      const key = p.subCategory || concept(p.displayName);
      if (p.diet === diet) byConcept.set(key, p);
      else if (p.diet === "VEG" && !byConcept.has(key)) byConcept.set(key, p);
    }
    for (const p of plans) {
      if (p.category === "STANDARD" || p.diet !== diet) continue;
      byConcept.set(p.subCategory || concept(p.displayName), p);
    }
    return Array.from(byConcept.values());
  }, [plans, diet]);

  const picked = rest.find((p) => p.slug === pick) ?? rest[0];
  const isNative = (p?: PlanRow) => !!p && p.diet === diet;

  /* "vegetarian" lowercases. "Jain" does not. */
  const dietAdj = diet === "JAIN" ? "Jain" : dietLabel.toLowerCase();
  const cooked = `Cooked ${dietAdj}`;
  const origin = (p?: PlanRow) => (isNative(p) ? cooked : "Written vegetarian, adapted");
  const originColour = (p?: PlanRow) => (isNative(p) ? DIM : ADAPTED);

  const startHref = (p?: PlanRow) =>
    p && subtotal !== null
      ? buildCheckoutUrl({
          dietaryVariant: diet,
          duration: dur,
          mealCombo: meal,
          priceRs: subtotal,
          planSlug: p.slug,
          planName: p.name,
          tier: "STANDARD",
        })
      : null;

  const columns = ARCHETYPES.map((a) => ({ ...a, plan: forDiet(a.sub) }));

  const here = columns.length + rest.length;
  const nNative = rest.filter((p) => isNative(p)).length + columns.filter((c) => isNative(c.plan)).length;
  const nAdapted = here - nNative;
  const verb = (n: number) => (n === 1 ? "is" : "are");

  const groups = useMemo(
    () =>
      DIETS.map((d) => ({
        key: d.key,
        label: DIET_LABEL[d.key] ?? d.label,
        dot: d.dot,
        items: plans.filter((p) => p.diet === d.key),
      })).filter((g) => g.items.length),
    [plans]
  );

  const toPrice = () => priceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    /* `fk` opts this subtree out of globals.css's marketing radius ban — see
       the note in PlanDetailClient. Without it every chip and card here stays
       square whatever plans.module.css says. */
    <main className="fk" style={{ background: "var(--fk-paper)", minHeight: "100vh" }}>
      <div className={s.wrap}>
        {/* ── masthead ─────────────────────────────────────────────────── */}
        <div className={s.top}>
          <div>
            <span className={s.in} style={label(DIM)}>
              Meal plans · Pune · cut-off {cutoff}
            </span>
            <h1
              className={s.in}
              style={{
                /* display() returns the Barlow Condensed ramp — 5.4rem at
                   lineHeight .84 and -.035em, the condensed hero this pass is
                   removing. Spread first so its layout keys survive, then
                   overridden with the homepage's display face. The size is the
                   plan detail page's own .h1 clamp, so the listing and the 59
                   pages it opens are set at the same scale. */
                ...display("clamp(2.6rem,6.4vw,5.4rem)"),
                fontFamily: "var(--fk-display)",
                /* display() from app/_ui/theme.ts also sets
                   textTransform:"uppercase" — the rule AGENTS.md rejects by
                   name. Overriding the face alone left the headline in
                   Newsreader CAPS, which is worse than the condensed original.
                   Any other page spreading display() has the same problem. */
                textTransform: "none",
                fontWeight: 600,
                fontSize: "clamp(2rem,1.4rem + 2.4vw,3.25rem)",
                lineHeight: 1.04,
                letterSpacing: "-0.025em",
                marginTop: 18,
                animationDelay: "0.06s",
              }}
            >
              Three choices,
              <br />
              then one price,
              <br />
              <span style={{ color: LIME }}>then the food.</span>
            </h1>
          </div>
          <p
            className={s.in}
            style={{
              ...body(),
              fontSize: "clamp(15.5px,1.5vw,17.5px)",
              maxWidth: "44ch",
              animationDelay: "0.12s",
            }}
          >
            How you eat, how long you commit and how many meals a day are the only things that change what you pay.
            Set those three and the number below is the number checkout collects, delivery, packaging and 5% GST
            included. The plan itself is free to choose.
          </p>
        </div>

        {/* ── the three choices ────────────────────────────────────────── */}
        <section aria-label="Set your plan" className={s.setter}>
          <div className={s.setRow}>
            <span className={s.setLabel}>Diet</span>
            <ChipRail
              name="Diet"
              value={diet}
              onPick={(d) => {
                setDiet(d);
                setPick(null);
              }}
              options={DIETS.map((d) => ({ key: d.key, label: DIET_LABEL[d.key] ?? d.label, dot: d.dot }))}
            />
          </div>
          <div className={s.setRow}>
            <span className={s.setLabel}>Length</span>
            <ChipRail
              name="Length"
              value={dur}
              onPick={setDur}
              options={DURATIONS.map((d) => ({ key: d.key, label: DUR_LABEL[d.key] }))}
            />
          </div>
          <div className={s.setRow}>
            <span className={s.setLabel}>Meals</span>
            <ChipRail
              name="Meals a day"
              value={meal}
              onPick={setMeal}
              options={MEALS.map((m) => ({ key: m.key, label: MEAL_LABEL[m.key] }))}
            />
          </div>
        </section>

        {/* ── the number ───────────────────────────────────────────────── */}
        <section id="n-price" ref={priceRef} aria-label="Your price" className={s.price}>
          <div className={s.priceTop}>
            <div>
              <span style={{ ...label(DIM), letterSpacing: "0.2em" }}>
                {dietLabel} · {DUR_LABEL[dur]} · {days === 1 ? "1 delivery" : `${days} deliveries`}
              </span>
              <div className={s.priceMain}>
                <b style={{ ...figure("clamp(2.8rem,7vw,5rem)"), letterSpacing: "-0.04em" }}>{total}</b>
                <span style={{ ...label(DIM), fontSize: 13, letterSpacing: "0.1em", display: "inline" }}>all in</span>
              </div>
            </div>

            <div className={s.priceSide}>
              <Readout
                value={b ? money(b.totalRs / Math.max(days * mealCount, 1)) : "n/a"}
                unit="per meal"
                colour={LIME_LIGHT}
              />
              <Readout value={b ? money(b.totalRs / days) : "n/a"} unit="per day" />
              <a href="#n-cols" className={k.btn} style={{ padding: "0 26px", letterSpacing: "0.07em" }}>
                <span>Pick the food</span>
              </a>
            </div>
          </div>

          {b && (
            <div className={s.receipt}>
              {[
                { k: "The food itself", v: money(b.baseRs) },
                { k: "Delivery, by 08:00", v: money(b.deliveryRs) },
                { k: "Sealed packaging", v: money(b.packagingRs) },
                { k: `GST at ${b.gstPercent}%`, v: money(b.gstRs) },
              ].map((r) => (
                <div key={r.k} className={s.receiptCell}>
                  <b style={{ ...num("15px"), display: "block" }}>{r.v}</b>
                  <span style={{ ...body(12.5), color: DIM, display: "block", marginTop: 5, lineHeight: 1.45 }}>
                    {r.k}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── the food ─────────────────────────────────────────────────── */}
        <div id="n-cols" className={s.colsHead}>
          <h2 style={sub("clamp(1.7rem,3.4vw,2.6rem)")}>Four ways to eat it, same price</h2>
          <span style={{ ...label(DIM), letterSpacing: "0.14em" }}>
            {dietLabel} · {mealCount} meals a day
          </span>
        </div>

        <section aria-label="Plan variations" className={s.cols}>
          {columns.map((c) => (
            <article key={c.sub} className={s.col}>
              <div>
                <span
                  style={{
                    ...label(DIM),
                    letterSpacing: "0.16em",
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                  }}
                >
                  <span aria-hidden="true" className={s.dot} style={{ background: c.accent }} />
                  {c.tag}
                </span>
                <h3 style={{ ...sub("clamp(1.5rem,2.4vw,2rem)"), lineHeight: 0.94, marginTop: 13 }}>
                  {c.plan ? (
                    <Link href={`/plans/${c.plan.slug}`} className={s.colTitle}>
                      {c.title}
                    </Link>
                  ) : (
                    c.title
                  )}
                </h3>
                <p style={{ ...body(13.5), lineHeight: 1.55, marginTop: 10 }}>{c.plan?.tagline ?? ""}</p>
                <span style={{ ...label(originColour(c.plan)), letterSpacing: "0.1em", marginTop: 10 }}>
                  {origin(c.plan)}
                </span>
              </div>

              <ColumnFoot
                kcal={c.plan ? c.plan.kcal.toLocaleString("en-IN") : "n/a"}
                parts={c.plan ? macroBar(c.plan) : []}
                p={c.plan ? `${c.plan.protein}g` : "n/a"}
                c={c.plan ? `${c.plan.carbs}g` : "n/a"}
                f={c.plan ? `${c.plan.fat}g` : "n/a"}
                href={startHref(c.plan)}
                price={total}
              />
            </article>
          ))}

          {/* The fourth column: everything written for a diagnosis or a sport,
              behind one control instead of fifty cards. */}
          <article className={s.col}>
            <div>
              <span
                style={{
                  ...label(LIME_LIGHT),
                  letterSpacing: "0.16em",
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                <span aria-hidden="true" className={s.dot} style={{ background: LIME }} />
                Written for a diagnosis
              </span>
              <h3 style={{ ...sub("clamp(1.5rem,2.4vw,2rem)"), lineHeight: 0.94, marginTop: 13 }}>
                {picked ? (
                  <Link href={`/plans/${picked.slug}`} className={s.colTitle}>
                    {concept(picked.displayName)}
                  </Link>
                ) : (
                  "By condition"
                )}
              </h3>
              <p style={{ ...body(13.5), lineHeight: 1.55, marginTop: 10 }}>{picked?.tagline ?? ""}</p>
              <span style={{ ...label(originColour(picked)), letterSpacing: "0.1em", marginTop: 10 }}>
                {origin(picked)}
              </span>
            </div>

            <label className={s.picker}>
              <span style={{ ...label(DIM), letterSpacing: "0.12em" }}>Choose one of {rest.length}</span>
              <select
                className={s.select}
                value={picked?.slug ?? ""}
                onChange={(e) => setPick(e.target.value)}
              >
                {rest.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {concept(p.displayName)}
                    {isNative(p) ? "" : "  · adapted"}
                  </option>
                ))}
              </select>
            </label>

            <ColumnFoot
              kcal={picked ? picked.kcal.toLocaleString("en-IN") : "n/a"}
              parts={picked ? macroBar(picked) : []}
              p={picked ? `${picked.protein}g` : "n/a"}
              c={picked ? `${picked.carbs}g` : "n/a"}
              f={picked ? `${picked.fat}g` : "n/a"}
              href={startHref(picked)}
              price={total}
              primary
            />
          </article>
        </section>

        {/* ── what the four columns are not showing ────────────────────── */}
        <p id="n-all" style={{ ...body(13.5), color: DIM, maxWidth: "none", marginTop: 18, scrollMarginTop: 24 }}>
          Nothing is hidden: {here} plans are orderable on {/^[AEIOU]/i.test(dietLabel) ? "an" : "a"} {dietLabel}{" "}
          diet, three goal-based ones in the columns and {rest.length} written for a condition or a sport in the
          dropdown.{" "}
          {nAdapted > 0 ? (
            <>
              Of those, {nNative} {verb(nNative)} cooked {dietAdj} in our kitchen and {nAdapted} {verb(nAdapted)}{" "}
              written vegetarian and adapted to it on request, which is what the amber line on a column means.{" "}
            </>
          ) : (
            <>Every one of them is cooked {dietAdj} in our own kitchen. </>
          )}
          Most of the catalogue&apos;s {plans.length} rows are a vegetarian and a non-veg version of the same plan, so
          switching the diet chip swaps the set rather than adding to it. Every plan runs a rotating cycle, this one
          is {picked?.cycleDays ?? 30} days, and every one is priced exactly as shown above.{" "}
          <a href="#n-cols" className={s.inlineLink}>
            Macros and the full menu
          </a>{" "}
          are public before you pay.
        </p>

        {/* ── the full index ───────────────────────────────────────────── */}
        <section aria-label="Full index" style={{ marginTop: "clamp(28px,3.4vw,44px)" }}>
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            aria-expanded={showAll}
            className={k.ghost}
            style={{
              width: "100%",
              justifyContent: "space-between",
              gap: 16,
              background: "var(--fk-surface)",
              borderColor: "var(--fk-line)",
              minHeight: 56,
              padding: "0 clamp(16px,2.2vw,24px)",
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: "0.12em",
            }}
          >
            <span>{showAll ? "Hide the full index" : "Show every plan in the kitchen"}</span>
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.12em", color: DIM }}>
              {plans.length} rows · {groups.length} diets
            </span>
          </button>

          {showAll && (
            <div className={s.groups}>
              {groups.map((g) => (
                <div key={g.key} className={s.group}>
                  <span
                    style={{ ...label(DIM), letterSpacing: "0.14em", display: "flex", alignItems: "center", gap: 9 }}
                  >
                    <span aria-hidden="true" className={s.dot} style={{ background: g.dot }} />
                    {g.label} · {g.items.length} {g.items.length === 1 ? "plan" : "plans"}
                  </span>
                  <ul className={s.items}>
                    {g.items.map((p) => (
                      <li key={p.id}>
                        <Link href={`/plans/${p.slug}`} className={s.item}>
                          <span>{concept(p.displayName)}</span>
                          <span className={s.itemKcal}>{p.kcal.toLocaleString("en-IN")} kcal</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── one day ──────────────────────────────────────────────────── */}
        <section aria-label="Trial day" className={s.trial}>
          <div>
            <h2 style={{ ...display("clamp(1.8rem,4vw,3rem)"), lineHeight: 0.9, letterSpacing: "-0.03em" }}>
              Try one day first, {trialTotal === null ? "one price" : money(trialTotal)}
            </h2>
            <p style={{ ...body(15), maxWidth: "52ch", marginTop: 12 }}>
              Four meals, tomorrow morning, weighed to the same macros as the monthly plan. No account kept, nothing
              to cancel.
            </p>
          </div>
          <button
            type="button"
            className={k.btn}
            onClick={() => {
              setDur("TRIAL_DAY");
              setMeal("ALL_FOUR");
              toPrice();
            }}
            style={{ padding: "0 30px", minHeight: 54, fontSize: 17, letterSpacing: "0.07em" }}
          >
            <span>Price the trial day</span>
          </button>
        </section>

        <div className={s.foot}>
          <span style={{ ...label(DIM), letterSpacing: "0.12em" }}>
            GST at 5% is included in every figure on this page
          </span>
        </div>
      </div>
    </main>
  );
}
