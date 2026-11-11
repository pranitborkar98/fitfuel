import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { DietType, Prisma } from "@prisma/client";

import { auth } from "@/lib/auth";
import { checkoutCreditReservation } from "@/lib/checkout-credit";
import { resolveCheckoutCustomer } from "@/lib/checkout-customer";
import { captureCheckoutReferral } from "@/lib/checkout-referral";
import { applyCoupon } from "@/lib/coupons";
import { getPayuConfig } from "@/lib/payu-config";
import { resolvePhysicalCheckout } from "@/lib/physical-checkout";
import { prisma } from "@/lib/prisma";
import { decomposePrice, durationKeyFromShort } from "@/lib/pricing-decomposition";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { payuInitSchema } from "@/lib/validation/schemas";

const DIET_MAP: Record<string, DietType> = {
  veg: "VEGETARIAN",
  egg: "EGGETARIAN",
  nonveg: "NON_VEGETARIAN",
  jain: "VEGETARIAN",
  vegan: "VEGETARIAN",
};

class CheckoutTotalChanged extends Error {
  constructor(public details: Record<string, unknown>) {
    super("Checkout total changed");
  }
}

function errorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : null;
}

function orderNumber(): string {
  const now = new Date();
  const day = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `FF-PAYU-${day}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const limit = await enforceRateLimit(req, "checkout");
    if (!limit.ok) return limit.response;

    const payu = getPayuConfig();
    if (!payu) {
      console.error("[PayU physical init] Missing or invalid payment configuration");
      return NextResponse.json(
        { error: "Online payment is temporarily unavailable." },
        { status: 503 },
      );
    }

    const parsed = await readJson(req, payuInitSchema);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
    const {
      firstname,
      lastname,
      email,
      phone,
      address,
      city,
      pincode,
      diet,
      dur,
      meal,
      price,
      deliveryWindow,
      useCredit,
      planSlug,
      expectedTotalRs,
    } = body;

    const selection = await resolvePhysicalCheckout({
      planSlug,
      diet,
      duration: dur,
      meals: meal,
      submittedSubtotalRs: price,
    });
    if (!selection.ok) {
      return NextResponse.json({ error: selection.error }, { status: selection.status });
    }

    const dietType = DIET_MAP[diet];
    if (!dietType) {
      return NextResponse.json({ error: "Invalid diet selection." }, { status: 400 });
    }

    const session = await auth();
    const user = await resolveCheckoutCustomer({
      email,
      phone,
      name: `${firstname}${lastname ? ` ${lastname}` : ""}`,
      authenticatedUserId: session?.user?.id,
    });
    const subtotalRs = selection.subtotalRs;
    const referral = await captureCheckoutReferral({
      userId: user.id,
      candidateCode: req.cookies.get("ff_ref")?.value,
      discountBaseRs: subtotalRs,
    });

    let discountRs = 0;
    let appliedCouponCode: string | null = null;
    const couponCode = body.couponCode?.trim().toUpperCase();
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!coupon) {
        return NextResponse.json({ error: "That coupon code is not valid." }, { status: 400 });
      }
      const [userUses, globalUses, paidOrders] = await Promise.all([
        prisma.couponRedemption.count({ where: { couponId: coupon.id, userId: user.id } }),
        prisma.couponRedemption.count({ where: { couponId: coupon.id } }),
        prisma.order.count({ where: { userId: user.id, paymentStatus: "SUCCESS" } }),
      ]);
      const result = applyCoupon(coupon, {
        saleSubtotalRs: subtotalRs,
        category: "PHYSICAL",
        planSlug,
        isFirstOrder: paidOrders === 0,
        userRedemptionCount: userUses,
        globalRedemptionCount: globalUses,
        deliveryFeeRs: decomposePrice({
          subtotalRs,
          duration: durationKeyFromShort(dur),
        }).deliveryRs,
      });
      if (!result.ok) {
        return NextResponse.json(
          { error: result.reason || "That coupon cannot be used for this plan." },
          { status: 400 },
        );
      }
      discountRs = Math.min(result.discountRs, Math.max(0, subtotalRs - 1));
      appliedCouponCode = coupon.code;
    }

    if ((referral?.discountRs ?? 0) > discountRs) {
      discountRs = referral?.discountRs ?? 0;
      appliedCouponCode = null;
    }

    const discountedSubtotalRs = Math.max(1, subtotalRs - discountRs);
    const gstRs = Math.round(discountedSubtotalRs * 0.05);
    const baseTotalRs = Math.max(1, discountedSubtotalRs + gstRs);
    const cgstRs = Math.ceil(gstRs / 2);
    const sgstRs = gstRs - cgstRs;
    const txnid = `FFP${Date.now()}${crypto.randomUUID().replaceAll("-", "").slice(0, 8)}`;
    const normalizedCity = city || "Pune";
    const window = deliveryWindow === "EVENING" ? "EVENING" : "MORNING";

    let created: { creditAppliedRs: number; chargeAmountRs: number } | null = null;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const creditAppliedRs = await checkoutCreditReservation(tx, {
            userId: user.id,
            totalRs: baseTotalRs,
            enabled: Boolean(useCredit && session?.user?.id === user.id),
          });
          const chargeAmountRs = baseTotalRs - creditAppliedRs;

          if (expectedTotalRs !== undefined && expectedTotalRs !== chargeAmountRs) {
            throw new CheckoutTotalChanged({
              error: "Your total changed. Please review the updated amount and try again.",
              totalRs: chargeAmountRs,
              discountRs,
              couponCode: appliedCouponCode,
              referralDiscountRs: referral?.discountRs ?? 0,
              creditAppliedRs,
            });
          }

          const savedAddress = await tx.address.create({
            data: {
              userId: user.id,
              line1: address,
              area: normalizedCity,
              city: normalizedCity,
              pincode,
            },
          });
          await tx.order.create({
            data: {
              userId: user.id,
              addressId: savedAddress.id,
              orderNumber: orderNumber(),
              status: "PENDING_PAYMENT",
              paymentMethod: "PAYU",
              paymentStatus: "PENDING",
              payuTxnId: txnid,
              subtotalRs: discountedSubtotalRs,
              gstRs,
              totalRs: chargeAmountRs,
              mrpSubtotalRs: subtotalRs,
              discountRs,
              couponCode: appliedCouponCode,
              creditAppliedRs,
              referralAttribution: referral?.code ?? null,
              cgstRs,
              sgstRs,
              igstRs: 0,
              buyerStateCode: "MH",
              hsnSacCode: "9963",
              notes: JSON.stringify({
                diet,
                dur,
                meal,
                planSlug,
                deliveryWindow: window,
                isJain: diet === "jain",
                referralDiscountRs: referral?.discountRs ?? 0,
              }),
              items: {
                create: {
                  productId: null,
                  diet: dietType,
                  duration: selection.duration,
                  mealsPerDay: selection.meals,
                  priceRs: discountedSubtotalRs,
                  gstRs,
                  totalRs: chargeAmountRs,
                  quantity: 1,
                },
              },
              payment: {
                create: {
                  method: "PAYU",
                  status: "PENDING",
                  amountRs: chargeAmountRs,
                  payuTxnId: txnid,
                },
              },
            },
          });
          return { creditAppliedRs, chargeAmountRs };
        }, { isolationLevel: "Serializable" });
        break;
      } catch (error: unknown) {
        if (error instanceof CheckoutTotalChanged) throw error;
        if (errorCode(error) === "P2034" && attempt < 2) continue;
        throw error;
      }
    }
    if (!created) throw new Error("Could not reserve checkout credit");

    const amount = created.chargeAmountRs.toFixed(2);
    const productinfo = `${selection.plan.displayName || selection.plan.name} · ${dur} · ${meal}`.slice(0, 200);
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
    if (error instanceof CheckoutTotalChanged) {
      return NextResponse.json(error.details, { status: 409 });
    }
    console.error("[PayU physical init error]", error);
    return NextResponse.json({ error: "Payment could not be started." }, { status: 500 });
  }
}
