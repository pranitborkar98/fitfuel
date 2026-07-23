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
    // The static copy in supplements-data.ts was de-dashed per DESIGN.md, but
    // the same fields also live in the DB, where the old text still carries
    // em dashes. Rows are edited through the admin UI, so normalising on read
    // keeps the rule enforced no matter what gets typed in later.
    //
    // Same heuristic as the codebase sweep: a short trailing fragment is an
    // appositive (comma), a long one is an independent clause (full stop).
    const deDash = (v: unknown): string => {
      if (typeof v !== "string" || !v.includes("—")) return (v as string) ?? "";
      return v.replace(/\s*—\s*/g, (_m, off: number, whole: string) => {
        const after = whole.slice(off).replace(/^\s*—\s*/, "");
        const seg = after.split(/[.,;:!?]/)[0] ?? "";
        return seg.trim().split(/\s+/).filter(Boolean).length >= 5 ? ". " : ", ";
      });
    };
    const deDashList = (v: unknown): string[] =>
      Array.isArray(v) ? v.map((x) => deDash(x)) : [];

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
      tagline: deDash(r.tagline),
      description: deDash(r.description),
      mechanism: deDash(r.mechanism),
      benefits: deDashList(r.benefits),
      dosage: deDash(r.dosage),
      timing: deDash(r.timing),
      onsetTime: deDash(r.onsetTime),
      halfLife: deDash(r.halfLife),
      form: r.form || "",
      cyclingRequired: !!r.cyclingRequired,
      cyclingProtocol: r.cyclingProtocol ? deDash(r.cyclingProtocol) : undefined,
      stacksWith: r.stacksWith || [],
      avoidWith: r.avoidWith || [],
      warnings: deDash(r.warnings),
      sideEffects: deDashList(r.sideEffects),
      genderNotes: r.genderNotes ? deDash(r.genderNotes) : undefined,
      ageNotes: r.ageNotes ? deDash(r.ageNotes) : undefined,
      evidenceLevel: (r.evidenceLevel || "moderate") as any,
      studyCount: r.studyCount || "",
      keyStudyFindings: deDashList(r.keyStudyFindings),
      goals: goalsBackToLower(r.recommendedFor),
      // Was `r.accentColor || "#a3e635"`. The DB carries a per-supplement
      // accent, and the live rows hold amber, purple, sky and indigo, which
      // rendered a four-hue palette on the public /supplements page even
      // after the static fallbacks in supplements-data.ts were unified.
      // Lime is the only chromatic value on marketing surfaces (DESIGN.md),
      // so the column is ignored here rather than being migrated: it stays
      // available to the admin UI, which is not bound by the marketing rules.
      accent: "#a3e635",
      priceRange: r.priceRange || "",
      valueRating: (r.valueRating || "good") as any,
      popular: !!r.popular,
      veganFriendly: !!r.veganFriendly,
      certificationNote: deDash(r.certificationNote),
      emoji: r.emoji || "\uD83D\uDC8A",
      indiaNote: r.indiaNote ? deDash(r.indiaNote) : undefined,
      indiaAvailability: (r.indiaAvailability || "available") as any,
      // Phase 18-1 / 18-3 additions:
      links,
      imageUrl: r.imageUrl || null,
      brandName: r.brandName || null,
      isFeatured: !!r.isFeatured,
    } as DbSupplement & { imageUrl: string | null; brandName: string | null; isFeatured: boolean };
  });
}