// app/v2/page.tsx
//
// THE STOREFRONT. A homepage built from zero as a shop, not as an essay.
//
// WHY THIS EXISTS RATHER THAN ANOTHER PASS ON app/page.tsx. That page is
// fifteen stacked full-width bands, each one a condensed headline, a paragraph
// and a grid. Every individual fix landed and the whole still read as a
// brochure, because the skeleton IS the brochure — swapping the contents of a
// band cannot change the shape of the stack. This is the shape a food business
// actually sells from:
//
//   one screen that states the offer and prices it
//   a sticky course bar
//   a dense grid of buyable dishes, every one with a price and an Add
//   the plans, as four filtered doors with real counts
//   one trust row
//
// Six blocks against fifteen. Roughly 150 words of prose against 4,235.
//
// IT LIVES AT /v2 ON PURPOSE. The live homepage is untouched, so the two can be
// opened side by side and judged rather than argued about. Nothing here is
// wired into navigation; if it wins, app/page.tsx becomes this.
//
// DESIGNED FOR PHOTOGRAPHS, HONEST WITHOUT THEM. A storefront is a thin frame
// around product images. With zero files in public/images/dishes the tiles fall
// back to a typographic plate — deliberately flat and quiet rather than a fake
// photo. The grid's proportions do not change when the real images land, so
// this layout is the same layout before and after the shoot.
//
// SERVER COMPONENT: data in, one client component for the interaction.

import type { Metadata } from "next";

import Storefront, { type ShopDish, type ShopPlan } from "./Storefront";
import { findDishImage, dishSlug } from "../_hp/DishImage";
import { getDayOne } from "../_hp/menu-data";
import { MENU } from "@/lib/menu-alacarte";
import { dishId, isOrderable, DISHES } from "@/lib/menu-cart";
import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { cutoffLabel } from "@/lib/order-cutoff";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "FitFuel — order single meals or a full plan, Pune",
  robots: { index: false, follow: false },
};

/* The four doors, with the tokens that actually filter the catalogue.
   Same mapping the live homepage now uses — see app/_hp/Pick.tsx for why
   ?category=WEIGHT_LOSS was dead and ?goal= replaced it. */
const DOORS: { goal: string; token: string | null; href: string; accent: string; who: string }[] = [
  { goal: "Lose fat", token: "weight_loss", href: "/plans?goal=weight_loss", accent: "#a3e635", who: "Weight down, without living on boiled eggs." },
  { goal: "Build muscle", token: "muscle_gain", href: "/plans?goal=muscle_gain", accent: "#f59e0b", who: "You train. Eating enough is what keeps failing." },
  { goal: "Just eat well", token: "balanced", href: "/plans?goal=balanced", accent: "#38bdf8", who: "No target. Just done deciding what is for dinner." },
  { goal: "Eat for a condition", token: null, href: "/plans?category=LIFESTYLE_MEDICAL", accent: "#2dd4bf", who: "Diabetes, PCOS, thyroid, and 35 more." },
];

export default async function V2() {
  const dayOne = await getDayOne();

  const db = prisma as unknown as { mealPlan: { count: (a: unknown) => Promise<number> } };
  const plans: ShopPlan[] = await Promise.all(
    DOORS.map(async (d) => ({
      goal: d.goal,
      who: d.who,
      href: d.href,
      accent: d.accent,
      count: await db.mealPlan.count({
        where: d.token ? { subCategory: { contains: d.token } } : { category: "LIFESTYLE_MEDICAL" },
      }),
    })),
  );

  /* Every dish on the menu, not a curated eight. A storefront that hides forty
     of its forty-eight products is a brochure with a basket bolted on. */
  const dishes: ShopDish[] = MENU.flatMap((c) =>
    c.items.map((i) => ({
      id: dishId(i.name),
      name: i.name,
      blurb: i.blurb,
      price: isOrderable(i) ? i.price : null,
      course: c.key,
      courseLabel: c.label,
      img: findDishImage(dishSlug(i.name))?.src ?? null,
    })),
  );

  const courses = MENU.map((c) => ({
    key: c.key,
    label: c.label,
    count: c.items.length,
  }));

  const trial = {
    price: TRIAL_TOTAL_GLYPH,
    cutoff: cutoffLabel(),
    kcal: Math.round(dayOne.reduce((n, d) => n + Number(d.kcal ?? 0), 0)),
    protein: Math.round(dayOne.reduce((n, d) => n + Number(d.protein ?? 0), 0)),
    meals: dayOne.map((d) => ({
      slot: d.slot,
      name: d.name,
      kcal: d.kcal == null ? null : Math.round(Number(d.kcal)),
      img: findDishImage(dishSlug(d.name))?.src ?? null,
    })),
  };

  return (
    <Storefront
      dishes={dishes}
      courses={courses}
      plans={plans}
      trial={trial}
      totalDishes={DISHES.length}
    />
  );
}
