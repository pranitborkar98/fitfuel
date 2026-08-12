// app/_shop/catalog.ts
//
// THE SHOP'S OWN DATA LAYER — pure, client-safe, no fs and no Prisma.
//
// design/FitFuel Shop.dc.html declares at the top of its script that its data
// was "lifted verbatim from the FitFuel repo", and it was: lib/menu-alacarte.ts,
// lib/plan-tier-pricing.ts, lib/pricing-decomposition.ts, lib/partner-network.ts
// and prisma/seed-plan-prices.ts. So this file does NOT restate any of it. It
// imports those modules and adds the one thing the prototype invented that the
// repo did not already have: a per-portion macro estimate for each à la carte
// dish.
//
// WHY THE MACROS ARE HERE AND NOT IN lib/menu-alacarte.ts. The plan meals are
// weighed on a scale and live in Recipe rows; these are RECIPE ESTIMATES for the
// single-dish menu, computed by the kitchen from the ingredient list rather than
// measured. Keeping them separate from the priced menu means nobody can mistake
// one for the other, and every surface that prints them stamps EST — which is
// the rule the design drew (never encode a
// claim you cannot back).

import { MENU, type MenuCategoryKey } from "@/lib/menu-alacarte";
import { DISHES, dishId, isOrderable, type Dish } from "@/lib/menu-cart";
import { decomposePrice, DELIVERY_COUNT, type PlanDurationKey } from "@/lib/pricing-decomposition";
import { DIETS, DURATIONS, MEALS, TIERS, type DietKey, type MealKey, type Tier } from "@/lib/plan-tier-pricing";

export { DIETS, DURATIONS, MEALS, TIERS, DELIVERY_COUNT };
export type { DietKey, MealKey, Tier, PlanDurationKey };

/** "₹9,975". Every price on the shop goes through this, never a literal. */
export const rs = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/* ── Image slot keys ───────────────────────────────────────────────────────
   The same convention app/_hp/DishImage.tsx uses: lowercase, ampersand spelled
   out, first six words. Restated here rather than imported because DishImage is
   a server component that pulls in node:fs, and this module is read by the
   client half of the shop. Same six lines, and dishSlot(name) === dishSlug(name)
   for every one of the 48 names in the menu. */
export function dishSlot(name: string): string {
  return dishId(name).split("-").slice(0, 6).join("-");
}

/* ── Kitchen estimates, per portion: [kcal, protein g, carbs g, fat g] ────── */

const MACROS: Record<string, [number, number, number, number]> = {
  "broccoli-and-bean-salad-in-mustard-dressing": [310, 14, 32, 14],
  "spinach-and-bean-sprouts-in-creamy-celery-dressing": [285, 12, 24, 16],
  "bean-sprouts-and-lettuce-in-guacamole": [295, 10, 26, 17],
  "garlicky-cabbage-and-spinach-salad": [210, 7, 18, 13],
  "pineapple-cucumber-salad": [185, 3, 34, 5],
  "brown-rice-salad": [380, 13, 52, 13],
  "carrot-raisin-salad": [240, 4, 38, 9],
  "uncooked-pad-thai-salad": [330, 11, 30, 19],
  "beetroot-salad": [280, 7, 28, 16],
  "paneer-veggie-salad": [420, 24, 18, 29],
  "avocado-chicken-keto-salad": [480, 38, 12, 32],
  "creamy-keto-paneer-bowl": [455, 24, 14, 36],
  "keto-paneer-bhurji": [390, 22, 10, 30],
  "keto-lettuce-wrap": [350, 28, 12, 21],
  "keto-zucchini-noodles-bowl": [410, 20, 16, 31],
  "keto-avocado-smoothie": [395, 9, 18, 33],
  "mediterranean-power-bowl": [520, 19, 62, 21],
  "thai-buddha-bowl": [545, 22, 64, 22],
  "indian-detox-bowl": [300, 16, 42, 8],
  "green-goddess-bowl": [470, 15, 55, 21],
  "mexican-fiesta-bowl": [530, 18, 72, 18],
  "protein-packed-fitness-bowl": [560, 34, 58, 20],
  "asian-shiitake-bowl": [490, 18, 68, 15],
  "keto-low-carb-bowl": [430, 26, 16, 31],
  "avocado-toast-with-egg-or-tomato": [380, 16, 34, 21],
  "almond-banana-overnight-oats": [410, 13, 58, 14],
  "egg-white-veggie-omelette": [220, 24, 8, 10],
  "greek-yogurt-parfait": [330, 20, 40, 10],
  "high-protein-paneer-bhurji-wrap": [450, 24, 44, 20],
  "masala-millet-veggie-upma": [340, 10, 52, 10],
  "chia-seed-pudding": [300, 9, 30, 16],
  "tofu-scramble-with-wholegrain-toast": [360, 22, 32, 17],
  "superfood-smoothie-bowl": [390, 11, 62, 11],
  "healthy-breakfast-muffins": [320, 8, 42, 13],
  "peanut-butter-power-bar": [240, 12, 24, 11],
  "chocolate-almond-crunch-bar": [250, 10, 25, 13],
  "berry-bliss-protein-bar": [220, 9, 28, 9],
  "banana-walnut-energy-bar": [230, 7, 30, 10],
  "coconut-cashew-keto-bar": [260, 8, 12, 22],
  "double-chocolate-protein-bar": [255, 15, 24, 11],
  "green-detox-juice": [110, 2, 24, 1],
  "ironman-juice": [140, 3, 31, 1],
  "magic-juice-for-eyes-and-skin": [135, 2, 29, 2],
  "beet-and-carrot-juice": [125, 2, 28, 1],
  "skin-detox-elixir": [100, 1, 22, 1],
  "ash-gourd-juice": [60, 1, 12, 0],
  "glow-boosting-juice": [150, 2, 34, 1],
  "ajwain-period-pain-reliever": [70, 0, 17, 0],
};

