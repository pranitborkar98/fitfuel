// lib/validation/schemas.ts
// WS-3 · SEC-2 — Zod schemas for the launch-blocking public routes.
//
// IMPORTANT: the diet/dur/meal values here are the FRONTEND keys the routes map
// via DIET_MAP / DUR_MAP / MEAL_MAP — NOT the Prisma enums. Keep them in sync
// with those maps in the route files.

import { z } from "zod";
import { isDateOnly } from "@/lib/date-only";

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
const DIET_KEYS = ["veg", "egg", "nonveg", "jain", "vegan"] as const;
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
  bundle: z.enum(["STARTER", "PRO"]).optional(),
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
  planSlug: z.string().trim().min(1).max(120),
  refCode: z.string().trim().max(64).optional(),
  couponCode: z.string().trim().max(40).optional(),
  expectedTotalRs: z.coerce.number().int().min(0).max(500_000).optional(),
});
export type CodOrderInput = z.infer<typeof codOrderSchema>;

/* ───────────────────────── PayU init ───────────────────────── */
export const payuInitSchema = z.object({
  firstname: z.string().trim().min(1).max(80),
  lastname: z.string().trim().max(80).optional().default(""),
  email: zEmail,
  phone: zPhone,
  address: z.string().trim().min(1).max(500),
  city: z.string().trim().max(120).optional().default("Pune"),
  pincode: zPincode,
  diet: z.enum(DIET_KEYS),
  dur: z.enum(DUR_KEYS),
  meal: z.enum(MEAL_KEYS),
  price: zMoney,
  deliveryWindow: z.enum(DELIVERY_WINDOWS).optional(),
  amount: z.coerce.number().finite().positive().max(500_000),
  productinfo: z.string().trim().min(1).max(200),
  useCredit: z.boolean().optional().default(false),
  planSlug: z.string().trim().min(1).max(120),
  couponCode: z.string().trim().max(40).optional(),
  expectedTotalRs: z.coerce.number().int().min(1).max(500_000).optional(),
});
export type PayuInitInput = z.infer<typeof payuInitSchema>;

/* ───────────────────────── Digital PayU init ───────────────────────── */
const optionalProfileNumber = z.union([
  z.literal(""),
  z.coerce.number().finite(),
]).optional();

export const digitalPayuInitSchema = z.object({
  firstname: z.string().trim().min(1).max(80),
  lastname: z.string().trim().max(80).optional().default(""),
  email: zEmail,
  phone: zPhone,
  planSlug: z.string().trim().min(1).max(120),
  dur: z.enum(DUR_KEYS),
  bundle: z.enum(["STARTER", "PRO"]).optional().default("STARTER"),
  couponCode: z.string().trim().max(40).optional(),
  buyerStateCode: z.string().trim().length(2).toUpperCase().optional(),
  useCredit: z.boolean().optional().default(false),
  expectedTotalRs: z.coerce.number().int().min(1).max(500_000).optional(),
  heightCm: optionalProfileNumber,
  weightKg: optionalProfileNumber,
  targetWeightKg: optionalProfileNumber,
  age: optionalProfileNumber,
});
export type DigitalPayuInitInput = z.infer<typeof digitalPayuInitSchema>;

/* ───────────────────────── Partner apply ───────────────────────── */
const optionalPartnerText = (max: number) => z.string().trim().max(max).optional().default("");

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
  form: z.object({
    name: z.string().trim().min(1, "Name is required").max(160),
    contactEmail: zEmail,
    contactPhone: optionalPartnerText(20),
    gymAddress: optionalPartnerText(500),
    gymManagerName: optionalPartnerText(120),
    bio: optionalPartnerText(800),
    specialty: optionalPartnerText(160),
    socialHandle: optionalPartnerText(120),
    followerCount: z.union([
      z.literal(""),
      z.coerce.number().int().min(0).max(1_000_000_000),
    ]).optional().default(""),
    qualification: optionalPartnerText(200),
    registrationNumber: optionalPartnerText(120),
    clinicName: optionalPartnerText(200),
    hospitalAffiliation: optionalPartnerText(200),
    allowedEmailDomain: optionalPartnerText(254),
    hrContactName: optionalPartnerText(120),
    treasurerContact: optionalPartnerText(200),
    societyAddress: optionalPartnerText(500),
    panNumber: optionalPartnerText(10),
    bankAccountName: optionalPartnerText(160),
    bankAccountNumber: optionalPartnerText(20),
    bankIfsc: optionalPartnerText(11),
  }).strict(),
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

/* ── user/onboarding (POST) ── */
export const onboardingSchema = z.object({
  weightKg: z.coerce.number().finite().positive().max(500),
  heightCm: z.coerce.number().finite().positive().max(300),
  age: z.coerce.number().int().min(13).max(100),
  gender: z.enum(["male", "female", "other"]),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]),
  goal: z.enum(["weight_loss", "aggressive_weight_loss", "muscle_gain", "lean_bulk", "maintenance", "performance"]),
  dietaryPreference: z.enum(["vegetarian", "eggetarian", "non_vegetarian", "jain", "vegan"]),
  healthConditions: z.array(z.enum(["pcos", "diabetic", "thyroid", "heart", "obesity", "gut", "other"])).max(7).optional().default([]),
  allergies: z.array(z.enum(["nuts", "dairy", "gluten", "shellfish"])).max(4).optional().default([]),
  targetWeightKg: z.coerce.number().finite().positive().max(500).nullable().optional(),
}).strict();
export type OnboardingInput = z.infer<typeof onboardingSchema>;

