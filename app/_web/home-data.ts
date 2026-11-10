// app/_web/home-data.ts
//
// DATA FOR THE HOMEPAGE BANDS, in a module that is neither client nor server.
//
// Same reason app/_web/services.ts exists: app/page.tsx is a server component
// and has to read some of this to resolve prices and photographs, while
// HomeSections.tsx carries "use client". Next replaces every export of a
// "use client" module with a client REFERENCE across that boundary, so a
// `.map()` on the server throws at prerender after tsc and eslint pass clean.
// Shared data lives here.
//
import type { FitnessGoal } from "@/lib/tdee";
import type { CaloriePoint } from "@/lib/progress";
/* Runtime import, not type-only: the sample day below is the single source
   of truth for its own totals, so the homepage sums the same meals the
   dashboard preview renders rather than retyping them. sample-data.ts
   imports only types from the dashboard, so this pulls in data, not pages. */
import { SAMPLE_DAY } from "@/app/dashboard-preview/sample-data";

/* ── Band counts and quotes ────────────────────────────────────────────────
   Moved here from app/_web/HomeBands.tsx (deleted 2026-11-09: the component
   was never mounted). The types stay live: app/page.tsx, FitFuelApp,
   HomeExperience and HomeSections all type their band props with them. */

export type Quote = {
  id: string;
  name: string;
  location: string;
  planLabel: string;
  resultLabel: string;
  quote: string;
};

export type BandCounts = {
  dishes: number;
  /* Plan CONCEPTS, not rows: distinct subCategory values, the same number
     the homepage catalogue renders as cards (one card per concept). The
     row total must never be stated here — the bands describe the
     catalogue, and the catalogue shows concepts. Rows vs concepts vs
     live/active is defined in lib/plan-counts.ts. */
  plans: number;
  /* Distinct LIFESTYLE_MEDICAL subCategory values, for the same reason:
     the wedge's "condition plans" and the conditions band's "plans for a
     condition" describe the same catalogue, so they count the condition
     concepts the catalogue renders, not the condition rows. */
  conditionPlans: number;
  exercises: number;
  supplements: number;
  recipes: number;
  retailerLinks: number;
  retailerNetworks: number;
  marketplaceProducts: number;
  activePartners: number;
};

// NOTHING IN THIS FILE IS A PRICE THAT A CUSTOMER PAYS. Plan prices come from
// the seeded PlanPrice matrix and the trial from lib/trial-price.ts, both
// resolved on the server — lib/trial-price.ts exists precisely to stop a second
// copy of a number appearing in copy and drifting away from checkout.

/* ── The day, 04:00 to your door ────────────────────────────────────────────
   Four steps, three of which have a real photograph in public/images. The
   fourth is the diary — there is no photograph of a number landing in an app,
   so it takes the same colour ground the dish wells use rather than borrowing
   a picture of something it is not. Same rule lib/site-images.ts states. */
export type DayStep = {
  at: string;
  label: string;
  line: string;
  img?: string;
  alt?: string;
};

export const DAY_STEPS: DayStep[] = [
  {
    at: "04:00",
    label: "Produce lands",
    line: "Vegetables in before dawn, weighed on arrival, nothing held over from yesterday.",
    img: "/images/produce.jpg",
    alt: "Produce delivered to the kitchen before dawn",
  },
  {
    at: "06:30",
    label: "Portioned for you",
    line: "Your calorie target sets the weight of every meal. Every meal is weighed in grams before sealing.",
    img: "/images/brand/meals-weighed-in-kitchen.webp",
    alt: "A meal tray being weighed on a kitchen scale",
  },
  {
    at: "07:30",
    label: "Your tray, your numbers",
    line: "Your name, meal slot and calculated macros stay with the tray through dispatch.",
    img: "/images/kitchen.jpg",
    alt: "The kitchen line packing labelled trays",
  },
  {
    at: "7–10 AM",
    label: "At your door",
    line: "Your meals arrive with their calories and macros already filled into your diary.",
    img: "/images/ai/story/pune-delivery.webp",
    alt: "A morning meal delivery being handed to a customer at their apartment",
  },
];

/* ── The three services that have a photograph ──────────────────────────────
   Each is a real route with a real model behind it: 952 Exercise rows,
   app/corporate + CORP_PLANS, and Partner rows with tracked payouts. */
export type Trio = {
  href: string;
  stat: string;
  label: string;
  blurb: string;
  img: string;
};

