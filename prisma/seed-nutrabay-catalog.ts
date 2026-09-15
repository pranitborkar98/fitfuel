/**
 * Imports the repaired 738-product Nutrabay catalogue.
 *
 * This catalogue is deliberately separate from SupplementLink. The full
 * retailer range is browsable, while only products with a matching FitFuel
 * evidence entry receive evidenceSupplementId.
 */
import { PrismaClient, type AffiliateNetwork } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { loadEnvConfig } from "@next/env";

import catalog from "../data/nutrabay-catalog.json";
import { NUTRABAY_PRODUCTS } from "../lib/nutrabay-products";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
const databaseUrl = new URL(process.env.DATABASE_URL!);
const sslMode = databaseUrl.searchParams.get("sslmode");
if (databaseUrl.searchParams.get("uselibpqcompat") !== "true" && sslMode && ["prefer", "require", "verify-ca"].includes(sslMode)) {
  databaseUrl.searchParams.set("sslmode", "verify-full");
}
const pool = new Pool({ connectionString: databaseUrl.toString(), connectionTimeoutMillis: 15_000, max: 5 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const BATCH_SIZE = 5;

function productIdFromUrl(value: string) {
  return new URL(value).searchParams.get("pId");
}

async function main() {
  const evidenceSlugByProductId = new Map(
    NUTRABAY_PRODUCTS.flatMap((product) => {
      const productId = productIdFromUrl(product.affiliateUrl);
      return productId ? [[productId, product.supplementSlug] as const] : [];
    }),
  );
  const evidenceSlugs = [...new Set(evidenceSlugByProductId.values())];
  const supplements = await prisma.supplement.findMany({
    where: { slug: { in: evidenceSlugs } },
    select: { id: true, slug: true },
  });
  const supplementIdBySlug = new Map(supplements.map((row) => [row.slug, row.id]));

  const existing = new Set(
    (
      await prisma.affiliateProduct.findMany({
        where: { retailer: "NUTRABAY" },
        select: { retailerProductId: true },
      })
    ).map((row) => row.retailerProductId),
  );

  for (let start = 0; start < catalog.length; start += BATCH_SIZE) {
    const batch = catalog.slice(start, start + BATCH_SIZE);
    // Rows are independent and the import is resumable. One long transaction
    // expired over the remote connection and left the catalogue empty.
    await Promise.all(
      batch.map((product) => {
        const evidenceSlug = evidenceSlugByProductId.get(product.retailerProductId);
        const evidenceSupplementId = evidenceSlug
          ? supplementIdBySlug.get(evidenceSlug) ?? null
          : null;
        const data = {
          retailer: product.retailer as AffiliateNetwork,
          variantId: product.variantId,
          slug: product.slug,
          name: product.name,
          category: product.category,
          priceRs: product.priceRs,
          imageUrl: product.imageUrl,
          sourceUrl: product.sourceUrl,
          affiliateUrl: product.affiliateUrl,
          dataQuality: product.dataQuality,
          evidenceSupplementId,
        };

        return prisma.affiliateProduct.upsert({
          where: {
            retailer_retailerProductId: {
              retailer: product.retailer as AffiliateNetwork,
              retailerProductId: product.retailerProductId,
            },
          },
          update: data,
          create: {
            ...data,
            retailerProductId: product.retailerProductId,
          },
        });
      }),
    );
  }

  const evidenceMatched = catalog.filter((product) =>
    supplementIdBySlug.has(evidenceSlugByProductId.get(product.retailerProductId) ?? ""),
  ).length;
  const updated = catalog.filter((product) => existing.has(product.retailerProductId)).length;
  const importedCount = await prisma.affiliateProduct.count({
    where: { retailer: "NUTRABAY", retailerProductId: { in: catalog.map((product) => product.retailerProductId) } },
  });
  if (importedCount !== catalog.length) throw new Error(`Import incomplete: ${importedCount}/${catalog.length} products present.`);
  console.log(
    `Nutrabay catalogue: ${catalog.length - updated} created, ${updated} updated, ${evidenceMatched} evidence matched.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