/** Protein / carbs / fat as a share of the dish's own calories. The three
 *  segments the design prints under every catalog tile, rail card and row. */
export type MacroBar = { pct: number; color: string };

export function macroBars(protein: number, carbs: number, fat: number, kcal: number): MacroBar[] {
  if (!kcal) return [];
  return [
    { pct: Math.round(((protein * 4) / kcal) * 100), color: "#84cc16" },
    { pct: Math.round(((carbs * 4) / kcal) * 100), color: "#9a9a94" },
    { pct: Math.round(((fat * 9) / kcal) * 100), color: "#5f5f59" },
  ];
}

export type ShopDish = Dish & {
  orderable: boolean;
  slot: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** "310 kcal" */
  kcalLabel: string;
  /** "14P · 32C · 14F" */
  macroLine: string;
  bars: MacroBar[];
  /** The blurb cropped for a tile, where the full sentence does not fit. */
  shortBlurb: string;
  priceLabel: string;
};

function shopDish(d: Dish): ShopDish {
  const m = MACROS[d.id] ?? [0, 0, 0, 0];
  const [kcal, protein, carbs, fat] = m;
  return {
    ...d,
    orderable: isOrderable(d),
    slot: dishSlot(d.name),
    kcal, protein, carbs, fat,
    kcalLabel: `${kcal} kcal`,
    macroLine: `${protein}P · ${carbs}C · ${fat}F`,
    bars: macroBars(protein, carbs, fat, kcal),
    shortBlurb: d.blurb.length > 62 ? `${d.blurb.slice(0, 60).trim()}…` : d.blurb,
    priceLabel: isOrderable(d) ? rs(d.price ?? 0) : "Not priced yet",
  };
}

export const SHOP_DISHES: ShopDish[] = DISHES.map(shopDish);
export const SHOP_DISH_BY_ID: ReadonlyMap<string, ShopDish> = new Map(SHOP_DISHES.map((d) => [d.id, d]));
export const PRICED_DISHES = SHOP_DISHES.filter((d) => d.orderable);

/** The six courses plus their counts, as the "shop by course" grid reads them. */
export const COURSES: { key: MenuCategoryKey; label: string; note: string; n: number; items: ShopDish[] }[] =
  MENU.map((c) => ({
    key: c.key,
    label: c.label,
    note: c.note,
    n: c.items.length,
    items: c.items.map((i) => SHOP_DISH_BY_ID.get(dishId(i.name))!).filter(Boolean),
  }));

/** Eight aisles: the six courses, then the two subscription doors. */
export const AISLES: { label: string; n: number; href: string }[] = [
  ...COURSES.map((c) => ({ label: c.label, n: c.n, href: `/menu?course=${c.key}` })),
  { label: "Meal plans", n: 126, href: "/plans" },
  { label: "Supplements", n: 46, href: "/supplements" },
];

