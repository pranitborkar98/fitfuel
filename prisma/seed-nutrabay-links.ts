/**
 * Adds the curated Nutrabay products to the evidence catalogue.
 *
 * Safe to rerun. Existing links are matched by affiliate URL and refreshed.
 * Products without an evidence entry are skipped rather than forced into an
 * unrelated category.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

import { NUTRABAY_PRODUCTS } from "../lib/nutrabay-products";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of NUTRABAY_PRODUCTS) {
    const supplement = await prisma.supplement.findUnique({
      where: { slug: product.supplementSlug },
      select: { id: true, imageUrl: true },
    });

    if (!supplement) {
      console.warn(`Skipping ${product.productName}: no ${product.supplementSlug} evidence entry.`);
      skipped++;
      continue;
    }

    if (product.imageUrl && supplement.imageUrl !== product.imageUrl) {
      await prisma.supplement.update({
        where: { id: supplement.id },
        data: { imageUrl: product.imageUrl },
      });
    }

    const existing = await prisma.supplementLink.findFirst({
      where: { affiliateUrl: product.affiliateUrl },
      select: { id: true },
    });
    const data = {
      supplementId: supplement.id,
      network: "NUTRABAY" as const,
      merchantLabel: product.productName,
      affiliateUrl: product.affiliateUrl,
      priceRs: product.priceRs,
      notes: "Current price is confirmed on the retailer before purchase.",
      // The product supplying an evidence entry's image must also be the first
      // checkout option, so the photographed jar and retailer label agree.
      sortOrder: product.imageUrl ? -100 : 0,
      isActive: true,
    };

    if (existing) {
      await prisma.supplementLink.update({ where: { id: existing.id }, data });
      updated++;
    } else {
      await prisma.supplementLink.create({ data });
      created++;
    }
  }

  console.log(`Nutrabay links: ${created} created, ${updated} updated, ${skipped} skipped.`);
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
