import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useSession } from "next-auth/react";

import { SLOT_LABEL, type Dish } from "@/app/_hp/menu-types";
import type { WeightPoint } from "@/lib/progress";
import { WeightTrendChart } from "./WeightTrendChart";
import { servingScaleForTarget } from "@/lib/portion-personalization";
import { waLink } from "@/lib/site";

import type { Quote } from "./home-data";
import PartnerNetwork from "@/app/_kitchen/PartnerNetwork";
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

      <ScaleBand />
    </div>
  );
}

/* ── Smart scale ────────────────────────────────────────────────────────
   The scale is a core feature, not a dashboard footnote: a supported
   Bluetooth scale sends the customer's weight straight into their account,
   and the saved trend sets the calorie target the kitchen weighs meals to.
   It sits here, directly after how it works and before the menu, because
   that is where a visitor decides whether the plan is built on real
   measurements or on a form they fill in once.

   EVERYTHING on this band is either drawn (the scale device, the BMI
   gauge) or reused from the dashboard (the weight-trend chart, extracted
   to WeightTrendChart.tsx). No photograph of a scale exists, so none is
   shown. Every number is an example, labelled as one: the homepage is
   anonymous and no visitor has readings yet. The only measured value is
   weight; the other 17 readings are estimates, and the band says so in
   the code's own words (BodyMetricsClient L911 and L1389).

   The daily messages are only what the cron routes send: a 7 AM preview
   of today's meals, a 9 PM recap with tomorrow's meals, and a 10 AM
   check that can nudge on a plateau, a milestone or a plan about to end.
   There is no daily weight email in the code, so none is claimed here. */
const SCALE_METRICS: { name: string; unit: string; measured: boolean }[] = [
  { name: "Weight", unit: "kg", measured: true },
  { name: "BMI", unit: "", measured: false },
  { name: "Body fat", unit: "%", measured: false },
  { name: "Fat mass", unit: "kg", measured: false },
  { name: "Fat-free weight", unit: "kg", measured: false },
  { name: "Subcutaneous fat", unit: "%", measured: false },
  { name: "Visceral fat", unit: "level", measured: false },
  { name: "Body water", unit: "%", measured: false },
  { name: "Water weight", unit: "kg", measured: false },
  { name: "Skeletal muscle", unit: "%", measured: false },
  { name: "Muscle mass", unit: "kg", measured: false },
  { name: "Muscle rate", unit: "%", measured: false },
  { name: "Bone mass", unit: "kg", measured: false },
  { name: "Protein", unit: "%", measured: false },
  { name: "Protein mass", unit: "kg", measured: false },
  { name: "BMR", unit: "kcal", measured: false },
  { name: "Body age", unit: "yrs", measured: false },
  { name: "Ideal weight", unit: "kg", measured: false },
];

/* Example trend, labelled as one everywhere it appears. Six weekly
   weigh-ins ending at 78.2 kg, the same example weight the dashboard
   band below the menu already shows. */
const EXAMPLE_SERIES: WeightPoint[] = [
  { date: "2026-10-05", weightKg: 80.4, bodyFatPct: null, muscleMassKg: null },
  { date: "2026-10-12", weightKg: 79.9, bodyFatPct: null, muscleMassKg: null },
  { date: "2026-10-19", weightKg: 79.7, bodyFatPct: null, muscleMassKg: null },
  { date: "2026-10-26", weightKg: 79.2, bodyFatPct: null, muscleMassKg: null },
  { date: "2026-11-02", weightKg: 78.8, bodyFatPct: null, muscleMassKg: null },
  { date: "2026-11-09", weightKg: 78.2, bodyFatPct: null, muscleMassKg: null },
];
const EXAMPLE_TARGET_KG = 75;
/* Example BMI for the gauge. Categories are lib/personalization.ts
   bmiCategory: Underweight below 18.5, Healthy 18.5 to 25, Overweight
   25 to 30, Obese 30 and over. The example is the same 78.2 kg reading
   at 178 cm tall: 78.2 / 1.78² = 24.7. The height is stated beside the
   gauge, so the BMI is never shown without the height behind it. */
const EXAMPLE_BMI = 24.7;

const GAUGE_MIN = 15;
const GAUGE_MAX = 40;
const GAUGE_CX = 120;
const GAUGE_CY = 122;
const GAUGE_R = 88;

