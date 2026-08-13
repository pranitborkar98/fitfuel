import type { Metadata, Viewport } from "next";

import StructuredData from "@/components/StructuredData";
import { prisma } from "@/lib/prisma";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import { MENU_FROM } from "@/lib/menu-alacarte";
import { cutoffLabel } from "@/lib/order-cutoff";
import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { COURSES, SHOP_DISHES } from "./_shop/catalog";
import type { AppPlan, AppSupp } from "./_web/FitFuelApp";
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
/**
 * Day one of every plan that actually has a seeded menu.
 *
 * TODAY THAT IS EXACTLY ONE PLAN OF 126 (weight-loss-veg, 120 slots = 30 days
 * x 4 meals, against 30 Recipe rows). The other 125 have no PlanScheduleSlot
 * rows at all, so their cards show a labelled placeholder rather than four
 * invented dish names — a plan that lists food it cannot cook is worse than a
 * plan that says the menu is coming. Seed more schedules and they light up
 * here with no code change.
 */
async function getPlanMenus(): Promise<Record<string, { slot: string; name: string; kcal: number }[]>> {
  const SLOT_ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
  try {
    const rows = await prisma.planScheduleSlot.findMany({
      where: { dayNumber: 1 },
      select: {
        mealSlot: true,
        mealPlan: { select: { slug: true } },
        recipe: { select: { name: true, caloriesPerServing: true } },
      },
    });
    const out: Record<string, { slot: string; name: string; kcal: number }[]> = {};
    for (const r of rows) {
      if (!r.recipe || !r.mealPlan) continue;
      const slug = r.mealPlan.slug;
      (out[slug] ||= []).push({
        slot: String(r.mealSlot),
        name: r.recipe.name,
        kcal: Math.round(Number(r.recipe.caloriesPerServing) || 0),
      });
    }
    for (const k of Object.keys(out)) {
      out[k].sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot));
    }
    return out;
  } catch {
    return {};
  }
}

async function getPlans(): Promise<AppPlan[]> {
  try {
    const menus = await getPlanMenus();
    const rows = await prisma.mealPlan.findMany({
      orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
      select: {
        name: true, displayName: true, slug: true, tagline: true, category: true,
        subCategory: true, dietaryVariant: true, avgCaloriesPerDay: true,
        avgProteinGrams: true, avgCarbsGrams: true, avgFatGrams: true,
      },
    });
    /* GROUP BY CONCEPT. The 126 rows are 59 plans x diet variants — "Weight
       Loss — Vegetarian / Eggetarian / Jain / Non Vegetarian / Vegan" is ONE
       plan with five variants, not five plans. Rendering the raw rows produced
       52 concepts as duplicate cards. `name` is already the clean concept name
       and `displayName` is the decorated one, so the split exists in the data. */
    const groups = new Map<string, typeof rows>();
    for (const r of rows) {
      const list = groups.get(r.subCategory) ?? [];
      list.push(r);
      groups.set(r.subCategory, list);
    }

    return [...groups.values()].map((rowsForConcept) => {
      // The vegetarian row is the sensible default where there is one — it is
      // the sheet the kitchen cooks most and the one Jain/Vegan are priced as.
      const r =
        rowsForConcept.find((x) => x.dietaryVariant === "VEG") ?? rowsForConcept[0];
      const kcal = Number(r.avgCaloriesPerDay) || 0;
      const p = Number(r.avgProteinGrams) || 0;
      const c = Number(r.avgCarbsGrams) || 0;
      const f = Number(r.avgFatGrams) || 0;
      return {
        label: r.name,
        slug: r.slug,
        note: r.tagline,
        cat: r.category as AppPlan["cat"],
        diet: String(r.dietaryVariant),
        sub: r.subCategory,
        macros: `${kcal.toLocaleString("en-IN")} kcal a day · ${p}g protein`,
        macroLine: `${kcal.toLocaleString("en-IN")} kcal · ${p}P · ${c}C · ${f}F`,
        kcal,
        pcf: [p, c, f] as [number, number, number],
        meals: menus[r.slug] ?? [],
        /* Every diet this plan is cooked in, each with its own slug, macros and
           menu — this is what the "Variations" button opens. */
        variants: rowsForConcept.map((v) => ({
          diet: String(v.dietaryVariant),
          slug: v.slug,
          label: v.displayName,
          kcal: Number(v.avgCaloriesPerDay) || 0,
          protein: Number(v.avgProteinGrams) || 0,
          meals: (menus[v.slug] ?? []).length,
        })),
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

/**
 * THE SUPPLEMENT CATALOG — 46 rows across 12 categories.
 *
 * A whole product line the webapp did not carry. The model is an educational
 * catalog, not a shelf: mechanism, benefits, dosage, timing, half-life,
 * stacks-with, avoid-with, warnings, evidence level and study count. The card
 * shows the buyer-facing slice; the rest belongs on a supplement product page
 * the same way the dish page carries a dish.
 */
async function getSupplements(): Promise<AppSupp[]> {
  try {
    const rows = await prisma.supplement.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        slug: true, name: true, brandName: true, tagline: true, form: true,
        dosage: true, timing: true, evidenceLevel: true, studyCount: true,
        benefits: true, category: { select: { name: true } },
      },
    });
    return rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      brand: r.brandName ?? null,
      tagline: r.tagline ?? "",
      category: r.category?.name ?? "Other",
      form: r.form ?? null,
      dosage: r.dosage ?? null,
      timing: r.timing ?? null,
      evidence: r.evidenceLevel ?? null,
      studies: r.studyCount ?? null,
      benefits: (r.benefits ?? []).slice(0, 3),
    }));
  } catch {
    return [];
  }
}

export default async function AppPage() {
  const [plans, supplements] = await Promise.all([getPlans(), getSupplements()]);

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
        supplements={supplements}
        planCount={plans.length || 126}
        licence={FSSAI_LICENCE}
      />
    </>
  );
}