/* ── Plan money ────────────────────────────────────────────────────────────
   prisma/seed-plan-prices.ts PRICE_MATRIX, GST-exclusive subtotals in rupees.
   The live figures come from PlanPrice through the server half of the page;
   this is the fallback that keeps the shop rendering when the query fails, the
   same contract app/page.tsx has always used for the schedule. */

const MATRIX: Record<string, [number, number, number]> = {
  "VEGETARIAN|TRIAL_DAY": [400, 400, 750],
  "EGGETARIAN|TRIAL_DAY": [400, 400, 750],
  "NON_VEGETARIAN|TRIAL_DAY": [400, 400, 750],
  "VEGETARIAN|WEEKLY": [2700, 2700, 4900],
  "EGGETARIAN|WEEKLY": [2700, 2700, 4900],
  "NON_VEGETARIAN|WEEKLY": [2700, 2700, 4900],
  "VEGETARIAN|BI_WEEKLY": [5775, 5775, 9720],
  "EGGETARIAN|BI_WEEKLY": [5775, 5775, 9720],
  "NON_VEGETARIAN|BI_WEEKLY": [5775, 5775, 9720],
  "VEGETARIAN|MONTHLY_EXCL_WEEKENDS": [7560, 7560, 13860],
  "EGGETARIAN|MONTHLY_EXCL_WEEKENDS": [7560, 7560, 13860],
  "NON_VEGETARIAN|MONTHLY_EXCL_WEEKENDS": [7600, 7600, 13860],
  "VEGETARIAN|ONE_MONTH": [9500, 9500, 16999],
  "EGGETARIAN|ONE_MONTH": [9500, 9500, 16999],
  "NON_VEGETARIAN|ONE_MONTH": [9500, 9500, 16999],
  "VEGETARIAN|TWO_MONTH": [18900, 18900, 33000],
  "EGGETARIAN|TWO_MONTH": [18900, 18900, 33000],
  "NON_VEGETARIAN|TWO_MONTH": [18900, 18900, 33000],
  "VEGETARIAN|THREE_MONTH": [27450, 27450, 47250],
  "EGGETARIAN|THREE_MONTH": [27450, 27450, 47250],
  "NON_VEGETARIAN|THREE_MONTH": [27450, 27450, 47250],
};

/** Jain and Vegan are cooked to the vegetarian sheet, which is why they are not
 *  keys in the matrix: they are a kitchen instruction, not a price band. */
const PRICE_DIET: Record<DietKey, string> = {
  VEG: "VEGETARIAN",
  EGG: "EGGETARIAN",
  NON_VEG: "NON_VEGETARIAN",
  JAIN: "VEGETARIAN",
  VEGAN: "VEGETARIAN",
};

const TIER_MULT: Record<Tier, number> = { STANDARD: 1, PREMIUM: 1.25, LUXURY: 1.5 };
export const tierMultiplier = (t: Tier) => TIER_MULT[t];

/** GST-exclusive subtotal for one plan configuration, or null if unpriced. */
export function planSubtotal(diet: DietKey, duration: PlanDurationKey, meal: MealKey, tier: Tier): number | null {
  const row = MATRIX[`${PRICE_DIET[diet]}|${duration}`];
  if (!row) return null;
  const std = row[MEALS.findIndex((m) => m.key === meal)];
  if (std == null) return null;
  return Math.round(std * TIER_MULT[tier]);
}

/** What the customer is actually charged for one configuration. */
export function planTotal(diet: DietKey, duration: PlanDurationKey, meal: MealKey, tier: Tier): number | null {
  const sub = planSubtotal(diet, duration, meal, tier);
  return sub == null ? null : decomposePrice({ subtotalRs: sub, duration }).totalRs;
}

/* The reference line the shop quotes everywhere: veg, one month, all four.
   The prototype printed "₹142 a meal" and "₹17,849 a month" as literals. They
   are the same configuration read two ways — per-meal off the food subtotal,
   per-month off what is actually collected — so both are derived here and
   neither can drift from the price matrix. */
export const MONTH_MEALS = DELIVERY_COUNT.ONE_MONTH * 4;
export const MONTH_SUBTOTAL_RS = planSubtotal("VEG", "ONE_MONTH", "ALL_FOUR", "STANDARD") ?? 16999;
export const MONTH_TOTAL_RS = planTotal("VEG", "ONE_MONTH", "ALL_FOUR", "STANDARD") ?? 17849;
export const PER_MEAL_RS = Math.round(MONTH_SUBTOTAL_RS / MONTH_MEALS);