function gaugePoint(v: number, r = GAUGE_R) {
  const a =
    ((180 - ((v - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 180) * Math.PI) /
    180;
  return { x: GAUGE_CX + r * Math.cos(a), y: GAUGE_CY - r * Math.sin(a) };
}

function gaugeArc(v0: number, v1: number) {
  const p0 = gaugePoint(v0);
  const p1 = gaugePoint(v1);
  return `M ${p0.x.toFixed(1)} ${p0.y.toFixed(1)} A ${GAUGE_R} ${GAUGE_R} 0 0 1 ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
}

const GAUGE_SEGMENTS: { from: number; to: number; label: string; healthy: boolean }[] = [
  { from: 15, to: 18.5, label: "Underweight", healthy: false },
  { from: 18.5, to: 25, label: "Healthy", healthy: true },
  { from: 25, to: 30, label: "Overweight", healthy: false },
  { from: 30, to: 40, label: "Obese", healthy: false },
];

function ScaleBand() {
  const needle = gaugePoint(EXAMPLE_BMI);
  const needleInner = gaugePoint(EXAMPLE_BMI, GAUGE_R - 22);
  return (
    <section className={x.scaleBand} aria-labelledby="smart-scale-title">
      <h2 id="smart-scale-title">Track your weight with a smart scale</h2>
      <p className={x.scaleLede}>
        A supported Bluetooth scale sends your weight straight to your
        FitFuel account. There is no companion app and nothing to type in.
        Your saved trend, profile and goal set your calorie target, and
        your kitchen weighs every meal to that target.
      </p>

      <div className={x.scaleGrid}>
        <div className={x.scalePanel}>
          <p className={x.scaleTag}>
            <span className={x.scaleLiveDot} aria-hidden="true" />
            Example reading
          </p>
          <svg
            viewBox="0 0 320 252"
            width="100%"
            style={{ display: "block", maxWidth: 360, margin: "0 auto" }}
            role="img"
            aria-label="Illustration of a Bluetooth scale showing an example reading of 78.2 kilograms"
          >
            <rect x="24" y="28" width="272" height="196" rx="16" fill="#131311" stroke="var(--fk-line-strong)" strokeWidth="1" />
            <rect x="105" y="56" width="110" height="64" rx="8" fill="#070707" stroke="var(--fk-line-2)" strokeWidth="1" />
            <text x="160" y="102" textAnchor="middle" fontFamily="var(--fk-display), Georgia, serif" fontWeight="600" fill="var(--fk-green)">
              <tspan fontSize="34">78.2</tspan>
              <tspan fontSize="14" dx="4">kg</tspan>
            </text>
            <g
              transform="translate(142, 148) scale(1.5)"
              fill="none"
              stroke="var(--fk-green)"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m7 7 10 10-5 5V2l5 5L7 17" />
            </g>
            <text x="160" y="208" textAnchor="middle" fontSize="13" fontFamily="var(--fk-sans), sans-serif" fill="var(--fk-ink-3)">
              Bluetooth
            </text>
            <circle cx="56" cy="230" r="6" fill="#1c1c1a" stroke="var(--fk-line-2)" strokeWidth="1" />
            <circle cx="264" cy="230" r="6" fill="#1c1c1a" stroke="var(--fk-line-2)" strokeWidth="1" />
          </svg>
          <p className={x.scaleCaption}>
            Example: 78.2 kg on a supported Bluetooth scale. Connect yours
            and your first weigh-in lands here.
          </p>

          <ol className={x.scaleSteps}>
            <li>
              <b>Connect in your browser</b>
              <span>
                Open Body measurements in your account and tap connect. Your
                browser asks which scale to pair. There is no companion app
                to install.
              </span>
            </li>
            <li>
              <b>Step on and stand still</b>
              <span>
                The scale sends weight and impedance over Bluetooth. It
                steadies itself first, then locks the reading once your
                weight holds steady.
              </span>
            </li>
            <li>
              <b>Confirm and save</b>
              <span>
                Your readings appear for review. Confirm them to save, or
                enter a reading by hand if Bluetooth is not available on
                your device.
              </span>
            </li>
          </ol>
        </div>

        <div className={x.scaleStack}>
          <div className={x.scalePanel}>
            <h3>Your BMI, in context</h3>
            <svg
              viewBox="0 0 240 150"
              width="100%"
              style={{ display: "block", maxWidth: 360, margin: "0 auto" }}
              role="img"
              aria-label="Example BMI 24.7, in the healthy range from 18.5 to 25"
            >
              {GAUGE_SEGMENTS.map((seg) => (
                <path
                  key={seg.label}
                  d={gaugeArc(seg.from, seg.to)}
                  fill="none"
                  stroke={seg.healthy ? "var(--fk-green)" : "var(--fk-line-strong)"}
                  strokeWidth="14"
                />
              ))}
              <line
                x1={GAUGE_CX}
                y1={GAUGE_CY}
                x2={needleInner.x}
                y2={needleInner.y}
                stroke="var(--fk-ink)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx={needle.x} cy={needle.y} r="5" fill="var(--fk-green)" />
              <circle cx={GAUGE_CX} cy={GAUGE_CY} r="4" fill="var(--fk-ink)" />
              <text x={GAUGE_CX - GAUGE_R - 2} y={GAUGE_CY + 16} textAnchor="end" fontSize="12" fontFamily="var(--fk-sans), sans-serif" fill="var(--fk-ink-3)">
                15
              </text>
              <text x={GAUGE_CX + GAUGE_R + 2} y={GAUGE_CY + 16} textAnchor="start" fontSize="12" fontFamily="var(--fk-sans), sans-serif" fill="var(--fk-ink-3)">
                40
              </text>
            </svg>
            <p className={x.scaleBmiValue}>
              Example BMI <b className="fk-num">24.7</b>{" "}
              <span>Healthy</span>
            </p>
            <p className={x.scaleCaption}>
              Underweight below 18.5. Healthy 18.5 to 25. Overweight 25 to
              30. Obese 30 and over.
            </p>
            <p className={x.scaleCaption}>
              Example: 78.2 kg at 178 cm tall. BMI is weight in
              kilograms divided by height in metres squared.
            </p>
          </div>

          <div className={x.scalePanel}>
            <h3>The trend matters more than one day</h3>
            <WeightTrendChart
              series={EXAMPLE_SERIES}
              metric="weight"
              target={EXAMPLE_TARGET_KG}
            />
            <p className={x.scaleCaption}>
              Example: six weekly weigh-ins, from 80.4 kg to 78.2 kg,
              against an example target of 75 kg. Two readings are needed
              before a trend means anything.
            </p>
          </div>
        </div>
      </div>

      <h3 className={x.scaleSubhead}>One weigh-in, 18 readings</h3>
      <p className={x.scaleLede}>
        One step on the scale produces all eighteen. Weight is the only one
        measured directly. The rest are estimates from the scale reading
        and your profile.
      </p>
      <ul className={x.scaleMetrics}>
        {SCALE_METRICS.map((m) => (
          <li key={m.name}>
            <span>
              {m.name}
              {m.unit ? <small> {m.unit}</small> : null}
            </span>
            <b className={m.measured ? x.scaleMeasured : x.scaleEstimate}>
              {m.measured ? "Measured" : "Estimate"}
            </b>
          </li>
        ))}
      </ul>
      <p className={x.scaleDisclaimer}>
        Only weight is measured directly. The other body-composition values
        are consumer-scale estimates derived from impedance and your
        profile. Use them for trends, not diagnosis or treatment decisions.
      </p>
      <p className={x.scaleDisclaimer}>
        Consumer-scale estimates are not medical measurements. If a number
        concerns you, discuss it with a qualified clinician rather than
        changing treatment from this screen.
      </p>

      <h3 className={x.scaleSubhead}>Your plan keeps you posted</h3>
      <p className={x.scaleLede}>
        Email and WhatsApp follow your plan. Every message is switchable,
        and nothing is sent that you did not leave on.
      </p>
      <ul className={x.scaleMail}>
        <li>
          <b>7 AM, every morning</b>
          <span>
            Today&apos;s meals, with total calories, before the day starts.
          </span>
        </li>
        <li>
          <b>9 PM, every evening</b>
          <span>
            Tomorrow&apos;s meals and total calories, with a nudge to log
            today.
          </span>
        </li>
        <li>
          <b>10 AM, every day</b>
          <span>
            A daily check reads your weight trend. A flat week can bring a
            plateau nudge, reaching your target brings a milestone message,
            and a plan ending in two to three days brings a reminder.
          </span>
        </li>
      </ul>

      <p className={x.scaleCtaRow}>
        <Link className={x.scaleCta} href="/dashboard/body-metrics">
          Open body measurements
        </Link>
        <span>Connect a scale, or enter a reading by hand.</span>
      </p>
    </section>
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

      {/* Partner network restored 2026-11-11 on chintu's call: PR #16 had
          taken it off the homepage. It renders here, before testimonials,
          as it did at 139fae4. The dashboard content stays the single
          DashboardBand in HomeSections. */}
      <PartnerNetwork />

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
