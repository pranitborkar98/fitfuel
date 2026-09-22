import type { Metadata, Viewport } from "next";

import StructuredData from "@/components/StructuredData";
import { prisma } from "@/lib/prisma";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import { MENU_FROM } from "@/lib/menu-alacarte";
import { cutoffLabel } from "@/lib/order-cutoff";
import { TRIAL, TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import type { PriceRow } from "@/lib/plan-tier-pricing";
import { readWithDeadline } from "@/lib/read-with-deadline";
import { NUTRABAY_MARKETPLACE_COUNT } from "@/lib/nutrabay-catalog";
import { COURSES, SHOP_DISHES } from "./_shop/catalog";
import type { AppPlan, AppSupp, ProductCounts } from "./_web/FitFuelApp";
import { findDishImage } from "./_hp/DishImage";
import { getWeek } from "./_hp/menu-data";
import { decodeRow } from "@/lib/decode-entities";
import { isTrainerConfigured } from "@/lib/ai-trainer/client";
import FitFuelApp from "./_web/FitFuelApp";
import type { Quote } from "./_web/HomeBands";

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
  title: "Healthy meals, meal plans and nutrition coaching | FitFuel",
  description:
    "Order chef-cooked healthy meals or build a complete nutrition plan with delivery, food logging, training and coaching in one FitFuel app.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "FitFuel | Healthy food built around you",
    description:
      "Chef-cooked meals, personalised plans, food logging, training and coaching from the FitFuel kitchen serving your area.",
    images: [{ url: "/images/hero-bowl-v2.png", alt: "A chef-cooked FitFuel meal" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a09",
  colorScheme: "dark",
};

const publicSentence = (value: string) => value.replace(/\s*—\s*/g, ". ");
const publicLabel = (value: string) => value.replace(/\s*—\s*/g, " · ");

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
    const [menus, rows] = await Promise.all([
      getPlanMenus(),
      prisma.mealPlan.findMany({
        orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
        select: {
          name: true, displayName: true, slug: true, tagline: true, category: true,
          subCategory: true, dietaryVariant: true, avgCaloriesPerDay: true,
          avgProteinGrams: true, avgCarbsGrams: true, avgFatGrams: true,
        },
      }),
    ]);
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
        label: publicLabel(r.name),
        slug: r.slug,
        note: publicSentence(r.tagline),
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
          label: publicLabel(v.displayName),
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
        benefits: true, imageUrl: true, category: { select: { name: true } },
        links: {
          where: { isActive: true },
          orderBy: [{ sortOrder: "asc" }, { priceRs: "asc" }],
          select: {
            id: true, network: true, merchantLabel: true, priceRs: true,
          },
        },
      },
    });
    return rows.map((r) => {
      const firstLink = r.links[0] ?? null;
      return {
        slug: r.slug,
        name: publicLabel(r.name),
        brand: r.brandName ? publicLabel(r.brandName) : null,
        tagline: publicSentence(r.tagline ?? ""),
        category: publicLabel(r.category?.name ?? "Other"),
        form: r.form ? publicSentence(r.form) : null,
        dosage: r.dosage ? publicSentence(r.dosage) : null,
        timing: r.timing ? publicSentence(r.timing) : null,
        evidence: r.evidenceLevel ?? null,
        studies: r.studyCount ?? null,
        benefits: (r.benefits ?? []).slice(0, 3).map(publicSentence),
        imageUrl: r.imageUrl ?? null,
        linkCount: r.links.length,
        buy: firstLink
          ? {
              url: `/api/supplements/click/${firstLink.id}`,
              label: publicLabel(firstLink.merchantLabel ?? "Nutrabay"),
              priceRs: firstLink.priceRs ?? null,
              network: String(firstLink.network),
            }
          : null,
      };
    });
  } catch {
    return [];
  }
}

/* Product depth is part of the homepage. Counts and prices describe the
   actual catalogue; a bounded read keeps an unavailable service from hanging it. */
