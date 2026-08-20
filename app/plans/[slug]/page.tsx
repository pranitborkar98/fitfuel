// app/plans/[slug]/page.tsx — Phase 19A
// Server fetch for plan + schedule + physical PlanPrice rows (via mealPlanId).
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PlanDetailClient from './PlanDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

const SLOT_ORDER: Record<string, number> = {
  BREAKFAST: 0,
  LUNCH: 1,
  SNACK: 2,
  DINNER: 3,
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const plan = await (prisma as any).mealPlan.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  if (!plan) return {}
  return {
    // Title was `${plan.name} — FitFuel`, which collided with the root
    // layout's "%s | FitFuel Pune" template and rendered the brand twice.
    // The template supplies the suffix now, and the em dash is gone.
    title: plan.name,
    description:
      plan.description ??
      `${plan.name} meal plan, cooked to your macros and delivered daily across Pune.`,
    alternates: { canonical: `/plans/${slug}` },
  }
}

export type SampleMeal = {
  slot: string
  name: string
  blurb: string | null
  kcal: number
  protein: number
  carbs: number
  fat: number
}
export type SampleWeek = {
  week: { day: number; meals: SampleMeal[] }[]
  poolSize: number
  repeatingSlots: string[]
}

/** An illustrative week off the Recipe library, cycled by meal type. Pure
 *  read, no writes, and the caller decides whether a plan may show one. */
