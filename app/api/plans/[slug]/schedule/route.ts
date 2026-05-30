import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
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

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
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

    const SLOT_ORDER = { BREAKFAST: 0, LUNCH: 1, SNACK: 2, DINNER: 3 }
    const schedule: Record<number, typeof slots> = {}
    for (const slot of slots) {
      if (!schedule[slot.dayNumber]) schedule[slot.dayNumber] = []
      schedule[slot.dayNumber].push(slot)
    }
    for (const day of Object.keys(schedule)) {
      schedule[Number(day)].sort(
        (a, b) =>
          (SLOT_ORDER[a.mealSlot as keyof typeof SLOT_ORDER] ?? 99) -
          (SLOT_ORDER[b.mealSlot as keyof typeof SLOT_ORDER] ?? 99)
      )
    }

    return NextResponse.json({ plan, schedule })
  } catch (err) {
    console.error('[/api/plans/[slug]/schedule]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}