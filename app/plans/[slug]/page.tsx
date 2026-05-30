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
  const plan = await prisma.mealPlan.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  if (!plan) return {}
  return {
    title: `${plan.name} — FitFuel`,
    description: plan.description ?? `${plan.name} meal plan with daily delivery in Pune.`,
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

  const schedule: Record<number, typeof slots> = {}
  for (const slot of slots) {
    if (!schedule[slot.dayNumber]) schedule[slot.dayNumber] = []
    schedule[slot.dayNumber].push(slot)
  }
  for (const day of Object.keys(schedule)) {
    schedule[Number(day)].sort(
      (a, b) =>
        (SLOT_ORDER[a.mealSlot] ?? 99) - (SLOT_ORDER[b.mealSlot] ?? 99)
    )
  }

  const day1Slots = schedule[1] ?? []

  return (
    <PlanDetailClient
      plan={plan as any}
      schedule={schedule as any}
      day1Slots={day1Slots as any}
    />
  )
}