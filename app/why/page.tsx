import type { Metadata, Viewport } from "next";

import { prisma } from "@/lib/prisma";
import { waLink } from "@/lib/site";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import V2Sections from "@/app/_shop/V2Sections";

/* ══════════════════════════════════════════════════════════════════════════
   WHY FITFUEL — the long-form argument, on its own route.

   THIS EXISTS BECAUSE I BROKE SOMETHING AND SAID I HADN'T. When `/` became the
   webapp, app/_shop/Shop.tsx stopped being imported by anything. I reported at
   the time that the moat content had "moved to routes that already exist and
   are linked from the rail". That was false, and a later sweep proved it: the
   plan finder, the receipt builder, the day timeline and the coach were on NO
   live route at all. Orphaned code, not relocated content.

   The storefront is deliberately not restored here — `/` is the app, and two
   competing shopping surfaces would be worse than one. What this route carries
   is the part a customer reads rather than shops: the 126-plan finder with the
   live TDEE calculation, the receipt builder across seven durations, the
   seven-stop day timeline, the coach, coverage and the FAQ.

   V2Sections is mounted as-is. It already renders on the --fk-* ramp after the
   token migration, so it matches the app rather than fighting it.
   ══════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "Why FitFuel",
  description:
    "The plan finder, the price you actually pay, and what happens between 4am and your door — the whole argument, with the arithmetic shown.",
  alternates: { canonical: "/why" },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

/** The day-one calorie shape the drum and the finder read. Fails soft: the
 *  sections render their own fallbacks rather than the page 500ing. */
async function getDays(): Promise<{ dishes: { kcal: number }[] }[]> {
  try {
    const plan = await prisma.mealPlan.findUnique({
      where: { slug: "weight-loss-veg" },
      select: { id: true },
    });
    if (!plan) return [];
    const rows = await prisma.planScheduleSlot.findMany({
      where: { mealPlanId: plan.id, dayNumber: { lte: 7 } },
      select: { dayNumber: true, recipe: { select: { caloriesPerServing: true } } },
    });
    const byDay = new Map<number, { kcal: number }[]>();
    for (const r of rows) {
      if (!r.recipe) continue;
      const d = Number(r.dayNumber);
      const list = byDay.get(d) ?? [];
      list.push({ kcal: Math.round(Number(r.recipe.caloriesPerServing) || 0) });
      byDay.set(d, list);
    }
    return [...byDay.keys()].sort((a, b) => a - b).map((d) => ({ dishes: byDay.get(d)! }));
  } catch {
    return [];
  }
}

export default async function WhyPage() {
  const days = await getDays();

  return (
    <div className="fk">
      {/* V2Sections renders 9 h2s and 8 h3s and no h1 — it was written to sit
          under the old homepage's own heading. Mounted on its own route it left
          the document with no top-level heading at all. Visually hidden because
          the first section carries the visible title; the outline needs the h1,
          the design does not need a second banner. */}
      <h1 className="fk-sr-only">Why FitFuel — the plans, the price, and the day</h1>
      <V2Sections
        licence={FSSAI_LICENCE}
        waHref={waLink("Hi FitFuel, I have a question about the plans.")}
        days={days}
      />
    </div>
  );
}