export const TRIO: Trio[] = [
  {
    href: "/dashboard/exercises",
    stat: "952 exercises",
    label: "Training",
    blurb:
      "Sets, reps and rest programmed into your week, burn fed back into today's net.",
    img: "/images/training.jpg",
  },
  {
    href: "/corporate",
    stat: "From ₹110 a meal",
    label: "For offices",
    blurb:
      "One hot lunch a day at the desk, personalised by goal and diet, trays labelled per person.",
    img: "/images/brand/weekday-lunch.webp",
  },
  {
    href: "/partners",
    stat: "Partner network",
    label: "Gyms & trainers",
    blurb:
      "Your gym or trainer puts your plan on your account and gets paid for it.",
    img: "/images/gym.jpg",
  },
];

/* ── The day target ─────────────────────────────────────────────────────────
   The three goals the TDEE calculator already hands a customer, as round
   targets. Nothing per-dish is invented from these: the arithmetic printed on
   a card is the dish's own macros against the target the visitor picked. */
export type Goal = {
  key: string;
  label: string;
  /** The goal as lib/tdee.ts names it, so a profile can be run through the real
   *  engine rather than against a second table of adjustments living here. */
  goal: FitnessGoal;
  /** The round figure someone who has NOT set their numbers gets. Deliberately
   *  coarse: it is a placeholder for a real calculation, and dressing it up as
   *  a precise figure would hide that. */
  kcal: number;
  protein: number;
};

export const GOALS: Goal[] = [
  { key: "cut", label: "Cut", goal: "weight_loss", kcal: 1600, protein: 120 },
  { key: "maintain", label: "Maintain", goal: "maintenance", kcal: 2000, protein: 140 },
  { key: "build", label: "Build", goal: "muscle_gain", kcal: 2600, protein: 170 },
];

/* ── The coach, as a four-week example ─────────────────────────────────────
   An ILLUSTRATION of lib/coach/recalibration.ts, not a customer's data: a
   a trend outside the goal tolerance moving the target by the engine's capped
   300 kcal/day is exactly what that module does. The copy says "an example
   month" so nobody reads
   these as somebody's results. */
export const COACH_WEEKS: { w: string; kg: number; note: string }[] = [
  { w: "Week 1", kg: 78.4, note: "Baseline set at 2,000 kcal" },
  { w: "Week 2", kg: 78.1, note: "On track, no change" },
  { w: "Week 3", kg: 78.0, note: "Stall flagged" },
  { w: "Week 4", kg: 78.1, note: "Target recommendation: 1,700 kcal" },
];

/* ── The progress screen's calorie chart, as an example shape ─────────────
   An ILLUSTRATION of lib/progress.ts's calorie chart, not a customer's data:
   thirty days of net calories against the 2,000 kcal target the sample plan
   carries (SAMPLE_PLAN.calorieTarget in app/dashboard-preview/sample-data.ts,
   and the Maintain goal above). The burn is the sample workout's own figure,
   180 kcal (SAMPLE_DAY.workout.estimatedCalories), so "in" is net plus 180
   on every day. Five days run over target, so the chart shows both bar
   colours the progress screen uses. The chart draws bars only; the dates are
   axis positions, never shown. The copy next to the chart says "Example
   shape" so nobody reads these as somebody's readings. */
const EXAMPLE_CALORIE_NETS = [
  1820, 1950, 2010, 1780, 1890, 1960, 1740, 1880, 2030, 1910,
  1830, 1970, 1760, 1900, 2050, 1840, 1920, 1790, 1980, 1870,
  2010, 1750, 1930, 1860, 1990, 1810, 1940, 2070, 1850, 1900,
];
const EXAMPLE_CALORIE_BURN = 180;

export const EXAMPLE_CALORIES: { days: CaloriePoint[]; target: number } = {
  target: 2000,
  days: EXAMPLE_CALORIE_NETS.map((net, i) => ({
    date: `2026-10-${String(i + 1).padStart(2, "0")}`,
    in: net + EXAMPLE_CALORIE_BURN,
    out: EXAMPLE_CALORIE_BURN,
    net,
  })),
};

/* ── The sample day's totals, summed from its own meals ────────────────────
   The dashboard preview's sample day (SAMPLE_DAY above) is the only place
   the homepage quotes a day's macros from. These are summed here, never
   typed, so the macro visual in HomeCharts cannot drift from the preview. */
