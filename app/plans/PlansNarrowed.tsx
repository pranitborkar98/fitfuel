"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, ChefHat, ChevronDown, Clock3, Info } from "lucide-react";
import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from "react";
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
import styles from "./plans-next.module.css";

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
  ready: boolean;
  /** Exact duration/meal combinations this plan can sell. */
  pricedCombos: string[];
}

interface Props {
  plans: PlanRow[];
  /** `${planId}|${duration}|${meal}` → real GST-exclusive subtotal. */
  priceByPlanCombo: Record<string, number>;
  initialDiet?: DietKey;
  initialDuration?: DurationKey;
  cutoff: string;
}

const durationLabels: Record<DurationKey, string> = {
  TRIAL_DAY: "1 day",
  WEEKLY: "1 week",
  BI_WEEKLY: "2 weeks",
  MONTHLY_EXCL_WEEKENDS: "Weekdays",
  ONE_MONTH: "1 month",
  TWO_MONTH: "2 months",
  THREE_MONTH: "3 months",
};

const mealLabels: Record<MealKey, string> = {
  BREAKFAST_LUNCH: "Breakfast + lunch",
  SNACK_DINNER: "Snack + dinner",
  ALL_FOUR: "All four meals",
};

const mealCounts: Record<MealKey, number> = {
  BREAKFAST_LUNCH: 2,
  SNACK_DINNER: 2,
  ALL_FOUR: 4,
};

const categoryLabels: Record<PlanRow["category"], string> = {
  STANDARD: "Everyday goal",
  LIFESTYLE_MEDICAL: "Condition support",
  SPORTS: "Sports nutrition",
};

const PLAN_FOOD = [
  "/images/ai/recipes/maharashtrian-moong-dal-chilla-with-green.webp",
  "/images/ai/recipes/chettinad-cauliflower-steak-with-black-pepper.webp",
  "/images/ai/recipes/rajasthani-makhana-chaat-with-tamarind-chutney.webp",
  "/images/ai/recipes/north-indian-palak-paneer-with-jowar.webp",
] as const;

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

