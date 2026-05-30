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
        dietaryVariant: true,
        planTier: true,
        planCategory: true,
        targetCalories: true,
        proteinTarget: true,
        carbTarget: true,
        fatTarget: true,
        isActive: true,
        durationDays: true,
      },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Fetch all 120 slots with recipe details
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

    // Group by day number
    const schedule: Record<number, typeof slots> = {}
    for (const slot of slots) {
      if (!schedule[slot.dayNumber]) schedule[slot.dayNumber] = []
      schedule[slot.dayNumber].push(slot)
    }

    // Sort each day's meals in display order
    const SLOT_ORDER = { BREAKFAST: 0, LUNCH: 1, SNACK: 2, DINNER: 3 }
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