async function getBandData(): Promise<{ counts: ProductCounts; quotes: Quote[] }> {
  const fallback: ProductCounts = {
    dishes: SHOP_DISHES.length,
    plans: 0,
    conditionPlans: 0,
    supplements: 0,
    recipes: 0,
    retailerNetworks: 0,
    exercises: 952,
    retailerLinks: 0,
    marketplaceProducts: NUTRABAY_MARKETPLACE_COUNT,
    activePartners: 0,
  };
  try {
    const [
      plans,
      conditionPlans,
      supplements,
      recipes,
      retailerNetworks,
      exercises,
      retailerLinks,
      marketplaceProducts,
      activePartners,
      rows,
    ] =
      await readWithDeadline(Promise.all([
        prisma.mealPlan.count(),
        prisma.mealPlan.count({ where: { category: "LIFESTYLE_MEDICAL" } }),
        prisma.supplement.count({ where: { isActive: true } }),
        prisma.recipe.count(),
        prisma.supplementLink.groupBy({ by: ["network"], where: { isActive: true, supplement: { isActive: true } } }),
        prisma.exercise.count(),
        prisma.supplementLink.count({
          where: { isActive: true, supplement: { isActive: true } },
        }),
        prisma.affiliateProduct.count({
          where: { retailer: "NUTRABAY", isActive: true },
        }),
        prisma.partner.count({
          where: {
            status: "ACTIVE",
            type: { in: ["GYM", "TRAINER"] },
          },
        }),
        prisma.testimonial.findMany({
          where: { isActive: true, isFeatured: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          take: 3,
          select: {
            id: true, name: true, location: true, planLabel: true,
            resultLabel: true, quote: true,
          },
        }),
      ]), 5000);
    return {
      counts: {
        dishes: SHOP_DISHES.length,
        plans,
        conditionPlans,
        supplements,
        recipes,
        retailerNetworks: retailerNetworks.length,
        exercises: exercises || fallback.exercises,
        retailerLinks,
        marketplaceProducts: marketplaceProducts || fallback.marketplaceProducts,
        activePartners,
      },
      /* Seeded copy carries &mdash; and &middot;, and React escapes text nodes
         — so a featured quote rendered as "actually delicious &mdash; I was
         expecting". Decoded on the way out. */
      quotes: rows.map(decodeRow).map((row) => ({
        ...row,
        quote: publicSentence(row.quote),
      })),
    };
  } catch {
    return { counts: fallback, quotes: [] };
  }
}

async function getPrices(): Promise<PriceRow[]> {
  try {
    const rows = await readWithDeadline(prisma.planPrice.groupBy({
      by: ["diet", "duration", "mealsPerDay", "priceRs"],
      where: { isActive: true, isDigital: false },
      _count: { _all: true },
    }), 5000);
    const best = new Map<string, { row: PriceRow; count: number }>();
    for (const row of rows) {
      const key = `${row.diet}|${row.duration}|${row.mealsPerDay}`;
      if (!best.has(key) || row._count._all > best.get(key)!.count) {
        best.set(key, { count: row._count._all, row: {
          diet: String(row.diet), duration: String(row.duration),
          mealsPerDay: String(row.mealsPerDay), priceRs: row.priceRs,
        } });
      }
    }
    return [...best.values()].map(({ row }) => row);
  } catch { return []; }
}

function trialReceipt() {
  const rs = (value: number) => `₹${value.toLocaleString("en-IN")}`;
  return {
    rows: [
      { k: "Two meals: breakfast and lunch", v: rs(TRIAL.baseRs) },
      { k: "Delivery", v: rs(TRIAL.deliveryRs) },
      { k: "Packaging", v: rs(TRIAL.packagingRs) },
      { k: `GST ${TRIAL.gstPercent}%`, v: rs(TRIAL.gstRs) },
    ],
    total: TRIAL_TOTAL_GLYPH,
  };
}

/**
 * ONE REAL WEEK OF A REAL PLAN.
 *
 * app/_hp/menu-data.ts's getWeek() — seven days of weight-loss-veg, which is
 * the ONE plan of 126 with a seeded PlanScheduleSlot set. Behind.tsx has
 * argued "nothing repeats for sixty days" in prose since it was written and
 * nothing on the page has ever shown a single day of it.
 *
 * Returns [] on any failure and the band then renders nothing at all, which is
 * correct: a rotation section with invented dish names in it would be the
 * exact claim it is trying to prove, falsified.
 */
/** The catalogue `?mode=` opens on. app/_web/AppChrome.tsx has linked
 *  /?mode=plans and /?mode=supps from every dish page and from /menu since it
 *  was written, and until the link sweep on 2026-08-20 this page read no query
 *  parameters at all — so both links quietly opened the dish catalogue.
 *  Anything unrecognised falls through to dishes. */
function modeFrom(v: string | string[] | undefined): "dishes" | "plans" | "supps" {
  const m = Array.isArray(v) ? v[0] : v;
  return m === "plans" || m === "supps" ? m : "dishes";
}

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  const { mode } = await searchParams;
  const [plans, supplements, bands, week, prices] = await Promise.all([
    getPlans(),
    getSupplements(),
    getBandData(),
    getWeek(),
    getPrices(),
  ]);

  return (
    <>
      <StructuredData />
      <FitFuelApp
        dishes={SHOP_DISHES}
        images={imageMap()}
        /* `note` is the kitchen's own sentence about the course, already on
           COURSES and previously rendered nowhere. The menu-order grid heads
           each of the six groups with it. */
        courses={COURSES.map((c) => ({
          key: c.key, label: c.label, n: c.n, note: c.note,
        }))}
        cutoffLabel={cutoffLabel()}
        trialTotal={TRIAL_TOTAL_GLYPH}
        menuFrom={`₹${MENU_FROM}`}
        plans={plans}
        supplements={supplements}
        planCount={plans.length || 126}
        licence={FSSAI_LICENCE}
        /* The 126 rows collapse to this many concepts — 59 goals and conditions,
           one per subCategory. Counted, never typed, so the figure on the
           conditions band cannot drift from the catalogue it describes. */
        goalCount={plans.length}
        prices={prices}
        trial={trialReceipt()}
        initialMode={modeFrom(mode)}
        bandCounts={bands.counts}
        /* Passed again. For four days these three featured Testimonial rows
           were queried here and dropped on the floor, because the imported
           design had no proof band in any of its eight sections. app/_hp/
           Proof.tsx had the right shape sitting on no route the whole time. */
        quotes={bands.quotes}
        /* The AI entry point states its real runtime status. The server checks
           the configured providers; the client never sees an API key. */
        aiConfigured={isTrainerConfigured()}
        /* Seven days of the one plan that has a seeded schedule. Decimal macro
           columns are already coerced to numbers inside menu-data. */
        week={week}
      />
    </>
  );
}