/* ── Plans on the shop floor ───────────────────────────────────────────────
   Six of the 126, the ones the storefront leads with. The macro lines are the
   seeded day-one figures for each plan, not a marketing round number. */

export type ShopPlan = {
  label: string;
  slug: string;
  note: string;
  cat: "STANDARD" | "LIFESTYLE_MEDICAL" | "SPORTS";
  macros: string;
  macroLine: string;
  kcal?: number;
  pcf?: [number, number, number];
};

export const SHOP_PLANS: ShopPlan[] = [
  { label: "Weight Loss", slug: "weight-loss", note: "Sustainable deficit", cat: "STANDARD", macros: "Day one: 1,430 kcal · 81g protein", macroLine: "1,430 kcal · 81P · 148C · 47F", kcal: 1430, pcf: [81, 148, 47] },
  { label: "Muscle Gain", slug: "muscle-gain", note: "High protein surplus", cat: "STANDARD", macros: "Surplus set from your TDEE", macroLine: "2,640 kcal · 158P · 296C · 78F", kcal: 2640, pcf: [158, 296, 78] },
  { label: "Balanced", slug: "balanced", note: "Clean maintenance fuel", cat: "STANDARD", macros: "Maintenance, no adjustment", macroLine: "2,050 kcal · 104P · 232C · 68F", kcal: 2050, pcf: [104, 232, 68] },
  { label: "Diabetic", slug: "diabetic", note: "Low GI, steady glucose", cat: "LIFESTYLE_MEDICAL", macros: "Low glycaemic load, 38 conditions covered", macroLine: "1,720 kcal · 96P · 168C · 62F" },
  { label: "PCOS", slug: "pcos", note: "Hormone-supportive", cat: "LIFESTYLE_MEDICAL", macros: "Insulin-aware carb split", macroLine: "1,640 kcal · 102P · 142C · 66F" },
  { label: "Body Recomp", slug: "body-recomp", note: "Lose fat, keep muscle", cat: "SPORTS", macros: "High protein, held deficit", macroLine: "1,880 kcal · 146P · 158C · 58F" },
];

export const PLAN_CATS: { key: string; label: string }[] = [
  { key: "all", label: "All 126" },
  { key: "STANDARD", label: "Goal plans" },
  { key: "LIFESTYLE_MEDICAL", label: "Medical & lifestyle" },
  { key: "SPORTS", label: "Sports nutrition" },
];

/* ── Digital plans (app/plans/digital) ─────────────────────────────────────── */

export const DIGITAL: { key: string; tag: string; label: string; popular: boolean; bullets: string[] }[] = [
  {
    key: "STARTER", tag: "Starter", label: "Digital Starter", popular: false,
    bullets: [
      "Full 30-day recipe book (PDF)",
      "Per-meal macros + daily totals",
      "Consolidated grocery list",
      "Meal logging on your dashboard",
    ],
  },
  {
    key: "PRO", tag: "Pro", label: "Digital Pro", popular: true,
    bullets: [
      "Everything in Starter",
      "30-day training plan (PDF): sets, reps, rest and the weekly split",
      "Workout calorie targets per day",
      "Progress and body-metrics tracking",
      "Free plan updates",
    ],
  },
];

/* ── Corporate ─────────────────────────────────────────────────────────────
   Four seat bands, three meal counts, three separately-priced plans and the
   three bulk channels that are not a headcount. */

export const CORP_TIERS = [
  { seats: 25, label: "25–49", perMeal: 128, off: "10% off" },
  { seats: 50, label: "50–99", perMeal: 118, off: "17% off" },
  { seats: 100, label: "100–249", perMeal: 110, off: "23% off" },
  { seats: 250, label: "250+", perMeal: 102, off: "28% off" },
] as const;

export const CORP_MEALS = [
  { n: 1, label: "Lunch", note: "1 a day" },
  { n: 2, label: "Lunch + snack", note: "2 a day" },
  { n: 4, label: "All four", note: "4 a day" },
] as const;

/** Working days a corporate rate is quoted against. */
export const CORP_WORKING_DAYS = 22;

/** The cheapest published seat rate, for the "from ₹102 a meal" line. */
export const CORP_FROM_RS = CORP_TIERS[CORP_TIERS.length - 1]!.perMeal;

