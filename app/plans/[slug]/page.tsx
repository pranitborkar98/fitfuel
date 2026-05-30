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
      dietaryVariant: true,
      tier: true,
      category: true,
      targetCalories: true,
      proteinTarget: true,
      carbTarget: true,
      fatTarget: true,
      isActive: true,
      durationDays: true,
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
          fiberGrams: true,
          cuisineType: true,
          prepTimeMins: true,
          cookTimeMins: true,
          servingSizeGrams: true,
          difficultyLevel: true,
        },
      },
    },
  })

  // Group slots by day
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

  // Day 1 full recipe detail (first build: Day 1 breakfast gets ingredients)
  const day1Slots = schedule[1] ?? []

  return (
    <PlanDetailClient
      plan={plan as any}
      schedule={schedule as any}
      day1Slots={day1Slots as any}
    />
  )
}