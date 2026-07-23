// lib/plan-tier-pricing.ts — Phase 19A
// Single source of truth for Standard / Premium / Luxury price matrices.
// STANDARD is the seeded matrix in PlanPrice. PREMIUM ≈ 1.25× STANDARD, LUXURY ≈ 1.5× STANDARD.
// Premium/Luxury are estimates until those MealPlan rows exist; shown as "Join waitlist" CTAs.

export type Tier = 'STANDARD' | 'PREMIUM' | 'LUXURY'
export type DurationKey =
  | 'TRIAL_DAY'
  | 'WEEKLY'
  | 'BI_WEEKLY'
  | 'MONTHLY_EXCL_WEEKENDS'
  | 'ONE_MONTH'
  | 'TWO_MONTH'
  | 'THREE_MONTH'
export type MealKey = 'BREAKFAST_LUNCH' | 'SNACK_DINNER' | 'ALL_FOUR'
export type DietKey = 'VEG' | 'EGG' | 'NON_VEG' | 'JAIN' | 'VEGAN'

// ─── Duration metadata ───────────────────────────────────────────────────────
export const DURATIONS: { key: DurationKey; label: string; days: number; legacy: string; popular?: boolean }[] = [
  { key: 'TRIAL_DAY',             label: 'Trial Day', days:  1, legacy: 'trial' },
  { key: 'WEEKLY',                label: '1 Week',    days:  7, legacy: 'weekly' },
  { key: 'BI_WEEKLY',             label: '2 Weeks',   days: 14, legacy: 'biweekly' },
  { key: 'MONTHLY_EXCL_WEEKENDS', label: 'Mon–Fri',   days: 22, legacy: 'monthly_ex' },
  { key: 'ONE_MONTH',             label: '1 Month',   days: 30, legacy: 'monthly', popular: true },
  { key: 'TWO_MONTH',             label: '2 Months',  days: 60, legacy: 'two_month' },
  { key: 'THREE_MONTH',           label: '3 Months',  days: 90, legacy: 'three_month' },
]

// ─── Meal-combo metadata ─────────────────────────────────────────────────────
export const MEALS: { key: MealKey; label: string; short: string; time: string; legacy: string }[] = [
  { key: 'BREAKFAST_LUNCH', label: 'Breakfast + Lunch', short: 'B + L', time: 'Morning',  legacy: 'bl' },
  { key: 'SNACK_DINNER',    label: 'Snack + Dinner',    short: 'S + D', time: 'Evening',  legacy: 'sd' },
  { key: 'ALL_FOUR',        label: 'All 4 Meals',       short: 'All 4', time: 'Full day', legacy: 'all' },
]

// ─── Diet metadata (Jain is first-class) ─────────────────────────────────────
//
// These dots are the ONE sanctioned exception to the lime-only palette in
// DESIGN.md. Green-for-vegetarian and red-for-non-vegetarian is FSSAI
// labelling convention in India, so the colour is carrying regulated meaning
// here, not decoration: recolouring it lime would actively mislead.
//
// Jain was #a78bfa (purple), which is not part of that convention and was
// just an arbitrary hue. Jain food is stricter vegetarian, so it now sits in
// the green family alongside veg and vegan. Egg keeps amber, which matches
// the yellow marker commonly used for eggetarian in Indian menus.
//
// Colour is never the sole signal: every dot is paired with its text label.
export const DIETS: { key: DietKey; label: string; short: string; dot: string; legacy: string }[] = [
  { key: 'VEG',     label: 'Vegetarian',     short: 'Veg',     dot: '#22c55e', legacy: 'veg'    },
  { key: 'EGG',     label: 'Eggetarian',     short: 'Egg',     dot: '#f59e0b', legacy: 'egg'    },
  { key: 'NON_VEG', label: 'Non-Vegetarian', short: 'Non-veg', dot: '#ef4444', legacy: 'nonveg' },
  { key: 'JAIN',    label: 'Jain',           short: 'Jain',    dot: '#4ade80', legacy: 'jain'   },
  { key: 'VEGAN',   label: 'Vegan',          short: 'Vegan',   dot: '#10b981', legacy: 'veg'    },
]

