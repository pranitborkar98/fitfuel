/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payments/payu/digital/route.ts  (Phase 13D — digital plan PayU initiation)
// Mirrors app/api/payments/payu/route.ts EXACTLY for hashing (empty UDFs) so the
// existing /success route's reverse-hash verification still matches.
// Differences: no address, server-computed price (18% GST inclusive) + coupon, notes flag isDigital.
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { computePrice } from "@/lib/pricing";
import { applyCoupon, type CouponLike } from "@/lib/coupons";

const PAYU_KEY  = process.env.PAYU_MERCHANT_KEY!;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const PAYU_URL  = "https://secure.payu.in/_payment";
const SELLER_STATE = "MH";

const DUR_MAP: Record<string, string> = {
  trial: "TRIAL_DAY", weekly: "WEEKLY", biweekly: "BI_WEEKLY",
  monthly_ex: "MONTHLY_EXCL_WEEKENDS", monthly: "ONE_MONTH",
  two_month: "TWO_MONTH", three_month: "THREE_MONTH",
};

function genOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `FF-DGTL-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
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
    const body = await req.json();
    const { firstname, lastname, email, phone, planSlug, dur, couponCode, buyerStateCode } = body;

    if (!firstname || !email || !phone || !planSlug || !dur) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const durEnum = DUR_MAP[dur];
    if (!durEnum) return NextResponse.json({ error: "Invalid duration" }, { status: 400 });

    // ── Resolve plan + digital price (server-side; never trust client amount) ──
    const plan = await (prisma as any).mealPlan.findUnique({ where: { slug: planSlug } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const price = await (prisma as any).planPrice.findFirst({
      where: { mealPlanId: plan.id, duration: durEnum, mealsPerDay: "ALL_FOUR", isDigital: true, isActive: true },
    });
    if (!price) return NextResponse.json({ error: "No digital price for this plan/duration" }, { status: 404 });

    // ── Coupon (optional) ──
    let discountRs = 0;
    let appliedCode: string | undefined;
    if (couponCode) {
      const coupon = await (prisma as any).coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        const maybeUser = await (prisma as any).user.findFirst({ where: { email } });
        const [userCount, globalCount, paidOrders] = await Promise.all([
          maybeUser ? (prisma as any).couponRedemption.count({ where: { couponId: coupon.id, userId: maybeUser.id } }) : 0,
          (prisma as any).couponRedemption.count({ where: { couponId: coupon.id } }),
          maybeUser ? (prisma as any).order.count({ where: { userId: maybeUser.id, paymentStatus: "SUCCESS" } }) : 0,
        ]);
        const res = applyCoupon(coupon as unknown as CouponLike, {
          saleSubtotalRs: price.priceRs, category: "DIGITAL", planSlug,
          isFirstOrder: paidOrders === 0, userRedemptionCount: userCount, globalRedemptionCount: globalCount,
        });
        if (res.ok) { discountRs = res.discountRs; appliedCode = couponCode; }
      }
    }

    const p = computePrice({
      items: [{ mrpRs: price.mrpRs ?? price.priceRs, saleRs: price.priceRs, qty: 1 }],
      discountRs,
      gstPercent: price.gstPercent,
      priceIsTaxInclusive: price.priceIsTaxInclusive,
      buyerStateCode: buyerStateCode || SELLER_STATE,
      sellerStateCode: SELLER_STATE,
    });

    const amount = p.totalRs.toFixed(2);            // exact string used in hash + sent to PayU
    const productinfo = `digital_${planSlug}`;
    const txnid = `FFD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // ── Hash — IDENTICAL formula to physical route (all UDFs empty) ──
    const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // ── Create PENDING order (no address) tagged digital in notes ──
    const user = await upsertCustomer(email, phone, `${firstname}${lastname ? " " + lastname : ""}`);

    await (prisma as any).order.create({
      data: {
        userId: user.id, orderNumber: genOrderNumber(),
        status: "PENDING_PAYMENT", paymentMethod: "PAYU", paymentStatus: "PENDING", payuTxnId: txnid,
        subtotalRs: p.subtotalRs, gstRs: p.gstRs, totalRs: p.totalRs,
        mrpSubtotalRs: p.mrpSubtotalRs, discountRs: p.discountRs, couponCode: appliedCode,
        cgstRs: p.cgstRs, sgstRs: p.sgstRs, igstRs: p.igstRs,
        buyerStateCode: buyerStateCode || SELLER_STATE, hsnSacCode: "9983",
        notes: JSON.stringify({ isDigital: true, planSlug, durEnum, couponCode: appliedCode ?? null }),
        items: {
          create: {
            productId: null, diet: "VEGETARIAN", duration: durEnum, mealsPerDay: "ALL_FOUR",
            priceRs: p.subtotalRs, gstRs: p.gstRs, totalRs: p.totalRs, quantity: 1,
          },
        },
        payment: { create: { method: "PAYU", status: "PENDING", amountRs: p.totalRs, payuTxnId: txnid } },
      },
    });

    return NextResponse.json({
      payuUrl: PAYU_URL, key: PAYU_KEY, txnid, amount, productinfo,
      firstname, email, phone, hash,
      surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/success`,
      furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/failed`,
      service_provider: "payu_paisa",
    });
  } catch (err) {
    console.error("[PayU digital init error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
