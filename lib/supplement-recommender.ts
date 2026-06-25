// lib/supplement-recommender.ts — F13 (LOOP-7). Deterministic, goal-based supplement
// recommendations. Maps the buyer's FitnessGoal → SupplementGoal and returns a ranked,
// diet-aware shortlist from the live catalogue. No external calls; safe to render server-side.
import { prisma } from "@/lib/prisma";

const GOAL_MAP: Record<string, { goal: string; label: string }> = {
  LOSE_WEIGHT:      { goal: "WEIGHT_LOSS", label: "fat loss" },
  GAIN_MUSCLE:      { goal: "MUSCLE_GAIN", label: "muscle gain" },
  MAINTAIN:         { goal: "BALANCED",    label: "staying balanced" },
  IMPROVE_FITNESS:  { goal: "PERFORMANCE", label: "performance" },
  MANAGE_CONDITION: { goal: "BALANCED",    label: "your health" },
};

export type RecommendedSupplement = {
  slug: string;
  name: string;
  emoji: string | null;
  tagline: string | null;
  accentColor: string | null;
  buyUrl: string | null;
};

export type SupplementRecommendation = {
  goalLabel: string;
  items: RecommendedSupplement[];
};

export async function getRecommendedSupplements(
  userId: string,
  take = 4,
): Promise<SupplementRecommendation | null> {
  const profile = await (prisma as any).userProfile.findUnique({
    where: { userId },
    select: { fitnessGoal: true, dietPreference: true },
  });

  const goalKey: string | undefined = profile?.fitnessGoal ?? undefined;
  if (!goalKey || !GOAL_MAP[goalKey]) return null;

  const { goal, label } = GOAL_MAP[goalKey];
  const vegan = profile?.dietPreference === "VEGAN";

  const rows = await (prisma as any).supplement.findMany({
    where: {
      isActive: true,
      recommendedFor: { has: goal },
      // Never recommend non-vegan products (whey, fish oil) to a vegan buyer.
      ...(vegan ? { veganFriendly: true } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { popular: "desc" }, { sortOrder: "asc" }],
    take,
    select: {
      slug: true,
      name: true,
      emoji: true,
      tagline: true,
      accentColor: true,
      links: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { affiliateUrl: true },
      },
    },
  });

  if (!rows.length) return null;

  const items: RecommendedSupplement[] = rows.map((r: any) => ({
    slug: r.slug,
    name: r.name,
    emoji: r.emoji ?? null,
    tagline: r.tagline ?? null,
    accentColor: r.accentColor ?? null,
    buyUrl: r.links?.[0]?.affiliateUrl ?? null,
  }));

  return { goalLabel: label, items };
}
