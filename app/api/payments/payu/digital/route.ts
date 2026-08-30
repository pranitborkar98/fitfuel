import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { PlanDuration, Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { captureCheckoutReferral } from "@/lib/checkout-referral";
import { resolveCheckoutCustomer } from "@/lib/checkout-customer";
import { checkoutCreditReservation } from "@/lib/checkout-credit";
import { applyCoupon } from "@/lib/coupons";
import { getPayuConfig } from "@/lib/payu-config";
import { prisma } from "@/lib/prisma";
import { computePrice } from "@/lib/pricing";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { digitalPayuInitSchema, type DigitalPayuInitInput } from "@/lib/validation/schemas";
import { getWorkoutPlanData } from "@/lib/workout-plan";

const SELLER_STATE = "MH";
const DUR_MAP: Record<string, PlanDuration> = {
  trial: "TRIAL_DAY",
  weekly: "WEEKLY",
  biweekly: "BI_WEEKLY",
  monthly_ex: "MONTHLY_EXCL_WEEKENDS",
  monthly: "ONE_MONTH",
  two_month: "TWO_MONTH",
  three_month: "THREE_MONTH",
};

class CheckoutTotalChanged extends Error {
  constructor(public details: Record<string, unknown>) {
    super("Checkout total changed");
  }
}

function errorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;
}

function optionalNumber(value: unknown, min: number, max: number, integer = false): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  let number = Number(value);
  if (!Number.isFinite(number)) return undefined;
  if (integer) number = Math.round(number);
  return number >= min && number <= max ? number : undefined;
}

function buildProfile(body: DigitalPayuInitInput): Record<string, number> | undefined {
  const profile: Record<string, number> = {};
  const heightCm = optionalNumber(body.heightCm, 100, 250);
  const weightKg = optionalNumber(body.weightKg, 20, 300);
  const targetWeightKg = optionalNumber(body.targetWeightKg, 20, 300);
  const age = optionalNumber(body.age, 10, 100, true);
  if (heightCm !== undefined) profile.heightCm = heightCm;
  if (weightKg !== undefined) profile.weightKg = weightKg;
  if (targetWeightKg !== undefined) profile.targetWeightKg = targetWeightKg;
  if (age !== undefined) profile.age = age;
  return Object.keys(profile).length ? profile : undefined;
}

