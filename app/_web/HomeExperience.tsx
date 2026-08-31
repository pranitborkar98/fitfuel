import Image from "next/image";
import Link from "next/link";

import { SLOT_LABEL, type Dish } from "@/app/_hp/menu-types";
import { servingScaleForTarget } from "@/lib/portion-personalization";
import { waLink } from "@/lib/site";

import { GOALS } from "./home-data";
import type { Numbers } from "./YourNumbers";
import x from "./experience.module.css";

const ICON = {
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  message: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z",
  arrow: "M7 17 17 7M8 7h9v9",
  scale: "M5 21h14M12 3v18M4 7h16M4 7l-2 6h6L4 7Zm16 0-2 6h6l-4-6Z",
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
  BREAKFAST: "/images/ai/recipes/maharashtrian-moong-dal-chilla-with-green.webp",
  LUNCH: "/images/ai/recipes/chettinad-cauliflower-steak-with-black-pepper.webp",
  SNACK: "/images/ai/recipes/rajasthani-makhana-chaat-with-tamarind-chutney.webp",
  DINNER: "/images/ai/recipes/north-indian-palak-paneer-with-jowar.webp",
};

type Target = { kcal: number; protein: number; personal: boolean };

export default function HomeExperience({
  week,
  goal,
  target,
  numbers,
  aiConfigured,
  planProfiles,
  exercises,
  supplements,
  onGoalChange,
  onOpenNumbers,
  onBrowseMeals,
  onBrowsePlans,
  onBrowseSupplements,
}: {
  week: Dish[];
  goal: string;
  target: Target;
  numbers: Numbers | null;
  aiConfigured: boolean;
  planProfiles: number;
  exercises: number;
  supplements: number;
  onGoalChange: (goal: string) => void;
  onOpenNumbers: () => void;
  onBrowseMeals: () => void;
  onBrowsePlans: () => void;
  onBrowseSupplements: () => void;
}) {
  const meals = week.filter((dish) => dish.day === 1).slice(0, 4);
  const planKcal = meals.reduce((sum, meal) => sum + (meal.kcal ?? 0), 0);
  const planProtein = meals.reduce((sum, meal) => sum + (meal.protein ?? 0), 0);
  const serving = servingScaleForTarget({
    calorieTarget: target.kcal,
    planCalories: planKcal,
  });
  const scaledKcal = Math.round(planKcal * serving.factor);
  const scaledProtein = Math.round(planProtein * serving.factor);
  const activeGoal = GOALS.find((item) => item.key === goal) ?? GOALS[1];
  const portionPercent = Math.round(serving.factor * 100);
  const remainingProtein = Math.max(0, target.protein - scaledProtein);
  const whatsapp = waLink(
    `Hi FitFuel! I want help starting the ${activeGoal.label.toLowerCase()} plan shown on your homepage.`,
  );

  const coachLine =
    remainingProtein > 0
      ? `This four-meal day covers ${Math.round((scaledProtein / target.protein) * 100)}% of your protein target. The coach can close the remaining ${remainingProtein}g using tonight’s menu.`
      : `This day reaches your protein target. The coach can now compare the result with your weight and training trend before suggesting a change.`;

  const flow = [
    {
      step: "01",
      title: "Your numbers",
      value: `${target.kcal.toLocaleString("en-IN")} kcal · ${target.protein}g protein`,
      note: target.personal
        ? `${numbers?.weightKg}kg, ${numbers?.age} years and your activity level run through the same target engine used after sign-in.`
        : "A useful preview until you add age, height, weight and activity—then every number becomes yours.",
      action: (
        <button type="button" onClick={onOpenNumbers}>
          {target.personal ? "Change my numbers" : "Use my numbers"}
        </button>
      ),
    },
    {
      step: "02",
      title: "Kitchen scale",
      value: `${portionPercent}% portions · ${scaledKcal.toLocaleString("en-IN")} kcal`,
      note: `The production rule moves in measurable 5% steps and stays between 70% and 130%—never an eyeballed ladle.`,
      action: <Link href="/our-kitchen">See the kitchen</Link>,
    },
    {
      step: "03",
      title: "Cook and deliver",
      value: "04:00 produce · 08:00 ready",
      note: "Recipes roll into the production sheet, named trays and the driver run from our Kharadi kitchen.",
      action: <Link href="/how-it-works">Follow a delivery</Link>,
    },
    {
      step: "04",
      title: "Log and learn",
      value: "Four meals · one-tap diary",
      note: "Delivered meals arrive pre-filled. Training burn and body metrics join the same day instead of living in another app.",
      action: <Link href="/dashboard/nutrition">Open my diary</Link>,
    },
    {
      step: "05",
      title: "Coach the trend",
      value: "30 days of context · weekly guardrails",
      note: "AI answers from your history; the weekly engine waits for a real trend and caps any calorie change at 300 a day.",
      action: <Link href="/dashboard/coach">Open weekly coach</Link>,
    },
  ];

  return (
    <section className={x.experience} aria-labelledby="home-title">
      <div className={x.intro}>
        <div className={x.introCopy}>
          <p className={x.eyebrow}>
            <span aria-hidden="true" /> The connected food app
          </p>
          <h1 id="home-title" className={x.title}>
            Your numbers go in. Your whole day comes out.
          </h1>
          <p className={x.lede}>
            FitFuel turns one target into four weighed meals, a kitchen sheet,
            a delivery run, a pre-filled diary and a coach that can see what happened.
          </p>
        </div>

        <div className={x.goalPanel}>
          <div className={x.goalHead}>
            <span>
              <small>Try the engine</small>
              <b>What are you working toward?</b>
            </span>
            <button type="button" className={x.profileButton} onClick={onOpenNumbers}>
              {target.personal ? `${numbers?.weightKg}kg · personalised` : "Add my numbers"}
            </button>
          </div>
          <div className={x.goals} role="radiogroup" aria-label="Choose your goal">
            {GOALS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="radio"
                aria-checked={goal === item.key}
                className={goal === item.key ? x.goalActive : undefined}
                onClick={() => onGoalChange(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className={x.targetReadout} aria-live="polite" aria-atomic="true">
            <span><small>Your target</small><b className="fk-num">{target.kcal.toLocaleString("en-IN")} kcal</b></span>
            <span><small>Protein</small><b className="fk-num">{target.protein}g</b></span>
            <span><small>Kitchen portion{serving.clamped ? " · safe cap" : ""}</small><b className="fk-num">{serving.factor.toFixed(2)}×</b></span>
          </div>
        </div>
      </div>

      <div className={x.workbench}>
        <article className={x.mealDay} aria-labelledby="meal-day-title">
          <div className={x.mealDayHead}>
            <span>
              <small>Day one · Weight Loss Vegetarian</small>
              <h2 id="meal-day-title">The same real menu, portioned for you</h2>
            </span>
            <span className={x.dayTotal}>
              <b className="fk-num">{scaledKcal.toLocaleString("en-IN")}</b>
              <small>kcal across four meals</small>
            </span>
          </div>

          {meals.length ? (
            <ul className={x.mealMosaic}>
              {meals.map((meal, index) => (
                <li key={`${meal.day}-${meal.slot}`} className={index === 0 ? x.mealLead : undefined}>
                  <Image
                    src={PLAN_IMAGES[meal.slot]}
                    alt={meal.name}
                    fill
                    priority={index === 0}
                    sizes={index === 0
                      ? "(max-width: 700px) 100vw, (max-width: 1100px) 55vw, 34vw"
                      : "(max-width: 700px) 50vw, (max-width: 1100px) 27vw, 17vw"}
                  />
                  <span className={x.mealShade} aria-hidden="true" />
                  <span className={x.mealCaption}>
                    <small>{SLOT_LABEL[meal.slot] ?? meal.slot}</small>
                    <b>{meal.name}</b>
                    <span className="fk-num">
                      {Math.round((meal.kcal ?? 0) * serving.factor)} kcal · {Math.round((meal.protein ?? 0) * serving.factor)}g protein
                    </span>
                  </span>
                  <span className="fk-sr-only">
                    Illustrative AI-generated image; not a photograph of the delivered meal.
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={x.scheduleEmpty}>
              The scheduled menu is temporarily unavailable. The catalogue below is still live.
            </div>
          )}

          <div className={x.mealDayFoot}>
            <span>
              <Icon path={ICON.scale} />
              <span><b>Kitchen-safe personalisation</b><small>5% portion steps · 70–130% limits</small></span>
            </span>
            <Link href="/plans/weight-loss-veg">See all 30 days <Icon path={ICON.arrow} size={17} /></Link>
          </div>
        </article>

        <aside className={x.engine} aria-label="How FitFuel turns the target into a coached day">
          <div className={x.engineHead}>
            <span className={x.engineSignal}><i aria-hidden="true" /> Live product preview</span>
            <h2>One loop, not six disconnected apps.</h2>
          </div>

          <ol className={x.flow}>
            {flow.map((item) => (
              <li key={item.step}>
                <span className={`${x.flowStep} fk-num`}>{item.step}</span>
                <span className={x.flowCopy}>
                  <small>{item.title}</small>
                  <b>{item.value}</b>
                  <p>{item.note}</p>
                  {item.action}
                </span>
              </li>
            ))}
          </ol>

          <div className={x.coachPreview}>
            <span className={x.coachIcon}><Icon path={ICON.spark} size={22} /></span>
            <span>
              <small>{aiConfigured ? "FitFuel AI is online" : "FitFuel AI"}</small>
              <p>{coachLine}</p>
            </span>
            <Link href="/dashboard/trainer" aria-label="Ask FitFuel AI about this day">
              Ask AI <Icon path={ICON.arrow} size={17} />
            </Link>
          </div>

          <div className={x.actions}>
            <button type="button" onClick={onBrowseMeals}>Order from tonight&apos;s menu</button>
            <button type="button" className={x.secondaryAction} onClick={onBrowsePlans}>
              Explore {planProfiles} plans
            </button>
            <a href={whatsapp} target="_blank" rel="noreferrer">
              <Icon path={ICON.message} size={18} /> Order on WhatsApp
            </a>
          </div>
        </aside>
      </div>

      <ul className={x.ecosystem} aria-label="The wider FitFuel system">
        <li>
          <button type="button" onClick={onBrowsePlans}>
            <b className="fk-num">{planProfiles}</b><span>plan profiles</span><small>Goals, sports and medical needs</small>
          </button>
        </li>
        <li>
          <Link href="/dashboard/exercises">
            <b className="fk-num">{exercises.toLocaleString("en-IN")}</b><span>exercises</span><small>Workout burn returns to today&apos;s balance</small>
          </Link>
        </li>
        <li>
          <button type="button" onClick={onBrowseSupplements}>
            <b className="fk-num">{supplements}</b><span>evidence guides</span><small>Mechanisms, timing and retailer comparison</small>
          </button>
        </li>
        <li>
          <Link href="/our-kitchen">
            <b>Own kitchen</b><span>and own riders</span><small>The physical loop stays accountable</small>
          </Link>
        </li>
      </ul>
    </section>
  );
}
