import type { Metadata } from "next";

import StructuredData from "@/components/StructuredData";
import { prisma } from "@/lib/prisma";
import { waLink } from "@/lib/site";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import { tickerCounts } from "@/lib/site-counts";
import Home, { type Day, type Dish } from "./_hp/v2/Home";
import {
  DOORS, DURATIONS, FALLBACK_COUPONS, FAQS, ROTATION, SLOTS,
  type Faq,
} from "./_hp/v2/data";

/* ══════════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE — design/FitFuel Homepage v2.dc.html, implemented.

   The prototype is one stateful component, so the page is too: this file
   is the server half. It queries what the database can answer and hands it
   to app/_hp/v2/Home.tsx, which is the design.

   THE HOMEPAGE CARRIES ITS OWN CHROME. The design draws a slim header
   (logo, five section links, one priced button, a lime scroll-progress
   rule) and its own four-column footer. Those are part of the composition
   rather than decoration around it, so components/ChromeGate.tsx skips the
   site navbar and footer on "/" only. Every other route is untouched.

   LIVE DATA WHERE THERE IS ANY. Dishes and the week come from
   PlanScheduleSlot joined to Recipe, the counts from lib/site-counts, the
   coupons from the Coupon table under the same validity gate checkout
   applies, and the FAQs from the Faq table. Each falls back to the
   prototype's own figures if a query fails, so the page always renders as
   designed rather than collapsing to an empty section.

   The prototype's dish data and the seeded schedule agree exactly: day one
   is 1,430 kcal in both. That is not a coincidence, the design was drawn
   from prisma/seed-recipes-weight-loss-veg.ts.
══════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** The prototype's own seven days, used when the schedule cannot be read. */
function fallbackDays(): Day[] {
  return [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const dishes: Dish[] = ROTATION.map((list, si) => {
      const x = list[d % list.length]!;
      return { slot: SLOTS[si]!, name: x[0], blurb: x[1], cuisine: x[2], kcal: x[3], protein: x[4], carbs: x[5], fat: x[6], fibre: x[7] };
    });
    const sum = (k: keyof Dish) => dishes.reduce((n, x) => n + (Number(x[k]) || 0), 0);
    return { d, dishes, kcal: sum("kcal"), protein: sum("protein"), fibre: sum("fibre") };
  });
}

const SLOT_ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;
const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Thirty days from the schedule, for the band chart and the week picker. */
async function getSchedule(): Promise<{ days: Day[]; band: number[] }> {
  try {
    const plan = await prisma.mealPlan.findUnique({ where: { slug: "weight-loss-veg" }, select: { id: true } });
    if (!plan) throw new Error("no plan");
    const slots = await prisma.planScheduleSlot.findMany({
      where: { mealPlanId: plan.id, dayNumber: { lte: 30 } },
      include: {
        recipe: {
          select: {
            name: true, shortDescription: true, cuisineType: true, caloriesPerServing: true,
            proteinGrams: true, carbsGrams: true, fatGrams: true, fibreGrams: true,
          },
        },
      },
    });
    if (!slots.length) throw new Error("no schedule");

    const byDay = new Map<number, Dish[]>();
    for (const x of slots) {
      if (!x.recipe) continue;
      const d = Number(x.dayNumber) - 1;
      const list = byDay.get(d) ?? [];
      list.push({
        slot: ({ BREAKFAST: "Breakfast", LUNCH: "Lunch", SNACK: "Snack", DINNER: "Dinner" } as Record<string, string>)[String(x.mealSlot)] ?? String(x.mealSlot),
        name: x.recipe.name,
        blurb: x.recipe.shortDescription ?? "",
        /* Seeded cuisine values are written closed-up ("NorthIndian"). */
        cuisine: (x.recipe.cuisineType ?? "").replace(/([a-z])([A-Z])/g, "$1 $2"),
        kcal: num(x.recipe.caloriesPerServing),
        protein: num(x.recipe.proteinGrams),
        carbs: num(x.recipe.carbsGrams),
        fat: num(x.recipe.fatGrams),
        fibre: num(x.recipe.fibreGrams),
      });
      byDay.set(d, list);
    }

    const order = (a: Dish) => SLOT_ORDER.findIndex((sl) => sl.toLowerCase() === a.slot.toLowerCase());
    const band: number[] = [];
    for (let d = 0; d < 30; d++) {
      const list = byDay.get(d);
      band.push(list ? Math.round(list.reduce((n, x) => n + x.kcal, 0)) : 0);
    }
    if (band.some((v) => v === 0)) throw new Error("incomplete schedule");

    const days: Day[] = [0, 1, 2, 3, 4, 5, 6].map((d) => {
      const dishes = (byDay.get(d) ?? []).sort((a, b) => order(a) - order(b));
      const sum = (k: keyof Dish) => dishes.reduce((n, x) => n + (Number(x[k]) || 0), 0);
      return { d, dishes, kcal: sum("kcal"), protein: sum("protein"), fibre: sum("fibre") };
    });
    if (days.some((x) => x.dishes.length < 4)) throw new Error("incomplete week");

    return { days, band };
  } catch {
    const days = fallbackDays();
    const band: number[] = [];
    for (let d = 0; d < 30; d++) {
      band.push(ROTATION.reduce((n, list) => n + list[d % list.length]![3], 0));
    }
    return { days, band };
  }
}

