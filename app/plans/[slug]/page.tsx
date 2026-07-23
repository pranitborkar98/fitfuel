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
        day1Slots={day1Slots as any}
        prices={prices as any}
      />
    </>
  )
}
