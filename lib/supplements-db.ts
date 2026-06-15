// lib/supplements-db.ts
// Phase 18-1 — SERVER-ONLY supplements fetcher.
//
// This file uses Prisma (pg driver) — never import it from "use client" files.
// For client code, import types + NETWORK_LABEL from `lib/supplements-types.ts` instead.

import "server-only";

import { prisma } from "@/lib/prisma";
import type {
  SupplementGoal,
  SupplementCategory,
} from "@/lib/supplements-data";
import type { DbSupplement, SupplementBuyLink } from "@/lib/supplements-types";

// Re-export client-safe pieces for ergonomic server-side use.
export { NETWORK_LABEL } from "@/lib/supplements-types";
export type { SupplementBuyLink, DbSupplement } from "@/lib/supplements-types";

const db = prisma as any;

function goalsBackToLower(arr: string[] | null | undefined): SupplementGoal[] {
  return (arr || []).map((g) => g.toLowerCase() as SupplementGoal);
}

/**
 * Load all active supplements with their links. Sorted by category sortOrder,
 * then supplement sortOrder.
 */
export async function getAllSupplements(): Promise<DbSupplement[]> {
  const rows = await db.supplement.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      category: { select: { slug: true, sortOrder: true } },
      links: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { priceRs: "asc" }],
        select: {
          id: true,
          network: true,
          merchantLabel: true,
          priceRs: true,
          mrpRs: true,
          notes: true,
        },
      },
    },
  });

  // Sort by category.sortOrder, then by supplement.sortOrder. Prisma can't
  // do nested orderBy across relations so we re-sort here.
  rows.sort((a: any, b: any) => {
    const ac = a.category?.sortOrder ?? 99;
    const bc = b.category?.sortOrder ?? 99;
    if (ac !== bc) return ac - bc;
    return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
  });

  return rows.map((r: any) => {
    const links: SupplementBuyLink[] = (r.links || []).map((l: any) => ({
      id: l.id,
      network: l.network,
      merchantLabel: l.merchantLabel,
      priceRs: l.priceRs,
      mrpRs: l.mrpRs,
      notes: l.notes,
      clickUrl: `/api/supplements/click/${l.id}`,
    }));

    return {
      id: r.slug,
      name: r.name,
      aka: r.aka || [],
      category: (r.category?.slug || "protein") as SupplementCategory,
      tagline: r.tagline || "",
      description: r.description || "",
      mechanism: r.mechanism || "",
      benefits: r.benefits || [],
      dosage: r.dosage || "",
      timing: r.timing || "",
      onsetTime: r.onsetTime || "",
      halfLife: r.halfLife || "",
      form: r.form || "",
      cyclingRequired: !!r.cyclingRequired,
      cyclingProtocol: r.cyclingProtocol || undefined,
      stacksWith: r.stacksWith || [],
      avoidWith: r.avoidWith || [],
      warnings: r.warnings || "",
      sideEffects: r.sideEffects || [],
      genderNotes: r.genderNotes || undefined,
      ageNotes: r.ageNotes || undefined,
      evidenceLevel: (r.evidenceLevel || "moderate") as any,
      studyCount: r.studyCount || "",
      keyStudyFindings: r.keyStudyFindings || [],
      goals: goalsBackToLower(r.recommendedFor),
      accent: r.accentColor || "#a3e635",
      priceRange: r.priceRange || "",
      valueRating: (r.valueRating || "good") as any,
      popular: !!r.popular,
      veganFriendly: !!r.veganFriendly,
      certificationNote: r.certificationNote || "",
      emoji: r.emoji || "\uD83D\uDC8A",
      indiaNote: r.indiaNote || undefined,
      indiaAvailability: (r.indiaAvailability || "available") as any,
      // Phase 18-1 / 18-3 additions:
      links,
      imageUrl: r.imageUrl || null,
      brandName: r.brandName || null,
      isFeatured: !!r.isFeatured,
    } as DbSupplement & { imageUrl: string | null; brandName: string | null; isFeatured: boolean };
  });
}