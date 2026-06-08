/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payments/payu/digital/route.ts — bundle-aware (STARTER/PRO). Hash formula unchanged.
// Phase 13D (capture): optional body stats validated here and stashed in order.notes.profile;
// persisted to UserProfile on payment success (see lib/activate-digital-plan.ts).
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { computePrice } from "@/lib/pricing";
import { applyCoupon, type CouponLike } from "@/lib/coupons";

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY!;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const PAYU_URL = "https://secure.payu.in/_payment";
const SELLER_STATE = "MH";
const DUR_MAP: Record<string, string> = { trial: "TRIAL_DAY", weekly: "WEEKLY", biweekly: "BI_WEEKLY", monthly_ex: "MONTHLY_EXCL_WEEKENDS", monthly: "ONE_MONTH", two_month: "TWO_MONTH", three_month: "THREE_MONTH" };

// ── Optional body stats: parse, sanity-check, drop blanks/out-of-range ──
function num(v: unknown, min: number, max: number, integer = false): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  let n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  if (integer) n = Math.round(n);
  if (n < min || n > max) return undefined;
  return n;
}
function buildProfile(body: any): Record<string, number> | undefined {
  const p: Record<string, number> = {};
  const h = num(body.heightCm, 100, 250);
  const w = num(body.weightKg, 20, 300);
  const t = num(body.targetWeightKg, 20, 300);
  const a = num(body.age, 10, 100, true);
  if (h !== undefined) p.heightCm = h;
  if (w !== undefined) p.weightKg = w;
  if (t !== undefined) p.targetWeightKg = t;
  if (a !== undefined) p.age = a;
  return Object.keys(p).length ? p : undefined;
}

function genOrderNumber() { const d = new Date(); return `FF-DGTL-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`; }
async function upsertCustomer(email: string, phone: string, name: string) {
  let user = await (prisma as any).user.findFirst({ where: { email } });
  if (!user && phone) user = await (prisma as any).user.findFirst({ where: { phone } });
  const phoneOwner = phone ? await (prisma as any).user.findFirst({ where: { phone } }) : null;
  if (user) { const data: any = { name }; if (phone && (!phoneOwner || phoneOwner.id === user.id)) data.phone = phone; return (prisma as any).user.update({ where: { id: user.id }, data }); }
  const data: any = { email, name }; if (phone && !phoneOwner) data.phone = phone; return (prisma as any).user.create({ data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstname, lastname, email, phone, planSlug, dur, bundle = "STARTER", couponCode, buyerStateCode } = body;
    if (!firstname || !email || !phone || !planSlug || !dur) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    const durEnum = DUR_MAP[dur];
    if (!durEnum) return NextResponse.json({ error: "Invalid duration" }, { status: 400 });

    const profile = buildProfile(body);

    const plan = await (prisma as any).mealPlan.findUnique({ where: { slug: planSlug } });
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    const price = await (prisma as any).planPrice.findFirst({ where: { mealPlanId: plan.id, duration: durEnum, mealsPerDay: "ALL_FOUR", bundle, isDigital: true, isActive: true } });
    if (!price) return NextResponse.json({ error: "No digital price for this plan/tier" }, { status: 404 });

    let discountRs = 0, appliedCode: string | undefined;
    if (couponCode) {
      const coupon = await (prisma as any).coupon.findUnique({ where: { code: couponCode } });
      if (coupon) {
        const u = await (prisma as any).user.findFirst({ where: { email } });
        const [uc, gc, po] = await Promise.all([
          u ? (prisma as any).couponRedemption.count({ where: { couponId: coupon.id, userId: u.id } }) : 0,
          (prisma as any).couponRedemption.count({ where: { couponId: coupon.id } }),
          u ? (prisma as any).order.count({ where: { userId: u.id, paymentStatus: "SUCCESS" } }) : 0,
        ]);
        const res = applyCoupon(coupon as unknown as CouponLike, { saleSubtotalRs: price.priceRs, category: "DIGITAL", planSlug, isFirstOrder: po === 0, userRedemptionCount: uc, globalRedemptionCount: gc });
        if (res.ok) { discountRs = res.discountRs; appliedCode = couponCode; }
      }
    }

    const p = computePrice({ items: [{ mrpRs: price.mrpRs ?? price.priceRs, saleRs: price.priceRs, qty: 1 }], discountRs, gstPercent: price.gstPercent, priceIsTaxInclusive: price.priceIsTaxInclusive, buyerStateCode: buyerStateCode || SELLER_STATE, sellerStateCode: SELLER_STATE });

    const amount = p.totalRs.toFixed(2);
    const productinfo = `digital_${bundle.toLowerCase()}_${planSlug}`;
    const txnid = `FFD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    const user = await upsertCustomer(email, phone, `${firstname}${lastname ? " " + lastname : ""}`);
    await (prisma as any).order.create({
      data: {
        userId: user.id, orderNumber: genOrderNumber(), status: "PENDING_PAYMENT", paymentMethod: "PAYU", paymentStatus: "PENDING", payuTxnId: txnid,
        subtotalRs: p.subtotalRs, gstRs: p.gstRs, totalRs: p.totalRs, mrpSubtotalRs: p.mrpSubtotalRs, discountRs: p.discountRs, couponCode: appliedCode,
        cgstRs: p.cgstRs, sgstRs: p.sgstRs, igstRs: p.igstRs, buyerStateCode: buyerStateCode || SELLER_STATE, hsnSacCode: "9983",
        notes: JSON.stringify({ isDigital: true, planSlug, durEnum, bundle, couponCode: appliedCode ?? null, ...(profile ? { profile } : {}) }),
        items: { create: { productId: null, diet: "VEGETARIAN", duration: durEnum, mealsPerDay: "ALL_FOUR", priceRs: p.subtotalRs, gstRs: p.gstRs, totalRs: p.totalRs, quantity: 1 } },
        payment: { create: { method: "PAYU", status: "PENDING", amountRs: p.totalRs, payuTxnId: txnid } },
      },
    });

    return NextResponse.json({ payuUrl: PAYU_URL, key: PAYU_KEY, txnid, amount, productinfo, firstname, email, phone, hash, surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/success`, furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/failed`, service_provider: "payu_paisa" });
  } catch (err) { console.error("[PayU digital init error]", err); return NextResponse.json({ error: "Internal server error" }, { status: 500 }); }
}
