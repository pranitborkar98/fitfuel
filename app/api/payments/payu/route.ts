/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payments/payu/route.ts  · WS-3 hardened (SEC-1/2)
// PayU initiation — builds the signed hash AND creates a PENDING_PAYMENT order
// keyed by txnid so the success callback can complete it after the redirect.
// 17C-2: apply credit balance if signed in & opted in; stamp Order.creditAppliedRs.
//        Credit is committed (recordCreditChange) only after CONFIRMED in success route.

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { applyCreditAtCheckout } from "@/lib/partners";
import { applyCoupon } from "@/lib/coupons";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { payuInitSchema } from "@/lib/validation/schemas";

const PAYU_KEY  = process.env.PAYU_MERCHANT_KEY!;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const PAYU_URL  = "https://secure.payu.in/_payment"; // production

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

function genOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `FF-PAYU-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
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
    // SEC-1: checkout-init flooding guard, by IP.
    const rl = await enforceRateLimit(req, "checkout");
    if (!rl.ok) return rl.response;

    // SEC-2: size-capped, schema-validated body. Replaces raw req.json() +
    // hand-rolled presence checks.
    const parsed = await readJson(req, payuInitSchema);
    if (!parsed.ok) return parsed.response;
    const {
      firstname, lastname, email, phone,
      address, city, pincode,
      diet, dur, meal, price, deliveryWindow,
      amount,       // total incl GST, what PayU charges (pre-credit)
      productinfo,
      useCredit,    // 17C-2
      planSlug,     // LOOP-3: the plan the customer actually chose
    } = parsed.data;

    const dietEnum = DIET_MAP[diet];
    const durEnum  = DUR_MAP[dur];
    const mealEnum = MEAL_MAP[meal];

    let creditAppliedRs = 0;
    let user: any = null;
    let couponDiscountRs = 0;
    let appliedCouponCode: string | null = null;
    let appliedCouponId: string | null = null;
    const subtotalRsServer = Math.round(Number(price));
    let gstRsServer = Math.round(Number(amount)) - subtotalRsServer; // recomputed below
    let chargeAmountRs = Math.round(Number(amount)); // recomputed server-side below

    // We need user.id BEFORE credit lookup. Upsert now (this is the order owner).
    if (dietEnum && durEnum && mealEnum && price) {
      user = await upsertCustomer(email, phone, `${firstname}${lastname ? " " + lastname : ""}`);

      // ── R-PRICE: server-side coupon re-validation (discount BEFORE GST) ──
      const couponCode = (parsed.data.couponCode || "").trim().toUpperCase();
      if (couponCode) {
        const coupon = await (prisma as any).coupon.findUnique({ where: { code: couponCode } });
        if (coupon) {
          const [uCount, gCount, paid] = await Promise.all([
            (prisma as any).couponRedemption.count({ where: { couponId: coupon.id, userId: user.id } }),
            (prisma as any).couponRedemption.count({ where: { couponId: coupon.id } }),
            (prisma as any).order.count({ where: { userId: user.id, paymentStatus: "SUCCESS" } }),
          ]);
          const cres = applyCoupon(coupon, {
            saleSubtotalRs: subtotalRsServer, category: "PHYSICAL", planSlug,
            isFirstOrder: paid === 0, userRedemptionCount: uCount, globalRedemptionCount: gCount, deliveryFeeRs: 0,
          });
          if (cres.ok) {
            couponDiscountRs = Math.min(cres.discountRs, Math.max(0, subtotalRsServer - 1));
            appliedCouponCode = coupon.code;
            appliedCouponId = coupon.id;
          }
        }
      }
      // Recompute the authoritative charge from subtotal − discount + GST.
      const discountedSubtotal = subtotalRsServer - couponDiscountRs;
      gstRsServer = Math.round(discountedSubtotal * 0.05);
      chargeAmountRs = discountedSubtotal + gstRsServer;

      // 17C-2: apply credit only if signed in AND opted in AND owns this account
      if (useCredit) {
        const session = await auth();
        if (session?.user?.id && session.user.id === user.id) {
          const applied = await applyCreditAtCheckout(user.id, chargeAmountRs);
          // Keep at least ₹1 for PayU (zero-amount orders rejected)
          creditAppliedRs = Math.min(applied.creditAppliedRs, Math.max(0, chargeAmountRs - 1));
          chargeAmountRs = chargeAmountRs - creditAppliedRs;
        }
      }
    }

    // PayU requires the amount field as a string with 2 decimals. Hash uses the exact same string.
    const payuAmount = chargeAmountRs.toFixed(2);

    const txnid = `FF${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // ── Hash (unchanged formula — all udf empty) ──
    const hashString = `${PAYU_KEY}|${txnid}|${payuAmount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // ── Create the PENDING order now, keyed by txnid ──
    if (user && dietEnum && durEnum && mealEnum && price) {
      const subtotal = subtotalRsServer;     // pre-GST (gross)
      const gst      = gstRsServer;          // GST on discounted subtotal
      const window   = deliveryWindow === "EVENING" ? "EVENING" : "MORNING";

      const addr = await (prisma as any).address.create({
        data: { userId: user.id, line1: address ?? "", area: city ?? "Pune", city: city ?? "Pune", pincode: pincode ?? "" },
      });

      await (prisma as any).order.create({
        data: {
          userId: user.id, addressId: addr.id, orderNumber: genOrderNumber(),
          status: "PENDING_PAYMENT",
          subtotalRs: subtotal, gstRs: gst, totalRs: chargeAmountRs,
          creditAppliedRs, discountRs: couponDiscountRs, couponCode: appliedCouponCode,
          paymentMethod: "PAYU", paymentStatus: "PENDING", payuTxnId: txnid,
          notes: JSON.stringify({ diet, dur, meal, planSlug: planSlug || null, deliveryWindow: window, isJain: diet === "jain" }),
          items: {
            create: {
              productId: null, diet: dietEnum, duration: durEnum, mealsPerDay: mealEnum,
              priceRs: subtotal, gstRs: gst, totalRs: chargeAmountRs, quantity: 1,
            },
          },
          payment: {
            create: { method: "PAYU", status: "PENDING", amountRs: chargeAmountRs, payuTxnId: txnid },
          },
        },
      });
    }

    return NextResponse.json({
      payuUrl:          PAYU_URL,
      key:              PAYU_KEY,
      txnid,
      amount:           payuAmount,    // post-credit, what PayU will charge
      productinfo,
      firstname,
      email,
      phone,
      hash,
      surl:             `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/success`,
      furl:             `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/failed`,
      service_provider: "payu_paisa",
      creditAppliedRs,
    });
  } catch (err) {
    console.error("[PayU init error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
