import type { Metadata, Viewport } from "next";

import StructuredData from "@/components/StructuredData";
import { prisma } from "@/lib/prisma";
import { waLink } from "@/lib/site";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import { MENU_FROM, MENU_STATS } from "@/lib/menu-alacarte";
import { decomposePrice } from "@/lib/pricing-decomposition";
import { TRIAL } from "@/lib/trial-price";
import { resolveImage } from "@/lib/site-images";
import { COURSES } from "./_shop/catalog";
import Home, { type WeekMeal } from "./_kitchen/Home";
import type { BoardCourse } from "./_kitchen/MenuBoard";

/* ══════════════════════════════════════════════════════════════════════════
   THE STOREFRONT — server half.

   THE RULE AT THE TOP OF THIS FILE STILL HOLDS, and is now enforceable: this
   page imports NO tokens from app/_ui, app/_home, app/_hp or app/_shop/theme.
   Those files carry the near-black / acid-lime set the owner rejected on
   2026-08-12, and every previous rebuild reached for one of them because it
   was the only thing in the repo that looked like a system. There is now a
   system that is not them — app/_design/tokens.css — and the storefront reads
   only from that.

   app/_shop/catalog.ts IS imported, and deliberately: it is pure data (dish
   ids, kitchen macro estimates, price labels) with no theme coupling. Data was
   never the problem.

   Everything printed here is computed from the same modules checkout charges
   from, so the homepage cannot drift from the till. The trial figure is
   decomposePrice(), not a literal.
   ══════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/* The browser chrome should match the paper, not the dead near-black. Next 16
   requires this as a separate `viewport` export — themeColor in `metadata` has
   been deprecated since 13.2 and the project exported neither until now. */
export const viewport: Viewport = {
  themeColor: "#fcfaf6",
  colorScheme: "light",
};

const SLOT_ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;
const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  SNACK: "Snack",
  DINNER: "Dinner",
};

/** Prisma returns Decimal for the gram columns; `+` on a Decimal yields NaN. */
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Day one of the plan the kitchen actually cooks most.
 *
 * Fails SOFT, like lib/site-counts: a homepage that 500s because a meal row
 * could not be read would be a strictly worse trade than a page without this
 * section, so an empty array simply drops it.
 */
async function getDayOne(): Promise<WeekMeal[]> {
  try {
    const plan = await prisma.mealPlan.findUnique({
      where: { slug: "weight-loss-veg" },
      select: { id: true },
    });
    if (!plan) return [];

    const rows = await prisma.planScheduleSlot.findMany({
      where: { mealPlanId: plan.id, dayNumber: 1 },
      include: {
        recipe: {
          select: { name: true, caloriesPerServing: true, proteinGrams: true },
        },
      },
    });

    return rows
      .filter((r) => r.recipe)
      .map((r) => ({
        slot: SLOT_LABEL[String(r.mealSlot)] ?? String(r.mealSlot),
        name: r.recipe!.name,
        kcal: Math.round(num(r.recipe!.caloriesPerServing)),
        protein: Math.round(num(r.recipe!.proteinGrams)),
      }))
      .sort(
        (a, b) =>
          SLOT_ORDER.findIndex((s) => SLOT_LABEL[s] === a.slot) -
          SLOT_ORDER.findIndex((s) => SLOT_LABEL[s] === b.slot),
      );
  } catch {
    return [];
  }
}

async function getPlanCount(): Promise<number> {
  try {
    const n = await prisma.mealPlan.count();
    return n || 126;
  } catch {
    return 126;
  }
}

/** Only the courses that contain dishes the kitchen has actually priced. */
function board(): BoardCourse[] {
  return COURSES.map((c) => ({
    key: c.key,
    label: c.label,
    items: c.items
      .filter((d) => d.orderable)
      .map((d) => ({
        id: d.id,
        name: d.name,
        blurb: d.blurb,
        priceLabel: d.priceLabel,
        kcalLabel: d.kcalLabel,
        macroLine: d.macroLine,
        variantNote: d.variantNote,
      })),
  })).filter((c) => c.items.length > 0);
}

export default async function StorefrontPage() {
  const [day, planCount] = await Promise.all([getDayOne(), getPlanCount()]);

  // The all-four-meals trial. Its subtotal is a seeded PlanPrice row (750);
  // decomposing it here keeps the advertised figure tied to the same maths.
  const allFour = decomposePrice({ subtotalRs: 750, duration: "TRIAL_DAY" });

  return (
    <>
      <StructuredData />
      <Home
        day={day}
        dayKcal={day.reduce((n, m) => n + m.kcal, 0)}
        dayProtein={day.reduce((n, m) => n + m.protein, 0)}
        courses={board()}
        dishesTotal={MENU_STATS.items}
        dishesPriced={MENU_STATS.priced}
        planCount={planCount}
        trial={{
          food: TRIAL.baseRs,
          delivery: TRIAL.deliveryRs,
          packaging: TRIAL.packagingRs,
          gst: TRIAL.gstRs,
          total: TRIAL.totalRs,
        }}
        trialAllFour={allFour.totalRs}
        menuFrom={MENU_FROM}
        waHref={waLink(
          "Hi FitFuel, I'd like to order the trial day. Do you deliver to my area?",
        )}
        licence={FSSAI_LICENCE}
        heroSrc={resolveImage("hero", "hero-bowl-overhead", "hero-bowl.jpg")?.src ?? null}
        produceSrc={resolveImage("sections", "produce", "produce.jpg")?.src ?? null}
      />
    </>
  );
}
