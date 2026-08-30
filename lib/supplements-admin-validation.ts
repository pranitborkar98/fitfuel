import "server-only";

import { z } from "zod";

export const AFFILIATE_NETWORKS = [
  "NUTRABAY",
  "HEALTHKART",
  "MUSCLEBLAZE",
  "AMAZON_IN",
  "FLIPKART",
  "TATA_1MG",
  "WELLNESS_FOREVER",
  "OTHER",
] as const;
export const SUPPLEMENT_GOALS = ["MUSCLE_GAIN", "WEIGHT_LOSS", "BALANCED", "PERFORMANCE"] as const;

export const supplementIdSchema = z.string().cuid();
const slugSchema = z.string().trim().toLowerCase().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const nullableText = (max: number) => z.string().trim().max(max).nullable();
const textArray = z.array(z.string().trim().min(1).max(500)).max(60);
const nullableImageUrl = z.union([
  z.null(),
  z.string().trim().max(2048).refine(
    (value) => value.startsWith("/") || /^https:\/\//i.test(value),
    "Use an HTTPS image URL or an app-relative path.",
  ),
]);
const accentColor = z.union([
  z.null(),
  z.string().trim().regex(/^#[0-9a-f]{6}$/i, "Accent colour must be a six-digit hex value."),
]);

export const supplementListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: slugSchema.optional(),
  includeInactive: z.enum(["0", "1"]).default("0"),
}).strict();

export const supplementCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1).max(160),
  categorySlug: slugSchema,
  tagline: nullableText(300).optional().default(null),
  description: nullableText(10_000).optional().default(null),
  benefits: textArray.optional().default([]),
  dosage: nullableText(500).optional().default(null),
  priceRange: nullableText(120).optional().default(null),
  emoji: nullableText(16).optional().default(null),
  accentColor: accentColor.optional().default(null),
  recommendedFor: z.array(z.enum(SUPPLEMENT_GOALS)).max(SUPPLEMENT_GOALS.length).optional().default([]),
}).strict();

export const supplementPatchSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  tagline: nullableText(300).optional(),
  description: nullableText(10_000).optional(),
  mechanism: nullableText(10_000).optional(),
  dosage: nullableText(500).optional(),
  timing: nullableText(500).optional(),
  onsetTime: nullableText(200).optional(),
  halfLife: nullableText(200).optional(),
  form: nullableText(120).optional(),
  cyclingRequired: z.boolean().optional(),
  cyclingProtocol: nullableText(1_000).optional(),
  warnings: nullableText(10_000).optional(),
  genderNotes: nullableText(5_000).optional(),
  ageNotes: nullableText(5_000).optional(),
  evidenceLevel: z.union([z.null(), z.enum(["very_high", "high", "moderate", "low", "preliminary"])]).optional(),
  studyCount: nullableText(100).optional(),
  priceRange: nullableText(120).optional(),
  valueRating: z.union([z.null(), z.enum(["exceptional", "good", "moderate", "expensive"])]).optional(),
  veganFriendly: z.boolean().optional(),
  certificationNote: nullableText(2_000).optional(),
  popular: z.boolean().optional(),
  indiaAvailability: z.union([z.null(), z.enum(["widely_available", "available", "limited", "import_only"])]).optional(),
  indiaNote: nullableText(2_000).optional(),
  imageUrl: nullableImageUrl.optional(),
  emoji: nullableText(16).optional(),
  accentColor: accentColor.optional(),
  brandName: nullableText(160).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().min(-10_000).max(10_000).optional(),
  aka: textArray.optional(),
  benefits: textArray.optional(),
  stacksWith: textArray.optional(),
  avoidWith: textArray.optional(),
  sideEffects: textArray.optional(),
  keyStudyFindings: textArray.optional(),
  recommendedFor: z.array(z.enum(SUPPLEMENT_GOALS)).max(SUPPLEMENT_GOALS.length).optional(),
  categorySlug: slugSchema.optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "No fields to update.");

const nullablePrice = z.union([z.null(), z.coerce.number().int().min(1).max(10_000_000)]);
const affiliateUrl = z.string().trim().url().max(4096).refine(
  (value) => new URL(value).protocol === "https:",
  "Affiliate URL must use HTTPS.",
);

export const supplementLinkCreateSchema = z.object({
  network: z.enum(AFFILIATE_NETWORKS),
  affiliateUrl,
  merchantLabel: nullableText(160).optional().default(null),
  priceRs: nullablePrice.optional().default(null),
  mrpRs: nullablePrice.optional().default(null),
  notes: nullableText(500).optional().default(null),
  sortOrder: z.coerce.number().int().min(-10_000).max(10_000).optional().default(0),
}).strict();

export const supplementLinkPatchSchema = z.object({
  network: z.enum(AFFILIATE_NETWORKS).optional(),
  affiliateUrl: affiliateUrl.optional(),
  merchantLabel: nullableText(160).optional(),
  priceRs: nullablePrice.optional(),
  mrpRs: nullablePrice.optional(),
  notes: nullableText(500).optional(),
  sortOrder: z.coerce.number().int().min(-10_000).max(10_000).optional(),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "No fields to update.");

export const supplementClicksQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
}).strict();

export function linkCommercialError(input: {
  network: typeof AFFILIATE_NETWORKS[number];
  merchantLabel: string | null;
  priceRs: number | null;
  mrpRs: number | null;
}): string | null {
  if (input.network === "OTHER" && !input.merchantLabel) return "Add a merchant label for Other links.";
  if (input.mrpRs !== null && input.priceRs !== null && input.mrpRs < input.priceRs) {
    return "MRP cannot be lower than the selling price.";
  }
  return null;
}

export function supplementPublishingError(input: {
  categoryActive: boolean;
  tagline: string | null;
  description: string | null;
  mechanism: string | null;
  benefits: string[];
  dosage: string | null;
  warnings: string | null;
  evidenceLevel: string | null;
  studyCount: string | null;
  keyStudyFindings: string[];
  priceRange: string | null;
  indiaAvailability: string | null;
  indiaNote: string | null;
  recommendedFor: readonly string[];
}): string | null {
  if (!input.categoryActive) return "Choose an active supplement category before publishing.";
  if (!input.tagline || !input.description || !input.mechanism) {
    return "Add the tagline, description and mechanism before publishing.";
  }
  if (!input.dosage || !input.warnings) return "Add dosage and safety guidance before publishing.";
  if (!input.evidenceLevel || !input.studyCount || input.keyStudyFindings.length === 0) {
    return "Add an evidence level, study context and at least one evidence finding before publishing.";
  }
  if (input.benefits.length === 0 || input.recommendedFor.length === 0) {
    return "Add at least one benefit and one recommended goal before publishing.";
  }
  if (!input.priceRange || !input.indiaAvailability || !input.indiaNote) {
    return "Add India price and availability context before publishing.";
  }
  return null;
}