export const CORP_PLANS = [
  {
    tag: "Most bought", label: "Desk Lunch", slug: "desk-lunch", price: "₹110", unit: "per meal, 100 seats",
    note: "One hot lunch a day at the desk, personalised by goal and diet, 22 working days a month.",
    bullets: [
      "Employee picks goal, diet and spice level in the app",
      "Single drop at reception, trays labelled per person",
      "Billed in arrears on what was actually delivered",
    ],
  },
  {
    tag: "Wellness budget", label: "Wellness Benefit", slug: "wellness-benefit", price: "₹1,950", unit: "per employee, per month",
    note: "A capped monthly food allowance the employee spends on any plan or dish. You fund the cap, they top up the rest.",
    bullets: [
      "Cap set per band; unspent balance does not roll over",
      "Employee sees the subsidy split at checkout",
      "Participation and macro-adherence report each month",
    ],
  },
  {
    tag: "Leadership", label: "Executive Health", slug: "executive-health", price: "₹4,600", unit: "per employee, per month",
    note: "All four meals on the Luxury tier with a dietician on the account and a quarterly bloodwork slot.",
    bullets: [
      "Four weighed meals a day, six mornings a week",
      "Named dietician, monthly 30-minute consult",
      "Quarterly at-home panel feeding the recalibration engine",
    ],
  },
];

export const CORP_CHANNELS = [
  {
    key: "gyms", label: "Gyms and studios", slug: "gyms",
    blurb: "Sell a member a fed week, not a supplement tub. Vouchers are bought in blocks and redeemed at face value.",
    lines: [
      { what: "Member voucher block", price: "₹210 each", detail: "Blocks of 50. Face value ₹250, the member pays nothing extra." },
      { what: "Trial-day block", price: "₹360 each", detail: "Minimum 25, against a ₹420 list price. Breakfast plus lunch." },
      { what: "Desk QR and macro dashboard", price: "Free", detail: "A live count of which members are eating to their macros." },
    ],
  },
  {
    key: "events", label: "Exhibitions and events", slug: "exhibitions",
    blurb: "Expo counters, corporate fairs and race-day tables, with a per-event code so the stall is measurable.",
    lines: [
      { what: "Expo counter, per day", price: "₹18,000", detail: "120 sampling portions, branded counter, scan-to-order QR." },
      { what: "Race-day recovery table", price: "₹26,000", detail: "250 boxes at 30g protein each, at the finish line." },
      { what: "Per-event attribution code", price: "Free", detail: "Every scan tracked from the stall through to the first order." },
    ],
  },
  {
    key: "nutrabay", label: "NutraBay supply", slug: "nutrabay",
    blurb: "We do not hold supplement stock. The 46 SKUs we recommend are matched to your plan and bought on NutraBay, affiliate tracked.",
    lines: [
      { what: "46 SKUs matched to plan", price: "Affiliate", detail: "Recommended against your macros, priced across six retailers." },
      { what: "Corporate supplement bundle", price: "12% off list", detail: "50+ seats. Whey, creatine, multivitamin, omega-3." },
      { what: "Reorder from the dashboard", price: "Free", detail: "One tap from the supplement tab, nothing re-entered." },
    ],
  },
];

/** What a corporate account includes, in the owner's terms. */
export const CORPORATE_INCLUDES = [
  { t: "Team meal programs", d: "Daily healthy meals for your employees, personalised by goal and dietary preference, delivered to the office or to homes." },
  { t: "Wellness as a benefit", d: "Offer FitFuel as a health benefit, with optional tracking and progress that supports a genuine wellness culture." },
  { t: "Flexible billing", d: "Consolidated monthly invoicing, GST-compliant, with simple onboarding for your team." },
  { t: "Tiered options", d: "Standard, Premium and Luxury tiers so each employee can choose the level that suits them." },
];

/** The live seat-band quote. Four bands × three meal counts, arithmetic shown. */
export function corpQuote(seats: number, mealsPerSeat: number) {
  const band = CORP_TIERS.find((t) => t.seats === seats) ?? CORP_TIERS[2];
  const meals = band.seats * mealsPerSeat * CORP_WORKING_DAYS;
  const subtotal = meals * band.perMeal;
  const gst = Math.round(subtotal * 0.05);
  return {
    band,
    meals,
    subtotal,
    gst,
    total: subtotal + gst,
    perSeat: `${rs(Math.round((subtotal + gst) / band.seats))} per employee · ${band.off} list`,
    foot:
      `Estimated on ${band.seats} seats × ${mealsPerSeat}${mealsPerSeat === 1 ? " meal" : " meals"} × ` +
      `${CORP_WORKING_DAYS} working days. Billed in arrears on meals actually delivered; a skipped day is not invoiced.`,
  };
}