export function sampleDayTotals() {
  return SAMPLE_DAY.meals.reduce(
    (t, m) => ({
      kcal: t.kcal + m.recipe.caloriesPerServing,
      protein: t.protein + m.recipe.proteinGrams,
      carbs: t.carbs + m.recipe.carbsGrams,
      fat: t.fat + m.recipe.fatGrams,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** Calories per gram, and shares normalised to 100 — FitFuelApp's method
 *  (4 kcal/g for protein and carbs, 9 for fat), so the shares always sum to
 *  100 even when the stated kcal disagrees slightly with the macros. */
export function macroShares(proteinG: number, carbsG: number, fatG: number) {
  const kcal = [proteinG * 4, carbsG * 4, fatG * 9];
  const total = kcal[0] + kcal[1] + kcal[2];
  const raw = kcal.map((k) => (k / total) * 100);
  const base = raw.map((r) => Math.floor(r));
  const left = 100 - base.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => i)
    .sort((a, b) => raw[b] - base[b] - (raw[a] - base[a]));
  for (let i = 0; i < left; i++) base[order[i % order.length]] += 1;
  return { protein: base[0], carbs: base[1], fat: base[2] };
}

/* ── The 29 conditions, each pointing at the plan that cooks for it ─────────
   These chips used to link to `/plans?q=<label>`. A link sweep found that
   `app/plans/page.tsx` reads exactly two search params — `diet` and `trial` —
   and has never read `q`, so all 29 landed on the unfiltered list of every
   plan. The reader tapped "PCOS" and got every plan with no explanation.

   So they resolve to the plan itself. Every slug below was checked against the
   database (grouped by subCategory, VEG variant preferred) and every one of
   them returns 200. Six needed a name the label does not spell — Diabetes is
   "Diabetic-Friendly", Postpartum is "Post-Pregnancy", Cholesterol shares
   "Heart & Cholesterol", and PCOD shares the "PCOS / PCOD Management" sheet.

   A chip with no plan behind it does not belong in this list at all; that is
   why this is a table and not a slugify() call, which would silently invent
   `/plans/kids-and-teens` and 404. */
export type ConditionLink = { label: string; slug: string };

export const CONDITIONS: ConditionLink[] = [
  { label: "Diabetes", slug: "diabetic-veg" },
  { label: "Pre-diabetes", slug: "pre-diabetic-veg" },
  { label: "Thyroid", slug: "thyroid-veg" },
  { label: "PCOS", slug: "pcos-veg" },
  { label: "PCOD", slug: "pcos-veg" },
  { label: "Hypertension", slug: "hypertension-veg" },
  { label: "Heart health", slug: "heart-health-veg" },
  { label: "Fatty liver", slug: "fatty-liver-veg" },
  { label: "Kidney health", slug: "kidney-health-veg" },
  { label: "Gout", slug: "gout-veg" },
  { label: "Cholesterol", slug: "heart-health-veg" },
  { label: "Anaemia", slug: "anaemia-veg" },
  { label: "Vitamin D", slug: "vitamin-d-veg" },
  { label: "B12 deficiency", slug: "b12-deficiency-veg" },
  { label: "Obesity", slug: "obesity-veg" },
  { label: "Post-surgery", slug: "post-surgery-veg" },
  { label: "Post-Covid", slug: "post-covid-veg" },
  { label: "Cancer recovery", slug: "cancer-recovery-veg" },
  { label: "Postpartum", slug: "post-pregnancy-veg" },
  { label: "Menopause", slug: "menopause-veg" },
  { label: "Fertility", slug: "fertility-veg" },
  { label: "PMS", slug: "pms-veg" },
  { label: "Hormonal acne", slug: "hormonal-acne-veg" },
  { label: "Gut health", slug: "gut-health-veg" },
  { label: "Seniors", slug: "senior-veg" },
  { label: "Kids and teens", slug: "kids-teen-veg" },
  { label: "Ramadan", slug: "ramadan" },
  { label: "Navratri", slug: "navratri" },
  { label: "Shravan", slug: "shravan" },
];

/* ── The homepage wall shows 8 of the 29, plus a "See all" link ─────────────
   2026-11-10 conversion restructure. Three rules, all applied here so the
   wall cannot drift from them:

   1. One chip per plan page. PCOD shares the PCOS sheet and Cholesterol
      shares the Heart health sheet, so the second label of each pair is
      dropped, not the plan. The first label in list order is kept.
   2. Cancer recovery and Kidney health are NOT on the homepage wall
      (regulated-claim caution). This is a homepage-links-only removal: the
      plans, their slugs and their routes are untouched and still reachable
      from /plans and search. Do not "fix" this list by re-adding them.
   3. Eight chips, in list order. The rest of the catalogue is one tap away
      on the "See all" link beside them.

   The full 29 stay in CONDITIONS above; other surfaces that need the whole
   list do not use this. */
const WALL_EXCLUDED_SLUGS = new Set([
  "cancer-recovery-veg",
  "kidney-health-veg",
]);

export const HOMEPAGE_CONDITIONS: ConditionLink[] = (() => {
  const seen = new Set<string>();
  const out: ConditionLink[] = [];
  for (const c of CONDITIONS) {
    if (WALL_EXCLUDED_SLUGS.has(c.slug)) continue;
    if (seen.has(c.slug)) continue;
    seen.add(c.slug);
    out.push(c);
  }
  return out.slice(0, 8);
})();

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I skip a day?",
    a: "Yes, until the cutoff the night before. Skipped days extend the plan rather than expiring.",
  },
  {
    q: "What if I dislike a dish?",
    a: "Rate the meal in your dashboard and contact the kitchen about alternatives. Confirm a swap and any macro differences before the order cutoff.",
  },
  {
    q: "Is the macro count real?",
    a: "Every portion is weighed against the recipe sheet. The figure on the tray is the figure in your diary.",
  },
  {
    q: "Do you deliver on Sundays?",
    a: "Check the delivery days and meal slots offered by the kitchen serving your address before ordering.",
  },
  {
    q: "Can my doctor set the plan?",
    a: "Discuss your clinician's dietary instructions with the kitchen before ordering. Confirm that the menu and portions meet your needs. FitFuel meals are not a substitute for treatment.",
  },
  {
    q: "Is there a lock-in?",
    a: "None. The trial is a single day, and plans are refundable pro-rata on unserved days.",
  },
];

/* ── The plan builder's price matrix ────────────────────────────────────────
   Shape only. The VALUES are read from the seeded PlanPrice rows in
   app/page.tsx — 3,614 of them across 65 distinct (diet × duration × meals)
   combinations — and handed down. A calculator on the homepage quoting numbers
   checkout does not charge is the exact failure lib/trial-price.ts was written
   to end, so this one has no literals of its own.

   Keyed "DURATION|MEALS|DIET". */
export type PriceMatrix = Record<string, number>;

export const priceKey = (duration: string, meals: string, diet: string) =>
  `${duration}|${meals}|${diet}`;

/* ── The positioning, as a comparison you can audit ─────────────────────────
   Verbatim from app/_hp/Wedge.tsx, which has been on no route since it was
   written. Its own comment carries the reasoning and it is worth repeating:
   this is a TABLE and not four cards because a comparison IS a table. A screen
   reader walks rows and columns; a sighted reader scans one column instead of
   holding three paragraphs in memory to spot the difference.

   And every cell is a sentence, never a tick or a cross. A glyph alone puts the
   whole meaning of the row on a 1.5:1 shape, which is exactly the kind of thing
   AGENTS.md rules out.

   The two figures in the last column are the live ones — 952 exercises and the
   condition-plan count — and they are passed in rather than typed here so this
   table cannot drift from the catalogue the rest of the page describes.

   2026-11-10 conversion restructure: the columns changed. The old table
   compared against a fitness app and a supplement brand, neither of which is
   what a Pune customer weighs FitFuel against. The columns are now the three
   real alternatives: healthy options on Zomato/Swiggy, a local tiffin, and
   cooking at home. Competitor cells state only what the category structurally
   does or does not do; no prices, features or ratings are claimed for them. */
export type WedgeRow = {
  what: string;
  aggregator: string;
  tiffin: string;
  home: string;
  us: string;
};

export const WEDGE_COLS = [
  "Healthy options on Zomato/Swiggy",
  "Local tiffin",
  "Cooking at home",
] as const;

export function wedgeRows(exercises: number, conditionPlans: number): WedgeRow[] {
  return [
    {
      what: "Calculates for your body",
      aggregator: "No, you pick from a restaurant menu",
      tiffin: "No, one shared menu",
      home: "Only if you work it out yourself",
      us: "Live weight from your scale, plus height, age, activity and goal",
    },
    {
      what: "Cooks your food",
      aggregator: "Yes, the restaurant cooks it",
      tiffin: "Yes, to one shared menu",
      home: "Yes, you cook it",
      us: "Yes, to your calculated target",
    },
    {
      what: "Weighs the portion",
      aggregator: "No, the restaurant portions it",
      tiffin: "No, ladled by eye",
      home: "Only if you weigh it yourself",
      us: "Weighed in grams, to your target",
    },
    {
      what: "Logs what you ate",
      aggregator: "No",
      tiffin: "No",
      home: "Only what you log yourself",
      us: "Pre-filled from the meal we cooked; you confirm it",
    },
    {
      what: "Programmes your training",
      aggregator: "No",
      tiffin: "No",
      home: "No, unless you plan it",
      us: `${exercises.toLocaleString("en-IN")} exercises, in your week`,
    },
    {
      what: "Tracks the body, not the intent",
      aggregator: "No",
      tiffin: "No",
      home: "Only if you track it yourself",
      us: "Measured weight from compatible scales; other body-composition values labelled as estimates",
    },
    {
      what: "Moves the target when you stall",
      aggregator: "No",
      tiffin: "No",
      home: "Only if you recalculate it",
      us: "Recalculated from your own numbers",
    },
    {
      what: "Built for a diagnosis",
      aggregator: "No, general menus",
      tiffin: "No, one shared menu",
      home: "Only if you plan it",
      us: `${conditionPlans} condition plans`,
    },
  ];
}

/* ── Every surface, listed ──────────────────────────────────────────────────
   From app/_hp/Inside.tsx, verbatim, and its own comment is the argument for
   the shape: "The temptation is to give each of these a section, and that is
   exactly how the last homepage reached 39,708px and 35 headings. A directory
   solves it: one row per surface, hairline separated, the number that proves
   it is real on the right. Ten surfaces cost one screen here and would have
   cost ten screens as feature blocks."

   THIS IS ALSO THE CONTENT THE IMPORTED REDESIGN DROPPED. app/_web/Platform.tsx
   carried eight of these as rows and the redesign replaced it with four stat
   columns — so `/` went from naming eleven dashboard screens to naming none of
   them. The four columns stay (they are the scale); this is what you get after
   you order, which is a different question.

   Every href was checked against app/ before it was written. */
export type Surface = { href: string; name: string; desc: string; stat: string };

export const SURFACES: Surface[] = [
  {
    href: "/dashboard",
    name: "Today",
    stat: "1",
    desc:
      "Your day on one screen: where today's box is, what is logged, what is left, and the delivery you confirm with one tap against the driver's own app rather than a status we typed in ourselves.",
  },
  {
    href: "/dashboard/nutrition",
    name: "The diary",
    stat: "56",
    desc:
      "FitFuel meals arrive pre-filled with weighed macros for one-tap confirmation. Everything else you add per gram from an Indian food database, with water alongside it.",
  },
  {
    href: "/dashboard/exercises",
    name: "Training",
    stat: "952",
    desc:
      "Your programme for the day, the exercise library behind it, and sets, reps and load logged against each session.",
  },
  {
    href: "/dashboard/body-metrics",
    name: "Body metrics",
    stat: "18",
    desc:
      "Weight, body fat, muscle mass, visceral fat, BMI and twelve more, read straight off a Bluetooth scale in the browser. No companion app.",
  },
  {
    href: "/dashboard/progress",
    name: "Progress",
    stat: "30d",
    desc:
      "Thirty-day charts, the consistency score with its five components, the weekly review, and the recalibration you approve or ignore.",
  },
  {
    href: "/dashboard/supplements",
    name: "Supplements",
    stat: "46",
    desc:
      "A goal- and diet-aware shortlist from the catalogue. Educational first, with affiliate links disclosed before you leave FitFuel.",
  },
  {
    href: "/dashboard/referrals",
    name: "Referrals",
    stat: "Rs 500",
    desc:
      "Your code, your link, who used it, and the credit ledger behind it. Rs 500 to you after their first order, Rs 200 off for them.",
  },
  {
    href: "/dashboard/partners",
    name: "Partner console",
    stat: "8",
    desc:
      "For gyms, trainers, dieticians, doctors, offices and residences: referrals, conversions, rewards and payouts.",
  },
  {
    href: "/dashboard/notification-settings",
    name: "Notifications",
    stat: "18",
    desc:
      "Eighteen message templates across WhatsApp and email, every one of them switchable per channel. Nothing is sent that you did not leave on.",
  },
  /* THE "ORDER TRACKING" ROW IS DELIBERATELY GONE, and this note is here so it
     is not helpfully restored.

     Inside.tsx listed it as a tenth surface pointing at `/order`. A link sweep
     of all 122 hrefs the homepage renders found exactly one 404, and it was
     that one: `app/order/` holds `confirmation/page.tsx` and `success/route.ts`
     (a PayU webhook, not a page) and nothing else. Inside.tsx's own comment
     claims every href was checked against app/ — it was stale, and the
     component being on no route is why nobody noticed.

     It is not restored with a corrected href either, because the surface it
     describes is `app/dashboard/DeliveryConfirmCard.tsx` — which is the "Today"
     row above, whose description already ends "and the delivery you confirm
     with one tap". Pointing both rows at /dashboard would be padding a
     directory of real screens with the same screen twice, which is the exact
     habit the rest of this page was built to avoid. Nine surfaces that exist
     beats ten where one is a duplicate and a 404. */
];
