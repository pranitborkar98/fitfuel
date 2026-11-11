import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { SLOT_LABEL, SLOT_ORDER, type Dish } from "@/app/_hp/menu-types";
import { servingScaleForTarget } from "@/lib/portion-personalization";
import { waLink } from "@/lib/site";

import { GOALS } from "./home-data";
import {
  TRIAL_MEAL_IMAGES,
  dayTotals,
  macroShares,
  proofLine,
} from "./homepage-v2-data";
import { MacroSplit } from "./DishVisuals";
import x from "./experience.module.css";

const ICON = {
  spark:
    "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  message: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z",
  arrow: "M7 17 17 7M8 7h9v9",
  scale: "M5 21h14M12 3v18M4 7h16M4 7l-2 6h6L4 7Zm16 0-2 6h6l-4-6Z",
  check: "m5 12 4 4L19 6",
  route: "M5 19h10a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h10M17 17l2 2-2 2M7 1 5 3l2 2",
} as const;

function Icon({ path, size = 20 }: { path: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  );
}

/* Day-1 meal images live in homepage-v2-data.ts (TRIAL_MEAL_IMAGES); the
   builder food strip uses the same map. */
const PLAN_IMAGES: Record<string, string> = TRIAL_MEAL_IMAGES;

type Target = { kcal: number; protein: number; personal: boolean };