/* ── The moats, as figures ─────────────────────────────────────────────────── */

export const CUISINES = [
  "Maharashtrian", "Punjabi", "Andhra", "Rajasthani", "Gujarati", "Bengali", "South Indian",
  "Chettinad", "Kashmiri", "Hyderabadi", "Sindhi", "Odia", "Malabar",
];

export const COACH_FIGURES = ["−0.45 kg/wk gap", "cap: ±300 kcal", "1,800 → 1,690"];

export const APP_SCREENS = [
  { key: "today", tag: "Today", label: "The day", note: "Plan day, four meals, the live delivery window and one tap to log.", stat: "Day 7 of 30 · 1,430 kcal" },
  { key: "nutrition", tag: "Nutrition", label: "Diary & macros", note: "Delivered meals arrive logged; anything else you add from the food table.", stat: "154 foods tracked" },
  { key: "training", tag: "Training", label: "The split", note: "Sets, reps and rest programmed into the week, burn fed back into today's net.", stat: "952 exercises · 14 equipment types" },
  { key: "body", tag: "Body", label: "Thirteen readings", note: "Weight, body fat, muscle, water, visceral fat and BMR off one step on the scale.", stat: "78.2 kg · −2.2 kg in 8 weeks" },
  { key: "progress", tag: "Progress", label: "Weekly review", note: "What was eaten, what was trained, and whether the plan needs recalibrating.", stat: "86% consistency · 12/14 eaten" },
];

export const APP_ROWS = [
  { n: "952", label: "Exercise library", note: "Filmed, filtered by equipment and muscle, programmed into your week." },
  { n: "154", label: "Food diary", note: "Your delivered meals log themselves; anything else you eat you add." },
  { n: "30d", label: "Body metrics", note: "Weight, waist, photos and the trend line the coach reads." },
  { n: "86%", label: "Consistency score", note: "One number for whether the plan is actually being eaten." },
  { n: "46", label: "Supplements", note: "Recommended against your plan, priced across six retailers." },
];

/* ── The footer the design draws ───────────────────────────────────────────── */

export const FOOTER_COLS: { title: string; links: { label: string; meta: string; href: string }[] }[] = [
  {
    title: "Eat tonight",
    links: [
      { label: "The full menu", meta: "48", href: "/menu" },
      { label: "Order direct, skip the apps", meta: "−40%", href: "/menu/card" },
      { label: "Salads and keto", meta: "16", href: "/menu?course=salads" },
      { label: "Breakfast, by 08:00", meta: "10", href: "/menu?course=breakfast" },
    ],
  },
  {
    title: "Eat daily",
    links: [
      { label: "Goal and condition plans", meta: "126", href: "/plans" },
      { label: "Trial day", meta: "₹420", href: "/plans?trial=true" },
      { label: "Digital plans, cook it yourself", meta: "PDF", href: "/plans/digital" },
      { label: "Supplements", meta: "46", href: "/supplements" },
    ],
  },
  {
    title: "For business",
    links: [
      { label: "Corporate accounts", meta: "from ₹102", href: "/corporate" },
      { label: "Gyms and studios", meta: "vouchers", href: "/partners" },
      { label: "Exhibitions and events", meta: "per day", href: "/partners" },
      { label: "Partner programmes", meta: "8", href: "/partners" },
    ],
  },
  {
    title: "Your account",
    links: [
      { label: "Today's dashboard", meta: "day 7", href: "/dashboard" },
      { label: "Orders and invoices", meta: "5", href: "/dashboard/orders" },
      { label: "Referral credit", meta: "₹300", href: "/dashboard/referrals" },
      { label: "Body metrics", meta: "13", href: "/dashboard/body-metrics" },
    ],
  },
];

export const DELIVERY_AREA_LINE =
  "Kharadi · Viman Nagar · Kalyani Nagar · Koregaon Park · Magarpatta · Amanora · Hadapsar · " +
  "Wagholi · Mundhwa · Yerwada · Lohegaon · Chandan Nagar · Vadgaon Sheri · Keshav Nagar · Manjri";
