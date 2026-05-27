// ============================================================
// FITFUEL — lib/tdee.ts
// Phase 9B — Personalisation Engine
// TDEE calculation, calorie targets, macro targets, serving multipliers
// ============================================================

// ── Types ──────────────────────────────────────────────────

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTREMELY_ACTIVE'

export type FitnessGoal =
  | 'weight_loss'
  | 'aggressive_weight_loss'
  | 'maintenance'
  | 'lean_bulk'
  | 'muscle_gain'
  | 'performance'
  | 'sports_endurance'
  | 'recovery'
  | 'pcos'
  | 'diabetic'
  | 'manage_condition'

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface TDEEInput {
  weightKg: number
  heightCm: number
  age: number
  gender: Gender
  activityLevel: ActivityLevel
}

export interface MacroTargets {
  calorieTarget: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface DailyCalorieBalance {
  in: number
  out: number
  net: number
  target: number
  remaining: number
  status: 'under' | 'over' | 'on_track'
}

// ── Activity Multipliers ────────────────────────────────────

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY:          1.2,    // desk job, little or no exercise
  LIGHTLY_ACTIVE:     1.375,  // light exercise 1-3 days/week
  MODERATELY_ACTIVE:  1.55,   // moderate exercise 3-5 days/week
  VERY_ACTIVE:        1.725,  // hard exercise 6-7 days/week
  EXTREMELY_ACTIVE:   1.9,    // physical job + hard training / athlete
}

// ── Calorie Adjustments by Goal ─────────────────────────────

const CALORIE_ADJUSTMENTS: Record<string, number> = {
  weight_loss:            -500,
  aggressive_weight_loss: -750,
  maintenance:             0,
  lean_bulk:              +300,
  muscle_gain:            +500,
  performance:            +200,
  sports_endurance:       +100,
  recovery:                0,
  pcos:                  -300,   // moderate deficit — PCOS is insulin-sensitive
  diabetic:              -250,   // conservative deficit
  manage_condition:        0,
}

// ── Protein targets per kg bodyweight ──────────────────────

const PROTEIN_PER_KG: Record<string, number> = {
  weight_loss:            2.0,
  aggressive_weight_loss: 2.2,
  muscle_gain:            2.2,
  lean_bulk:              2.0,
  maintenance:            1.6,
  performance:            2.4,
  sports_endurance:       1.8,
  recovery:               1.8,
  pcos:                   1.8,
  diabetic:               1.6,
  manage_condition:       1.6,
}

// ── Core Calculations ───────────────────────────────────────

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation.
 * Most accurate for general population.
 */
export function calculateBMR(input: TDEEInput): number {
  const { weightKg, heightCm, age, gender } = input

  const base = 10 * weightKg + 6.25 * heightCm - 5 * age

  if (gender === 'MALE') return base + 5
  if (gender === 'FEMALE') return base - 161
  // OTHER — average of male and female
  return base - 78
}

/**
 * Calculate Total Daily Energy Expenditure.
 * BMR × activity multiplier.
 */
export function calculateTDEE(input: TDEEInput): number {
  const bmr = calculateBMR(input)
  const multiplier = ACTIVITY_MULTIPLIERS[input.activityLevel]
  return Math.round(bmr * multiplier)
}

/**
 * Apply goal-based calorie adjustment to TDEE.
 * Returns the personalised daily calorie target.
 * Enforces a floor of 1200 kcal (females) / 1500 kcal (males) — never below.
 */
export function getCalorieTarget(
  tdee: number,
  goal: FitnessGoal,
  gender: Gender = 'OTHER'
): number {
  const adjustment = CALORIE_ADJUSTMENTS[goal] ?? 0
  const raw = tdee + adjustment

  const floor = gender === 'FEMALE' ? 1200 : 1500
  return Math.max(raw, floor)
}

/**
 * Calculate macro targets from calorie target + goal + bodyweight.
 * Protein: goal-based g/kg
 * Fat: 27% of calories
 * Carbs: remainder
 */