// ─── Tier metadata ───────────────────────────────────────────────────────────
// Accents were lime / amber / violet, i.e. a three-hue tier palette. Tiers are
// now distinguished by availability, not colour: the one purchasable tier gets
// lime, the two waitlisted ones sit muted. Same reason as the category accents
// in PlansCatalog, see DESIGN.md.
//
// The Luxury tagline promised an "AI trainer". There is no AI anywhere in this
// codebase, so it is not being sold here or on the homepage tier table.
export const TIERS: { key: Tier; label: string; tagline: string; accent: string; available: boolean }[] = [
  { key: 'STANDARD', label: 'Standard', tagline: 'Real food, real macros, real results.',        accent: '#84cc16', available: true  },
  { key: 'PREMIUM',  label: 'Premium',  tagline: 'Standard + supplements + workout plan.',        accent: '#85857e', available: false },
  { key: 'LUXURY',   label: 'Luxury',   tagline: 'Premium + nutritionist consult + concierge.',   accent: '#85857e', available: false },
]

// ─── Tier multipliers (Premium ≈ 1.25× STD, Luxury ≈ 1.5× STD) ────────────────
// Matches the hardcoded matrices on the original /plans page (vetted by Chintu).
const TIER_MULTIPLIER: Record<Tier, number> = {
  STANDARD: 1.0,
  PREMIUM:  1.25,
  LUXURY:   1.50,
}

// ─── PlanPrice row shape ─────────────────────────────────────────────────────
export interface PriceRow {
  id?: string
  diet?: string
  duration: string
  mealsPerDay: string
  priceRs: number
  mrpRs?: number | null
}

// ─── Lookup helpers ──────────────────────────────────────────────────────────
// Get Standard price for a (duration, mealCombo) — from real PlanPrice rows.
export function getStandardPrice(
  prices: PriceRow[],
  duration: DurationKey,
  mealCombo: MealKey
): number | null {
  const row = prices.find((p) => p.duration === duration && p.mealsPerDay === mealCombo)
  return row ? row.priceRs : null
}

// Get tier-adjusted price (Standard is real, Premium/Luxury are × multiplier rounded to nearest ₹).
export function getTierPrice(
  prices: PriceRow[],
  tier: Tier,
  duration: DurationKey,
  mealCombo: MealKey
): number | null {
  const std = getStandardPrice(prices, duration, mealCombo)
  if (std === null) return null
  return Math.round(std * TIER_MULTIPLIER[tier])
}

// ─── Diet variant → checkout legacy code ─────────────────────────────────────
export function dietToLegacy(dietaryVariant: string): string {
  const d = DIETS.find((x) => x.key === dietaryVariant)
  return d ? d.legacy : 'veg'
}

// ─── Diet variant → display label ────────────────────────────────────────────
export function dietToLabel(dietaryVariant: string): string {
  const d = DIETS.find((x) => x.key === dietaryVariant)
  return d ? d.label : dietaryVariant
}

// ─── Build checkout URL ──────────────────────────────────────────────────────
export function buildCheckoutUrl(opts: {
  dietaryVariant: string
  duration: DurationKey
  mealCombo: MealKey
  priceRs: number
  planSlug: string
  planName: string
  tier?: Tier
}): string {
  const dur = DURATIONS.find((d) => d.key === opts.duration)!
  const meal = MEALS.find((m) => m.key === opts.mealCombo)!
  const params = new URLSearchParams({
    diet:      dietToLegacy(opts.dietaryVariant),
    dur:       dur.legacy,
    meal:      meal.legacy,
    price:     String(opts.priceRs),
    planSlug:  opts.planSlug,
    planName:  opts.planName,
    tier:      opts.tier ?? 'STANDARD',
  })
  return `/checkout?${params.toString()}`
}