function OptionGroup<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: { key: T; label: string; marker?: string }[];
  onChange: (value: T) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((option) => option.key === value);

  function move(e: KeyboardEvent<HTMLDivElement>) {
    const direction =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? 1
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? -1
          : 0;
    if (!direction) return;
    e.preventDefault();
    const next = (selectedIndex + direction + options.length) % options.length;
    onChange(options[next].key);
    refs.current[next]?.focus();
  }

  return (
    <fieldset className={styles.optionGroup}>
      <legend>{legend}</legend>
      <div role="radiogroup" aria-label={legend} className={styles.options} onKeyDown={move}>
        {options.map((option, index) => {
          const selected = value === option.key;
          return (
            <button
              key={option.key}
              ref={(element) => { refs.current[index] = element; }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              className={selected ? `${styles.option} ${styles.optionSelected}` : styles.option}
              onClick={() => onChange(option.key)}
            >
              {option.marker ? <span className={styles.dietMarker} style={{ background: option.marker }} aria-hidden="true" /> : null}
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function conceptName(plan: PlanRow) {
  return plan.displayName.split(/\s+—\s+|,\s*/)[0].trim();
}

export default function PlansNarrowed({
  plans,
  priceByPlanCombo,
  initialDiet = "VEG",
  initialDuration = "ONE_MONTH",
  cutoff,
}: Props) {
  const [diet, setDiet] = useState<DietKey>(initialDiet);
  const [duration, setDuration] = useState<DurationKey>(initialDuration);
  const [meals, setMeals] = useState<MealKey>(
    initialDuration === "TRIAL_DAY" ? "BREAKFAST_LUNCH" : "ALL_FOUR",
  );
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const selectionKey = `${duration}|${meals}`;
  const selectedDiet = DIETS.find((item) => item.key === diet)!;
  const selectedDuration = DURATIONS.find((item) => item.key === duration)!;
  const dietPlans = useMemo(
    () => plans.filter((plan) => plan.diet === diet),
    [plans, diet],
  );
  const orderable = useCallback(
    (plan: PlanRow) => plan.ready && plan.pricedCombos.includes(selectionKey),
    [selectionKey],
  );
  const orderedPlans = useMemo(
    () => [...dietPlans].sort((a, b) => Number(orderable(b)) - Number(orderable(a))),
    [dietPlans, orderable],
  );
  const selectedPlan =
    dietPlans.find((plan) => plan.slug === selectedSlug) ??
    orderedPlans.find(orderable) ??
    orderedPlans[0];
  const selectedCanOrder = selectedPlan ? orderable(selectedPlan) : false;
  const shownPlans = showAll ? orderedPlans : orderedPlans.slice(0, 8);
  const readyCount = orderedPlans.filter(orderable).length;
  const subtotal = selectedPlan
    ? priceByPlanCombo[`${selectedPlan.id}|${duration}|${meals}`] ?? null
    : null;
  const breakdown = subtotal === null ? null : decomposePrice({ subtotalRs: subtotal, duration });

  const checkoutHref =
    selectedPlan && selectedCanOrder && subtotal !== null
      ? buildCheckoutUrl({
          dietaryVariant: diet,
          duration,
          mealCombo: meals,
          priceRs: subtotal,
          planSlug: selectedPlan.slug,
          planName: selectedPlan.name,
          tier: "STANDARD",
        })
      : null;

  const trialPlan = orderedPlans.find((plan) => priceByPlanCombo[`${plan.id}|TRIAL_DAY|BREAKFAST_LUNCH`] !== undefined);
  const trialSubtotal = trialPlan
    ? priceByPlanCombo[`${trialPlan.id}|TRIAL_DAY|BREAKFAST_LUNCH`]
    : null;
  const trialTotal = trialSubtotal === null
    ? null
    : decomposePrice({ subtotalRs: trialSubtotal, duration: "TRIAL_DAY" }).totalRs;

  function chooseDiet(next: DietKey) {
    setDiet(next);
    setSelectedSlug(null);
  }

  return (
    <main className={`${styles.page} fk`}>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.serviceLine}><ChefHat size={18} /> Meal plans cooked in Pune</span>
              <h1>Choose what fits your day.</h1>
            </div>
            <div className={styles.heroCopy}>
              <p>Choose your diet, delivery length, meals and purpose. The price shown comes from that exact stored plan combination.</p>
              <span><Clock3 size={16} /> Order cut-off {cutoff}</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.builderSection} aria-labelledby="builder-title">
        <div className={styles.wrap}>
          <div className={styles.builderIntro}>
            <p className="fk-eyebrow">Three plain choices</p>
            <h2 id="builder-title">Build the shape of your plan.</h2>
          </div>

          <div className={styles.builderGrid}>
            <div className={styles.controls}>
              <OptionGroup
                legend="How do you eat?"
                value={diet}
                onChange={chooseDiet}
                options={DIETS.map((item) => ({ key: item.key, label: item.label, marker: item.dot }))}
              />
              <OptionGroup
                legend="How long do you want it?"
                value={duration}
                onChange={setDuration}
                options={DURATIONS.map((item) => ({ key: item.key, label: durationLabels[item.key] }))}
              />
              <OptionGroup
                legend="Which meals should arrive?"
                value={meals}
                onChange={setMeals}
                options={MEALS.map((item) => ({ key: item.key, label: mealLabels[item.key] }))}
              />
            </div>

            <aside className={styles.priceCard} aria-label="Selected plan price">
              <span>Your all-in price</span>
              {breakdown ? (
                <>
                  <strong className="fk-num">{money(breakdown.totalRs)}</strong>
                  <p>{selectedDiet.label} · {durationLabels[duration]} · {mealLabels[meals]}</p>
                  <div className={styles.priceFacts}>
                    <div><span>Per day</span><strong>{money(breakdown.totalRs / selectedDuration.days)}</strong></div>
                    <div><span>Per meal</span><strong>{money(breakdown.totalRs / (selectedDuration.days * mealCounts[meals]))}</strong></div>
                  </div>
                  <dl className={styles.receipt}>
                    <div><dt>Food</dt><dd>{money(breakdown.baseRs)}</dd></div>
                    <div><dt>Delivery</dt><dd>{money(breakdown.deliveryRs)}</dd></div>
                    <div><dt>Packaging</dt><dd>{money(breakdown.packagingRs)}</dd></div>
                    <div><dt>GST ({breakdown.gstPercent}%)</dt><dd>{money(breakdown.gstRs)}</dd></div>
                  </dl>
                  <a href="#plan-list" className="fk-btn fk-btn-primary">Choose the food <ArrowRight size={18} /></a>
                </>
              ) : (
                <div className={styles.noPrice}>
                  <Info size={20} />
                  <p>This combination is not priced yet. Try another length or meal set.</p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <section id="plan-list" className={styles.planSection} aria-labelledby="plan-list-title">
        <div className={styles.wrap}>
          <div className={styles.planHeader}>
            <div>
              <p className="fk-eyebrow">Now choose the purpose</p>
              <h2 id="plan-list-title">The food behind your goal.</h2>
              <p>
                {readyCount > 0
                  ? `${readyCount} ${readyCount === 1 ? "plan is" : "plans are"} ready for this exact combination. Other concepts stay visible while their menus are prepared.`
                  : "No plan is kitchen-ready for this exact combination yet. You can still explore every concept."}
              </p>
            </div>
            <span className={styles.selectionSummary}>{selectedDiet.label} · {mealLabels[meals]}</span>
          </div>

          <div className={styles.planLayout}>
            <div className={styles.planGrid} role="radiogroup" aria-label="Choose a meal plan">
              {shownPlans.map((plan, index) => {
                const active = selectedPlan?.slug === plan.slug;
                const canOrder = orderable(plan);
                return (
                  <article key={plan.id} className={active ? `${styles.planCard} ${styles.planCardSelected}` : styles.planCard}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setSelectedSlug(plan.slug)}
                      className={styles.planChoice}
                    >
                      <span className={styles.planPhoto}>
                        <Image
                          src={PLAN_FOOD[index % PLAN_FOOD.length]}
                          alt=""
                          fill
                          sizes="(max-width: 680px) 100vw, (max-width: 1180px) 50vw, 340px"
                        />
                        <span className={styles.photoShade} aria-hidden="true" />
                        <small>Illustrative menu preview</small>
                      </span>
                      <span className={styles.planCopy}>
                        <span className={canOrder ? styles.available : styles.preparing}>
                          {canOrder ? <BadgeCheck size={15} /> : <Clock3 size={15} />}
                          {canOrder ? "Kitchen-ready" : "Menu in preparation"}
                        </span>
                        <span className={styles.category}>{categoryLabels[plan.category]}</span>
                        <strong>{conceptName(plan)}</strong>
                        <span className={styles.tagline}>{plan.tagline}</span>
                        <span className={styles.macros}>{plan.kcal.toLocaleString("en-IN")} kcal · {plan.protein}g protein</span>
                      </span>
                    </button>
                    <Link href={`/plans/${plan.slug}`}>Read plan details <ArrowRight size={15} /></Link>
                  </article>
                );
              })}
            </div>

            <aside className={styles.selectionCard}>
              <span>Selected plan</span>
              <h3>{selectedPlan ? conceptName(selectedPlan) : "No plan found"}</h3>
              {selectedPlan ? <p>{selectedPlan.tagline}</p> : null}
              {selectedPlan ? (
                <div className={styles.selectedMacros}>
                  <span><strong>{selectedPlan.kcal.toLocaleString("en-IN")}</strong> kcal/day</span>
                  <span><strong>{selectedPlan.protein}g</strong> protein</span>
                  <span><strong>{selectedPlan.cycleDays}</strong> menu days</span>
                </div>
              ) : null}
              {checkoutHref && breakdown ? (
                <Link href={checkoutHref} className="fk-btn fk-btn-primary">
                  Continue · {money(breakdown.totalRs)} <ArrowRight size={18} />
                </Link>
              ) : selectedPlan ? (
                <>
                  <div className={styles.unavailableNote}><Clock3 size={18} /> This menu or price is not published for your exact choices yet.</div>
                  <Link href={`/plans/${selectedPlan.slug}`} className="fk-btn fk-btn-secondary">Explore this plan</Link>
                </>
              ) : null}
            </aside>
          </div>

          {orderedPlans.length > 8 ? (
            <button type="button" className={styles.showAll} onClick={() => setShowAll((value) => !value)} aria-expanded={showAll}>
              {showAll ? "Show fewer plans" : `Show all ${orderedPlans.length} ${selectedDiet.label.toLowerCase()} plans`}
              <ChevronDown size={18} className={showAll ? styles.chevronOpen : ""} />
            </button>
          ) : null}
        </div>
      </section>

      <section className={styles.trialSection}>
        <div className={styles.wrap}>
          <div className={styles.trialCard}>
            <div>
              <p className="fk-eyebrow">Try the loop for one day</p>
              <h2>{trialTotal === null ? "Start with breakfast and lunch." : `Breakfast and lunch for ${money(trialTotal)}.`}</h2>
              <p>One delivery day, one chosen window, everything included. Nothing to cancel.</p>
            </div>
            <button
              type="button"
              className="fk-btn fk-btn-primary"
              onClick={() => {
                setDuration("TRIAL_DAY");
                setMeals("BREAKFAST_LUNCH");
                document.getElementById("builder-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Price the trial day <ArrowRight size={18} />
            </button>
          </div>
          <p className={styles.gstNote}>Every total on this page includes delivery, packaging and 5% GST.</p>
        </div>
      </section>
    </main>
  );
}