/* ── user/profile (PATCH) ── */
export const profilePatchSchema = z.object({
  name: z.string().trim().max(120).optional(),
  phone: z.union([z.literal(""), zPhone]).optional(),
  dietPreference: z.enum(["", "VEGETARIAN", "EGGETARIAN", "NON_VEGETARIAN", "JAIN", "VEGAN"]).optional(),
  fitnessGoal: z.enum(["", "LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN", "IMPROVE_FITNESS", "MANAGE_CONDITION"]).optional(),
  gender: z.enum(["", "MALE", "FEMALE", "OTHER"]).optional(),
}).strict();
export type ProfilePatchInput = z.infer<typeof profilePatchSchema>;

/* ── user/metrics (GET query + POST body) ── */
export const metricsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(365).default(30),
});
export type MetricsQuery = z.infer<typeof metricsQuerySchema>;

const optionalMetric = (min: number, max: number) =>
  z.coerce.number().finite().min(min).max(max).nullable().optional();

export const metricsPostSchema = z.object({
  weight: optionalMetric(20, 300),
  bmi: optionalMetric(5, 100),
  bodyFatRate: optionalMetric(1, 75),
  fatMass: optionalMetric(0, 250),
  fatFreeWeight: optionalMetric(5, 300),
  subcutaneousFat: optionalMetric(0, 75),
  visceralFat: optionalMetric(0, 50),
  bodyWater: optionalMetric(20, 80),
  waterWeight: optionalMetric(5, 250),
  skeletalMuscle: optionalMetric(5, 80),
  muscleMass: optionalMetric(3, 250),
  muscleRate: optionalMetric(1, 100),
  boneMass: optionalMetric(0.5, 15),
  protein: optionalMetric(1, 40),
  proteinMass: optionalMetric(0.5, 100),
  bmr: optionalMetric(500, 10_000),
  bodyAge: optionalMetric(5, 150),
  idealWeight: optionalMetric(20, 300),
  source: z.enum(["manual", "ble_estimate"]).optional(),
  recordedAt: z.union([
    z.string().datetime({ offset: true }),
    z.number().int().nonnegative().max(4_102_444_800_000),
  ]).optional(),
}).strict();
export type MetricsPostInput = z.infer<typeof metricsPostSchema>;

/* ── nutrition/diary (GET query + POST body) ── */
const dateOnlyValue = z.string().trim().refine(isDateOnly, "Use a valid YYYY-MM-DD date");

export const diaryQuerySchema = z.object({
  date: dateOnlyValue.optional(),
}).strict();
export const diaryPostSchema = z.object({
  foodItemId: z.string().trim().min(1).max(60),
  mealTypeId: z.string().trim().min(1).max(60),
  date: dateOnlyValue,
  quantity: z.coerce.number().finite().positive().max(5000),
  notes: z.string().trim().max(500).optional(),
}).strict();
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
  fiber: zNum(500).optional(),
  waterMl: zNum(50_000).optional(),
}).strict();
export type GoalsPatchInput = z.infer<typeof goalsPatchSchema>;

/* ── nutrition/water (GET query + POST body) ── */
export const waterQuerySchema = z.object({
  date: dateOnlyValue.optional(),
}).strict();
export const waterPostSchema = z.object({
  date: dateOnlyValue.optional(),
  amountMl: z.coerce.number().finite().nonnegative().max(20_000),
  action: z.enum(["add", "subtract", "set"]).optional().default("add"),
}).strict();
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
  mealSlot: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  rating: z.coerce.number().int().min(1).max(5),
  note: z.string().trim().max(500).optional(),
}).strict();
export type MealRateInput = z.infer<typeof mealRateSchema>;

/* ── workout/sessions (GET query + POST body) ── */
export const workoutSessionQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
}).strict();
export const workoutSessionPostSchema = z.object({
  name: z.string().trim().max(120).optional(),
  date: dateOnlyValue.optional(),
}).strict();
export type WorkoutSessionPostInput = z.infer<typeof workoutSessionPostSchema>;

export const workoutBurnedQuerySchema = z.object({
  date: dateOnlyValue.optional(),
}).strict();

export const exerciseQuerySchema = z.object({
  q: z.string().trim().max(80).optional().default(""),
  category: z.string().trim().max(80).optional().default(""),
  level: z.string().trim().max(40).optional().default(""),
  equipment: z.string().trim().max(80).optional().default(""),
  muscle: z.string().trim().max(80).optional().default(""),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).max(100_000).default(0),
}).strict();

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
}).strict();
export type NotificationPrefsInput = z.infer<typeof notificationPrefsSchema>;

/* ── attribute-ref (POST) ── */
export const attributeRefSchema = z.object({
  code: z.string().trim().max(64).optional().default(""),
});
export type AttributeRefInput = z.infer<typeof attributeRefSchema>;
