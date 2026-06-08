/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payments/payu/success/route.ts
// PayU posts here after payment. Verify hash, complete the pending order (keyed by txnid).
// Phase 13D: branches on notes.isDigital — digital plans skip delivery (isDigital UserActivePlan).
// Phase 13D (capture): forwards notes.profile to activateDigitalPlan so body stats land on UserProfile.

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { activateDigitalPlan } from "@/lib/activate-digital-plan";

const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const BASE_URL  = process.env.NEXT_PUBLIC_BASE_URL!;

const DUR_DAYS: Record<string, number> = {
  TRIAL_DAY: 1, WEEKLY: 7, BI_WEEKLY: 14,
  MONTHLY_EXCL_WEEKENDS: 26, ONE_MONTH: 30, TWO_MONTH: 60, THREE_MONTH: 90,
};
const DUR_MAP: Record<string, string> = {
  trial: "TRIAL_DAY", weekly: "WEEKLY", biweekly: "BI_WEEKLY",
  monthly_ex: "MONTHLY_EXCL_WEEKENDS", monthly: "ONE_MONTH",
  two_month: "TWO_MONTH", three_month: "THREE_MONTH",
};
const MEAL_MAP: Record<string, string> = {
  bl: "BREAKFAST_LUNCH", sd: "SNACK_DINNER", all: "ALL_FOUR",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const status      = formData.get("status")      as string;
    const txnid       = formData.get("txnid")       as string;
    const amount      = formData.get("amount")      as string;
    const productinfo = formData.get("productinfo") as string;
    const firstname   = formData.get("firstname")   as string;
    const email       = formData.get("email")       as string;
    const hash        = formData.get("hash")        as string;
    const mihpayid    = formData.get("mihpayid")    as string;

    // ── Verify hash — PayU reverse formula (udf empty, unchanged) ──
    const reverseHash  = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_MERCHANT_KEY}`;
    const expectedHash = crypto.createHash("sha512").update(reverseHash).digest("hex");

    if (hash !== expectedHash) {
      console.error("[PayU] Hash mismatch — possible tampering", { txnid });
      return NextResponse.redirect(`${BASE_URL}/checkout?error=invalid_hash`, 303);
    }
    if (status !== "success") {
      return NextResponse.redirect(`${BASE_URL}/checkout?error=payment_failed&txnid=${txnid}`, 303);
    }

    const order = await (prisma as any).order.findFirst({ where: { payuTxnId: txnid } });
    if (!order) {
      console.warn("[PayU] success but no pending order for txnid", txnid);
      return NextResponse.redirect(`${BASE_URL}/order/confirmation?txnid=${txnid}&amount=${amount}`, 303);
    }

    const meta = (() => { try { return JSON.parse(order.notes ?? "{}"); } catch { return {}; } })();

    // ── Idempotency: PayU can hit surl more than once ──
    if (order.status === "CONFIRMED") {
      const done = meta.isDigital
        ? `${BASE_URL}/dashboard?digital=1&order=${order.orderNumber}`
        : `${BASE_URL}/order/confirmation?txnid=${txnid}&amount=${amount}&order=${order.orderNumber}`;
      return NextResponse.redirect(done, 303);
    }

    // ── Mark order + payment paid (both paths need this) ──
    await (prisma as any).order.update({
      where: { id: order.id },
      data:  { status: "CONFIRMED", paymentStatus: "SUCCESS", payuPaymentId: mihpayid },
    });
    await (prisma as any).payment.update({
      where: { orderId: order.id },
      data:  { status: "SUCCESS", payuPaymentId: mihpayid, paidAt: new Date() },
    });

    // ════════════════════ DIGITAL PATH (Phase 13D) ════════════════════
    if (meta.isDigital) {
      const plan = await (prisma as any).mealPlan.findUnique({ where: { slug: meta.planSlug } });
      if (plan) {
        await activateDigitalPlan({ orderId: order.id, mealPlanId: plan.id, durEnum: meta.durEnum ?? "ONE_MONTH", bundle: meta.bundle ?? "STARTER", profile: meta.profile });
        console.log("[PayU] DIGITAL plan activated", { txnid, order: order.orderNumber });
      } else {
        console.error("[PayU] Digital paid but plan not found", { txnid, planSlug: meta.planSlug });
      }
      // Digital customers go to the dashboard where the PDF download lives.
      return NextResponse.redirect(`${BASE_URL}/dashboard?digital=1&order=${order.orderNumber}`, 303);
    }

    // ════════════════════ PHYSICAL PATH (unchanged) ════════════════════
    const durEnum  = DUR_MAP[meta.dur]  ?? "ONE_MONTH";
    const mealEnum = MEAL_MAP[meta.meal] ?? "ALL_FOUR";
    const window   = meta.deliveryWindow === "EVENING" ? "EVENING" : "MORNING";

    const mealPlan =
      (await (prisma as any).mealPlan.findUnique({ where: { slug: "weight-loss-veg" } })) ??
      (await (prisma as any).mealPlan.findFirst({ where: { isActive: true } })) ??
      (await (prisma as any).mealPlan.findFirst());

    if (mealPlan) {
      const startDate = new Date();
      const days = DUR_DAYS[durEnum] ?? 30;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);

      await (prisma as any).userActivePlan.create({
        data: {
          userId: order.userId, mealPlanId: mealPlan.id, orderId: order.id,
          startDate, endDate, currentDay: 1, status: "active",
          mealsPerDay: mealEnum, duration: durEnum,
          deliveryWindow: window, skipDates: [],
          // isDigital defaults false — physical plans appear on the dispatch board.
        },
      });
    } else {
      console.error("[PayU] Paid but NO meal plan found to attach — manual fix needed", { txnid, order: order.orderNumber });
    }

    console.log("[PayU] SUCCESS + plan created", { txnid, mihpayid, order: order.orderNumber });
    return NextResponse.redirect(
      `${BASE_URL}/order/confirmation?txnid=${txnid}&amount=${amount}&order=${order.orderNumber}`, 303
    );
  } catch (err) {
    console.error("[PayU success handler error]", err);
    return NextResponse.redirect(`${BASE_URL}/checkout?error=server_error`, 303);
  }
}

export async function GET() {
  return NextResponse.redirect(`${BASE_URL}/plans`, 303);
}
