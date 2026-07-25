// app/_home/TrialDay.tsx
//
// THE FOOD. Actual dishes, actual macros, from the database.
//
// The homepage argued about food for weeks without ever showing any. It had a
// sixty-cell grid that counted menu days, a kitchen photo, and four different
// sections making claims about macros, and a visitor could not name a single
// thing they would be eating tomorrow. This section answers the only question
// that matters at Rs 400: what actually turns up.
//
// SOURCE OF TRUTH: PlanScheduleSlot day 1 of `weight-loss-veg`, joined to
// Recipe. Nothing here is written by hand, so the day the kitchen changes the
// schedule, this section changes with it.
//
// WHY ONLY ONE PLAN: recipe seeding is 1 of 126
// (FITFUEL-MASTER-TRACKER-DEFINITIVE.md line 138 — F4, still open). This is
// the only plan with a complete seeded day, so it is labelled as one sample
// day from one plan rather than dressed up as the whole menu. When F4 lands,
// widening this is a change of `where`, not a rebuild.
//
// FAILURE BEHAVIOUR IS DELIBERATE. The query is wrapped, and an empty or
// failed result still renders the heading, the copy and the CTA rather than
// returning null. A section that silently deletes itself when the database
// hiccups is exactly how this page lost its trust strip for four days.
//
// SERVER COMPONENT. The Prisma call runs at build; the page stays static.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, MUTE, DIM, huge, mid, copy, tag } from "./theme";

const PLAN_SLUG = "weight-loss-veg";

/* The order a day is actually eaten in, not the order Postgres returns. */
const SLOT_ORDER: Record<string, number> = { BREAKFAST: 0, LUNCH: 1, SNACK: 2, DINNER: 3 };
const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: "Breakfast", LUNCH: "Lunch", SNACK: "Snack", DINNER: "Dinner",
};

