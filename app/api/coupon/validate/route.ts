/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/coupon/validate/route.ts  (Phase 13D · WS-3 hardened SEC-1/2)
// Returns discount + new total for the digital checkout UI. No auth wall (guest checkout).
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyCoupon, type CouponLike } from "@/lib/coupons";
import { computePrice, formatRs } from "@/lib/pricing";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { couponValidateSchema } from "@/lib/validation/schemas";

export const runtime = "nodejs";

const DUR_MAP: Record<string, string> = {
  trial: "TRIAL_DAY", weekly: "WEEKLY", biweekly: "BI_WEEKLY",
  monthly_ex: "MONTHLY_EXCL_WEEKENDS", monthly: "ONE_MONTH",
  two_month: "TWO_MONTH", three_month: "THREE_MONTH",
};

export async function POST(req: NextRequest) {
  // SEC-1: coupon enumeration guard.
  const rl = await enforceRateLimit(req, "couponValidate");
  if (!rl.ok) return rl.response;

  // SEC-2: validated body (dur restricted to known keys, etc.).
  const parsed = await readJson(req, couponValidateSchema);
  if (!parsed.ok) return parsed.response;
  const { code, planSlug, dur, email, buyerStateCode } = parsed.data;

  const durEnum = DUR_MAP[dur];
  if (!durEnum) return Response.json({ ok: false, reason: "Invalid duration." }, { status: 400 });

  const plan = await (prisma as any).mealPlan.findUnique({ where: { slug: planSlug } });
  if (!plan) return Response.json({ ok: false, reason: "Plan not found." }, { status: 404 });

  const price = await (prisma as any).planPrice.findFirst({
    where: { mealPlanId: plan.id, duration: durEnum, mealsPerDay: "ALL_FOUR", isDigital: true, isActive: true },
  });
  if (!price) return Response.json({ ok: false, reason: "Price unavailable." }, { status: 404 });

  const coupon = await (prisma as any).coupon.findUnique({ where: { code } });
  if (!coupon) return Response.json({ ok: false, reason: "Invalid coupon code." });

  // Guest: resolve prior usage by email if that customer exists.
  const user = email ? await (prisma as any).user.findFirst({ where: { email } }) : null;
  const [userCount, globalCount, paidOrders] = await Promise.all([
    user ? (prisma as any).couponRedemption.count({ where: { couponId: coupon.id, userId: user.id } }) : 0,
    (prisma as any).couponRedemption.count({ where: { couponId: coupon.id } }),
    user ? (prisma as any).order.count({ where: { userId: user.id, paymentStatus: "SUCCESS" } }) : 0,
  ]);

  const res = applyCoupon(coupon as unknown as CouponLike, {
    saleSubtotalRs: price.priceRs, category: "DIGITAL", planSlug,
    isFirstOrder: paidOrders === 0, userRedemptionCount: userCount, globalRedemptionCount: globalCount,
  });
  if (!res.ok) return Response.json({ ok: false, reason: res.reason });

  const p = computePrice({
    items: [{ mrpRs: price.mrpRs ?? price.priceRs, saleRs: price.priceRs, qty: 1 }],
    discountRs: res.discountRs,
    gstPercent: price.gstPercent,
    priceIsTaxInclusive: price.priceIsTaxInclusive,
    buyerStateCode: buyerStateCode || "MH",
    sellerStateCode: "MH",
  });

  return Response.json({
    ok: true, discountRs: res.discountRs, totalRs: p.totalRs,
    display: { discount: formatRs(res.discountRs), total: formatRs(p.totalRs) },
  });
}
