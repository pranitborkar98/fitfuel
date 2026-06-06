// lib/coupons.ts  (CORRECTED — rupees). Validates a coupon, returns a pre-tax discount.
// Pure logic — pass Prisma Coupon rows + redemption counts; no DB calls here.
// See FITFUEL-PRICING-PROMOTIONS-STRATEGY.md §C.

export type DiscountType = "PERCENT" | "FLAT" | "FREE_DELIVERY";

export interface CouponLike {
  code: string;
  discountType: DiscountType;
  value: number;             // PERCENT: whole % | FLAT: rupees
  maxDiscountRs: number | null;
  minOrderRs: number | null;
  appliesTo: string;         // ALL | DIGITAL | PHYSICAL | plan slug
  firstOrderOnly: boolean;
  usageLimitGlobal: number | null;
  usageLimitPerUser: number | null;
  validFrom: Date | null;
  validUntil: Date | null;
  isActive: boolean;
}

export interface CouponContext {
  saleSubtotalRs: number;
  category: "DIGITAL" | "PHYSICAL" | string;
  planSlug?: string;
  isFirstOrder: boolean;
  userRedemptionCount: number;
  globalRedemptionCount: number;
  deliveryFeeRs?: number;    // FREE_DELIVERY (physical only)
  now?: Date;
}

export interface CouponResult { ok: boolean; discountRs: number; reason?: string; }

export function applyCoupon(coupon: CouponLike, ctx: CouponContext): CouponResult {
  const now = ctx.now ?? new Date();
  const fail = (reason: string): CouponResult => ({ ok: false, discountRs: 0, reason });

  if (!coupon.isActive) return fail("Coupon is not active.");
  if (coupon.validFrom && now < coupon.validFrom) return fail("Coupon is not yet valid.");
  if (coupon.validUntil && now > coupon.validUntil) return fail("Coupon has expired.");

  const scope = coupon.appliesTo;
  const scopeOk = scope === "ALL" || scope === ctx.category ||
    (ctx.planSlug !== undefined && scope === ctx.planSlug);
  if (!scopeOk) return fail("Coupon doesn't apply to this item.");

  if (coupon.minOrderRs && ctx.saleSubtotalRs < coupon.minOrderRs) return fail("Order below coupon minimum.");
  if (coupon.firstOrderOnly && !ctx.isFirstOrder) return fail("Coupon is for first order only.");
  if (coupon.usageLimitPerUser != null && ctx.userRedemptionCount >= coupon.usageLimitPerUser) return fail("You've already used this coupon.");
  if (coupon.usageLimitGlobal != null && ctx.globalRedemptionCount >= coupon.usageLimitGlobal) return fail("Coupon usage limit reached.");

  let discount = 0;
  switch (coupon.discountType) {
    case "PERCENT":
      discount = Math.round((ctx.saleSubtotalRs * coupon.value) / 100);
      if (coupon.maxDiscountRs != null) discount = Math.min(discount, coupon.maxDiscountRs);
      break;
    case "FLAT": discount = coupon.value; break;
    case "FREE_DELIVERY": discount = ctx.deliveryFeeRs ?? 0; break;
  }

  discount = Math.min(Math.max(discount, 0), ctx.saleSubtotalRs);
  if (discount === 0) return fail("Coupon yields no discount on this order.");
  return { ok: true, discountRs: discount };
}
