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
    label: "Cooked to the sheet",
    line: "Every portion goes on a scale against your macros, not an eyeballed ladle.",
    img: "/images/chef-hands.jpg",
    alt: "A cook portioning a dish against the recipe sheet",
  },
  {
    at: "07:30",
    label: "Trays labelled, drivers load",
    line: "Named trays, our riders. No aggregator takes 40 paise of your rupee.",
    img: "/images/kitchen.jpg",
    alt: "The kitchen line packing labelled trays",
  },
  {
    at: "08:00",
    label: "Logged, not guessed",
    line: "Breakfast arrives already in your diary — macros counted, nothing to type in.",
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
    img: "/images/corporate.jpg",
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

/* ── The four that do not ───────────────────────────────────────────────────
   A stat, a name, a line and three claims each. Every row was checked against
   prisma/schema.prisma and app/dashboard/* before it was written. */
export type Minor = {
  idx: string;
  href: string;
  stat: string;
  label: string;
  blurb: string;
  rows: string[];
};

export const MINOR: Minor[] = [
  {
    idx: "01",
    href: "/dashboard/coach",
    stat: "Recalibrates weekly",
    label: "The AI coach",
    blurb:
      "Four weigh-ins that disagree with your goal move your target, with the arithmetic shown.",
    rows: [
      "Reads weight, adherence and training load",
      "Moves kcal in 80-kcal steps, never blind",
      "Every change is shown as a sum, not a verdict",
    ],
  },
  {
    idx: "02",
    href: "/dashboard/trainer",
    stat: "Reads your last 30 days",
    label: "Ask the coach",
    blurb:
      "Why the scale stalled, whether your protein is short, what to eat tonight.",
    rows: [
      "Answers grounded in your own logged days",
      "Suggests dishes from tonight's menu",
      "Flags the week you under-ate protein",
    ],
  },
  {
    idx: "03",
    href: "/plans/digital",
    stat: "Recipes, no delivery",
    label: "Digital plans",
    blurb:
      "The 30-day recipe book, macros and grocery list, without the delivery.",
    rows: [
      "30 days of recipes with weights",
      "Grocery list, split by week",
      "For cities we do not cook in yet",
    ],
  },
  {
    idx: "04",
    href: "/supplements",
    stat: "6 retailers compared",
    label: "Supplements, priced",
    blurb:
      "Researched against your plan and compared across six retailers. We hold no stock.",
    rows: [
      "Only what your logged intake is short of",
      "Live price across six sellers",
      "We take no cut on the click",
    ],
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

/* ── The coach, as four weigh-ins ───────────────────────────────────────────
   An ILLUSTRATION of lib/coach/recalibration.ts, not a customer's data: a
   stall in week three moving the target by two 80-kcal steps is exactly what
   that module does. The copy above it says "an example week" so nobody reads
   these as somebody's results. */
export const COACH_WEEKS: { w: string; kg: number; note: string }[] = [
  { w: "Week 1", kg: 78.4, note: "Baseline set at 2,000 kcal" },
  { w: "Week 2", kg: 78.1, note: "On track, no change" },
  { w: "Week 3", kg: 78.0, note: "Stall flagged" },
  { w: "Week 4", kg: 78.1, note: "Target moved to 1,840" },
];

/* ── The 29 conditions the kitchen cooks for ────────────────────────────────
   This is the app's canonical list, previously the single copy inside
   HomeBands.tsx. The redesign shipped its own 28-item list carrying conditions
   we have no plan for — CKD staging, sleep apnoea, endometriosis — and a chip
   that leads to nothing is worse than a shorter list that all resolves. */
export const CONDITIONS = [
  "Diabetes", "Pre-diabetes", "Thyroid", "PCOS", "PCOD", "Hypertension",
  "Heart health", "Fatty liver", "Kidney health", "Gout", "Cholesterol",
  "Anaemia", "Vitamin D", "B12 deficiency", "Obesity", "Post-surgery",
  "Post-Covid", "Cancer recovery", "Postpartum", "Menopause", "Fertility",
  "PMS", "Hormonal acne", "Gut health", "Seniors", "Kids and teens",
  "Ramadan", "Navratri", "Shravan",
];

/* ── Breakfast drop times ───────────────────────────────────────────────────
   Eight of the fifteen suburbs in app/_hp/areas-data.ts — the ones on the
   morning run. The full footprint, plotted from published coordinates with the
   3/6/9km rings, is the map behind the location chip and /locations, and this
   table links there rather than implying eight is the whole footprint. */
export const AREA_DROPS: { a: string; t: string }[] = [
  { a: "Kharadi", t: "07:30" },
  { a: "Viman Nagar", t: "07:45" },
  { a: "Kalyani Nagar", t: "08:00" },
  { a: "Koregaon Park", t: "08:15" },
  { a: "Magarpatta City", t: "08:15" },
  { a: "Mundhwa", t: "08:30" },
  { a: "Wagholi", t: "08:30" },
  { a: "Yerwada", t: "08:45" },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "Can I skip a day?",
    a: "Yes, until the cutoff the night before. Skipped days extend the plan rather than expiring.",
  },
  {
    q: "What if I dislike a dish?",
    a: "Tell the kitchen once. It never comes back on your plan, and a swap of equal macros replaces it.",
  },
  {
    q: "Is the macro count real?",
    a: "Every portion is weighed against the recipe sheet. The figure on the tray is the figure in your diary.",
  },
  {
    q: "Do you deliver on Sundays?",
    a: "Breakfast only. The kitchen prepares Sunday's produce on Saturday evening.",
  },
  {
    q: "Can my doctor set the plan?",
    a: "Send us the prescription. Clinical plans are cooked to the diagnosis and reviewed every month.",
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
   table cannot drift from the catalogue the rest of the page describes. */
export type WedgeRow = {
  what: string;
  tiffin: string;
  app: string;
  supp: string;
  us: string;
};

export const WEDGE_COLS = [
  "A tiffin service",
  "A fitness app",
  "A supplement brand",
] as const;

export function wedgeRows(exercises: number, conditionPlans: number): WedgeRow[] {
  return [
    {
      what: "Cooks your food",
      tiffin: "Yes, to one shared menu",
      app: "No",
      supp: "No",
      us: "Yes, to your macros",
    },
    {
      what: "Weighs the portion",
      tiffin: "No, ladled by eye",
      app: "No, you estimate it",
      supp: "Only the scoop",
      us: "On a scale, before sealing",
    },
    {
      what: "Logs what you ate",
      tiffin: "No",
      app: "Only what you type in",
      supp: "No",
      us: "Automatically — it is the same system",
    },
    {
      what: "Programmes your training",
      tiffin: "No",
      app: "Sometimes, sold separately",
      supp: "No",
      us: `${exercises.toLocaleString("en-IN")} exercises, in your week`,
    },
    {
      what: "Tracks the body, not the intent",
      tiffin: "No",
      app: "If you own the scale and remember",
      supp: "No",
      us: "13 measures, read off your scale",
    },
    {
      what: "Moves the target when you stall",
      tiffin: "No",
      app: "No, it just keeps counting",
      supp: "No",
      us: "Recalculated from your own numbers",
    },
    {
      what: "Built for a diagnosis",
      tiffin: "No",
      app: "Generic macro maths",
      supp: "No",
      us: `${conditionPlans} condition plans`,
    },
  ];
}