function orderNumber(): string {
  const now = new Date();
  const day = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `FF-DGTL-${day}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

async function reserveCreditAndCreateOrder(input: {
  userId: string;
  canUseCredit: boolean;
  expectedTotalRs?: number;
  baseTotalRs: number;
  referralDiscountRs: number;
  referralCode: string | null;
  couponCode: string | null;
  profile?: Record<string, number>;
  planSlug: string;
  duration: PlanDuration;
  bundle: "STARTER" | "PRO";
  txnid: string;
  price: {
    subtotalRs: number;
    gstRs: number;
    mrpSubtotalRs: number;
    discountRs: number;
    cgstRs: number;
    sgstRs: number;
    igstRs: number;
  };
  buyerStateCode: string;
}): Promise<{ creditAppliedRs: number; chargeAmountRs: number }> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const creditAppliedRs = await checkoutCreditReservation(tx, {
          userId: input.userId,
          totalRs: input.baseTotalRs,
          enabled: input.canUseCredit,
        });

        const chargeAmountRs = input.baseTotalRs - creditAppliedRs;
        if (input.expectedTotalRs !== undefined && input.expectedTotalRs !== chargeAmountRs) {
          throw new CheckoutTotalChanged({
            error: "Your total changed. Please review the updated amount and try again.",
            totalRs: chargeAmountRs,
            discountRs: input.price.discountRs,
            couponCode: input.couponCode,
            referralDiscountRs: input.referralDiscountRs,
            creditAppliedRs,
          });
        }

        await tx.order.create({
          data: {
            userId: input.userId,
            orderNumber: orderNumber(),
            status: "PENDING_PAYMENT",
            paymentMethod: "PAYU",
            paymentStatus: "PENDING",
            payuTxnId: input.txnid,
            subtotalRs: input.price.subtotalRs,
            gstRs: input.price.gstRs,
            totalRs: chargeAmountRs,
            mrpSubtotalRs: input.price.mrpSubtotalRs,
            discountRs: input.price.discountRs,
            couponCode: input.couponCode,
            creditAppliedRs,
            referralAttribution: input.referralCode,
            cgstRs: input.price.cgstRs,
            sgstRs: input.price.sgstRs,
            igstRs: input.price.igstRs,
            buyerStateCode: input.buyerStateCode,
            hsnSacCode: "9983",
            notes: JSON.stringify({
              isDigital: true,
              planSlug: input.planSlug,
              durEnum: input.duration,
              bundle: input.bundle,
              couponCode: input.couponCode,
              referralDiscountRs: input.referralDiscountRs,
              ...(input.profile ? { profile: input.profile } : {}),
            }),
            items: {
              create: {
                productId: null,
                diet: "VEGETARIAN",
                duration: input.duration,
                mealsPerDay: "ALL_FOUR",
                priceRs: input.price.subtotalRs,
                gstRs: input.price.gstRs,
                totalRs: chargeAmountRs,
                quantity: 1,
              },
            },
            payment: {
              create: { method: "PAYU", status: "PENDING", amountRs: chargeAmountRs, payuTxnId: input.txnid },
            },
          },
        });
        return { creditAppliedRs, chargeAmountRs };
      }, { isolationLevel: "Serializable" });
    } catch (error: unknown) {
      if (error instanceof CheckoutTotalChanged) throw error;
      if (errorCode(error) === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error("Could not reserve checkout credit");
}

export async function POST(req: NextRequest) {
  try {
    const limit = await enforceRateLimit(req, "checkout");
    if (!limit.ok) return limit.response;
    const payu = getPayuConfig();
    if (!payu) {
      console.error("[PayU digital init] Missing or invalid payment configuration");
      return NextResponse.json({ error: "Online payment is temporarily unavailable." }, { status: 503 });
    }

    const parsed = await readJson(req, digitalPayuInitSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const { firstname, lastname, email, phone, planSlug, dur, bundle, buyerStateCode, useCredit, expectedTotalRs } = body;
    const duration = DUR_MAP[dur];
    if (!duration) return NextResponse.json({ error: "Invalid duration." }, { status: 400 });
    const session = await auth();

    const plan = await prisma.mealPlan.findUnique({ where: { slug: planSlug } });
    if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });
    const price = await prisma.planPrice.findFirst({
      where: { mealPlanId: plan.id, duration, mealsPerDay: "ALL_FOUR", bundle, isDigital: true, isActive: true },
    });
    if (!price) return NextResponse.json({ error: "No active digital price is available for this option." }, { status: 404 });
    if (bundle === "PRO") {
      const workout = await getWorkoutPlanData(plan.subCategory || "", plan.tier || "");
      if (!workout) return NextResponse.json({ error: "The Pro training schedule is not ready for this plan." }, { status: 409 });
    }

    const user = await resolveCheckoutCustomer({
      email,
      phone,
      name: `${firstname}${lastname ? ` ${lastname}` : ""}`,
      authenticatedUserId: session?.user?.id,
    });
    const referral = await captureCheckoutReferral({
      userId: user.id,
      candidateCode: req.cookies.get("ff_ref")?.value,
      discountBaseRs: price.priceRs,
    });

    let discountRs = 0;
    let appliedCouponCode: string | null = null;
    const couponCode = body.couponCode?.trim().toUpperCase();
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon) return NextResponse.json({ error: "That coupon code is not valid." }, { status: 400 });
      const [userUses, globalUses, paidOrders] = await Promise.all([
        prisma.couponRedemption.count({ where: { couponId: coupon.id, userId: user.id } }),
        prisma.couponRedemption.count({ where: { couponId: coupon.id } }),
        prisma.order.count({ where: { userId: user.id, paymentStatus: "SUCCESS" } }),
      ]);
      const result = applyCoupon(coupon, {
        saleSubtotalRs: price.priceRs,
        category: "DIGITAL",
        planSlug,
        isFirstOrder: paidOrders === 0,
        userRedemptionCount: userUses,
        globalRedemptionCount: globalUses,
      });
      if (!result.ok) return NextResponse.json({ error: result.reason || "That coupon cannot be used for this plan." }, { status: 400 });
      discountRs = Math.min(result.discountRs, Math.max(0, price.priceRs - 1));
      appliedCouponCode = coupon.code;
    }
    if ((referral?.discountRs ?? 0) > discountRs) {
      discountRs = referral?.discountRs ?? 0;
      appliedCouponCode = null;
    }

    const breakdown = computePrice({
      items: [{ mrpRs: price.mrpRs ?? price.priceRs, saleRs: price.priceRs, qty: 1 }],
      discountRs,
      gstPercent: price.gstPercent,
      priceIsTaxInclusive: price.priceIsTaxInclusive,
      buyerStateCode: buyerStateCode || SELLER_STATE,
      sellerStateCode: SELLER_STATE,
    });
    const txnid = `FFD${Date.now()}${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
    const created = await reserveCreditAndCreateOrder({
      userId: user.id,
      canUseCredit: Boolean(useCredit && session?.user?.id === user.id),
      expectedTotalRs,
      baseTotalRs: Math.max(1, breakdown.totalRs),
      referralDiscountRs: referral?.discountRs ?? 0,
      referralCode: referral?.code ?? null,
      couponCode: appliedCouponCode,
      profile: buildProfile(body),
      planSlug,
      duration,
      bundle,
      txnid,
      price: breakdown,
      buyerStateCode: buyerStateCode || SELLER_STATE,
    });

    const amount = created.chargeAmountRs.toFixed(2);
    const productinfo = `digital_${bundle.toLowerCase()}_${planSlug}`;
    const hashInput = `${payu.key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${payu.salt}`;
    const hash = crypto.createHash("sha512").update(hashInput).digest("hex");
    return NextResponse.json({
      payuUrl: payu.paymentUrl,
      key: payu.key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      hash,
      surl: `${payu.baseUrl}/api/payments/payu/success`,
      furl: `${payu.baseUrl}/api/payments/payu/failed`,
      service_provider: "payu_paisa",
      creditAppliedRs: created.creditAppliedRs,
    });
  } catch (error: unknown) {
    if (error instanceof CheckoutTotalChanged) return NextResponse.json(error.details, { status: 409 });
    console.error("[PayU digital init error]", error);
    return NextResponse.json({ error: "Digital payment could not be started." }, { status: 500 });
  }
}
