/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/orders/cod/route.ts  · WS-3 hardened (SEC-1/2)
// 16A: order_confirmed + staff_new_order notifications
// 17A: capture ?ref cookie -> Order.referralAttribution + processReferralReward
// 17C-2: apply credit balance if signed in & opted in; commit spend after order CONFIRMED.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { fireNotification, notifyStaffByRoles } from "@/lib/notify";
import { processReferralReward, applyCreditAtCheckout, recordCreditChange } from "@/lib/partners";
import { resolvePurchasedPlan } from "@/lib/resolve-purchased-plan";
import { applyCoupon } from "@/lib/coupons";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { codOrderSchema } from "@/lib/validation/schemas";

const DIET_MAP: Record<string, string> = {
  veg: "VEGETARIAN", egg: "EGGETARIAN", nonveg: "NON_VEGETARIAN", jain: "VEGETARIAN",
};
const DUR_MAP: Record<string, string> = {
  trial: "TRIAL_DAY", weekly: "WEEKLY", biweekly: "BI_WEEKLY",
  monthly_ex: "MONTHLY_EXCL_WEEKENDS", monthly: "ONE_MONTH",
  two_month: "TWO_MONTH", three_month: "THREE_MONTH",
};
const MEAL_MAP: Record<string, string> = {
  bl: "BREAKFAST_LUNCH", sd: "SNACK_DINNER", all: "ALL_FOUR",
};
const DUR_DAYS: Record<string, number> = {
  TRIAL_DAY: 1, WEEKLY: 7, BI_WEEKLY: 14,
  MONTHLY_EXCL_WEEKENDS: 30, ONE_MONTH: 30,
  TWO_MONTH: 60, THREE_MONTH: 90,
};

function genOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  return `FF-COD-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function upsertCustomer(email: string, phone: string, name: string) {
  let user = await (prisma as any).user.findFirst({ where: { email } });
  if (!user && phone) user = await (prisma as any).user.findFirst({ where: { phone } });
  const phoneOwner = phone ? await (prisma as any).user.findFirst({ where: { phone } }) : null;
  if (user) {
    const data: any = { name };
    if (phone && (!phoneOwner || phoneOwner.id === user.id)) data.phone = phone;
    return (prisma as any).user.update({ where: { id: user.id }, data });
  }
  const data: any = { email, name };
  if (phone && !phoneOwner) data.phone = phone;
  return (prisma as any).user.create({ data });
}

export async function POST(req: NextRequest) {
  try {
    // SEC-1: COD-flooding guard, by IP.
    const rl = await enforceRateLimit(req, "checkout");
    if (!rl.ok) return rl.response;

    // SEC-2: size-capped, schema-validated body. Replaces raw req.json() +
    // hand-rolled presence checks. diet/dur/meal are restricted to known keys.
    const parsed = await readJson(req, codOrderSchema);
    if (!parsed.ok) return parsed.response;
    const {
      firstname, lastname, email, phone, address, city, pincode,
      diet, dur, meal, price, deliveryWindow, useCredit, planSlug,
    } = parsed.data;

    const dietEnum = DIET_MAP[diet];
    const durEnum  = DUR_MAP[dur];
    const mealEnum = MEAL_MAP[meal];
    if (!dietEnum || !durEnum || !mealEnum) {
      return NextResponse.json({ error: "Invalid plan parameters" }, { status: 400 });
    }

    const subtotal = Math.round(Number(price));

    const user = await upsertCustomer(email, phone, `${firstname}${lastname ? " " + lastname : ""}`);

    // ── R-PRICE: server-side coupon re-validation (discount applied BEFORE GST) ──
    let couponDiscountRs = 0;
    let appliedCouponCode: string | null = null;
    let appliedCouponId: string | null = null;
    const couponCode = parsed.data.couponCode?.trim().toUpperCase();
    if (couponCode) {
      const coupon = await (prisma as any).coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        const [uCount, gCount, paid] = await Promise.all([
          (prisma as any).couponRedemption.count({ where: { couponId: coupon.id, userId: user.id } }),
          (prisma as any).couponRedemption.count({ where: { couponId: coupon.id } }),
          (prisma as any).order.count({ where: { userId: user.id, paymentStatus: "SUCCESS" } }),
        ]);
        const cres = applyCoupon(coupon, {
          saleSubtotalRs: subtotal, category: "PHYSICAL", planSlug,
          isFirstOrder: paid === 0, userRedemptionCount: uCount, globalRedemptionCount: gCount, deliveryFeeRs: 0,
        });
        if (cres.ok) {
          couponDiscountRs = Math.min(cres.discountRs, Math.max(0, subtotal - 1));
          appliedCouponCode = coupon.code;
          appliedCouponId = coupon.id;
        }
      }
    }
    const discountedSubtotal = subtotal - couponDiscountRs;
    const gst      = Math.round(discountedSubtotal * 0.05);
    const baseTotal = discountedSubtotal + gst;

    // ── 17C-2: apply credit if signed in AND opted in AND owns this account ──
    let creditAppliedRs = 0;
    let total = baseTotal;
    if (useCredit) {
      const session = await auth();
      if (session?.user?.id && session.user.id === user.id) {
        const applied = await applyCreditAtCheckout(user.id, baseTotal);
        // Cap to ensure non-zero total (PayU rule; we keep it consistent for COD too).
        creditAppliedRs = Math.min(applied.creditAppliedRs, Math.max(0, baseTotal - 1));
        total = baseTotal - creditAppliedRs;
      }
    }

    // ── Phase 17A: capture ref from cookie OR body, snapshot on Order ──
    const refFromBody: string | undefined = parsed.data.refCode;
    const refFromCookie = req.cookies.get("ff_ref")?.value;
    const refSnapshot = (refFromBody || refFromCookie || "").slice(0, 64) || null;

    if (refSnapshot) {
      const existingAttribution = await (prisma as any).user.findUnique({
        where: { id: user.id },
        select: { referredByPartnerCode: true },
      });
      if (!existingAttribution?.referredByPartnerCode) {
        await (prisma as any).user.update({
          where: { id: user.id },
          data: { referredByPartnerCode: refSnapshot },
        });
      }
    }

    const addr = await (prisma as any).address.create({
      data: { userId: user.id, line1: address, area: city, city, pincode },
    });

    const orderNumber = genOrderNumber();
    const order = await (prisma as any).order.create({
      data: {
        userId: user.id, addressId: addr.id, orderNumber,
        status: "CONFIRMED", subtotalRs: subtotal, gstRs: gst, totalRs: total,
        creditAppliedRs, discountRs: couponDiscountRs, couponCode: appliedCouponCode,
        paymentMethod: "CASH_ON_DELIVERY", paymentStatus: "PENDING",
        referralAttribution: refSnapshot,
        notes: JSON.stringify({ diet, dur, meal, planSlug: planSlug || null, deliveryWindow: deliveryWindow === "EVENING" ? "EVENING" : "MORNING", isJain: diet === "jain" }),
      },
    });

    await (prisma as any).orderItem.create({
      data: {
        orderId: order.id, productId: null,
        diet: dietEnum, duration: durEnum, mealsPerDay: mealEnum,
        priceRs: subtotal, gstRs: gst, totalRs: total, quantity: 1,
      },
    });

    await (prisma as any).payment.create({
      data: { orderId: order.id, method: "CASH_ON_DELIVERY", status: "PENDING", amountRs: total },
    });

    // ── R-PRICE: record coupon redemption (enforces usage limits next time) ──
    if (appliedCouponId && couponDiscountRs > 0) {
      try {
        await (prisma as any).couponRedemption.create({
          data: { couponId: appliedCouponId, userId: user.id, orderId: order.id, amountRs: couponDiscountRs },
        });
      } catch (e) { console.error("[COD] coupon redemption record failed", e); }
    }

    const startDate = new Date();
    const days = DUR_DAYS[durEnum] ?? 30;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    // LOOP-3: activate the plan the customer ACTUALLY bought (was hardcoded weight-loss-veg).
    const mealPlan = await resolvePurchasedPlan({ planSlug, diet });

    if (mealPlan) {
      await (prisma as any).userActivePlan.create({
        data: {
          userId: user.id,
          mealPlanId: mealPlan.id,
          orderId: order.id,
          startDate, endDate, currentDay: 1, status: "active",
          mealsPerDay: mealEnum as any,
          duration: durEnum as any,
          deliveryWindow: (deliveryWindow === "EVENING" ? "EVENING" : "MORNING") as any,
          skipDates: [],
        },
      });
    } else {
      console.error("[COD] No meal plan to attach", { orderNumber });
    }

    // ── 17C-2: commit the credit spend now (order is already CONFIRMED) ──
    if (creditAppliedRs > 0) {
      try {
        await recordCreditChange(user.id, -creditAppliedRs, "order_payment", { refOrderId: order.id });
      } catch (e) {
        console.error("[COD] credit commit failed", e);
      }
    }

    console.log("[COD Order saved]", { orderNumber, userId: user.id, total, creditAppliedRs });

    // ════════════════════ NOTIFICATIONS (16A) ════════════════════
    try {
      const planName = (mealPlan as any)?.displayName || (mealPlan as any)?.slug || "Meal Plan";
      fireNotification({
        userId: user.id,
        toEmail: user.email,
        toPhone: user.phone || undefined,
        toName: user.name,
        templateKey: "order_confirmed",
        vars: { orderNumber: order.orderNumber, planName, amount: String(total) },
      });
      notifyStaffByRoles(["OWNER", "ADMIN"], "staff_new_order", {
        orderNumber: order.orderNumber,
        customerName: user.name,
        planName,
        amount: String(total),
      });
    } catch (e) {
      console.error("[COD] notification dispatch failed", e);
    }

    // ════════════════════ REFERRAL REWARD (17A) ════════════════════
    try {
      await processReferralReward(order.id);
    } catch (e) {
      console.error("[COD] referral reward processing failed", e);
    }

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, orderId: order.id, total, creditAppliedRs });

  } catch (err) {
    console.error("[COD order error]", err);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}
