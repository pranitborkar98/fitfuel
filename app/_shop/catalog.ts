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
import { DELIVERY_COUNT, type PlanDurationKey } from "@/lib/pricing-decomposition";
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

/** The six courses plus their counts, as the "shop by course" grid reads them. */
export const COURSES: { key: MenuCategoryKey; label: string; note: string; n: number; items: ShopDish[] }[] =
  MENU.map((c) => ({
    key: c.key,
    label: c.label,
    note: c.note,
    n: c.items.length,
    items: c.items.map((i) => SHOP_DISH_BY_ID.get(dishId(i.name))!).filter(Boolean),
  }));

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

/* ── Plan rows, as the sheet reads them ────────────────────────────────────
   ShopPlan is the shape PlanSheet consumes: a database-backed plan row
   shaped to it, with the seeded day-one macro line. (The hand-written
   six-row SHOP_PLANS array that used to sit here was deleted with the dead
   Shop storefront; only the type survives.) */

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

export const PLAN_CATS: { key: string; label: string }[] = [
  { key: "all", label: "All plans" },
  { key: "STANDARD", label: "Goal plans" },
  { key: "LIFESTYLE_MEDICAL", label: "Medical & lifestyle" },
  { key: "SPORTS", label: "Sports nutrition" },
];
