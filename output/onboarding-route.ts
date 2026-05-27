// app/api/user/onboarding/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { calculateTDEE, calculateCalorieTarget, calculateMacroTargets } from '@/lib/tdee'
import { addDays } from 'date-fns'

// ── Plan selection logic ──────────────────────────────────────
// Maps goal + diet + condition → meal plan slug
// Falls back to weight-loss-veg if target plan is not isActive
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
  if (goal === 'weight_loss')         return `weight-loss-${d}`
  if (goal === 'aggressive_weight_loss') return `weight-loss-${d}`
  if (goal === 'muscle_gain')         return `muscle-gain-${d}`
  if (goal === 'lean_bulk')           return `muscle-gain-${d}`
  if (goal === 'performance')         return `strength-hypertrophy-${d}`
  if (goal === 'maintenance')         return `balanced-${d}`

  return `balanced-${d}` // safe default
}

// Maps frontend diet value → slug suffix
function dietToSlug(diet: string): string {
  const map: Record<string, string> = {
    vegetarian:     'veg',
    eggetarian:     'egg',
    non_vegetarian: 'non-veg',
    jain:           'jain',
    vegan:          'veg', // vegan-muscle is only vegan plan; fallback to veg
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
      healthConditions = [],  // string[]
      allergies = [],          // string[]
    } = body

    // ── Validate required fields ──────────────────────────────
    if (!weightKg || !heightCm || !age || !gender || !activityLevel || !goal || !dietaryPreference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── Calculate TDEE + targets ──────────────────────────────
    const tdee = calculateTDEE({ weightKg, heightCm, age, gender, activityLevel })
    const calorieTarget = calculateCalorieTarget(tdee, goal)
    const macros = calculateMacroTargets(calorieTarget, weightKg, goal)

    // ── Determine plan slug ───────────────────────────────────
    const primaryCondition = healthConditions[0] ?? 'none'
    const dietSlug = dietToSlug(dietaryPreference)
    const targetSlug = getPlanSlug(goal, dietSlug, primaryCondition)

    // ── Find the plan (fallback to weight-loss-veg if inactive) ──
    let plan = await prisma.mealPlan.findUnique({
      where: { slug: targetSlug },
    })

    if (!plan || !plan.isActive) {
      // Fallback — only verified active plan
      plan = await prisma.mealPlan.findUnique({
        where: { slug: 'weight-loss-veg' },
      })
    }

    if (!plan) {
      return NextResponse.json({ error: 'No active meal plan found' }, { status: 500 })
    }

    // ── Check if already onboarded (prevent duplicate UserActivePlan) ──
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (existingProfile?.onboardingComplete) {
      return NextResponse.json({ error: 'Already onboarded' }, { status: 400 })
    }

    // ── Write to DB (transaction) ─────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update UserProfile
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

      // 2. Create UserActivePlan
      const startDate = new Date()
      const endDate = addDays(startDate, 30)

      const activePlan = await tx.userActivePlan.create({
        data: {
          userId,
          mealPlanId: plan!.id,
          startDate,
          endDate,
          currentDay: 1,
          status: 'active',
          calorieTarget,
          proteinTarget: macros.proteinGrams,
          carbTarget: macros.carbsGrams,
          fatTarget: macros.fatGrams,
        },
      })

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
      activePlanId: result.activePlan.id,
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