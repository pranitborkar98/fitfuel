"use client";

import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowRight, Check, ChefHat, ClipboardCheck, Scale, Truck } from "lucide-react";
import { useMemo, useState } from "react";

import Breadcrumb from "@/components/Breadcrumb";
import { DELIVERY_WINDOWS } from "@/lib/delivery-windows";
import { decomposePrice } from "@/lib/pricing-decomposition";
import {
  buildCheckoutUrl,
  dietToLabel,
  DURATIONS,
  MEALS,
  type DurationKey,
  type MealKey,
} from "@/lib/plan-tier-pricing";
import { waLink } from "@/lib/site";
import { CONDITION_PLAN_BOUNDARY } from "@/lib/plan-public-copy";
import styles from "./plan-detail.module.css";

export interface Recipe {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface Slot {
  id: string;
  dayNumber: number;
  mealSlot: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
  recipe: Recipe;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  tagline?: string | null;
  whoIsItFor?: string | null;
  keyPrinciples?: string[] | null;
  whatIsAvoided?: string[] | null;
  dietaryVariant: string;
  tier: string;
  category: string;
  avgCaloriesPerDay: number;
  avgProteinGrams: number;
  avgCarbsGrams: number;
  avgFatGrams: number;
  cycleLengthDays: number;
  mealsPerDay: number;
}

export interface PriceRow {
  id: string;
  diet: string;
  duration: string;
  mealsPerDay: string;
  priceRs: number;
  mrpRs?: number | null;
}

interface Props {
  plan: Plan;
  schedule: Record<number, Slot[]>;
  prices: PriceRow[];
  isReady: boolean;
}

const SLOT_LABEL: Record<Slot["mealSlot"], string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  SNACK: "Snack",
  DINNER: "Dinner",
};

const money = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

const PLAN_HERO: Record<string, string> = {
  STANDARD: "/images/ai/recipes/maharashtrian-moong-dal-chilla-with-green.webp",
  LIFESTYLE_MEDICAL: "/images/ai/recipes/north-indian-palak-paneer-with-jowar.webp",
  SPORTS: "/images/ai/recipes/chettinad-cauliflower-steak-with-black-pepper.webp",
};

function safeImageUrl(value: string | null | undefined) {
  if (!value) return null;
  return value.startsWith("/") || /^https?:\/\//i.test(value) ? value : null;
}

