// app/api/coupon/validate/route.ts  (Phase 13D · WS-3 hardened · R-PRICE physical)
// Returns the coupon discount for the checkout UI (digital AND physical). Guest-safe.
//
// Digital (default / no isDigital flag): looks up the digital PlanPrice, category DIGITAL.
// Physical (isDigital:false): applies the coupon against the provided physical subtotalRs
//   (the GST-exclusive anchor the checkout shows), category PHYSICAL. deliveryRs lets
//   FREE_DELIVERY coupons discount the delivery line. Order routes RE-APPLY server-side.

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyCoupon } from "@/lib/coupons";
import { computePrice, formatRs } from "@/lib/pricing";
import { decomposePrice, durationKeyFromShort } from "@/lib/pricing-decomposition";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { couponValidateSchema } from "@/lib/validation/schemas";
import type { MealsPerDay, PlanDuration } from "@prisma/client";

export const runtime = "nodejs";

const DUR_MAP: Record<string, PlanDuration> = {
  trial: "TRIAL_DAY", weekly: "WEEKLY", biweekly: "BI_WEEKLY",
  monthly_ex: "MONTHLY_EXCL_WEEKENDS", monthly: "ONE_MONTH",
  two_month: "TWO_MONTH", three_month: "THREE_MONTH",
};
const MEAL_MAP: Record<string, MealsPerDay> = {
  bl: "BREAKFAST_LUNCH",
  sd: "SNACK_DINNER",
  all: "ALL_FOUR",
};

export async function POST(req: NextRequest) {
  const rl = await enforceRateLimit(req, "couponValidate");
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, couponValidateSchema);
  if (!parsed.ok) return parsed.response;
  const { planSlug, dur, email, buyerStateCode, isDigital, bundle, meal } = parsed.data;
  const code = parsed.data.code.toUpperCase();

  const durEnum = DUR_MAP[dur];
  if (!durEnum) return Response.json({ ok: false, reason: "Invalid duration." }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return Response.json({ ok: false, reason: "Invalid coupon code." });

  const user = email
    ? await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() }, select: { id: true } })
    : null;
  const [userCount, globalCount, paidOrders] = await Promise.all([
    user ? prisma.couponRedemption.count({ where: { couponId: coupon.id, userId: user.id } }) : 0,
    prisma.couponRedemption.count({ where: { couponId: coupon.id } }),
    user ? prisma.order.count({ where: { userId: user.id, paymentStatus: "SUCCESS" } }) : 0,
  ]);

  // ─────────────── PHYSICAL ───────────────
  if (isDigital === false) {
    const mealsPerDay = meal ? MEAL_MAP[meal] : null;
    if (!mealsPerDay) return Response.json({ ok: false, reason: "Choose the meals again." }, { status: 400 });
    const plan = await prisma.mealPlan.findUnique({ where: { slug: planSlug }, select: { id: true } });
    if (!plan) return Response.json({ ok: false, reason: "Plan not found." }, { status: 404 });
    const price = await prisma.planPrice.findFirst({
      where: { mealPlanId: plan.id, duration: durEnum, mealsPerDay, isDigital: false, isActive: true },
      select: { priceRs: true },
    });
    if (!price) return Response.json({ ok: false, reason: "Price unavailable." }, { status: 404 });
    const subtotal = price.priceRs;
    const deliveryFeeRs = decomposePrice({ subtotalRs: subtotal, duration: durationKeyFromShort(dur) }).deliveryRs;

    const res = applyCoupon(coupon, {
      saleSubtotalRs: subtotal, category: "PHYSICAL", planSlug,
      isFirstOrder: paidOrders === 0, userRedemptionCount: userCount, globalRedemptionCount: globalCount,
      deliveryFeeRs,
    });
    if (!res.ok) return Response.json({ ok: false, reason: res.reason });

    const discountRs = Math.min(res.discountRs, Math.max(0, subtotal - 1));
    const discounted = subtotal - discountRs;
    const gst = Math.round(discounted * 0.05);
    const total = discounted + gst;
    return Response.json({
      ok: true, discountRs, totalRs: Math.max(1, total),
      display: { discount: formatRs(discountRs), total: formatRs(Math.max(1, total)) },
    });
  }

  // ─────────────── DIGITAL (default) ───────────────
  const plan = await prisma.mealPlan.findUnique({ where: { slug: planSlug } });
  if (!plan) return Response.json({ ok: false, reason: "Plan not found." }, { status: 404 });

  const price = await prisma.planPrice.findFirst({
    where: {
      mealPlanId: plan.id,
      duration: durEnum,
      mealsPerDay: "ALL_FOUR",
      isDigital: true,
      isActive: true,
      ...(bundle ? { bundle } : {}),
    },
  });
  if (!price) return Response.json({ ok: false, reason: "Price unavailable." }, { status: 404 });

  const res = applyCoupon(coupon, {
    saleSubtotalRs: price.priceRs, category: "DIGITAL", planSlug,
    isFirstOrder: paidOrders === 0, userRedemptionCount: userCount, globalRedemptionCount: globalCount,
  });
  if (!res.ok) return Response.json({ ok: false, reason: res.reason });

  const discountRs = Math.min(res.discountRs, Math.max(0, price.priceRs - 1));
  const p = computePrice({
    items: [{ mrpRs: price.mrpRs ?? price.priceRs, saleRs: price.priceRs, qty: 1 }],
    discountRs, gstPercent: price.gstPercent,
    priceIsTaxInclusive: price.priceIsTaxInclusive,
    buyerStateCode: buyerStateCode || "MH", sellerStateCode: "MH",
  });

  return Response.json({
    ok: true, discountRs, totalRs: Math.max(1, p.totalRs),
    display: { discount: formatRs(discountRs), total: formatRs(Math.max(1, p.totalRs)) },
  });
}