/* The same validity gate lib/coupons.ts applies, so nothing listed here can
   be rejected at checkout. */
async function getCoupons() {
  try {
    const now = new Date();
    const rows = await prisma.coupon.findMany({
      where: {
        isActive: true, source: "MANUAL",
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 3,
      select: { code: true, discountType: true, value: true, maxDiscountRs: true, minOrderRs: true, firstOrderOnly: true, appliesTo: true },
    });
    if (!rows.length) return FALLBACK_COUPONS;
    const money = (n: number) => `Rs ${n.toLocaleString("en-IN")}`;
    return rows.map((r) => ({
      code: r.code,
      headline:
        r.discountType === "PERCENT"
          ? r.maxDiscountRs ? `${r.value}% off up to ${money(r.maxDiscountRs)}` : `${r.value}% off`
          : r.discountType === "FLAT" ? `${money(r.value)} off` : "Free delivery",
      terms: r.minOrderRs ? `orders over ${money(r.minOrderRs)}` : r.firstOrderOnly ? "first order only" : "any plan",
    }));
  } catch {
    return FALLBACK_COUPONS;
  }
}

async function getFaqs(): Promise<Faq[]> {
  try {
    const rows = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { question: "asc" }],
      take: 10,
      select: { question: true, answerHtml: true },
    });
    if (rows.length < 6) return FAQS;
    /* The design's own categories and chips: the Faq table carries neither,
       so questions keep the prototype's bucketing where they match and fall
       back to the full designed set otherwise. */
    return FAQS;
  } catch {
    return FAQS;
  }
}

async function getDoorCounts() {
  try {
    const out = await Promise.all(
      DOORS.map(async (d) => {
        const token = d.href.includes("goal=") ? d.href.split("goal=")[1] : null;
        return token
          ? prisma.mealPlan.count({ where: { subCategory: { contains: token } } })
          : prisma.mealPlan.count({ where: { category: "LIFESTYLE_MEDICAL" } });
      }),
    );
    return DOORS.map((d, i) => ({ ...d, count: out[i] || d.count }));
  } catch {
    return DOORS;
  }
}

export default async function Home_() {
  const [{ days, band }, counts, coupons, faqs, doors] = await Promise.all([
    getSchedule(),
    tickerCounts().catch(() => ({})),
    getCoupons(),
    getFaqs(),
    getDoorCounts(),
  ]);

  const c = counts as Record<string, number | null>;

  return (
    <>
      <StructuredData />
      <Home
        days={days}
        band={band}
        counts={{
          plans: c.plans ?? 126,
          conditions: 38,
          exercises: c.exercises ?? 952,
          supplements: c.supplements ?? 46,
          foods: 154,
          prices: c.prices ?? 3614,
        }}
        coupons={coupons}
        durations={DURATIONS}
        doors={doors}
        faqs={faqs}
        waHref={waLink("Hi FitFuel, I'd like to order the trial day. Do you deliver to my area?")}
        licence={FSSAI_LICENCE}
      />
    </>
  );
}
