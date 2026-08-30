import { randomUUID } from "node:crypto";
import type { DietType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { checkoutCreditReservation } from "@/lib/checkout-credit";
import { resolveCheckoutCustomer } from "@/lib/checkout-customer";
import { captureCheckoutReferral } from "@/lib/checkout-referral";
import { applyCoupon } from "@/lib/coupons";
import { fireNotification, notifyStaffByRoles } from "@/lib/notify";
import { firstDeliveryDateFor } from "@/lib/order-cutoff";
import { resolvePhysicalCheckout } from "@/lib/physical-checkout";
import { planDateRange } from "@/lib/plan-service-dates";
import { prisma } from "@/lib/prisma";
import { decomposePrice, durationKeyFromShort } from "@/lib/pricing-decomposition";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { codOrderSchema } from "@/lib/validation/schemas";

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
  return `FF-COD-${day}-${randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const limit = await enforceRateLimit(req, "checkout");
    if (!limit.ok) return limit.response;

    const parsed = await readJson(req, codOrderSchema);
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
      candidateCode: body.refCode || req.cookies.get("ff_ref")?.value,
      discountBaseRs: subtotalRs,
    });

    let discountRs = 0;
    let appliedCouponCode: string | null = null;
    let appliedCouponId: string | null = null;
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
          { error: result.reason || "That coupon cannot be used for this order." },
          { status: 400 },
        );
      }
      discountRs = Math.min(result.discountRs, Math.max(0, subtotalRs - 1));
      appliedCouponCode = coupon.code;
      appliedCouponId = coupon.id;
    }
    if ((referral?.discountRs ?? 0) > discountRs) {
      discountRs = referral?.discountRs ?? 0;
      appliedCouponCode = null;
      appliedCouponId = null;
    }

    const discountedSubtotalRs = Math.max(1, subtotalRs - discountRs);
    const gstRs = Math.round(discountedSubtotalRs * 0.05);
    const baseTotalRs = Math.max(1, discountedSubtotalRs + gstRs);
    const cgstRs = Math.ceil(gstRs / 2);
    const sgstRs = gstRs - cgstRs;
    const { startDate, endDate } = planDateRange(firstDeliveryDateFor(), selection.duration);
    const window = deliveryWindow === "EVENING" ? "EVENING" : "MORNING";
    const normalizedCity = city || "Pune";
    const canUseCredit = Boolean(useCredit && session?.user?.id === user.id);

    let saved: {
      orderId: string;
      orderNumber: string;
      totalRs: number;
      creditAppliedRs: number;
    } | null = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        saved = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const creditAppliedRs = await checkoutCreditReservation(tx, {
            userId: user.id,
            totalRs: baseTotalRs,
            enabled: canUseCredit,
          });
          const totalRs = baseTotalRs - creditAppliedRs;

          if (expectedTotalRs !== undefined && expectedTotalRs !== totalRs) {
            throw new CheckoutTotalChanged({
              error: "Your total changed. Please review the updated amount and place the order again.",
              totalRs,
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
          const createdOrder = await tx.order.create({
            data: {
              userId: user.id,
              addressId: savedAddress.id,
              orderNumber: orderNumber(),
              status: "CONFIRMED",
              paymentMethod: "CASH_ON_DELIVERY",
              paymentStatus: "PENDING",
              subtotalRs: discountedSubtotalRs,
              gstRs,
              totalRs,
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
                  totalRs,
                  quantity: 1,
                },
              },
              payment: {
                create: {
                  method: "CASH_ON_DELIVERY",
                  status: "PENDING",
                  amountRs: totalRs,
                },
              },
            },
          });

          if (appliedCouponId && discountRs > 0) {
            await tx.couponRedemption.create({
              data: {
                couponId: appliedCouponId,
                userId: user.id,
                orderId: createdOrder.id,
                amountRs: discountRs,
              },
            });
          }

          const profile = await tx.userProfile.findUnique({
            where: { userId: user.id },
            select: { calorieTarget: true },
          });
          await tx.userActivePlan.create({
            data: {
              userId: user.id,
              mealPlanId: selection.plan.id,
              orderId: createdOrder.id,
              startDate,
              endDate,
              currentDay: 1,
              status: "active",
              mealsPerDay: selection.meals,
              duration: selection.duration,
              deliveryWindow: window,
              calorieTarget: profile?.calorieTarget ?? null,
              skipDates: [],
            },
          });

          if (creditAppliedRs > 0) {
            const spent = await tx.user.updateMany({
              where: { id: user.id, creditsBalanceRs: { gte: creditAppliedRs } },
              data: { creditsBalanceRs: { increment: -creditAppliedRs } },
            });
            if (spent.count !== 1) {
              throw Object.assign(new Error("Credit balance changed"), { code: "P2034" });
            }
            await tx.creditLedger.create({
              data: {
                userId: user.id,
                deltaRs: -creditAppliedRs,
                reason: "order_payment",
                refOrderId: createdOrder.id,
              },
            });
          }

          return {
            orderId: createdOrder.id,
            orderNumber: createdOrder.orderNumber,
            totalRs,
            creditAppliedRs,
          };
        }, { isolationLevel: "Serializable" });
        break;
      } catch (error: unknown) {
        if (error instanceof CheckoutTotalChanged) throw error;
        if (errorCode(error) === "P2034" && attempt < 2) continue;
        throw error;
      }
    }
    if (!saved) throw new Error("Could not create cash-on-delivery order");

    fireNotification({
      userId: user.id,
      toEmail: user.email || undefined,
      toPhone: user.phone || undefined,
      toName: user.name || firstname,
      templateKey: "order_confirmed",
      vars: {
        orderNumber: saved.orderNumber,
        planName: selection.plan.displayName || selection.plan.name,
        amount: String(saved.totalRs),
      },
    });
    await notifyStaffByRoles(["OWNER", "ADMIN"], "staff_new_order", {
      orderNumber: saved.orderNumber,
      customerName: user.name || firstname,
      planName: selection.plan.displayName || selection.plan.name,
      amount: String(saved.totalRs),
    });

    return NextResponse.json({
      success: true,
      orderNumber: saved.orderNumber,
      orderId: saved.orderId,
      total: saved.totalRs,
      creditAppliedRs: saved.creditAppliedRs,
    });
  } catch (error: unknown) {
    if (error instanceof CheckoutTotalChanged) {
      return NextResponse.json(error.details, { status: 409 });
    }
    console.error("[COD order error]", error);
    return NextResponse.json(
      { error: "Cash-on-delivery order could not be placed." },
      { status: 500 },
    );
  }
}
