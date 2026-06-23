// lib/validation/schemas.ts
// WS-3 · SEC-2 — Zod schemas for the launch-blocking public routes.
//
// IMPORTANT: the diet/dur/meal values here are the FRONTEND keys the routes map
// via DIET_MAP / DUR_MAP / MEAL_MAP — NOT the Prisma enums. Keep them in sync
// with those maps in the route files.

import { z } from "zod";

/* ───────────────────────── Shared primitives ───────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;

// Plausible phone string — kept permissive on purpose so we don't reformat and
// break findFirst({ where: { phone } }) matching against existing rows.
export const zPhone = z
  .string()
  .trim()
  .min(7, "Phone too short")
  .max(20, "Phone too long")
  .regex(/^[0-9+\-\s()]+$/, "Invalid phone");

// Email for order/checkout routes — trimmed only (these routes match case-sensitively).
export const zEmail = z
  .string()
  .trim()
  .max(254)
  .regex(EMAIL_RE, "Invalid email");

// Email for the waitlist — normalised to lower-case (route stores it lower-cased).
export const zEmailLower = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .regex(EMAIL_RE, "Invalid email");

export const zPincode = z
  .string()
  .trim()
  .regex(/^[0-9]{6}$/, "Invalid pincode");

const zMoney = z.coerce.number().finite().min(0).max(500_000);

// Frontend selection keys (mirror the *_MAP objects in the route files).
const DIET_KEYS = ["veg", "egg", "nonveg", "jain"] as const;
const DUR_KEYS = [
  "trial",
  "weekly",
  "biweekly",
  "monthly_ex",
  "monthly",
  "two_month",
  "three_month",
] as const;
const MEAL_KEYS = ["bl", "sd", "all"] as const;
const DELIVERY_WINDOWS = ["MORNING", "EVENING"] as const;

/* ───────────────────────── Waitlist (SEC-3) ───────────────────────── */
export const waitlistSchema = z.object({
  email: zEmailLower,
  tier: z
    .string()
    .trim()
    .toUpperCase()
    .pipe(z.enum(["PREMIUM", "LUXURY"])),
});
export type WaitlistInput = z.infer<typeof waitlistSchema>;

/* ───────────────────────── Coupon validate ───────────────────────── */
export const couponValidateSchema = z.object({
  code: z.string().trim().min(1).max(40),
  planSlug: z.string().trim().min(1).max(120),
  dur: z.enum(DUR_KEYS),
  email: zEmail.optional(),
  buyerStateCode: z.string().trim().length(2).toUpperCase().optional(),
  // R-PRICE: physical coupon support. When isDigital === false, the route applies
  // the coupon against the provided physical subtotal (category PHYSICAL).
  meal: z.enum(MEAL_KEYS).optional(),
  isDigital: z.boolean().optional(),
  subtotalRs: z.coerce.number().finite().min(0).max(500_000).optional(),
  deliveryRs: z.coerce.number().finite().min(0).max(50_000).optional(),
});
export type CouponValidateInput = z.infer<typeof couponValidateSchema>;

/* ───────────────────────── Credit preview (GET query) ───────────────────────── */
export const creditPreviewQuerySchema = z.object({
  subtotal: z.coerce.number().finite().min(0).max(500_000).default(0),
});
export type CreditPreviewQuery = z.infer<typeof creditPreviewQuerySchema>;

/* ───────────────────────── COD order create ───────────────────────── */
export const codOrderSchema = z.object({
  firstname: z.string().trim().min(1).max(80),
  lastname: z.string().trim().max(80).optional().default(""),
  email: zEmail,
  phone: zPhone,
  address: z.string().trim().min(1).max(500),
  city: z.string().trim().max(120).optional().default(""),
  pincode: zPincode,
  diet: z.enum(DIET_KEYS),
  dur: z.enum(DUR_KEYS),
  meal: z.enum(MEAL_KEYS),
  price: zMoney,
  deliveryWindow: z.enum(DELIVERY_WINDOWS).optional(),
  useCredit: z.boolean().optional().default(false),
  planSlug: z.string().trim().max(120).optional(),
  refCode: z.string().trim().max(64).optional(),
  couponCode: z.string().trim().max(40).optional(),
});
export type CodOrderInput = z.infer<typeof codOrderSchema>;

