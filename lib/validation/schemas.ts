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