export function getMacroTargets(
  calorieTarget: number,
  goal: FitnessGoal,
  weightKg: number
): MacroTargets {
  const proteinPerKg = PROTEIN_PER_KG[goal] ?? 1.6
  const proteinG = Math.round(proteinPerKg * weightKg)
  const proteinKcal = proteinG * 4

  const fatG = Math.round((calorieTarget * 0.27) / 9)
  const fatKcal = fatG * 9

  const carbsKcal = calorieTarget - proteinKcal - fatKcal
  const carbsG = Math.round(Math.max(carbsKcal, 0) / 4)

  return {
    calorieTarget,
    proteinG,
    carbsG,
    fatG,
  }
}

/**
 * Full personalisation in one call.
 * Takes profile → returns TDEE + calorie target + macros.
 */
export function getPersonalisedTargets(
  profile: TDEEInput,
  goal: FitnessGoal
): { tdee: number } & MacroTargets {
  const tdee = calculateTDEE(profile)
  const calorieTarget = getCalorieTarget(tdee, goal, profile.gender)
  const macros = getMacroTargets(calorieTarget, goal, profile.weightKg)

  return {
    tdee,
    ...macros,
  }
}

/**
 * Serving size multiplier.
 * How much of a recipe this user gets vs the plan default.
 * e.g. plan default 1800 kcal, user target 2100 → multiplier 1.2
 * Rounded to 1 decimal place.
 */
export function getServingMultiplier(
  userCalorieTarget: number,
  planDefaultCalories: number
): number {
  if (planDefaultCalories === 0) return 1.0
  return Math.round((userCalorieTarget / planDefaultCalories) * 10) / 10
}

/**
 * BMI calculation.
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

/**
 * BMI category label.
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25)   return 'Normal weight'
  if (bmi < 30)   return 'Overweight'
  return 'Obese'
}

/**
 * Ideal weight range using Devine formula (midpoint ± 10%).
 */
export function getIdealWeightRange(
  heightCm: number,
  gender: Gender
): { minKg: number; maxKg: number; midKg: number } {
  const inchesOver5ft = (heightCm / 2.54) - 60
  const base = gender === 'MALE' ? 50 : 45.5
  const midKg = Math.round((base + 2.3 * inchesOver5ft) * 10) / 10
  return {
    minKg: Math.round(midKg * 0.9 * 10) / 10,
    maxKg: Math.round(midKg * 1.1 * 10) / 10,
    midKg,
  }
}

/**
 * Estimated weeks to goal weight at current calorie deficit/surplus.
 */
export function weeksToGoal(
  currentWeightKg: number,
  targetWeightKg: number,
  tdee: number,
  calorieTarget: number
): number | null {
  const weeklyDeficit = (tdee - calorieTarget) * 7
  if (weeklyDeficit === 0) return null

  const kgToLose = currentWeightKg - targetWeightKg
  const kgPerWeek = weeklyDeficit / 7700 // 7700 kcal ≈ 1 kg fat

  if (kgToLose === 0) return 0
  const weeks = Math.abs(kgToLose / kgPerWeek)
  return Math.round(weeks)
}

// ── Activity Level Display Helpers ──────────────────────────

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY:          'Sedentary',
  LIGHTLY_ACTIVE:     'Lightly Active',
  MODERATELY_ACTIVE:  'Moderately Active',
  VERY_ACTIVE:        'Very Active',
  EXTREMELY_ACTIVE:   'Extremely Active (Athlete)',
}

export const ACTIVITY_LEVEL_DESCRIPTIONS: Record<ActivityLevel, string> = {
  SEDENTARY:          'Desk job, little or no exercise',
  LIGHTLY_ACTIVE:     'Light exercise or sport 1–3 days/week',
  MODERATELY_ACTIVE:  'Moderate exercise or sport 3–5 days/week',
  VERY_ACTIVE:        'Hard exercise or sport 6–7 days/week',
  EXTREMELY_ACTIVE:   'Physical job + training, or professional athlete',
}

export const FITNESS_GOAL_LABELS: Record<string, string> = {
  weight_loss:            'Lose Weight',
  aggressive_weight_loss: 'Aggressive Fat Loss',
  maintenance:            'Maintain Weight',
  lean_bulk:              'Lean Bulk',
  muscle_gain:            'Build Muscle',
  performance:            'Athletic Performance',
  sports_endurance:       'Endurance Sport',
  recovery:               'Recovery / Rehab',
  pcos:                   'PCOS Management',
  diabetic:               'Diabetes Management',
  manage_condition:       'Manage Health Condition',
}