export default function HomeExperience({
  week,
  goal,
  target,
  cutoffLabel,
  trialTotal,
  planRows,
  goalCount,
  licence,
  onBrowseMeals,
}: {
  week: Dish[];
  goal: string;
  target: Target;
  cutoffLabel: string;
  trialTotal: string;
  /** Live DB row count (126), for the proof line under the CTAs. */
  planRows: number;
  /** Distinct goals and conditions (59), for the same proof line. */
  goalCount: number;
  licence: string;
  onBrowseMeals: () => void;
}) {
  const meals = week.filter((dish) => dish.day === 1).slice(0, 4);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const mealTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeMeal = meals[activeMealIndex] ?? meals[0];
  /* ── HERO MOSAIC AUTO-ADVANCE ──────────────────────────────────────────
     The featured meal rotates every 6 seconds. A manual pick pauses it for
     30 seconds, hovering or focusing the mosaic pauses it while the visitor
     is looking, and the pause button pauses it until resumed. Reduced motion
     means manual only — no auto-advance, no count-up, no sweep. */
  const [paused, setPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const resumeAtRef = useRef(0);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    if (paused || hoverPaused || reducedMotion || meals.length < 2) return;
    const id = window.setInterval(() => {
      if (Date.now() < resumeAtRef.current) return;
      setActiveMealIndex((i) => (i + 1) % meals.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [paused, hoverPaused, reducedMotion, meals.length]);
  const selectMeal = (index: number) => {
    setActiveMealIndex(index);
    resumeAtRef.current = Date.now() + 30000;
  };
  const planKcal = meals.reduce((sum, meal) => sum + (meal.kcal ?? 0), 0);
  const serving = servingScaleForTarget({
    calorieTarget: target.kcal,
    planCalories: planKcal,
  });
  const scaledKcal = Math.round(planKcal * serving.factor);
  /* The trial day's own arithmetic, computed from the same four meals — the
     day strip under the mosaic and the proof band read these sums, never a
     typed total. */
  const dayOneTotals = dayTotals(meals);
  const dayShares = macroShares(dayOneTotals);
  const activeGoal = GOALS.find((item) => item.key === goal) ?? GOALS[1];
  const whatsapp = waLink(
    `Hi FitFuel! I want help choosing a ${activeGoal.label.toLowerCase()} plan and checking delivery to my address.`,
  );

  const moveMealFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % meals.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + meals.length) % meals.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = meals.length - 1;
    else return;

    event.preventDefault();
    setActiveMealIndex(next);
    resumeAtRef.current = Date.now() + 30000;
    mealTabRefs.current[next]?.focus();
  };

  return (
    <div className={x.home} id="main-content" aria-labelledby="home-title">
      <section className={x.hero} aria-label="FitFuel daily food app">
        <div className={x.heroCopy}>
          <p className={x.eyebrow}>
            Breakfast and lunch · {trialTotal} · Nothing to cancel.
          </p>
          <h1 id="home-title" className={x.title}>
            Chef-cooked meals, weighed to{" "}
            <span className={x.accentWord}>macros.</span>
          </h1>
          <p className={x.lede}>
            Four meals cooked in our kitchen, weighed in grams to your target,
            at your door by 8am.
          </p>

          <div className={x.heroActions}>
            <Link href="/plans?trial=true" className={x.heroPrimary}>
              Start the trial for {trialTotal}{" "}
              <Icon path={ICON.arrow} size={18} />
            </Link>
            <button
              type="button"
              className={x.heroGhost}
              onClick={onBrowseMeals}
            >
              See tonight&apos;s menu <Icon path={ICON.arrow} size={18} />
            </button>
          </div>
          <p className={x.heroProof}>
            {proofLine(planRows, goalCount, licence)}
          </p>
        </div>

        <div className={x.heroSupport}>
          <div className={x.assistance}>
            <button type="button" onClick={() => document.getElementById("fitfuel-coach-trigger")?.click()}>
              <Icon path={ICON.spark} size={18} /> Ask the AI coach
            </button>
            <a href={whatsapp} target="_blank" rel="noreferrer">
              <Icon path={ICON.message} size={18} /> Order on WhatsApp
            </a>
          </div>

          <ol className={x.operation} aria-label="How FitFuel handles your day">
            <li>
              <Icon path={ICON.scale} size={18} />
              <span>
                <b>Set</b>
                <small>Your target</small>
              </span>
            </li>
            <li>
              <Icon path={ICON.spark} size={18} />
              <span>
                <b>Calculate</b>
                <small>Calories + macros</small>
              </span>
            </li>
            <li>
              <Icon path={ICON.check} size={18} />
              <span>
                <b>Weigh</b>
                <small>Every meal</small>
              </span>
            </li>
            <li>
              <Icon path={ICON.route} size={18} />
              <span>
                <b>Adjust</b>
                <small>From progress</small>
              </span>
            </li>
          </ol>
        </div>

        <div
          className={x.menuPreview}
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
          onFocusCapture={() => setHoverPaused(true)}
          onBlurCapture={() => setHoverPaused(false)}
        >
          <div className={x.previewHead}>
            <span>
              <small>Sample four-meal day</small>
              <b>
                {meals.length ? `Portion preview · ${scaledKcal.toLocaleString("en-IN")} kcal` : "Menu preview"}
              </b>
            </span>
            <span className={x.deliveryStatus}>
              <i aria-hidden="true" /> Order by {cutoffLabel}
            </span>
          </div>

          {activeMeal ? (
            <div
              key={activeMealIndex}
              id="meal-preview-panel"
              className={x.featureMeal}
              role="tabpanel"
              aria-labelledby={`meal-preview-tab-${activeMealIndex}`}
              aria-live="polite"
            >
              <Image
                src={PLAN_IMAGES[activeMeal.slot]}
                alt={activeMeal.name}
                fill
                loading="eager"
                sizes="(max-width: 900px) 100vw, 54vw"
              />
              <span className={x.scrim} aria-hidden="true" />
              <span className={x.featureCopy}>
                <span className={x.featureRow}>
                  {/* The macro ring sits NEXT TO the photo, never instead of
                      it — the same ring as the dish cards, at 56px. */}
                  <MacroSplit
                    p={Math.round((activeMeal.protein ?? 0) * serving.factor)}
                    c={Math.round((activeMeal.carbs ?? 0) * serving.factor)}
                    f={Math.round((activeMeal.fat ?? 0) * serving.factor)}
                    kcal={Math.round((activeMeal.kcal ?? 0) * serving.factor)}
                    small
                    hideKeys
                  />
                  <span className={x.featureText}>
                    <small>{SLOT_LABEL[activeMeal.slot] ?? activeMeal.slot}</small>
                    <b>{activeMeal.name}</b>
                    <span className="fk-num">
                      {Math.round((activeMeal.kcal ?? 0) * serving.factor)} kcal ·{" "}
                      {Math.round((activeMeal.protein ?? 0) * serving.factor)}g
                      protein
                    </span>
                  </span>
                </span>
              </span>
              <span className="fk-sr-only">
                Illustrative AI-generated food image; not a photograph of the
                delivered meal.
              </span>
              <button
                type="button"
                className={x.mosaicPause}
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                aria-label={
                  paused
                    ? "Resume the meal preview"
                    : "Pause the meal preview"
                }
              >
                {paused ? "Play" : "Pause"}
              </button>
            </div>
          ) : (
            /* EMPTY-STATE FALLBACK (mandatory, not optional): no published
               week must never render an empty card. The four food photographs
               still render with slot labels only — no invented dish names, no
               invented macros — and the day strip below is replaced by one
               honest line. */
            <div
              className={x.menuFallback}
              role="group"
              aria-label="Tonight's menu is being prepared"
            >
              {SLOT_ORDER.map((slot) => (
                <span key={slot} className={x.fallbackTile}>
                  <span className={x.mealThumb}>
                    <Image
                      src={PLAN_IMAGES[slot]}
                      alt=""
                      fill
                      sizes="96px"
                    />
                  </span>
                  <span>{SLOT_LABEL[slot] ?? slot}</span>
                </span>
              ))}
              <span className="fk-sr-only">
                Illustrative AI-generated food images; not photographs of the
                delivered meals.
              </span>
            </div>
          )}

          {meals.length ? (
            <div
              className={x.mealGrid}
              role="tablist"
              aria-label="Preview all four meals"
              aria-orientation="horizontal"
            >
              {meals.map((meal, index) => (
                <button
                  key={`${meal.day}-${meal.slot}`}
                  id={`meal-preview-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-controls="meal-preview-panel"
                  aria-selected={activeMealIndex === index}
                  tabIndex={activeMealIndex === index ? 0 : -1}
                  className={
                    activeMealIndex === index ? x.mealActive : undefined
                  }
                  onClick={() => selectMeal(index)}
                  onKeyDown={(event) => moveMealFocus(event, index)}
                  ref={(element) => {
                    mealTabRefs.current[index] = element;
                  }}
                >
                  <span className={x.mealThumb}>
                    <Image
                      src={PLAN_IMAGES[meal.slot]}
                      alt=""
                      fill
                      sizes="96px"
                    />
                  </span>
                  <span>
                    <small>{SLOT_LABEL[meal.slot] ?? meal.slot}</small>
                    <b>{meal.name}</b>
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {/* The trial day as a data visual: the whole day's arithmetic
              before the visitor scrolls. Sums are computed from the same
              four meals above. */}
          {meals.length ? (
            <div className={x.dayStrip} aria-label="Today's trial day totals">
              <p className={x.dayStripHead}>
                <span>Today&apos;s trial day</span>
                <b className="fk-num">
                  {dayOneTotals.kcal.toLocaleString("en-IN")} kcal
                </b>
              </p>
              <span className={x.dayStripBar} aria-hidden="true">
                <i
                  style={{
                    width: `${dayShares.protein * 100}%`,
                    background: "var(--fk-ring-p)",
                  }}
                />
                <i
                  style={{
                    width: `${dayShares.carbs * 100}%`,
                    background: "var(--fk-ring-c)",
                  }}
                />
                <i
                  style={{
                    width: `${dayShares.fat * 100}%`,
                    background: "var(--fk-ring-f)",
                  }}
                />
              </span>
              <span className="fk-sr-only">
                {`${dayOneTotals.protein} grams protein, ${dayOneTotals.carbs} grams carbohydrate, ${dayOneTotals.fat} grams fat.`}
              </span>
              <ul className={x.dayStripChips}>
                {meals.map((meal) => (
                  <li key={meal.slot}>
                    <span>{SLOT_LABEL[meal.slot] ?? meal.slot}</span>
                    <b className="fk-num">
                      {meal.kcal ?? 0} kcal · {meal.protein ?? 0}g protein
                    </b>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={x.dayStripFallback}>
              Tonight&apos;s menu is being prepared.{" "}
              <Link href="#catalog">See the 48 dishes below.</Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export function HomeProductLinks({
  aiConfigured,
  exerciseCount,
  marketplaceProducts,
  activePartners,
  onBrowsePlans,
}: {
  aiConfigured: boolean;
  exerciseCount: number;
  marketplaceProducts: number;
  activePartners: number;
  onBrowsePlans: () => void;
}) {
  return (
    <div className={x.home}>
      <section className={x.productMap} aria-labelledby="product-map-title">
        <header className={x.productMapHead}>
          <h2 id="product-map-title">Plan the rest of your week.</h2>
          <p>
            Start with delivered food, use a nationwide digital plan, run your
            week in the member app or browse supplements on Nutrabay.
          </p>
        </header>

        <nav className={x.quickRail} aria-label="Choose a FitFuel product">
          <button type="button" onClick={onBrowsePlans}>
            <span className={x.quickPhoto}>
              <Image
                src="/images/brand/weekly-meal-delivery.webp"
                alt=""
                fill
                sizes="(min-width: 1100px) 25vw, (min-width: 640px) 50vw, 100vw"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            </span>
            <span className={x.quickBody}>
              <span>
                <small>Delivered nutrition</small>
                <b>Meals weighed to your accepted target</b>
              </span>
              <Icon path={ICON.arrow} size={17} />
            </span>
          </button>
          <Link href="/plans/digital#digital-options">
            <span className={x.quickPhoto}>
              <Image
                src="/images/brand/weekday-lunch.webp"
                alt=""
                fill
                sizes="(min-width: 1100px) 25vw, (min-width: 640px) 50vw, 100vw"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            </span>
            <span className={x.quickBody}>
              <span>
                <small>Available across India</small>
                <b>Digital plans, recipes and grocery lists</b>
              </span>
              <Icon path={ICON.arrow} size={17} />
            </span>
          </Link>
          <Link href="/dashboard-preview">
            {/* No dashboard screenshot exists, so this card carries a green-wash
                icon tile in place of a photo — never an empty well. */}
            <span className={x.quickIconArea} aria-hidden="true">
              <span className={x.quickIcon}>
                <Icon path={ICON.scale} size={24} />
              </span>
            </span>
            <span className={x.quickBody}>
              <span>
                <small>Explore the dashboard</small>
                <b>
                  Food diary, weight, {exerciseCount.toLocaleString("en-IN")} exercises and {aiConfigured ? "AI coach" : "weekly review"}
                </b>
              </span>
              <Icon path={ICON.arrow} size={17} />
            </span>
          </Link>
          <Link href="/products">
            <span className={x.quickPhoto}>
              <Image
                src="/images/supplements.jpg"
                alt=""
                fill
                sizes="(min-width: 1100px) 25vw, (min-width: 640px) 50vw, 100vw"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            </span>
            <span className={x.quickBody}>
              <span>
                <small>Supplements from Nutrabay</small>
                <b>
                  {marketplaceProducts.toLocaleString("en-IN")} products, with ingredient guidance where available
                </b>
              </span>
              <Icon path={ICON.arrow} size={17} />
            </span>
          </Link>
        </nav>

        <nav className={x.businessRail} aria-label="FitFuel for organisations">
          <Link href="/corporate">
            <span className={x.businessCopy}>
              <span>
                <span className={x.businessLabel}>For teams</span>
                <b>Labelled office meals, personalised per employee</b>
              </span>
              <Icon path={ICON.arrow} size={17} />
            </span>
            <span className={x.businessPhoto}>
              <Image
                src="/images/corporate.jpg"
                alt=""
                fill
                sizes="(min-width: 1100px) 25vw, 100vw"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            </span>
          </Link>
          <Link href="/partners">
            <span className={x.businessCopy}>
              <span>
                <span className={x.businessLabel}>For gyms and trainers</span>
                <b>
                  Referral tracking and payouts
                  {activePartners > 0
                    ? `, with ${activePartners.toLocaleString("en-IN")} active now`
                    : ""}
                </b>
              </span>
              <Icon path={ICON.arrow} size={17} />
            </span>
            <span className={x.businessPhoto}>
              <Image
                src="/images/gym.jpg"
                alt=""
                fill
                sizes="(min-width: 1100px) 25vw, 100vw"
                style={{ objectFit: "cover" }}
                loading="lazy"
              />
            </span>
          </Link>
        </nav>
      </section>

    </div>
  );
}
