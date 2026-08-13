import type { Metadata, Viewport } from "next";

import StructuredData from "@/components/StructuredData";
import { prisma } from "@/lib/prisma";
import { waLink } from "@/lib/site";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import { MENU_FROM } from "@/lib/menu-alacarte";
import { cutoffLabel } from "@/lib/order-cutoff";
import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { COURSES, SHOP_DISHES } from "./_shop/catalog";
import type { AppPlan } from "./_web/FitFuelApp";
import { findDishImage } from "./_hp/DishImage";
import FitFuelApp from "./_web/FitFuelApp";

/* ══════════════════════════════════════════════════════════════════════════
   `/` IS THE APP.

   It was a 29-section scrolling argument for the business. Every section was
   real, and none of it is deleted — the moats, the rotation, the day timeline,
   the plan finder and the receipt builder all still live on routes the app's
   rail links to. What changed is that the FRONT DOOR is now the product: a
   customer landing here gets a searchable, filterable catalog with a basket,
   not a pitch deck they have to scroll past to find lunch.

   This file is the server half and its job is small: query what the database
   can answer, resolve every image slot against public/images at build time,
   and hand the lot to app/_web/FitFuelApp.tsx.

   NO TOKENS FROM _ui / _home / _hp / _shop/theme ARE IMPORTED HERE. Those
   carry the near-black set rejected on 2026-08-12. The app renders on
   app/_design/tokens.css. app/_shop/catalog.ts IS imported, deliberately: it
   is pure data with no theme coupling, and the data was never the problem.
   ══════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a09",
  colorScheme: "dark",
};

/**
 * ALL 126 PLANS, from the database.
 *
 * The app previously rendered `SHOP_PLANS` — a hand-written array of six
 * showcase plans — while claiming "126" on the chip. The real set is 70
 * lifestyle & medical, 34 goal and 22 sports plans across 59 conditions, and
 * shipping six of them was the single biggest thing missing from the shop.
 *
 * NOT FILTERED ON isActive. Every one of the 126 rows currently has
 * `isActive: false` ("flip to true when ready to sell"), so filtering on it
 * renders an empty catalog. Ordering still goes through the configurator and
 * the seeded PlanPrice matrix, which is what actually gates a sale.
 */
async function getPlans(): Promise<AppPlan[]> {
  try {
    const rows = await prisma.mealPlan.findMany({
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
      select: {
        displayName: true, slug: true, tagline: true, category: true,
        subCategory: true, dietaryVariant: true, avgCaloriesPerDay: true,
        avgProteinGrams: true, avgCarbsGrams: true, avgFatGrams: true,
      },
    });
    return rows.map((r) => {
      const kcal = Number(r.avgCaloriesPerDay) || 0;
      const p = Number(r.avgProteinGrams) || 0;
      const c = Number(r.avgCarbsGrams) || 0;
      const f = Number(r.avgFatGrams) || 0;
      return {
        label: r.displayName,
        slug: r.slug,
        note: r.tagline,
        cat: r.category as AppPlan["cat"],
        diet: String(r.dietaryVariant),
        sub: r.subCategory,
        macros: `${kcal.toLocaleString("en-IN")} kcal a day · ${p}g protein`,
        macroLine: `${kcal.toLocaleString("en-IN")} kcal · ${p}P · ${c}C · ${f}F`,
        kcal,
        pcf: [p, c, f] as [number, number, number],
      };
    });
  } catch {
    return [];
  }
}

/**
 * Dish slug → public image src, resolved once on the server.
 *
 * The app half is a client component and cannot touch the filesystem, so the
 * lookup happens here. A dish with no file simply never enters the map and the
 * card renders its warm well instead — never a macro ring standing in for a
 * photograph.
 */
function imageMap(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const d of SHOP_DISHES) {
    const hit = findDishImage(d.slot);
    if (hit) out[d.slot] = hit.src;
  }
  return out;
}

export default async function AppPage() {
  const plans = await getPlans();

  return (
    <>
      <StructuredData />
      <FitFuelApp
        dishes={SHOP_DISHES}
        images={imageMap()}
        courses={COURSES.map((c) => ({ key: c.key, label: c.label, n: c.n }))}
        area="Kharadi"
        cutoffLabel={cutoffLabel()}
        trialTotal={TRIAL_TOTAL_GLYPH}
        menuFrom={`₹${MENU_FROM}`}
        plans={plans}
        planCount={plans.length || 126}
        waHref={waLink(
          "Hi FitFuel, I'd like to order. Do you deliver to my area?",
        )}
        licence={FSSAI_LICENCE}
      />
    </>
  );
}