async function buildSampleWeek(): Promise<SampleWeek | null> {
  try {
    const pool = await prisma.recipe.findMany({
      select: {
        id: true,
        name: true,
        shortDescription: true,
        mealType: true,
        caloriesPerServing: true,
        proteinGrams: true,
        carbsGrams: true,
        fatGrams: true,
      },
      orderBy: [{ rotationGroup: 'asc' }, { name: 'asc' }],
    })
    if (!pool.length) return null

    const by = (t: string) => pool.filter((r: (typeof pool)[number]) => String(r.mealType) === t)
    const slotsByType = {
      BREAKFAST: by('BREAKFAST'),
      LUNCH: by('LUNCH'),
      SNACK: by('SNACK'),
      DINNER: by('DINNER'),
    }
    /* Deterministic: day N takes the Nth recipe of that meal type, wrapping.
       No randomness, so the same plan page renders the same week on every
       request and in the build output. */
    const week = Array.from({ length: 7 }, (_, i) => {
      const day = i + 1
      const meals = (['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as const)
        .map((t) => {
          const list = slotsByType[t]
          if (!list.length) return null
          const r = list[i % list.length]
          /* proteinGrams / carbsGrams / fatGrams are Prisma Decimal, not
             number. They cross the server boundary as objects and adding two
             with `+` concatenates them into a string, which Math.round then
             turns into NaN. Coerced here, once, so everything downstream is a
             real number. */
          return {
            slot: t as string,
            name: r.name,
            blurb: r.shortDescription ?? null,
            kcal: Number(r.caloriesPerServing) || 0,
            protein: Number(r.proteinGrams) || 0,
            carbs: Number(r.carbsGrams) || 0,
            fat: Number(r.fatGrams) || 0,
          }
        })
        .filter(Boolean) as SampleMeal[]
      return { day, meals }
    })
    /* How many meal types could not fill seven distinct days. Printed by the
       component, because a section about repetition must not hide a repeat. */
    const short = (['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'] as const).filter(
      (t) => slotsByType[t].length > 0 && slotsByType[t].length < 7
    )
    return { week, poolSize: pool.length, repeatingSlots: short as unknown as string[] }
  } catch {
    return null
  }
}

export default async function PlanPage({ params }: Props) {
  const { slug } = await params
  const db = prisma as any

  const plan = await db.mealPlan.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      tagline: true,
      whoIsItFor: true,
      keyPrinciples: true,
      whatIsAvoided: true,
      dietaryVariant: true,
      tier: true,
      category: true,
      avgCaloriesPerDay: true,
      avgProteinGrams: true,
      avgCarbsGrams: true,
      avgFatGrams: true,
      cycleLengthDays: true,
      mealsPerDay: true,
      accentColor: true,
      isActive: true,
    },
  })

  if (!plan) notFound()

  const slots = await db.planScheduleSlot.findMany({
    where: { mealPlanId: plan.id },
    orderBy: [{ dayNumber: 'asc' }, { mealSlot: 'asc' }],
    include: {
      recipe: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          caloriesPerServing: true,
          proteinGrams: true,
          carbsGrams: true,
          fatGrams: true,
          fibreGrams: true,
          cuisineType: true,
          prepTimeMins: true,
          cookTimeMins: true,
          servingSizeGrams: true,
          difficulty: true,
        },
      },
    },
  })

  const prices = await db.planPrice.findMany({
    where: { mealPlanId: plan.id, isDigital: false, isActive: true },
    select: {
      id: true,
      diet: true,
      duration: true,
      mealsPerDay: true,
      priceRs: true,
      mrpRs: true,
    },
  })

  const schedule: Record<number, typeof slots> = {}
  for (const slot of slots) {
    if (!schedule[slot.dayNumber]) schedule[slot.dayNumber] = []
    schedule[slot.dayNumber].push(slot)
  }
  for (const day of Object.keys(schedule)) {
    schedule[Number(day)].sort(
      (a: any, b: any) =>
        (SLOT_ORDER[a.mealSlot] ?? 99) - (SLOT_ORDER[b.mealSlot] ?? 99)
    )
  }

  const day1Slots = schedule[1] ?? []

  /* ── A SAMPLE WEEK FOR THE 58 PLANS THAT HAVE NO SCHEDULE ────────────────
     ONE MealPlan of 126 has PlanScheduleSlot rows. The other 58 concepts were
     rendering "30 days. Zero repeats." above a ledger reading Day 01 · 0 KCAL,
     Day 02 · 0 KCAL — a claim of a non-repeating month over seven empty rows,
     on the pages that sell the product.

     So an illustrative week is built from the Recipe library instead: 30
     recipes, 8 breakfast / 10 lunch / 5 snack / 7 dinner, cycled by meal type.
     It is labelled in the component as an EXAMPLE of how a week is built, and
     never as this plan's own rotation.

     ⚠ NOT ON CLINICAL PLANS. Every one of those 30 recipes belongs to
     weight-loss-veg — it is the only seeded plan — so the "shared pool" is in
     fact one plan's food. Putting it under Kidney Health or Diabetic-Friendly
     would show a reader managing a diagnosis a week of somebody else's diet,
     which is a worse failure than an honest blank. LIFESTYLE_MEDICAL is the 70
     rows cooked for a condition; those keep the "being written" line. Flip
     SAMPLE_FOR to include it if that call changes.

     Five snacks across seven days means two repeat. That is stated in the
     component rather than hidden, because the section's whole claim is about
     repetition. */
  const SAMPLE_FOR = ['STANDARD', 'SPORTS']
  const sampleWeek =
    Object.keys(schedule).length === 0 && SAMPLE_FOR.includes(String(plan.category))
      ? await buildSampleWeek()
      : null

  // Product + Offer schema. A plan page states a price, a diet, a calorie
  // target and an availability, all of which were previously readable only
  // as prose. Emitted server-side so it is in the initial HTML.
  const cheapest = (prices as any[])?.length
    ? Math.min(...(prices as any[]).map((p: any) => Number(p.priceRs ?? p.price ?? 0)).filter((n) => n > 0))
    : null

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plan.name,
    description: plan.description ?? plan.tagline ?? `${plan.name} meal plan delivered in Pune.`,
    category: 'Meal plan',
    brand: { '@type': 'Brand', name: 'FitFuel' },
    url: `https://fitfuel.in/plans/${plan.slug}`,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Calories per day', value: plan.avgCaloriesPerDay },
      { '@type': 'PropertyValue', name: 'Protein per day (g)', value: plan.avgProteinGrams },
      { '@type': 'PropertyValue', name: 'Diet', value: plan.dietaryVariant },
      { '@type': 'PropertyValue', name: 'Meals per day', value: plan.mealsPerDay },
    ],
    ...(cheapest
      ? {
          offers: {
            '@type': 'Offer',
            price: String(cheapest),
            priceCurrency: 'INR',
            // Deliberately NOT keyed off plan.isActive: that column is false
            // on all 126 rows while the catalog sells every one of them, so
            // trusting it would publish "out of stock" for the entire
            // product line. See the note in app/sitemap.ts.
            availability: 'https://schema.org/InStock',
            url: `https://fitfuel.in/plans/${plan.slug}`,
            areaServed: { '@type': 'City', name: 'Pune' },
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <PlanDetailClient
        plan={plan as any}
        schedule={schedule as any}
        sampleWeek={sampleWeek}
        day1Slots={day1Slots as any}
        prices={prices as any}
      />
    </>
  )
}
