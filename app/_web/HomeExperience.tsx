import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { SLOT_LABEL, type Dish } from "@/app/_hp/menu-types";
import { servingScaleForTarget } from "@/lib/portion-personalization";
import { waLink } from "@/lib/site";

import { GOALS } from "./home-data";
import type { Quote } from "./HomeBands";
import type { Numbers } from "./YourNumbers";
import x from "./experience.module.css";

const ICON = {
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  message: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z",
  arrow: "M7 17 17 7M8 7h9v9",
  scale: "M5 21h14M12 3v18M4 7h16M4 7l-2 6h6L4 7Zm16 0-2 6h6l-4-6Z",
  clock: "M12 8v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
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
  BREAKFAST: "/images/ai/recipes/maharashtrian-moong-dal-chilla-with-green.webp",
  LUNCH: "/images/ai/recipes/chettinad-cauliflower-steak-with-black-pepper.webp",
  SNACK: "/images/ai/recipes/rajasthani-makhana-chaat-with-tamarind-chutney.webp",
  DINNER: "/images/ai/recipes/north-indian-palak-paneer-with-jowar.webp",
};

const PLAN_LENSES = [
  {
    key: "STANDARD",
    label: "Goal plans",
    title: "Lose, maintain or build",
    copy: "Your calorie target sets the kitchen portion—not a generic menu label.",
    image: "/images/ai/dishes/mediterranean-power-bowl.webp",
  },
  {
    key: "LIFESTYLE_MEDICAL",
    label: "Medical & lifestyle",
    title: "Cooked for the condition",
    copy: "Diabetes, PCOS, thyroid, fatty liver and more, reviewed as plans—not hashtags.",
    image: "/images/ai/dishes/indian-detox-bowl.webp",
  },
  {
    key: "SPORTS",
    label: "Sports nutrition",
    title: "Food that knows you trained",
    copy: "Workout burn returns to the same day before the coach changes anything.",
    image: "/images/ai/story/meal-training-loop.webp",
  },
] as const;

type Target = { kcal: number; protein: number; personal: boolean };