export default function PlanDetailClient({ plan, schedule, prices, isReady }: Props) {
  const orderedPrices = useMemo(() => {
    const durationOrder = new Map(DURATIONS.map((item, index) => [item.key, index]));
    const mealOrder = new Map(MEALS.map((item, index) => [item.key, index]));
    return [...prices].sort(
      (a, b) =>
        (durationOrder.get(a.duration as DurationKey) ?? 99) -
          (durationOrder.get(b.duration as DurationKey) ?? 99) ||
        (mealOrder.get(a.mealsPerDay as MealKey) ?? 99) -
          (mealOrder.get(b.mealsPerDay as MealKey) ?? 99),
    );
  }, [prices]);

  const firstPrice =
    orderedPrices.find(
      (price) => price.duration === "TRIAL_DAY" && price.mealsPerDay === "BREAKFAST_LUNCH",
    ) ?? orderedPrices[0];
  const [duration, setDuration] = useState<DurationKey>(
    (firstPrice?.duration as DurationKey) ?? "TRIAL_DAY",
  );
  const [meals, setMeals] = useState<MealKey>(
    (firstPrice?.mealsPerDay as MealKey) ?? "BREAKFAST_LUNCH",
  );

  const dayNumbers = useMemo(
    () => Object.keys(schedule).map(Number).sort((a, b) => a - b),
    [schedule],
  );
  const previewDays = dayNumbers.slice(0, 7);
  const [selectedDay, setSelectedDay] = useState(previewDays[0] ?? 1);

  const availableDurations = DURATIONS.filter((item) =>
    orderedPrices.some((price) => price.duration === item.key),
  );
  const availableMeals = MEALS.filter((item) =>
    orderedPrices.some((price) => price.duration === duration && price.mealsPerDay === item.key),
  );
  const selectedPrice = orderedPrices.find(
    (price) => price.duration === duration && price.mealsPerDay === meals,
  );
  const breakdown = selectedPrice
    ? decomposePrice({ subtotalRs: selectedPrice.priceRs, duration })
    : null;
  const currentMeals = schedule[selectedDay] ?? [];
  const principles = Array.isArray(plan.keyPrinciples) ? plan.keyPrinciples : [];
  const avoided = Array.isArray(plan.whatIsAvoided) ? plan.whatIsAvoided : [];

  function chooseDuration(next: DurationKey) {
    setDuration(next);
    const nextMeals = MEALS.find((item) =>
      orderedPrices.some(
        (price) => price.duration === next && price.mealsPerDay === item.key,
      ),
    );
    if (
      nextMeals &&
      !orderedPrices.some(
        (price) => price.duration === next && price.mealsPerDay === meals,
      )
    ) {
      setMeals(nextMeals.key);
    }
  }

  const checkoutHref =
    isReady && selectedPrice
      ? buildCheckoutUrl({
          dietaryVariant: plan.dietaryVariant,
          duration,
          mealCombo: meals,
          priceRs: selectedPrice.priceRs,
          planSlug: plan.slug,
          planName: plan.name,
          tier: "STANDARD",
        })
      : null;

  return (
    <main className={`${styles.page} fk`}>
      <div className={styles.wrap}>
        <Breadcrumb trail={[{ href: "/plans", label: "Plans" }]} current={plan.name} className={styles.breadcrumb} />
      </div>

      <section className={styles.hero}>
        <div className={`${styles.wrap} ${styles.heroGrid}`}>
          <div>
            <p className={styles.kicker}>
              {dietToLabel(plan.dietaryVariant)} meal plan
              <span aria-hidden="true"> · </span>
              {isReady ? "Kitchen-ready" : "Menu in preparation"}
            </p>
            <h1>{plan.name}</h1>
            <p className={styles.deck}>
              {plan.description ?? plan.tagline ?? "A cooked meal plan with clear portions and connected tracking."}
            </p>
            <div className={styles.heroActions}>
              {isReady ? (
                <a href="#choose" className={styles.primaryButton}>
                  Choose your delivery <ArrowRight size={18} />
                </a>
              ) : (
                <a href={waLink(`Hi, please tell me when the ${plan.name} plan is kitchen-ready.`)} target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
                  Ask when it opens <ArrowRight size={18} />
                </a>
              )}
              <Link href="/plans" className={styles.secondaryButton}>Compare plans</Link>
            </div>
          </div>

          <aside className={styles.heroVisual} aria-label="Plan nutrition overview">
            <div className={styles.heroPhoto}>
              <Image
                src={PLAN_HERO[plan.category] ?? PLAN_HERO.STANDARD}
                alt=""
                fill
                priority
                sizes="(max-width: 760px) 100vw, 42vw"
              />
              <span>Illustrative menu photography</span>
            </div>
            <div className={styles.factCard}>
              <div><strong>{Math.round(plan.avgCaloriesPerDay).toLocaleString("en-IN")}</strong><span>kcal each day</span></div>
              <div><strong>{Math.round(plan.avgProteinGrams)}g</strong><span>protein each day</span></div>
              <div><strong>{plan.mealsPerDay}</strong><span>meal slots available</span></div>
              <div><strong>{plan.cycleLengthDays}</strong><span>days in the menu cycle</span></div>
            </div>
          </aside>
        </div>
      </section>

      {plan.category === "LIFESTYLE_MEDICAL" ? (
        <section className={styles.conditionBoundary} aria-label="Medical boundary">
          <div className={styles.wrap}>
            <AlertTriangle aria-hidden="true" size={22} />
            <div><strong>Food support, not treatment.</strong><p>{CONDITION_PLAN_BOUNDARY}</p></div>
          </div>
        </section>
      ) : null}

      <section className={styles.loopSection} aria-labelledby="loop-title">
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>One plan, one set of numbers</p>
          <h2 id="loop-title">The portion on your plate matches the portion in your diary.</h2>
          <p className={styles.sectionDeck}>
            Your calorie target creates one serving factor. The kitchen applies it to production quantities, and the diary applies the same factor to calories and macros.
          </p>
          <div className={styles.loopGrid}>
            <article><Scale size={24} /><h3>Your target sets the portion</h3><p>The plan starts from your calorie target instead of treating every member as the same serving.</p></article>
            <article><ChefHat size={24} /><h3>The kitchen cooks that portion</h3><p>Recipe quantities and the production list use the plan’s serving factor.</p></article>
            <article><ClipboardCheck size={24} /><h3>One tap records the same meal</h3><p>Confirm what you ate and the diary uses the same grams and macros—no manual reconstruction.</p></article>
          </div>
        </div>
      </section>

      <section className={styles.menuSection} aria-labelledby="menu-title">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Published kitchen menu</p>
              <h2 id="menu-title">See the food before you order.</h2>
            </div>
            {isReady ? <span className={styles.ready}><Check size={16} /> Menu checked for all {plan.cycleLengthDays} days</span> : null}
          </div>

          {dayNumbers.length ? (
            <>
              <div className={styles.dayTabs} role="tablist" aria-label="Menu day">
                {previewDays.map((day) => (
                  <button key={day} type="button" role="tab" aria-selected={selectedDay === day} onClick={() => setSelectedDay(day)}>
                    Day {day}
                  </button>
                ))}
              </div>
              <div className={styles.mealGrid} role="tabpanel" aria-label={`Day ${selectedDay} meals`}>
                {currentMeals.map((slot) => {
                  const imageUrl = safeImageUrl(slot.recipe.imageUrl);
                  return (
                    <article key={slot.id} className={styles.mealCard}>
                      <div className={styles.mealPhoto}>
                        {imageUrl ? (
                          // The kitchen/admin owns these URLs; a plain image keeps both local and approved remote photos usable.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={imageUrl} alt={slot.recipe.name} />
                        ) : (
                          <span>Photo added with the final kitchen listing</span>
                        )}
                      </div>
                      <div className={styles.mealBody}>
                        <span>{SLOT_LABEL[slot.mealSlot]}</span>
                        <h3>{slot.recipe.name}</h3>
                        {slot.recipe.description ? <p>{slot.recipe.description}</p> : null}
                        <div className={styles.macros}>
                          <span>{Math.round(slot.recipe.caloriesPerServing)} kcal</span>
                          <span>{Math.round(slot.recipe.proteinGrams)}g protein</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {dayNumbers.length > previewDays.length ? (
                <p className={styles.previewNote}>This is the first 7 days of the published {plan.cycleLengthDays}-day rotation.</p>
              ) : null}
            </>
          ) : (
            <div className={styles.menuPending}>
              <ChefHat size={28} />
              <div><h3>This menu is still being prepared.</h3><p>You can explore the concept, but checkout stays closed until every required day and meal has a kitchen-approved recipe and price.</p></div>
            </div>
          )}
        </div>
      </section>

      <section id="choose" className={styles.priceSection} aria-labelledby="price-title">
        <div className={`${styles.wrap} ${styles.priceGrid}`}>
          <div>
            <p className={styles.eyebrow}>Choose your plan</p>
            <h2 id="price-title">One clear total before checkout.</h2>
            <p className={styles.sectionDeck}>Pick the number of delivery days and the meals that fit your routine. Only combinations with a stored kitchen price appear here.</p>

            {orderedPrices.length ? (
              <div className={styles.choices}>
                <fieldset>
                  <legend>How long?</legend>
                  <div role="radiogroup" aria-label="Plan duration">
                    {availableDurations.map((item) => (
                      <button key={item.key} type="button" role="radio" aria-checked={duration === item.key} onClick={() => chooseDuration(item.key)}>{item.label}</button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>Which meals?</legend>
                  <div role="radiogroup" aria-label="Meals each day">
                    {availableMeals.map((item) => (
                      <button key={item.key} type="button" role="radio" aria-checked={meals === item.key} onClick={() => setMeals(item.key)}>{item.label}</button>
                    ))}
                  </div>
                </fieldset>
              </div>
            ) : (
              <div className={styles.noPrice}>Kitchen pricing has not been published for this plan yet.</div>
            )}
          </div>

          <aside className={styles.receipt} aria-live="polite">
            {breakdown ? (
              <>
                <span>Your all-in total</span>
                <strong>{money(breakdown.totalRs)}</strong>
                <p>{DURATIONS.find((item) => item.key === duration)?.label} · {MEALS.find((item) => item.key === meals)?.label}</p>
                <dl>
                  <div><dt>Food</dt><dd>{money(breakdown.baseRs)}</dd></div>
                  <div><dt>Delivery</dt><dd>{money(breakdown.deliveryRs)}</dd></div>
                  <div><dt>Packaging</dt><dd>{money(breakdown.packagingRs)}</dd></div>
                  <div><dt>GST (5%)</dt><dd>{money(breakdown.gstRs)}</dd></div>
                  <div className={styles.totalRow}><dt>Total paid</dt><dd>{money(breakdown.totalRs)}</dd></div>
                </dl>
                {checkoutHref ? (
                  <Link href={checkoutHref} className={styles.checkoutButton}>Continue to checkout <ArrowRight size={18} /></Link>
                ) : (
                  <p className={styles.unavailable}>Ordering opens after the complete menu passes the kitchen check.</p>
                )}
                <small><Truck size={14} /> Choose {DELIVERY_WINDOWS.MORNING.time} or {DELIVERY_WINDOWS.EVENING.time} at checkout.</small>
              </>
            ) : (
              <><span>Not available to order</span><strong>Price pending</strong><p>We will not invent a placeholder price.</p></>
            )}
          </aside>
        </div>
      </section>

      {(principles.length || avoided.length) ? (
        <section className={styles.detailsSection} aria-labelledby="details-title">
          <div className={`${styles.wrap} ${styles.detailsGrid}`}>
            <div><p className={styles.eyebrow}>What shapes the menu</p><h2 id="details-title">Clear choices, not diet jargon.</h2><p>{plan.whoIsItFor ?? "A practical cooked-food routine for people who want portions and tracking to agree."}</p></div>
            <div className={styles.listCard}>
              {principles.length ? <div><h3>Built around</h3><ul>{principles.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul></div> : null}
              {avoided.length ? <div><h3>Leaves out</h3><ul>{avoided.map((item) => <li key={item}><span aria-hidden="true">−</span>{item}</li>)}</ul></div> : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.faqSection} aria-labelledby="faq-title">
        <div className={styles.narrow}>
          <p className={styles.eyebrow}>Before you choose</p>
          <h2 id="faq-title">The practical questions.</h2>
          {[
            ["Can I see the menu first?", "Yes. A published schedule appears above. If the kitchen menu is incomplete, this page closes checkout instead of pretending it is ready."],
            ["How does tracking work?", "Your active-plan meals are ready in the diary. Tap “I ate this” to record the serving and its matching macros."],
            ["When is delivery?", `Choose the morning window, ${DELIVERY_WINDOWS.MORNING.time}, or the evening window, ${DELIVERY_WINDOWS.EVENING.time}, at checkout. Exact address availability is confirmed before payment.`],
            ["What about allergies?", "Declare allergies during onboarding so the kitchen can review them. Meals are made in a shared kitchen and cannot be guaranteed allergen-free; severe allergies need a doctor and kitchen conversation before ordering."],
          ].map(([question, answer]) => (
            <details key={question}><summary>{question}</summary><p>{answer}</p></details>
          ))}
        </div>
      </section>
    </main>
  );
}
