// app/plans/[slug]/page.tsx — Phase 19A
// Server fetch for plan + schedule + physical PlanPrice rows (via mealPlanId).
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { safeJsonLd } from '@/lib/content-safety'
import { hasCompletePlanSchedule } from '@/lib/plan-readiness'
import { publicPlanAudience, publicPlanDescription, publicPlanPrinciples } from '@/lib/plan-public-copy'
import PlanDetailClient, { type Plan, type PriceRow, type Slot } from './PlanDetailClient'

interface Props {
  params: Promise<{ slug: string }>
}

const SLOT_ORDER: Record<string, number> = {
  BREAKFAST: 0,
  LUNCH: 1,
  SNACK: 2,
  DINNER: 3,
}

function numeric(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function optionalNumeric(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const plan = await prisma.mealPlan.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  if (!plan) return {}
  return {
    // Title was `${plan.name} — FitFuel`, which collided with the root
    // layout's "%s | FitFuel Pune" template and rendered the brand twice.
    // The template supplies the suffix now, and the em dash is gone.
    title: plan.name,
    description: publicPlanDescription(plan),
    alternates: { canonical: `/plans/${slug}` },
  }
}

export default async function PlanPage({ params }: Props) {
  const { slug } = await params
  const plan = await prisma.mealPlan.findUnique({
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

  const serializablePlan = {
    ...plan,
    description: publicPlanDescription(plan),
    whoIsItFor: publicPlanAudience(plan),
    keyPrinciples: publicPlanPrinciples(plan),
    avgCaloriesPerDay: numeric(plan.avgCaloriesPerDay),
    avgProteinGrams: numeric(plan.avgProteinGrams),
    avgCarbsGrams: numeric(plan.avgCarbsGrams),
    avgFatGrams: numeric(plan.avgFatGrams),
  }

  const slots = await prisma.planScheduleSlot.findMany({
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

  const prices = await prisma.planPrice.findMany({
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

  const serializableSlots = slots.map((slot) => ({
    ...slot,
    servingMultiplier: optionalNumeric(slot.servingMultiplier),
    recipe: {
      ...slot.recipe,
      caloriesPerServing: numeric(slot.recipe.caloriesPerServing),
      proteinGrams: numeric(slot.recipe.proteinGrams),
      carbsGrams: numeric(slot.recipe.carbsGrams),
      fatGrams: numeric(slot.recipe.fatGrams),
      fibreGrams: optionalNumeric(slot.recipe.fibreGrams),
      servingSizeGrams: optionalNumeric(slot.recipe.servingSizeGrams),
    },
  }))
  const serializablePrices = prices.map((price) => ({
    ...price,
    priceRs: numeric(price.priceRs),
    mrpRs: optionalNumeric(price.mrpRs),
  }))
  const isReady =
    serializablePrices.length > 0 &&
    hasCompletePlanSchedule({
      scheduleCount: serializableSlots.length,
      cycleLengthDays: serializablePlan.cycleLengthDays,
      mealsPerDay: serializablePlan.mealsPerDay,
    })

  const schedule: Record<number, Slot[]> = {}
  for (const slot of serializableSlots) {
    if (!schedule[slot.dayNumber]) schedule[slot.dayNumber] = []
    schedule[slot.dayNumber].push(slot)
  }
  for (const day of Object.keys(schedule)) {
    schedule[Number(day)].sort(
      (a, b) =>
        (SLOT_ORDER[a.mealSlot] ?? 99) - (SLOT_ORDER[b.mealSlot] ?? 99)
    )
  }

  // Product + Offer schema. A plan page states a price, a diet, a calorie
  // target and an availability, all of which were previously readable only
  // as prose. Emitted server-side so it is in the initial HTML.
  const positivePrices = prices.map((price) => price.priceRs).filter((value) => value > 0)
  const cheapest = positivePrices.length ? Math.min(...positivePrices) : null

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plan.name,
    description: serializablePlan.description ?? serializablePlan.tagline ?? `${serializablePlan.name} meal plan delivered in Pune.`,
    category: 'Meal plan',
    brand: { '@type': 'Brand', name: 'FitFuel' },
    url: `https://fitfuel.in/plans/${serializablePlan.slug}`,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'Calories per day', value: serializablePlan.avgCaloriesPerDay },
      { '@type': 'PropertyValue', name: 'Protein per day (g)', value: serializablePlan.avgProteinGrams },
      { '@type': 'PropertyValue', name: 'Diet', value: serializablePlan.dietaryVariant },
      { '@type': 'PropertyValue', name: 'Meals per day', value: serializablePlan.mealsPerDay },
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
            availability: isReady
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url: `https://fitfuel.in/plans/${serializablePlan.slug}`,
            areaServed: { '@type': 'City', name: 'Pune' },
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productLd) }}
      />
      <PlanDetailClient
        plan={serializablePlan satisfies Plan}
        schedule={schedule}
        prices={serializablePrices satisfies PriceRow[]}
        isReady={isReady}
      />
    </>
  )
}