/* ───────────────────────── PayU init ───────────────────────── */
export const payuInitSchema = z.object({
  firstname: z.string().trim().min(1).max(80),
  lastname: z.string().trim().max(80).optional().default(""),
  email: zEmail,
  phone: zPhone,
  address: z.string().trim().max(500).optional(),
  city: z.string().trim().max(120).optional(),
  pincode: z.string().trim().max(10).optional(),
  diet: z.enum(DIET_KEYS),
  dur: z.enum(DUR_KEYS),
  meal: z.enum(MEAL_KEYS),
  price: zMoney,
  deliveryWindow: z.enum(DELIVERY_WINDOWS).optional(),
  amount: z.coerce.number().finite().positive().max(500_000),
  productinfo: z.string().trim().min(1).max(200),
  useCredit: z.boolean().optional().default(false),
  planSlug: z.string().trim().max(120).optional(),
  couponCode: z.string().trim().max(40).optional(),
});
export type PayuInitInput = z.infer<typeof payuInitSchema>;

/* ───────────────────────── Partner apply ─────────────────────────
   Keep this minimal: validate `type` against the enum and require the two
   universal fields. The route keeps its own detailed, message-specific PAN /
   IFSC / bank checks for cash types so we don't change those error strings. */
export const partnerApplySchema = z.object({
  type: z.enum([
    "GYM",
    "TRAINER",
    "INFLUENCER",
    "DIETICIAN",
    "DOCTOR",
    "CORPORATE",
    "RESIDENCE",
  ]),
  form: z
    .object({
      name: z.string().trim().min(1, "Name is required").max(160),
      contactEmail: z.string().trim().min(1, "Email is required").max(254),
    })
    // allow (and pass through, typed as any) the many optional type-specific fields
    .catchall(z.any()),
});
export type PartnerApplyInput = z.infer<typeof partnerApplySchema>;

// Re-exported so route files can reference the same regexes if needed.
export const REGEX = { PAN: PAN_RE, IFSC: IFSC_RE, EMAIL: EMAIL_RE };

/* ═══════════════════════════════════════════════════════════════════════════
   WS-3 · SEC-2 — AUTHED-ROUTE SCHEMAS (F1)
   Lower-risk, session-gated routes. Each schema mirrors EXACTLY what its route
   already consumes — same keys, same coercions — so hardening is additive and
   changes no business logic. Numbers use z.coerce to match the route's Number().
   ═══════════════════════════════════════════════════════════════════════════ */

const zNum = (max = 1_000_000) =>
  z.coerce.number().finite().nonnegative().max(max);

/* ── user/onboarding (POST) ──
   gender/activityLevel/goal/dietaryPreference stay permissive strings: the route
   maps them via its own maps with safe defaults, so over-strict enums would
   reject legit values. We enforce types, presence, and bounds only. */
export const onboardingSchema = z.object({
  weightKg: z.coerce.number().finite().positive().max(500),
  heightCm: z.coerce.number().finite().positive().max(300),
  age: z.coerce.number().int().min(1).max(120),
  gender: z.string().trim().min(1).max(20),
  activityLevel: z.string().trim().min(1).max(40),
  goal: z.string().trim().min(1).max(40),
  dietaryPreference: z.string().trim().min(1).max(40),
  healthConditions: z.array(z.string().trim().max(40)).max(20).optional().default([]),
  allergies: z.array(z.string().trim().max(60)).max(40).optional().default([]),
  targetWeightKg: z.coerce.number().finite().positive().max(500).nullable().optional(),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;

/* ── user/profile (PATCH) ── */
export const profilePatchSchema = z.object({
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(20).optional(),
  dietPreference: z.string().trim().max(40).optional(),
  fitnessGoal: z.string().trim().max(40).optional(),
  gender: z.string().trim().max(20).optional(),
});
export type ProfilePatchInput = z.infer<typeof profilePatchSchema>;

/* ── user/metrics (GET query + POST body) ── */
export const metricsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(365).default(30),
});
export type MetricsQuery = z.infer<typeof metricsQuerySchema>;

export const metricsPostSchema = z.object({
  weight: zNum(1000).nullable().optional(),
  bmi: zNum(1000).nullable().optional(),
  bodyFatRate: zNum(100).nullable().optional(),
  fatFreeWeight: zNum(1000).nullable().optional(),
  subcutaneousFat: zNum(100).nullable().optional(),
  visceralFat: zNum(100).nullable().optional(),
  bodyWater: zNum(100).nullable().optional(),
  skeletalMuscle: zNum(100).nullable().optional(),
  muscleMass: zNum(1000).nullable().optional(),
  boneMass: zNum(100).nullable().optional(),
  protein: zNum(100).nullable().optional(),
  bmr: zNum(20000).nullable().optional(),
  bodyAge: zNum(150).nullable().optional(),
  source: z.string().trim().max(40).optional(),
  recordedAt: z.union([z.string(), z.number()]).optional(),
});
export type MetricsPostInput = z.infer<typeof metricsPostSchema>;

