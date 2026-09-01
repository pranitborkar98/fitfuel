import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";

import { SLOT_LABEL, type Dish } from "@/app/_hp/menu-types";
import { servingScaleForTarget } from "@/lib/portion-personalization";
import { waLink } from "@/lib/site";

import { GOALS } from "./home-data";
import type { Quote } from "./HomeBands";
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

const PLAN_IMAGES: Record<string, string> = {
  BREAKFAST:
    "/images/ai/recipes/maharashtrian-moong-dal-chilla-with-green.webp",
  LUNCH:
    "/images/ai/recipes/chettinad-cauliflower-steak-with-black-pepper.webp",
  SNACK:
    "/images/ai/recipes/rajasthani-makhana-chaat-with-tamarind-chutney.webp",
  DINNER: "/images/ai/recipes/north-indian-palak-paneer-with-jowar.webp",
};

type Target = { kcal: number; protein: number; personal: boolean };

function timeGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeExperience({
  week,
  goal,
  target,
  cutoffLabel,
  trialTotal,
  aiConfigured,
  exerciseCount,
  retailerLinks,
  activePartners,
  quotes,
  onBrowseMeals,
  onBrowsePlans,
  onBrowseSupplements,
}: {
  week: Dish[];
  goal: string;
  target: Target;
  cutoffLabel: string;
  trialTotal: string;
  aiConfigured: boolean;
  exerciseCount: number;
  retailerLinks: number;
  activePartners: number;
  quotes: Quote[];
  onBrowseMeals: () => void;
  onBrowsePlans: () => void;
  onBrowseSupplements: () => void;
}) {
  const meals = week.filter((dish) => dish.day === 1).slice(0, 4);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const mealTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeMeal = meals[activeMealIndex] ?? meals[0];
  const planKcal = meals.reduce((sum, meal) => sum + (meal.kcal ?? 0), 0);
  const serving = servingScaleForTarget({
    calorieTarget: target.kcal,
    planCalories: planKcal,
  });
  const scaledKcal = Math.round(planKcal * serving.factor);
  const activeGoal = GOALS.find((item) => item.key === goal) ?? GOALS[1];
  const whatsapp = waLink(
    `Hi FitFuel! I want help choosing a ${activeGoal.label.toLowerCase()} plan and checking delivery to my address.`,
  );
  const proof = quotes[0];

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
    mealTabRefs.current[next]?.focus();
  };

  return (
    <div className={x.home} id="main-content" aria-labelledby="home-title">
      <section className={x.hero} aria-label="FitFuel daily food app">
        <div className={x.heroCopy}>
          <p className={x.eyebrow} suppressHydrationWarning>
            {timeGreeting()}
          </p>
          <h1 id="home-title" className={x.title}>
            Meals calculated for your body.
          </h1>
          <p className={x.lede}>
            Your weight is read live from a supported Bluetooth scale. Together
            with your height, age, activity and goal, it sets the calorie and
            macro target we use to weigh every meal.
          </p>

          <div className={x.heroActions}>
            <button type="button" onClick={onBrowseMeals}>
              Explore today’s food <Icon path={ICON.arrow} size={18} />
            </button>
            <Link href="/plans?trial=true">
              Try breakfast + lunch · {trialTotal}
            </Link>
          </div>
        </div>

        <div className={x.heroSupport}>
          <div className={x.assistance}>
            <Link href="/dashboard/trainer">
              <Icon path={ICON.spark} size={18} /> Ask the AI coach
            </Link>
            <a href={whatsapp} target="_blank" rel="noreferrer">
              <Icon path={ICON.message} size={18} /> Order on WhatsApp
            </a>
          </div>

          <ol className={x.operation} aria-label="How FitFuel handles your day">
            <li>
              <Icon path={ICON.scale} size={18} />
              <span>
                <b>Read live</b>
                <small>Your weight</small>
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

        <div className={x.menuPreview}>
          <div className={x.previewHead}>
            <span>
              <small>Tomorrow’s four-meal day</small>
              <b>
                {activeGoal.label} plan · {scaledKcal.toLocaleString("en-IN")}{" "}
                kcal
              </b>
            </span>
            <span className={x.deliveryStatus}>
              <i aria-hidden="true" /> Order by {cutoffLabel}
            </span>
          </div>

          {activeMeal ? (
            <div
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
                <small>{SLOT_LABEL[activeMeal.slot] ?? activeMeal.slot}</small>
                <b>{activeMeal.name}</b>
                <span className="fk-num">
                  {Math.round((activeMeal.kcal ?? 0) * serving.factor)} kcal ·{" "}
                  {Math.round((activeMeal.protein ?? 0) * serving.factor)}g
                  protein
                </span>
              </span>
              <span className="fk-sr-only">
                Illustrative AI-generated food image; not a photograph of the
                delivered meal.
              </span>
            </div>
          ) : (
            <div className={x.menuUnavailable}>
              The next published menu is being prepared.
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
                  onClick={() => setActiveMealIndex(index)}
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
        </div>
      </section>

      <section className={x.productMap} aria-labelledby="product-map-title">
        <header className={x.productMapHead}>
          <h2 id="product-map-title">One system, four ways to use it.</h2>
          <p>
            Start with delivered food, use a nationwide digital plan, run your
            week in the member app or buy an evidence-matched supplement.
          </p>
        </header>

        <nav className={x.quickRail} aria-label="Choose a FitFuel product">
          <button type="button" onClick={onBrowsePlans}>
            <span className={x.quickIcon}>
              <Icon path={ICON.route} size={20} />
            </span>
            <span>
              <small>Delivered nutrition</small>
              <b>Meals weighed to your accepted target</b>
            </span>
            <Icon path={ICON.arrow} size={17} />
          </button>
          <Link href="/plans/digital#digital-options">
            <span className={x.quickIcon}>
              <Icon path={ICON.check} size={20} />
            </span>
            <span>
              <small>Available across India</small>
              <b>Digital plans, recipes and grocery lists</b>
            </span>
            <Icon path={ICON.arrow} size={17} />
          </Link>
          <Link href="/dashboard">
            <span className={x.quickIcon}>
              <Icon path={ICON.scale} size={20} />
            </span>
            <span>
              <small>Member platform</small>
              <b>
                Live weight, diary, {exerciseCount.toLocaleString("en-IN")} exercises and {aiConfigured ? "live coach" : "weekly coach"}
              </b>
            </span>
            <Icon path={ICON.arrow} size={17} />
          </Link>
          <button type="button" onClick={onBrowseSupplements}>
            <span className={x.quickIcon}>
              <Icon path={ICON.spark} size={20} />
            </span>
            <span>
              <small>Evidence-led marketplace</small>
              <b>
                {retailerLinks > 0
                  ? `${retailerLinks.toLocaleString("en-IN")} tracked product listings`
                  : "Research before any retailer link"}
              </b>
            </span>
            <Icon path={ICON.arrow} size={17} />
          </button>
        </nav>

        <nav className={x.businessRail} aria-label="FitFuel for organisations">
          <Link href="/corporate">
            <span>For teams</span>
            <b>Labelled office meals, personalised per employee</b>
            <Icon path={ICON.arrow} size={17} />
          </Link>
          <Link href="/partners">
            <span>For gyms and trainers</span>
            <b>
              Referral tracking and payouts
              {activePartners > 0
                ? `, with ${activePartners.toLocaleString("en-IN")} active now`
                : ""}
            </b>
            <Icon path={ICON.arrow} size={17} />
          </Link>
        </nav>
      </section>

      {proof ? (
        <aside className={x.proofLine} aria-label="Customer result">
          <b>{proof.resultLabel}</b>
          <blockquote>“{proof.quote}”</blockquote>
          <span>
            {proof.name} · {proof.planLabel}
          </span>
          <Link href="/testimonials">
            More stories <Icon path={ICON.arrow} size={16} />
          </Link>
        </aside>
      ) : null}
    </div>
  );
}
