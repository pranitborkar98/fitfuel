// app/_hp/Today.tsx
//
// The strongest asset on the site, moved to position three.
//
// Real day-one dishes for weight-loss-veg, straight out of PlanScheduleSlot joined
// to Recipe, with the macros the kitchen weighed them to. Nothing here is written
// by hand, so when the schedule changes this changes with it.
//
// Only one plan is fully seeded (F4 in the tracker, still open), so it is labelled
// as one sample day from one plan rather than dressed up as the whole menu.
//
// If the database is unreachable the section still renders its heading and CTA
// rather than deleting itself.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import s from "./hp.module.css";
import { WRAP, SECTION, INK_3, GREEN, display, sub, body, label, figure } from "./theme";

const PLAN_SLUG = "weight-loss-veg";
const SLOT_ORDER: Record<string, number> = { BREAKFAST: 0, LUNCH: 1, SNACK: 2, DINNER: 3 };
const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: "Breakfast", LUNCH: "Lunch", SNACK: "Snack", DINNER: "Dinner",
};

// Recipe macro columns are Prisma Decimal. Adding them with + concatenates
// strings and the totals come out NaN, so coerce once here.
function num(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function humaniseCuisine(v: string | null): string | null {
  return v ? v.replace(/([a-z])([A-Z])/g, "$1 $2") : null;
}

type Dish = {
  slot: string; name: string; blurb: string | null; cuisine: string | null;
  kcal: number | null; protein: number | null; carbs: number | null;
  fat: number | null; fibre: number | null;
};

async function getDay1(): Promise<Dish[]> {
  try {
    const db = prisma as any;
    const plan = await db.mealPlan.findUnique({ where: { slug: PLAN_SLUG }, select: { id: true } });
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
      .filter((x: any) => x.recipe)
      .map((x: any) => ({
        slot: String(x.mealSlot),
        name: x.recipe.name,
        blurb: x.recipe.shortDescription,
        cuisine: humaniseCuisine(x.recipe.cuisineType),
        kcal: num(x.recipe.caloriesPerServing),
        protein: num(x.recipe.proteinGrams),
        carbs: num(x.recipe.carbsGrams),
        fat: num(x.recipe.fatGrams),
        fibre: num(x.recipe.fibreGrams),
      }))
      .sort((a: Dish, b: Dish) => (SLOT_ORDER[a.slot] ?? 9) - (SLOT_ORDER[b.slot] ?? 9));
  } catch {
    return [];
  }
}

function Macro({ v, unit, name }: { v: number | null; unit: string; name: string }) {
  return (
    <div>
      <span className={s.macroV}>
        {v == null ? "—" : Math.round(v)}
        {v != null && unit}
      </span>
      <span className={s.macroL}>{name}</span>
    </div>
  );
}

export default async function Today() {
  const dishes = await getDay1();
  const kcal = dishes.reduce((n, d) => n + (d.kcal ?? 0), 0);
  const protein = dishes.reduce((n, d) => n + (d.protein ?? 0), 0);

  return (
    <section aria-labelledby="hp-today" style={SECTION}>
      <div style={WRAP}>
        <div className={s.reveal}>
          <span style={label(GREEN)}>Day one, Rs 400</span>
          <h2 id="hp-today" style={{ ...display("clamp(2.1rem,4.6vw,3.5rem)"), marginTop: 14, maxWidth: "18ch" }}>
            This is what turns up tomorrow morning
          </h2>
          <p style={{ ...body(17), marginTop: 18, maxWidth: "56ch" }}>
            Not a render and not a stock photo. Day one of Weight Loss Vegetarian, pulled live
            from the kitchen&rsquo;s own schedule, with the macros each dish was weighed to.
          </p>
        </div>

        {dishes.length > 0 && (
          <>
            <div className={`${s.totals} ${s.reveal}`}>
              <div>
                <div style={figure("clamp(2rem,3.6vw,2.9rem)", GREEN)}>{Math.round(kcal)}</div>
                <div style={{ ...body(14), marginTop: 8 }}>kcal across the day</div>
              </div>
              <div>
                <div style={figure("clamp(2rem,3.6vw,2.9rem)")}>{Math.round(protein)}g</div>
                <div style={{ ...body(14), marginTop: 8 }}>protein, weighed not estimated</div>
              </div>
              <div>
                <div style={figure("clamp(2rem,3.6vw,2.9rem)")}>{dishes.length}</div>
                <div style={{ ...body(14), marginTop: 8 }}>meals, cooked from 04:00</div>
              </div>
            </div>

            <div className={s.dishes}>
              {dishes.map((d) => (
                <article key={d.slot + d.name} className={s.dish}>
                  <div className={s.dishHead}>
                    <span style={label(GREEN)}>{SLOT_LABEL[d.slot] ?? d.slot}</span>
                    {d.cuisine && <span style={{ ...label(INK_3), fontSize: 11 }}>{d.cuisine}</span>}
                  </div>
                  <h3 style={{ ...sub("clamp(1.1rem,1.5vw,1.28rem)"), marginTop: 14 }}>{d.name}</h3>
                  {d.blurb && <p style={{ ...body(14.5), marginTop: 9 }}>{d.blurb}</p>}
                  <div className={s.macros}>
                    <Macro v={d.kcal} unit="" name="kcal" />
                    <Macro v={d.protein} unit="g" name="Protein" />
                    <Macro v={d.carbs} unit="g" name="Carbs" />
                    <Macro v={d.fat} unit="g" name="Fat" />
                    <Macro v={d.fibre} unit="g" name="Fibre" />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className={s.actions} style={{ marginTop: 34 }}>
          <Link href="/plans?trial=true" className={s.btn}>Start with one day</Link>
          <Link href={`/plans/${PLAN_SLUG}`} className={s.btnGhost}>
            Read the full 60-day menu <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