/* ── nutrition/diary (GET query + POST body) ── */
export const diaryQuerySchema = z.object({
  date: z.string().trim().max(40).optional(),
});
export const diaryPostSchema = z.object({
  foodItemId: z.string().trim().min(1).max(60),
  mealTypeId: z.string().trim().min(1).max(60),
  date: z.string().trim().min(1).max(40),
  quantity: z.coerce.number().finite().positive().max(100_000),
  notes: z.string().trim().max(500).optional(),
});
export type DiaryPostInput = z.infer<typeof diaryPostSchema>;

/* ── nutrition/foods (GET query + POST body) ── */
export const foodsQuerySchema = z.object({
  q: z.string().trim().max(80).optional(),
});
export const foodsPostSchema = z.object({
  name: z.string().trim().min(1).max(120),
  brand: z.string().trim().max(120).optional(),
  category: z.string().trim().max(60).optional(),
  per100Calories: z.coerce.number().finite().nonnegative().max(10_000),
  per100Protein: zNum(1000).optional(),
  per100Carbs: zNum(1000).optional(),
  per100Fat: zNum(1000).optional(),
  per100Fiber: zNum(1000).optional(),
});
export type FoodsPostInput = z.infer<typeof foodsPostSchema>;

/* ── nutrition/goals (PATCH) ── */
export const goalsPatchSchema = z.object({
  calories: zNum(20_000).optional(),
  protein: zNum(2000).optional(),
  carbs: zNum(5000).optional(),
  fat: zNum(2000).optional(),
  waterMl: zNum(50_000).optional(),
});
export type GoalsPatchInput = z.infer<typeof goalsPatchSchema>;

/* ── nutrition/water (GET query + POST body) ── */
export const waterQuerySchema = z.object({
  date: z.string().trim().max(40).optional(),
});
export const waterPostSchema = z.object({
  date: z.string().trim().max(40).optional(),
  amountMl: z.coerce.number().finite().positive().max(20_000),
  action: z.enum(["add", "subtract", "set"]).optional().default("add"),
});
export type WaterPostInput = z.infer<typeof waterPostSchema>;

/* ── active-plan/meals/log (POST) ── */
export const mealLogSchema = z.object({
  planScheduleSlotId: z.string().trim().min(1).max(60),
  dayNumber: z.coerce.number().int().min(1).max(400),
  actualGrams: z.coerce.number().finite().positive().max(5000).optional(),
});
export type MealLogInput = z.infer<typeof mealLogSchema>;

/* ── active-plan/meals/rate (POST) ── */
export const mealRateSchema = z.object({
  mealSlot: z.string().trim().min(1).max(20),
  logDate: z.string().trim().min(1).max(40),
  rating: z.coerce.number().int().min(1).max(5),
  note: z.string().trim().max(500).optional(),
});
export type MealRateInput = z.infer<typeof mealRateSchema>;

/* ── workout/sessions (GET query + POST body) ── */
export const workoutSessionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
});
export const workoutSessionPostSchema = z.object({
  name: z.string().trim().max(120).optional(),
  date: z.string().trim().max(40).optional(),
});
export type WorkoutSessionPostInput = z.infer<typeof workoutSessionPostSchema>;

/* ── user/deliveries (POST) ──
   action-specific note requirement stays in the route to preserve its exact
   "Please describe the issue." message. */
export const deliveryActionSchema = z.object({
  deliveryId: z.string().trim().min(1).max(60),
  action: z.enum(["confirm", "issue"]),
  note: z.string().trim().max(500).optional(),
});
export type DeliveryActionInput = z.infer<typeof deliveryActionSchema>;

/* ── user/notification-preferences (POST) ── */
export const notificationPrefsSchema = z.object({
  weeklyDigest: z.boolean().optional(),
  morningPush: z.boolean().optional(),
  eveningRecap: z.boolean().optional(),
  nudges: z.boolean().optional(),
  marketing: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  whatsappEnabled: z.boolean().optional(),
});
export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;

/* ── attribute-ref (POST) ── */
export const attributeRefSchema = z.object({
  code: z.string().trim().max(64).optional().default(""),
});
export type AttributeRefInput = z.infer<typeof attributeRefSchema>;