/** Prisma Decimal -> number. Returns null rather than NaN for missing data. */
function num(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* Seeded cuisine values are written closed-up ("NorthIndian", "SouthIndian")
   while others are single words ("Chettinad"). Printing the raw value put
   "NorthIndian" on a menu card. Split on the case boundary only; single-word
   values pass through untouched. */
function humaniseCuisine(v: string | null): string | null {
  if (!v) return null;
  return v.replace(/([a-z])([A-Z])/g, "$1 $2");
}

type Dish = {
  slot: string;
  name: string;
  blurb: string | null;
  cuisine: string | null;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fibre: number | null;
};

async function getDay1(): Promise<Dish[]> {
  try {
    const db = prisma as any;
    const plan = await db.mealPlan.findUnique({
      where: { slug: PLAN_SLUG },
      select: { id: true },
    });
    if (!plan) return [];

    const slots = await db.planScheduleSlot.findMany({
      where: { mealPlanId: plan.id, dayNumber: 1 },
      include: {
        recipe: {
          select: {
            name: true, shortDescription: true, cuisineType: true,
            caloriesPerServing: true, proteinGrams: true,
            carbsGrams: true, fatGrams: true, fibreGrams: true,
          },
        },
      },
    });

    return slots
      .filter((s: any) => s.recipe)
      .map((s: any) => ({
        slot: String(s.mealSlot),
        name: s.recipe.name,
        blurb: s.recipe.shortDescription,
        cuisine: humaniseCuisine(s.recipe.cuisineType),
        /* The gram columns are Prisma Decimal, NOT number. Summing them with
           `+` coerced each one to a string and concatenated the day into
           "24.538.2...", which Math.round then turned into NaN on the totals
           bar. Coerce once, here, so everything downstream is a real number. */
        kcal: num(s.recipe.caloriesPerServing),
        protein: num(s.recipe.proteinGrams),
        carbs: num(s.recipe.carbsGrams),
        fat: num(s.recipe.fatGrams),
        fibre: num(s.recipe.fibreGrams),
      }))
      .sort((a: Dish, b: Dish) => (SLOT_ORDER[a.slot] ?? 9) - (SLOT_ORDER[b.slot] ?? 9));
  } catch {
    /* Database unreachable at build. Render the section without the grid
       rather than deleting it. See the file header. */
    return [];
  }
}

/** One macro figure. Nulls print as a dash rather than "null" or "0". */
function Macro({ v, unit, label }: { v: number | null; unit: string; label: string }) {
  return (
    <div className="ff-dish-macro">
      <span className="ff-dish-macro-v">
        {v == null ? "—" : Math.round(v)}
        <span style={{ fontSize: ".62em", color: MUTE, marginLeft: 1 }}>{unit}</span>
      </span>
      <span className="ff-dish-macro-l">{label}</span>
    </div>
  );
}

export default async function TrialDay() {
  const dishes = await getDay1();
  const total = dishes.reduce((n, d) => n + (d.kcal ?? 0), 0);
  const protein = dishes.reduce((n, d) => n + (d.protein ?? 0), 0);

  return (
    <section
      aria-labelledby="trialday-heading"
      style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0" }}
    >
      <div style={WRAP}>
        <Reveal>
          <span style={tag(LIME)}>Day one, Rs 400</span>
          <h2 id="trialday-heading" style={{ ...huge("clamp(2.4rem,6.4vw,5.2rem)"), maxWidth: "16ch", marginTop: 16 }}>
            This is what turns up tomorrow
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <p style={{ ...copy(16.5), maxWidth: "58ch", marginTop: 22 }}>
            Not a sample, not a stock photo. Day one of Weight Loss Vegetarian, straight from the
            kitchen schedule, with the macros we weighed it to.
          </p>
        </Reveal>

        {dishes.length > 0 && (
          <>
            {/* The day's totals, before the dishes: this is the number a
                visitor is deciding against. */}
            <Reveal delay={0.08}>
              <div className="ff-trial-tot">
                <div>
                  <span style={{ ...huge("clamp(2.2rem,4vw,3.2rem)"), color: LIME, lineHeight: .82 }}>
                    {Math.round(total)}
                  </span>
                  <span style={{ ...copy(13.5), color: DIM, display: "block", marginTop: 8 }}>kcal across the day</span>
                </div>
                <div>
                  <span style={{ ...huge("clamp(2.2rem,4vw,3.2rem)"), color: INK, lineHeight: .82 }}>
                    {Math.round(protein)}
                    <span style={{ fontSize: ".5em", color: MUTE }}>g</span>
                  </span>
                  <span style={{ ...copy(13.5), color: DIM, display: "block", marginTop: 8 }}>protein, weighed not estimated</span>
                </div>
                <div>
                  <span style={{ ...huge("clamp(2.2rem,4vw,3.2rem)"), color: INK, lineHeight: .82 }}>
                    {dishes.length}
                  </span>
                  <span style={{ ...copy(13.5), color: DIM, display: "block", marginTop: 8 }}>meals, cooked from 04:00</span>
                </div>
              </div>
            </Reveal>

            <div className="ff-dishes">
              {dishes.map((d, i) => (
                <Reveal key={d.slot + d.name} delay={0.1 + i * 0.05}>
                  <article className="ff-dish">
                    <div className="ff-dish-head">
                      <span style={{ ...tag(LIME), fontSize: 11.5 }}>{SLOT_LABEL[d.slot] ?? d.slot}</span>
                      {d.cuisine && <span style={{ ...tag(DIM), fontSize: 11.5 }}>{d.cuisine}</span>}
                    </div>
                    <h3 style={{ ...mid("clamp(1.25rem,1.9vw,1.5rem)"), marginTop: 14 }}>{d.name}</h3>
                    {d.blurb && <p style={{ ...copy(14), marginTop: 10 }}>{d.blurb}</p>}
                    <div className="ff-dish-macros">
                      <Macro v={d.kcal} unit="" label="kcal" />
                      <Macro v={d.protein} unit="g" label="Protein" />
                      <Macro v={d.carbs} unit="g" label="Carbs" />
                      <Macro v={d.fat} unit="g" label="Fat" />
                      <Macro v={d.fibre} unit="g" label="Fibre" />
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </>
        )}

        <Reveal delay={0.2}>
          <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginTop: "clamp(30px,3.6vw,46px)" }}>
            <Link href="/plans?trial=true" className="ff-btn">Start your trial day</Link>
            <Link href={`/plans/${PLAN_SLUG}`} className="ff-a">
              Read the full menu <ArrowRight size={17} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
