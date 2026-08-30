// app/api/user/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { prisma } from '@/lib/prisma'
import { calculateTDEE, getCalorieTarget, getMacroTargets } from '@/lib/tdee'
import { enforceRateLimit } from '@/lib/rate-limit'
import { readJson } from '@/lib/validation/core'
import { onboardingSchema } from '@/lib/validation/schemas'
import type { ActivityLevel, DietType, DietVariant, FitnessGoal, Gender, Prisma } from '@prisma/client'
import { hasCompletePlanSchedule } from '@/lib/plan-readiness'

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
  if (goal === 'maintenance')            return `balanced-diet-${d}`
  return `balanced-diet-${d}`
}

function dietToSlug(diet: string): string {
  const map: Record<string, string> = {
    vegetarian:     'veg',
    eggetarian:     'egg',
    non_vegetarian: 'non-veg',
    jain:           'jain',
    vegan:          'vegan',
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

    const genderEnum = mapGender(gender)
    const activityEnum = mapActivity(activityLevel)
    const tdee = calculateTDEE({ weightKg, heightCm, age, gender: genderEnum, activityLevel: activityEnum })
    const calorieTarget = getCalorieTarget(tdee, goal, genderEnum)
    const macros = getMacroTargets(calorieTarget, goal, weightKg)

    const primaryCondition: string = healthConditions.length > 0 ? healthConditions[0] : 'none'
    const dietSlug = dietToSlug(dietaryPreference)
    const targetSlug = getPlanSlug(goal, dietSlug, primaryCondition)

    const dietVariant = mapDietVariant(dietaryPreference)
    const candidates = await prisma.mealPlan.findMany({
      where: { isActive: true, dietaryVariant: dietVariant },
      orderBy: [{ sortOrder: 'asc' }, { displayName: 'asc' }],
      select: {
        id: true,
        slug: true,
        displayName: true,
        avgCaloriesPerDay: true,
        subCategory: true,
        cycleLengthDays: true,
        mealsPerDay: true,
        _count: { select: { scheduleSlots: true } },
        planPrices: {
          where: { isDigital: false, isActive: true },
          select: { id: true },
          take: 1,
        },
      },
    })
    const orderable = candidates.filter((candidate) =>
      candidate.planPrices.length > 0 && hasCompletePlanSchedule({
        scheduleCount: candidate._count.scheduleSlots,
        cycleLengthDays: candidate.cycleLengthDays,
        mealsPerDay: candidate.mealsPerDay,
      })
    )
    const desiredCategory = goal === 'muscle_gain' || goal === 'lean_bulk'
      ? 'muscle_gain'
      : goal === 'maintenance'
        ? 'balanced'
        : goal === 'performance'
          ? 'strength'
          : primaryCondition !== 'none'
            ? primaryCondition
            : 'weight_loss'
    const plan = orderable.find((candidate) => candidate.slug === targetSlug)
      ?? orderable.find((candidate) => candidate.subCategory === desiredCategory)
      ?? orderable[0]
      ?? null

    const existingActivePlan = await prisma.userActivePlan.findFirst({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const profile = await tx.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          weightKg,
          heightCm,
          age,
          gender: genderEnum,
          activityLevel: activityEnum,
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
          gender: genderEnum,
          activityLevel: activityEnum,
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

      // Onboarding personalises food already purchased. It must never create
      // a subscription from a generic confirmed order or a guessed plan.
      await tx.userActivePlan.updateMany({
        where: { userId, status: 'active' },
        data: {
          calorieTarget,
          proteinTarget: macros.proteinG,
          carbTarget: macros.carbsG,
          fatTarget: macros.fatG,
        },
      })

      return profile
    })

    return NextResponse.json({
      success: true,
      tdee,
      calorieTarget,
      macros,
      plan: plan ? {
        slug: plan.slug,
        displayName: plan.displayName,
        avgCaloriesPerDay: plan.avgCaloriesPerDay,
      } : null,
      activePlanId: existingActivePlan?.id ?? null,
      requiresOrder: !existingActivePlan,
      recommendationUnavailable: !plan,
    })
  } catch (err) {
    console.error('[onboarding] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function mapGender(gender: 'male' | 'female' | 'other'): Gender {
  return { male: 'MALE', female: 'FEMALE', other: 'OTHER' }[gender] as Gender
}

function mapActivity(activity: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'): ActivityLevel {
  return activity.toUpperCase() as ActivityLevel
}

function mapGoalToEnum(goal: string): FitnessGoal {
  const map: Record<string, FitnessGoal> = {
    weight_loss: 'LOSE_WEIGHT',
    aggressive_weight_loss: 'LOSE_WEIGHT',
    muscle_gain: 'GAIN_MUSCLE',
    lean_bulk: 'GAIN_MUSCLE',
    maintenance: 'MAINTAIN',
    performance: 'IMPROVE_FITNESS',
    manage_condition: 'MANAGE_CONDITION',
  }
  return map[goal] ?? 'MAINTAIN'
}

function mapDietToEnum(diet: string): DietType {
  const map: Record<string, DietType> = {
    vegetarian: 'VEGETARIAN',
    eggetarian: 'EGGETARIAN',
    non_vegetarian: 'NON_VEGETARIAN',
    jain: 'JAIN',
    vegan: 'VEGAN',
  }
  return map[diet] ?? 'VEGETARIAN'
}

function mapDietVariant(diet: string): DietVariant {
  const map: Record<string, DietVariant> = {
    vegetarian: 'VEG',
    eggetarian: 'EGG',
    non_vegetarian: 'NON_VEG',
    jain: 'JAIN',
    vegan: 'VEGAN',
  }
  return map[diet] ?? 'VEG'
}
