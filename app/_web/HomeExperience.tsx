import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useSession } from "next-auth/react";

import { SLOT_LABEL, type Dish } from "@/app/_hp/menu-types";
import { servingScaleForTarget } from "@/lib/portion-personalization";
import { waLink } from "@/lib/site";

import type { Quote } from "./home-data";
import x from "./experience.module.css";
import hub from "./home-workspace.module.css";

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
  target,
  cutoffLabel,
  trialTotal,
}: {
  week: Dish[];
  target: Target;
  cutoffLabel: string;
  trialTotal: string;
}) {
  /* Account widgets (daily tools, today at a glance) are for signed-in
     members only. useSession is how the homepage knows: HomeToday already
     reads it the same way. While the session is still loading we show the
     visitor layout, so nobody is ever stuck on "Loading your account…";
     the widgets appear once the session resolves. Anonymous visitors get
     the hero and the sample-day preview, never an account panel. */
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated" && Boolean(session?.user?.id);
  /* Seven days arrive from getWeek(); the preview used to show day 1 only and
     drop the other six. Grouped by day so every fetched day is previewable. */
  const days = useMemo(() => {
    const byDay = new Map<number, Dish[]>();
    for (const dish of week) {
      const list = byDay.get(dish.day) ?? [];
      list.push(dish);
      byDay.set(dish.day, list);
    }
    return [...byDay.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([day, dishes]) => ({ day, meals: dishes.slice(0, 4) }));
  }, [week]);
  const [activeDay, setActiveDay] = useState(0);
  const [activeMealIndex, setActiveMealIndex] = useState(0);
  const dayTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mealTabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const dayMeals = days[activeDay]?.meals ?? [];
  const activeMeal = dayMeals[activeMealIndex] ?? dayMeals[0];
  const planKcal = dayMeals.reduce((sum, meal) => sum + (meal.kcal ?? 0), 0);
  const serving = servingScaleForTarget({
    calorieTarget: target.kcal,
    planCalories: planKcal,
  });
  const scaledKcal = Math.round(planKcal * serving.factor);
  /* No goal is assumed before the visitor chooses one. The old text named the
     currently selected goal ("maintain plan") in a message the visitor had
     not chosen; this one names only the trial day and delivery. */
  const whatsapp = waLink(
    `Hi FitFuel! I want to try the ${trialTotal} trial day and check delivery to my address.`,
  );

  const moveMealFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % dayMeals.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + dayMeals.length) % dayMeals.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = dayMeals.length - 1;
    else return;

    event.preventDefault();
    setActiveMealIndex(next);
    mealTabRefs.current[next]?.focus();
  };

  const moveDayFocus = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % days.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + days.length) % days.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = days.length - 1;
    else return;

    event.preventDefault();
    setActiveDay(next);
    setActiveMealIndex(0);
    dayTabRefs.current[next]?.focus();
  };

  return (
    <div className={`${x.home} ${hub.workspace}`} id="main-content" aria-labelledby="home-title">
      <section
        className={`${x.hero} ${hub.hero}${signedIn ? "" : ` ${hub.heroGuest}`}`}
        aria-label="FitFuel daily food app"
      >
        <div className={`${x.heroCopy} ${hub.heading}`}>
          {/* Signed-in members get the time greeting; a first-time visitor
              gets the trial price instead. The greeting was part of the
              account feel a logged-out visitor used to see. */}
          <p className={x.eyebrow} suppressHydrationWarning>
            {signedIn ? timeGreeting() : `First day ${trialTotal}`}
          </p>
          <h1 id="home-title" className={`${x.title} ${hub.title}`}>
            Chef-cooked meals, weighed to your macros.
          </h1>
          <p className={x.lede}>
            Four meals a day, delivered in Pune by 10 AM.
          </p>

          {/* One primary action (start the trial) and one secondary (check
              the pincode). The old four-way choice is gone: "Order a meal"
              just scrolled to the catalogue below, and the trial link sat
              second. Coach and WhatsApp stay below as support, not as
              competing calls to action. */}
          <div className={x.heroActions}>
            <Link href="/plans?trial=true" className={x.heroPrimary}>
              Start your trial · {trialTotal} <Icon path={ICON.arrow} size={18} />
            </Link>
            <Link href="/locations">Check my pincode</Link>
          </div>
        </div>

        <div className={`${x.heroSupport} ${hub.support}`}>
          <div className={x.assistance}>
            <button type="button" onClick={() => document.getElementById("fitfuel-coach-trigger")?.click()}>
              <Icon path={ICON.spark} size={18} /> Ask the AI coach
            </button>
            <a href={whatsapp} target="_blank" rel="noreferrer">
              <Icon path={ICON.message} size={18} /> Order on WhatsApp
            </a>
          </div>
        </div>

        {/* 2026-11-10 conversion restructure: the daily-tools and today
            widgets left the hero. They now live in the single dashboard
            section below the catalogue (DashboardBand in HomeSections), so
            the hero is the trial and the menu preview only. The hero grid
            no longer names the "tools" and "day" rows. */}
        <div className={`${x.menuPreview} ${hub.menu}`}>
          <div className={x.previewHead}>
            <span>
              <small>
                {days.length > 1
                  ? `Day ${days[activeDay]?.day ?? 1} · sample four-meal day`
                  : "Sample four-meal day"}
              </small>
              <b>
                {dayMeals.length ? `Portion preview · ${scaledKcal.toLocaleString("en-IN")} kcal` : "Menu preview"}
              </b>
            </span>
            <span className={x.deliveryStatus}>
              <i aria-hidden="true" /> Order by {cutoffLabel}
            </span>
          </div>

          {days.length > 1 ? (
            <div
              className={x.weekTabs}
              role="tablist"
              aria-label="Preview a day of the week"
            >
              {days.map((d, index) => (
                <button
                  key={d.day}
                  type="button"
                  role="tab"
                  id={`week-tab-${index}`}
                  aria-controls="meal-preview-panel"
                  aria-selected={activeDay === index}
                  tabIndex={activeDay === index ? 0 : -1}
                  className={activeDay === index ? x.weekTabActive : x.weekTab}
                  onClick={() => {
                    setActiveDay(index);
                    setActiveMealIndex(0);
                  }}
                  onKeyDown={(event) => moveDayFocus(event, index)}
                  ref={(element) => {
                    dayTabRefs.current[index] = element;
                  }}
                >
                  Day {d.day}
                </button>
              ))}
            </div>
          ) : null}

          {activeMeal ? (
            <div
              id="meal-preview-panel"
              className={x.featureMeal}
              role="tabpanel"
              aria-labelledby={`meal-preview-tab-${activeDay}-${activeMealIndex}`}
              aria-live="polite"
              data-tilt
            >
              <Image
                src={PLAN_IMAGES[activeMeal.slot]}
                alt={activeMeal.name}
                fill
                loading="eager"
                sizes="(max-width: 900px) 100vw, 54vw"
              />
              {/* Steam over the hot meal. Pure CSS, aria-hidden, and off entirely
                  under prefers-reduced-motion — see experience.module.css. */}
              <span className={x.steam} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
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

          {dayMeals.length ? (
            <div
              className={x.mealGrid}
              role="tablist"
              aria-label="Preview all four meals"
              aria-orientation="horizontal"
            >
              {dayMeals.map((meal, index) => (
                <button
                  key={`${meal.day}-${meal.slot}`}
                  id={`meal-preview-tab-${activeDay}-${index}`}
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

      {/* ── How it works ───────────────────────────────────────────────────
            The old Set / Calculate / Weigh / Adjust strip sat under the hero
            (and was hidden by the workspace layout). It is now the 3-step
            section directly below the hero. Set and Calculate are one step:
            the visitor sets a target and the kitchen works out the numbers,
            so the split was two halves of the same moment. */}
      <section className={x.howItWorks} aria-labelledby="how-it-works-title">
        <h2 id="how-it-works-title">How it works</h2>
        <p>Three steps between you and a day of food that fits your target.</p>
        <ol className={x.howSteps}>
          <li>
            <Icon path={ICON.scale} size={18} />
            <span>
              <b>Set your target</b>
              <small>
                Tell us your goal, weight and activity. We work out the
                calories and protein for your day.
              </small>
            </span>
          </li>
          <li>
            <Icon path={ICON.check} size={18} />
            <span>
              <b>We weigh every meal</b>
              <small>
                Your kitchen portions each meal in grams and labels it with
                your numbers.
              </small>
            </span>
          </li>
          <li>
            <Icon path={ICON.route} size={18} />
            <span>
              <b>Adjust from progress</b>
              <small>
                Your weight and diary feed back in, so the target moves with
                you.
              </small>
            </span>
          </li>
        </ol>
      </section>
    </div>
  );
}

export function HomeProductLinks({
  aiConfigured,
  exerciseCount,
  quotes,
  onBrowsePlans,
}: {
  aiConfigured: boolean;
  exerciseCount: number;
  quotes: Quote[];
  onBrowsePlans: () => void;
}) {
  return (
    <div className={x.home}>
      <section className={x.productMap} aria-labelledby="product-map-title">
        <header className={x.productMapHead}>
          <h2 id="product-map-title">Plan the rest of your week</h2>
          <p>
            Start with delivered food, use a nationwide digital plan, or run your
            week in the member app.
          </p>
        </header>

        <nav className={x.quickRail} aria-label="Choose a FitFuel product">
          <button type="button" onClick={onBrowsePlans}>
            <span className={x.quickIcon}>
              <Icon path={ICON.route} size={20} />
            </span>
            <span>
              <small>Delivered nutrition</small>
              <b>Meals weighed to your target</b>
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
          <Link href="/dashboard-preview">
            <span className={x.quickIcon}>
              <Icon path={ICON.scale} size={20} />
            </span>
            <span>
              <small>Explore the dashboard</small>
              <b>
                Food diary, weight, {exerciseCount.toLocaleString("en-IN")} exercises and {aiConfigured ? "AI coach" : "weekly review"}
              </b>
            </span>
            <Icon path={ICON.arrow} size={17} />
          </Link>
        </nav>

        {/* 2026-11-10 conversion restructure: the supplements card left this
            rail. Supplements appear once on the homepage, as the slim
            Nutrabay strip (RetailBand in HomeSections). */}
        <nav className={x.businessRail} aria-label="FitFuel for organisations">
          <Link href="/corporate">
            <span>For teams</span>
            <b>Labelled office meals, personalised per employee</b>
            <Icon path={ICON.arrow} size={17} />
          </Link>
        </nav>
      </section>

      {/* 2026-11-10 conversion restructure: the dashboard card and the
          partner network left this file. The dashboard content is now the
          single DashboardBand in HomeSections, and the partner cards
          (including the "Coming soon" gym, corporate and trainer slots) are
          off the homepage entirely. PartnerNetwork itself is untouched: it
          still renders on /partners, /corporate and /services. */}

      {/* Testimonials stay: chintu confirmed 2026-11-10 18:08 IST to keep
          them as they are, overriding the verdict's remove-by-default. */}
      {/* All three fetched testimonials. Only the first ever rendered; the
          other two were queried and dropped. One card each, same shape. The
          heading is visible now: the section had only an aria-label, so it
          read as three loose quotes with no band of its own. */}
      {quotes.length ? (
        <section className={x.proof} aria-labelledby="proof-title">
          <h2 id="proof-title" className={x.proofTitle}>
            Customer results
          </h2>
          <div className={x.proofList}>
            {quotes.map((quote) => (
              <blockquote key={quote.id} className={x.proofCard} data-reveal="up">
                <b>{quote.resultLabel}</b>
                <p>“{quote.quote}”</p>
                <span>
                  {quote.name} · {quote.planLabel}
                </span>
              </blockquote>
            ))}
          </div>
          <Link href="/testimonials" className={x.proofMore}>
            More stories <Icon path={ICON.arrow} size={16} />
          </Link>
        </section>
      ) : null}
    </div>
  );
}