function puneGreeting() {
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
  numbers,
  area,
  areaCount,
  cutoffLabel,
  trialTotal,
  aiConfigured,
  planProfiles,
  exercises,
  supplements,
  categoryCounts,
  quotes,
  onGoalChange,
  onOpenNumbers,
  onBrowseMeals,
  onBrowsePlans,
  onBrowsePlanCategory,
  onBrowseSupplements,
}: {
  week: Dish[];
  goal: string;
  target: Target;
  numbers: Numbers | null;
  area: string;
  areaCount: number;
  cutoffLabel: string;
  trialTotal: string;
  aiConfigured: boolean;
  planProfiles: number;
  exercises: number;
  supplements: number;
  categoryCounts: Record<string, number>;
  quotes: Quote[];
  onGoalChange: (goal: string) => void;
  onOpenNumbers: () => void;
  onBrowseMeals: () => void;
  onBrowsePlans: () => void;
  onBrowsePlanCategory: (category: string) => void;
  onBrowseSupplements: () => void;
}) {
  const meals = week.filter((dish) => dish.day === 1).slice(0, 4);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const activeMeal = meals[activeMealIndex] ?? meals[0];
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
  const proteinCoverage = target.protein
    ? Math.min(100, Math.round((scaledProtein / target.protein) * 100))
    : 0;
  const calorieCoverage = target.kcal
    ? Math.min(100, Math.round((scaledKcal / target.kcal) * 100))
    : 0;
  const whatsapp = waLink(
    `Hi FitFuel! I want help choosing a ${activeGoal.label.toLowerCase()} plan and checking delivery to ${area}.`,
  );

  const coachLine =
    remainingProtein > 0
      ? `This menu reaches ${proteinCoverage}% of your protein target. I can close the remaining ${remainingProtein}g from tonight’s catalogue.`
      : "This menu reaches your protein target. I can compare it with your weight and training trend before suggesting a change.";

  return (
    <section className={x.experience} aria-labelledby="home-title">
      <div className={x.hero}>
        <div className={x.heroCopy}>
          <p className={x.eyebrow} suppressHydrationWarning>
            <span aria-hidden="true" /> {puneGreeting()}, {area}
          </p>
          <h1 id="home-title" className={x.title}>
            Your food, training and progress—finally one system.
          </h1>
          <p className={x.lede}>
            We calculate the target, weigh four meals in Kharadi, deliver them
            across east Pune, fill your diary and coach the weekly trend.
          </p>

          <div className={x.heroActions}>
            <button type="button" onClick={onOpenNumbers}>
              Build my day <Icon path={ICON.arrow} size={18} />
            </button>
            <Link href="/plans?trial=true">Try breakfast + lunch · {trialTotal}</Link>
          </div>

          <a className={x.whatsappLine} href={whatsapp} target="_blank" rel="noreferrer">
            <Icon path={ICON.message} size={18} /> Prefer a person? Order on WhatsApp
          </a>

          <ul className={x.heroProof} aria-label="FitFuel delivery facts">
            <li><b className="fk-num">{areaCount}</b><span>east Pune areas</span></li>
            <li><b>Own kitchen</b><span>and own riders</span></li>
            <li><b>FSSAI</b><span>licensed operation</span></li>
          </ul>
        </div>

        <div className={x.heroVisual}>
          <Image
            src="/images/ai/story/meal-training-loop.webp"
            alt="A woman sitting down to a high-protein Indian meal after training, with her nutrition app beside it"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 51vw"
          />
          <span className={x.heroScrim} aria-hidden="true" />
          <span className="fk-sr-only">
            Illustrative AI-generated lifestyle image; not a photograph of a customer or delivered meal.
          </span>

          <div className={x.deliveryPill}>
            <span className={x.liveDot} aria-hidden="true" />
            <span><small>Morning delivery</small><b>At your door by 08:00</b></span>
          </div>

          <div className={x.heroDashboard}>
            <span className={x.dashboardTop}>
              <span><small>Today’s target</small><b>{activeGoal.label}</b></span>
              <button type="button" onClick={onOpenNumbers}>
                {target.personal ? "Edit" : "Personalise"}
              </button>
            </span>
            <span className={x.dashboardNumbers}>
              <span><b className="fk-num">{target.kcal.toLocaleString("en-IN")}</b><small>kcal</small></span>
              <span><b className="fk-num">{target.protein}g</b><small>protein</small></span>
              <span><b className="fk-num">4</b><small>meals</small></span>
            </span>
            <span className={x.dashboardFoot}>
              <Icon path={ICON.clock} size={17} /> Order by {cutoffLabel} for the next morning run
            </span>
          </div>
        </div>
      </div>

      <div className={x.dailyApp}>
        <div className={x.dailyTop}>
          <span>
            <small>Interactive product preview · published day one</small>
            <h2>Your day, live before you order.</h2>
          </span>
          <span className={x.dayStatus}>
            <i aria-hidden="true" /> Kitchen-ready plan
          </span>
        </div>

        <div className={x.dailyGrid}>
          <div className={x.mealStage}>
            {activeMeal ? (
              <div className={x.activeMeal} role="tabpanel" aria-live="polite">
                <Image
                  src={PLAN_IMAGES[activeMeal.slot]}
                  alt={activeMeal.name}
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 1180px) 60vw, 43vw"
                />
                <span className={x.mealScrim} aria-hidden="true" />
                <span className={x.activeMealCopy}>
                  <small>{SLOT_LABEL[activeMeal.slot] ?? activeMeal.slot}</small>
                  <b>{activeMeal.name}</b>
                  <span className="fk-num">
                    {Math.round((activeMeal.kcal ?? 0) * serving.factor)} kcal · {Math.round((activeMeal.protein ?? 0) * serving.factor)}g protein
                  </span>
                </span>
                <span className="fk-sr-only">
                  Illustrative AI-generated image; not a photograph of the delivered meal.
                </span>
              </div>
            ) : (
              <div className={x.scheduleEmpty}>
                The scheduled menu is temporarily unavailable. The catalogue below is still live.
              </div>
            )}

            {meals.length ? (
              <div className={x.mealTabs} role="tablist" aria-label="Preview the four meals">
                {meals.map((meal, index) => (
                  <button
                    key={`${meal.day}-${meal.slot}`}
                    type="button"
                    role="tab"
                    aria-selected={activeMealIndex === index}
                    className={activeMealIndex === index ? x.mealTabActive : undefined}
                    onClick={() => setActiveMealIndex(index)}
                  >
                    <span className={x.tabImage}>
                      <Image src={PLAN_IMAGES[meal.slot]} alt="" fill sizes="72px" />
                    </span>
                    <span><small>{SLOT_LABEL[meal.slot] ?? meal.slot}</small><b>{meal.name}</b></span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <aside className={x.controlPanel} aria-label="Personalise the sample day">
            <div className={x.controlHead}>
              <span><small>Your goal</small><b>Watch the whole day recalculate</b></span>
              <button type="button" className={x.profileButton} onClick={onOpenNumbers}>
                {target.personal ? `${numbers?.weightKg}kg · yours` : "Use my numbers"}
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
              <span><small>Daily target</small><b className="fk-num">{target.kcal.toLocaleString("en-IN")} kcal</b></span>
              <span><small>Four-meal menu</small><b className="fk-num">{scaledKcal.toLocaleString("en-IN")} kcal</b></span>
              <span><small>Kitchen portion{serving.clamped ? " · safe cap" : ""}</small><b className="fk-num">{serving.factor.toFixed(2)}×</b></span>
            </div>

            <div className={x.coverage}>
              <span>
                <span><b>Calories</b><small className="fk-num">{calorieCoverage}%</small></span>
                <progress max={100} value={calorieCoverage} aria-label={`${calorieCoverage}% of calorie target`} />
              </span>
              <span>
                <span><b>Protein</b><small className="fk-num">{proteinCoverage}%</small></span>
                <progress max={100} value={proteinCoverage} aria-label={`${proteinCoverage}% of protein target`} />
              </span>
            </div>

            <div className={x.portionRule}>
              <Icon path={ICON.scale} size={21} />
              <span><b>{portionPercent}% portions on a real scale</b><small>Moves in 5% steps and stays inside the kitchen-safe 70–130% range.</small></span>
            </div>

            <div className={x.coachPreview}>
              <span className={x.coachIcon}><Icon path={ICON.spark} size={21} /></span>
              <span>
                <small>{aiConfigured ? "FitFuel AI · online" : "FitFuel AI"}</small>
                <p>{coachLine}</p>
              </span>
              <Link href="/dashboard/trainer" aria-label="Ask FitFuel AI about this day">
                Ask AI <Icon path={ICON.arrow} size={17} />
              </Link>
            </div>

            <div className={x.actions}>
              <button type="button" onClick={onBrowseMeals}>Order from tonight’s menu</button>
              <button type="button" className={x.secondaryAction} onClick={onBrowsePlans}>
                Explore {planProfiles} plans
              </button>
            </div>
          </aside>
        </div>

        <div className={x.systemRail} aria-label="What happens to this meal next">
          <span><Icon path={ICON.scale} size={18} /><b>Weigh</b><small>{portionPercent}% portion</small></span>
          <i aria-hidden="true" />
          <span><Icon path={ICON.route} size={18} /><b>Deliver</b><small>one daily run</small></span>
          <i aria-hidden="true" />
          <span><Icon path={ICON.check} size={18} /><b>Pre-fill</b><small>tap to confirm</small></span>
          <i aria-hidden="true" />
          <span><Icon path={ICON.spark} size={18} /><b>Coach</b><small>weekly trend</small></span>
        </div>
      </div>

      <div className={x.planDiscovery}>
        <div className={x.sectionHead}>
          <span><small>{planProfiles} plan profiles</small><h2>Start with the result, not a product list.</h2></span>
          <button type="button" onClick={onBrowsePlans}>See every plan <Icon path={ICON.arrow} size={17} /></button>
        </div>

        <ul className={x.planLenses}>
          {PLAN_LENSES.map((lens) => (
            <li key={lens.key}>
              <button type="button" onClick={() => onBrowsePlanCategory(lens.key)}>
                <Image src={lens.image} alt="" fill sizes="(max-width: 720px) 100vw, 33vw" />
                <span className={x.lensScrim} aria-hidden="true" />
                <span className={x.lensCopy}>
                  <small>{(categoryCounts[lens.key] ?? 0).toLocaleString("en-IN")} {lens.label.toLowerCase()}</small>
                  <b>{lens.title}</b>
                  <span>{lens.copy}</span>
                  <em>Explore <Icon path={ICON.arrow} size={16} /></em>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="fk-sr-only">
          Food and lifestyle images in this plan chooser are AI-generated illustrations.
        </p>

        <div className={x.trialBar}>
          <span className={x.trialPrice}><small>First day</small><b className="fk-num">{trialTotal}</b></span>
          <span className={x.trialCopy}><b>Breakfast and lunch. Everything included.</b><small>Food, packaging, delivery and GST. Nothing to cancel.</small></span>
          <Link href="/plans?trial=true">Start the trial <Icon path={ICON.arrow} size={18} /></Link>
        </div>
      </div>

      {quotes.length ? (
        <div className={x.proof}>
          <div className={x.sectionHead}>
            <span><small>From people eating it</small><h2>Results attached to a plan and a Pune address.</h2></span>
            <Link href="/testimonials">See all stories <Icon path={ICON.arrow} size={17} /></Link>
          </div>
          <ul className={x.quoteGrid}>
            {quotes.slice(0, 3).map((quote) => (
              <li key={quote.id}>
                <b className={x.quoteResult}>{quote.resultLabel}</b>
                <blockquote>“{quote.quote}”</blockquote>
                <span><b>{quote.name}</b><small>{quote.location} · {quote.planLabel}</small></span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ul className={x.ecosystem} aria-label="The wider FitFuel system">
        <li><button type="button" onClick={onBrowsePlans}><b className="fk-num">{planProfiles}</b><span>plan profiles</span><small>Goals, sports and medical needs</small></button></li>
        <li><Link href="/dashboard/exercises"><b className="fk-num">{exercises.toLocaleString("en-IN")}</b><span>exercises</span><small>Workout burn returns to today’s balance</small></Link></li>
        <li><button type="button" onClick={onBrowseSupplements}><b className="fk-num">{supplements}</b><span>evidence guides</span><small>Mechanisms, timing and retailer comparison</small></button></li>
        <li><Link href="/our-kitchen"><b>Own kitchen</b><span>and own riders</span><small>The physical loop stays accountable</small></Link></li>
      </ul>
    </section>
  );
}
