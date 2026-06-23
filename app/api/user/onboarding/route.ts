// app/api/user/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { prisma } from '@/lib/prisma'
import { calculateTDEE, getCalorieTarget, getMacroTargets } from '@/lib/tdee'
import { addDays } from 'date-fns'
import { enforceRateLimit } from '@/lib/rate-limit'
import { readJson } from '@/lib/validation/core'
import { onboardingSchema } from '@/lib/validation/schemas'

// ── Plan selection logic ──────────────────────────────────────
function getPlanSlug(goal: string, diet: string, condition: string): string {
  const d = diet
  if (condition === 'pcos')     return `pcos-${d}`
  if (condition === 'diabetic') return `diabetic-${d}`
  if (condition === 'thyroid')  return `thyroid-${d}`
  if (condition === 'heart')    return `heart-health-${d}`
  if (condition === 'obesity')  return `obesity-${d}`
  if (condition === 'gut')      return `gut-health-${d}`
  if (goal === 'weight_loss')            return `weight-loss-${d}`
  if (goal === 'aggressive_weight_loss') return `weight-loss-${d}`
  if (goal === 'muscle_gain')            return `muscle-gain-${d}`
  if (goal === 'lean_bulk')              return `muscle-gain-${d}`
  if (goal === 'performance')            return `strength-hypertrophy-${d}`
  if (goal === 'maintenance')            return `balanced-${d}`
  return `balanced-${d}`
}

function dietToSlug(diet: string): string {
  const map: Record<string, string> = {
    vegetarian:     'veg',
    eggetarian:     'egg',
    non_vegetarian: 'non-veg',
    jain:           'jain',
    vegan:          'veg',
  }
  return map[diet] ?? 'veg'
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // WS-3 · SEC-1/2 (F1): rate-limit per user + validate body
    const rl = await enforceRateLimit(req, 'mutation', userId)
    if (!rl.ok) return rl.response
    const parsed = await readJson(req, onboardingSchema)
    if (!parsed.ok) return parsed.response
    const body = parsed.data

    const {
      weightKg,
      heightCm,
      age,
      gender,
      activityLevel,
      goal,
      dietaryPreference,
      healthConditions = [],
      allergies = [],
    } = body

    if (!weightKg || !heightCm || !age || !gender || !activityLevel || !goal || !dietaryPreference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const tdee = calculateTDEE({ weightKg, heightCm, age, gender, activityLevel })
    const calorieTarget = getCalorieTarget(tdee, goal, gender.toUpperCase() as any)
    const macros = getMacroTargets(calorieTarget, goal as any, weightKg)

    const primaryCondition = healthConditions[0] ?? 'none'
    const dietSlug = dietToSlug(dietaryPreference)
    const targetSlug = getPlanSlug(goal, dietSlug, primaryCondition)

    const plan = await prisma.mealPlan.findUnique({
      where: { slug: targetSlug },
    })

    if (!plan) {
      return NextResponse.json(
        { error: `Plan not found: ${targetSlug}. Please seed this plan first.` },
        { status: 500 }
      )
    }

    if (!plan.isActive) {
      return NextResponse.json(
        { error: `Plan ${targetSlug} exists but is not active yet. Set isActive = true to enable it.` },
        { status: 503 }
      )
    }

    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (existingProfile?.onboardingComplete) {
      return NextResponse.json({ error: 'Already onboarded' }, { status: 400 })
    }

    const confirmedOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: 'CONFIRMED',
        userActivePlans: { none: {} },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = await prisma.$transaction(async (tx: any) => {
      const profile = await tx.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          weightKg,
          heightCm,
          age,
          gender: gender.toUpperCase(),
          activityLevel: activityLevel.toUpperCase(),
          fitnessGoal: mapGoalToEnum(goal),
          dietPreference: mapDietToEnum(dietaryPreference),
          healthConditions,
          allergies,
          tdee,
          calorieTarget,
          onboardingComplete: true,
          targetWeightKg: body.targetWeightKg ?? null,
        },
        update: {
          weightKg,
          heightCm,
          age,
          gender: gender.toUpperCase(),
          activityLevel: activityLevel.toUpperCase(),
          fitnessGoal: mapGoalToEnum(goal),
          dietPreference: mapDietToEnum(dietaryPreference),
          healthConditions,
          allergies,
          tdee,
          calorieTarget,
          onboardingComplete: true,
          targetWeightKg: body.targetWeightKg ?? null,
        },
      })

      let activePlan = null
      if (confirmedOrder) {
        const startDate = new Date()
        const endDate = addDays(startDate, 30)

        activePlan = await tx.userActivePlan.create({
          data: {
            userId,
            mealPlanId: plan.id,
            orderId: confirmedOrder.id,
            startDate,
            endDate,
            currentDay: 1,
            status: 'active',
            calorieTarget,
            proteinTarget: macros.proteinG,
            carbTarget: macros.carbsG,
            fatTarget: macros.fatG,
          },
        })
      }

      return { profile, activePlan, plan }
    })

    return NextResponse.json({
      success: true,
      tdee,
      calorieTarget,
      macros,
      plan: {
        slug: result.plan.slug,
        displayName: result.plan.displayName,
        avgCaloriesPerDay: result.plan.avgCaloriesPerDay,
      },
      activePlanId: result.activePlan?.id ?? null,
      requiresOrder: !confirmedOrder,
    })
  } catch (err) {
    console.error('[onboarding] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function mapGoalToEnum(goal: string) {
  const map: Record<string, string> = {
    weight_loss: 'LOSE_WEIGHT',
    aggressive_weight_loss: 'LOSE_WEIGHT',
    muscle_gain: 'GAIN_MUSCLE',
    lean_bulk: 'GAIN_MUSCLE',
    maintenance: 'MAINTAIN',
    performance: 'IMPROVE_FITNESS',
    manage_condition: 'MANAGE_CONDITION',
  }
  return (map[goal] ?? 'MAINTAIN') as any
}

function mapDietToEnum(diet: string) {
  const map: Record<string, string> = {
    vegetarian: 'VEGETARIAN',
    eggetarian: 'EGGETARIAN',
    non_vegetarian: 'NON_VEGETARIAN',
    jain: 'VEGETARIAN',
    vegan: 'VEGETARIAN',
  }
  return (map[diet] ?? 'VEGETARIAN') as any
}
