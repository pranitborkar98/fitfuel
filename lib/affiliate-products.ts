import "server-only";

import {
  NUTRABAY_CATALOG,
  NUTRABAY_EVIDENCE_BY_PRODUCT_ID,
  findNutrabaySnapshotProduct,
} from "@/lib/nutrabay-catalog";
import { prisma } from "@/lib/prisma";
import { readWithDeadline } from "@/lib/read-with-deadline";

export type MarketplaceProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceRs: number;
  imageUrl: string;
  dataQuality: string;
  checkoutUrl: string;
  evidence: {
    slug: string;
    name: string;
    evidenceLevel: string | null;
  } | null;
};

type EvidenceMatch = NonNullable<MarketplaceProduct["evidence"]>;

type MarketplaceCatalog = {
  products: MarketplaceProduct[];
  guidanceAvailable: boolean;
};

function unavailableCatalog(): MarketplaceCatalog {
  return { products: fallbackProducts(new Map()), guidanceAvailable: false };
}

function fallbackProducts(evidenceBySlug: Map<string, EvidenceMatch>): MarketplaceProduct[] {
  return NUTRABAY_CATALOG.map((product) => {
    const evidenceSlug = NUTRABAY_EVIDENCE_BY_PRODUCT_ID.get(product.retailerProductId);
    const evidence = evidenceSlug ? evidenceBySlug.get(evidenceSlug) ?? null : null;

    return {
      id: `nby-${product.retailerProductId}`,
      slug: product.slug,
      name: product.name,
      category: product.category,
      priceRs: product.priceRs,
      imageUrl: product.imageUrl,
      dataQuality: product.dataQuality,
      checkoutUrl: `/api/products/click/nby-${product.retailerProductId}`,
      evidence,
    };
  });
}

async function readMarketplaceProducts(): Promise<MarketplaceCatalog> {
  try {
    const products = await prisma.affiliateProduct.findMany({
      where: { retailer: "NUTRABAY", isActive: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      select: {
        id: true,
        retailerProductId: true,
        slug: true,
        name: true,
        category: true,
        priceRs: true,
        imageUrl: true,
        dataQuality: true,
        evidenceSupplement: {
          select: {
            slug: true,
            name: true,
            evidenceLevel: true,
            isActive: true,
          },
        },
      },
    });

    if (products.length > 0) {
      return { guidanceAvailable: true, products: products.map((product) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        priceRs: product.priceRs,
        imageUrl: product.imageUrl,
        dataQuality: product.dataQuality,
        checkoutUrl: `/api/products/click/${findNutrabaySnapshotProduct(`nby-${product.retailerProductId}`) ? `nby-${product.retailerProductId}` : product.id}`,
        evidence: product.evidenceSupplement?.isActive ? product.evidenceSupplement : null,
      })) };
    }

    // An intentionally disabled catalogue must stay disabled. The snapshot is
    // for a fresh database that has not received the retailer import yet.
    const existingCount = await prisma.affiliateProduct.count({ where: { retailer: "NUTRABAY" } });
    if (existingCount > 0) return { products: [], guidanceAvailable: true };

    const evidenceSlugs = [...new Set(NUTRABAY_EVIDENCE_BY_PRODUCT_ID.values())];
    const evidenceRows = await prisma.supplement.findMany({
      where: { slug: { in: evidenceSlugs }, isActive: true },
      select: {
        slug: true,
        name: true,
        evidenceLevel: true,
      },
    });
    const evidenceBySlug = new Map(
      evidenceRows.map((row) => [row.slug, row] as const),
    );

    return { products: fallbackProducts(evidenceBySlug), guidanceAvailable: true };
  } catch {
    return unavailableCatalog();
  }
}

export async function getMarketplaceProducts(): Promise<MarketplaceCatalog> {
  try {
    return await readWithDeadline(readMarketplaceProducts(), 4_000);
  } catch {
    return unavailableCatalog();
  }
}
