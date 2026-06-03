// app/api/user/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

import { prisma } from '@/lib/prisma'
import { calculateTDEE, getCalorieTarget, getMacroTargets } from '@/lib/tdee'
import { addDays } from 'date-fns'

// ── Plan selection logic ──────────────────────────────────────
// Maps goal + diet + condition → meal plan slug
function getPlanSlug(goal: string, diet: string, condition: string): string {
  const d = diet // veg | egg | non-veg | jain | vegan

  // Condition takes priority over goal
  if (condition === 'pcos')     return `pcos-${d}`
  if (condition === 'diabetic') return `diabetic-${d}`
  if (condition === 'thyroid')  return `thyroid-${d}`
  if (condition === 'heart')    return `heart-health-${d}`
  if (condition === 'obesity')  return `obesity-${d}`
  if (condition === 'gut')      return `gut-health-${d}`

  // Goal-based
  if (goal === 'weight_loss')            return `weight-loss-${d}`
  if (goal === 'aggressive_weight_loss') return `weight-loss-${d}`
  if (goal === 'muscle_gain')            return `muscle-gain-${d}`
  if (goal === 'lean_bulk')              return `muscle-gain-${d}`
  if (goal === 'performance')            return `strength-hypertrophy-${d}`
  if (goal === 'maintenance')            return `balanced-${d}`

  return `balanced-${d}` // safe default
}

// Maps frontend diet value → slug suffix
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
    const body = await req.json()

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

    // ── Validate required fields ──────────────────────────────
    if (!weightKg || !heightCm || !age || !gender || !activityLevel || !goal || !dietaryPreference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Calculate TDEE + targets ──────────────────────────────
    const tdee = calculateTDEE({ weightKg, heightCm, age, gender, activityLevel })
    const calorieTarget = getCalorieTarget(tdee, goal, gender.toUpperCase() as any)
    const macros = getMacroTargets(calorieTarget, goal as any, weightKg)

    // ── Determine plan slug ───────────────────────────────────
    const primaryCondition = healthConditions[0] ?? 'none'
    const dietSlug = dietToSlug(dietaryPreference)
    const targetSlug = getPlanSlug(goal, dietSlug, primaryCondition)

    // ── Find the plan ─────────────────────────────────────────
    // FIX 1: Never silently fall back to weight-loss-veg — that assigns the
    // wrong diet to the user. If the target plan isn't seeded/active yet,
    // tell the client explicitly so it doesn't serve wrong meals.
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

    // ── Check if already onboarded (prevent duplicate UserActivePlan) ──
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (existingProfile?.onboardingComplete) {
      return NextResponse.json({ error: 'Already onboarded' }, { status: 400 })
    }

    // ── FIX 2: Check for a confirmed order before creating UserActivePlan ──
    // Onboarding saves the profile + targets but only creates the plan
    // if the user has a CONFIRMED order. Without an order, we return the
    // calculated targets so the Step 5 screen can display them — but the
    // user must complete checkout to activate the plan.
    const confirmedOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: 'CONFIRMED',
        userActivePlans: { none: {} }, // order not already linked to a plan
      },
      orderBy: { createdAt: 'desc' },
    })

    // ── Write to DB (transaction) ─────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1. Always save UserProfile — targets are calculated regardless of order
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

      // 2. Only create UserActivePlan if there is a confirmed unpaired order
      let activePlan = null
      if (confirmedOrder) {
        const startDate = new Date()
        const endDate = addDays(startDate, 30)

        activePlan = await tx.userActivePlan.create({
          data: {
            userId,
            mealPlanId: plan.id,
            orderId: confirmedOrder.id,  // link to the order that paid for this
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
      // null if no confirmed order — frontend should redirect to checkout
      activePlanId: result.activePlan?.id ?? null,
      requiresOrder: !confirmedOrder,
    })
  } catch (err) {
    console.error('[onboarding] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── Enum mappers ──────────────────────────────────────────────
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