import type { Metadata } from "next";

import StructuredData from "@/components/StructuredData";
import { prisma } from "@/lib/prisma";
import { waLink } from "@/lib/site";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import { tickerCounts } from "@/lib/site-counts";
import { findDishImage } from "./_hp/DishImage";
import { slot as resolveSlot } from "@/lib/site-images";
import { ROTATION, SLOTS } from "./_hp/v2/data";
import Shop, { type ShopDay, type ShopMeal } from "./_shop/Shop";
import { APP_SCREENS, CORP_PLANS, DIGITAL, SHOP_DISHES, dishSlot } from "./_shop/catalog";

/* ══════════════════════════════════════════════════════════════════════
   FITFUEL SHOP — design/FitFuel Shop.dc.html, implemented.

   The prototype is one stateful component, so the page is too: this file
   is the server half. It queries what the database can answer, resolves
   every image slot against public/images/ at build time, and hands the
   lot to app/_shop/Shop.tsx, which is the design.

   WHAT CHANGED FROM THE v2 HOMEPAGE. v2 opened with a hero and argued the
   product before it sold anything. This one opens with a trial day, eight
   aisles and sixteen dishes you can put in a basket, and only then, under
   "Anyone can sell you a salad", argues the moat. Same kitchen, same
   figures, the order of the page reversed.

   THE PAGE CARRIES ITS OWN CHROME, as v2 did: components/ChromeGate skips
   the site navbar and footer on "/" and app/_shop/Chrome.tsx draws the
   header, the six-tab bar and the four-column footer the design specifies.

   LIVE DATA WHERE THERE IS ANY. The week comes from PlanScheduleSlot
   joined to Recipe and the counts from lib/site-counts; each falls back
   to the seeded rotation if the query fails, so the page always renders
   as designed rather than collapsing to an empty section.
══════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SLOT_ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** The seeded rotation, used when the schedule cannot be read. */
function fallbackDays(): ShopDay[] {
  return [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const dishes: ShopMeal[] = ROTATION.map((list, si) => {
      const x = list[d % list.length]!;
      return { slot: SLOTS[si]!, name: x[0], kcal: x[3], protein: x[4], carbs: x[5], fat: x[6] };
    });
    return {
      d,
      dishes,
      kcal: dishes.reduce((n, x) => n + x.kcal, 0),
      protein: dishes.reduce((n, x) => n + x.protein, 0),
    };
  });
}

/** Seven days off the Weight Loss (Veg) schedule, for the rotation picker and
 *  the three plan showcases. */
async function getWeek(): Promise<ShopDay[]> {
  try {
    const plan = await prisma.mealPlan.findUnique({ where: { slug: "weight-loss-veg" }, select: { id: true } });
    if (!plan) throw new Error("no plan");

    const rows = await prisma.planScheduleSlot.findMany({
      where: { mealPlanId: plan.id, dayNumber: { lte: 7 } },
      include: {
        recipe: {
          select: {
            name: true, caloriesPerServing: true,
            proteinGrams: true, carbsGrams: true, fatGrams: true,
          },
        },
      },
    });
    if (!rows.length) throw new Error("no schedule");

    const byDay = new Map<number, ShopMeal[]>();
    for (const x of rows) {
      if (!x.recipe) continue;
      const d = Number(x.dayNumber) - 1;
      const list = byDay.get(d) ?? [];
      list.push({
        slot: ({ BREAKFAST: "Breakfast", LUNCH: "Lunch", SNACK: "Snack", DINNER: "Dinner" } as Record<string, string>)[String(x.mealSlot)] ?? String(x.mealSlot),
        name: x.recipe.name,
        kcal: num(x.recipe.caloriesPerServing),
        protein: num(x.recipe.proteinGrams),
        carbs: num(x.recipe.carbsGrams),
        fat: num(x.recipe.fatGrams),
      });
      byDay.set(d, list);
    }

    const order = (a: ShopMeal) => SLOT_ORDER.findIndex((sl) => sl.toLowerCase() === a.slot.toLowerCase());
    const days: ShopDay[] = [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const dishes = (byDay.get(d) ?? []).sort((a, b) => order(a) - order(b));
      return {
        d,
        dishes,
        kcal: Math.round(dishes.reduce((n, x) => n + x.kcal, 0)),
        protein: dishes.reduce((n, x) => n + x.protein, 0),
      };
    });
    if (days.some((x) => x.dishes.length < 4)) throw new Error("incomplete week");
    return days;
  } catch {
    return fallbackDays();
  }
}

/**
 * Every image slot the shop draws, resolved once at build time.
 *
 * The client half cannot do this: lib/site-images.ts and DishImage both read
 * the filesystem, and this page is statically prerendered, so the whole lookup
 * costs nothing per request. A slug with no file simply does not appear in the
 * map and <Slot> renders its fallback — the dish's own macro glyph where it has
 * one, a recessed well where it does not.
 */
function imageMap(days: ShopDay[]): Record<string, string> {
  const out: Record<string, string> = {};

  const put = (key: string, hit: { src: string } | null) => {
    if (hit) out[key] = hit.src;
  };

  // The 48 à la carte dishes.
  for (const d of SHOP_DISHES) put(d.slot, findDishImage(d.slot));

  // The plan meals shown across the three showcase strips.
  for (const day of days) for (const m of day.dishes) put(dishSlot(m.name), findDishImage(dishSlot(m.name)));

  // Everything that is not a dish. `corporate` has a real photograph today;
  // the rest resolve to null until the photography lands them, and nothing
  // borrows a picture of something it is not.
  put("corporate", resolveSlot("sections", "corporate"));
  for (const p of CORP_PLANS) put(`corporate-${p.slug}`, resolveSlot("sections", `corporate-${p.slug}`));
  for (const d of DIGITAL) put(`digital-${d.key.toLowerCase()}`, resolveSlot("sections", `digital-${d.key.toLowerCase()}`));
  for (const sc of APP_SCREENS) put(`app-${sc.key}`, resolveSlot("sections", `app-${sc.key}`));

  return out;
}

export default async function ShopPage() {
  const [days, counts] = await Promise.all([getWeek(), tickerCounts().catch(() => ({}))]);
  const c = counts as Record<string, number | null>;

  return (
    <>
      <StructuredData />
      <Shop
        days={days}
        images={imageMap(days)}
        counts={{
          plans: c.plans ?? 126,
          conditions: 38,
          exercises: c.exercises ?? 952,
          supplements: c.supplements ?? 46,
          foods: 154,
          prices: c.prices ?? 3614,
        }}
        waHref={waLink("Hi FitFuel, I'd like to order the trial day. Do you deliver to my area?")}
        licence={FSSAI_LICENCE}
      />
    </>
  );
}
