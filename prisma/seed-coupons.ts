// prisma/seed-coupons.ts
// R-PRICE-c (Decision #192) — seed real, issuable coupons so the live coupon
// engine (Phase 13D · lib/coupons.ts + /api/coupon/validate) has data. Fixes the
// "no coupon available" gap. Idempotent (upsert by code). Edit/extend freely.
//
// Run: npx tsx --env-file=.env.local prisma/seed-coupons.ts
//
// DiscountType: PERCENT (value = whole %, cap with maxDiscountRs) | FLAT (value = ₹)
//               | FREE_DELIVERY. appliesTo: ALL | DIGITAL | PHYSICAL | <plan slug>.

import { prisma } from "../lib/prisma";

const now = new Date();
const inDays = (n: number) => new Date(now.getTime() + n * 86400000);

interface SeedCoupon {
  code: string;
  discountType: "PERCENT" | "FLAT" | "FREE_DELIVERY";
  value: number;
  maxDiscountRs?: number | null;
  minOrderRs?: number | null;
  appliesTo?: string;
  firstOrderOnly?: boolean;
  usageLimitGlobal?: number | null;
  usageLimitPerUser?: number | null;
  validUntil?: Date | null;
  stackable?: boolean;
}

const COUPONS: SeedCoupon[] = [
  {
    code: "LAUNCH20",
    discountType: "PERCENT",
    value: 20,
    maxDiscountRs: 3000, // cap so a 3-month plan doesn't give away too much
    minOrderRs: 2000,
    appliesTo: "ALL",
    usageLimitPerUser: 1,
    validUntil: inDays(60),
  },
  {
    code: "WELCOME15",
    discountType: "PERCENT",
    value: 15,
    maxDiscountRs: 2000,
    appliesTo: "ALL",
    firstOrderOnly: true,
    usageLimitPerUser: 1,
    validUntil: inDays(90),
  },
  {
    code: "FLAT500",
    discountType: "FLAT",
    value: 500,
    minOrderRs: 5000,
    appliesTo: "PHYSICAL",
    usageLimitPerUser: 1,
    validUntil: inDays(45),
  },
  {
    code: "FREEDEL",
    discountType: "FREE_DELIVERY",
    value: 0,
    appliesTo: "PHYSICAL",
    usageLimitPerUser: 2,
    validUntil: inDays(30),
  },
];

async function main() {
  const db = prisma as any;
  let created = 0;
  let updated = 0;
  for (const c of COUPONS) {
    const existing = await db.coupon.findUnique({ where: { code: c.code } });
    const data = {
      discountType: c.discountType,
      value: c.value,
      maxDiscountRs: c.maxDiscountRs ?? null,
      minOrderRs: c.minOrderRs ?? null,
      appliesTo: c.appliesTo ?? "ALL",
      firstOrderOnly: c.firstOrderOnly ?? false,
      usageLimitGlobal: c.usageLimitGlobal ?? null,
      usageLimitPerUser: c.usageLimitPerUser ?? 1,
      validFrom: now,
      validUntil: c.validUntil ?? null,
      stackable: c.stackable ?? false,
      source: "MANUAL" as const,
      isActive: true,
    };
    await db.coupon.upsert({
      where: { code: c.code },
      create: { code: c.code, ...data },
      update: data,
    });
    if (existing) updated++;
    else created++;
    console.log(`  ${existing ? "updated" : "created"}  ${c.code}  (${c.discountType} ${c.value}${c.discountType === "PERCENT" ? "%" : ""})`);
  }
  console.log(`\nCoupons seeded: ${created} created, ${updated} updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await (prisma as any).$disconnect();
  });
