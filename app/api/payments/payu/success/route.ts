// app/api/payments/payu/success/route.ts
// 16A: order_confirmed + staff_new_order notifications
// 17A: processReferralReward after order CONFIRMED
// 17C-2: idempotently create purchased access and commercial accounting.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyStaffByRoles, sendNotification } from "@/lib/notify";
import { getPayuConfig } from "@/lib/payu-config";
import { ensurePurchasedEntitlement, parseOrderMeta, type OrderMeta } from "@/lib/order-entitlement";
import { ensurePaidOrderAccounting } from "@/lib/order-accounting";
import { payuAmountMatches, readPayuResponse, verifyPayuResponse } from "@/lib/payu-response";

function completedOrderUrl(baseUrl: string, order: { orderNumber: string }, meta: OrderMeta, txnid: string, amount: string) {
  if (meta.isDigital) return `${baseUrl}/dashboard?digital=1&order=${order.orderNumber}`;
  if (meta.kind === "DISH") return `${baseUrl}/order/confirmation?order=${order.orderNumber}`;
  return `${baseUrl}/order/confirmation?txnid=${txnid}&amount=${amount}&order=${order.orderNumber}&window=${meta.deliveryWindow === "EVENING" ? "EVENING" : "MORNING"}`;
}

function isPaidOrderState(order: { paymentStatus: string; status: string }) {
  return order.paymentStatus === "SUCCESS" && ["CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status);
}

export async function POST(req: NextRequest) {
  try {
    const payu = getPayuConfig();
    if (!payu) {
      console.error("[PayU success] Missing or invalid payment configuration");
      return NextResponse.json({ error: "Payment callback is not configured." }, { status: 503 });
    }
    const response = readPayuResponse(await req.formData());
    const { status, txnid, amount, firstname, email, mihpayid } = response;

    if (!verifyPayuResponse(response, payu)) {
      console.error("[PayU] Hash mismatch", { txnid });
      return NextResponse.redirect(`${payu.baseUrl}/checkout?error=invalid_hash`, 303);
    }
    if (status !== "success") {
      return NextResponse.redirect(`${payu.baseUrl}/checkout?error=payment_failed&txnid=${txnid}`, 303);
    }

    const matchingOrders = await prisma.order.findMany({ where: { payuTxnId: txnid }, take: 2 });
    if (matchingOrders.length !== 1) {
      console.error(
        matchingOrders.length > 1 ? "[PayU] Duplicate transaction id on orders" : "[PayU] Signed success for unknown order",
        { txnid },
      );
      return NextResponse.redirect(`${payu.baseUrl}/checkout?error=order_not_found&txnid=${txnid}`, 303);
    }
    const order = matchingOrders[0];

    // Belt-and-braces: the hash already covers `amount`, but also cross-check it
    // against what THIS order is supposed to cost before confirming anything.
    if (!payuAmountMatches(amount, Number(order.totalRs))) {
      console.error("[PayU] Amount mismatch", { txnid, posted: amount, expected: order.totalRs });
      return NextResponse.redirect(`${payu.baseUrl}/checkout?error=amount_mismatch&txnid=${txnid}`, 303);
    }

    const meta = parseOrderMeta(order.notes);

    // A later callback is a repair opportunity. Each operation below is
    // idempotent, including after the kitchen or driver advances the order.
    if (isPaidOrderState(order)) {
      await ensurePurchasedEntitlement(order, meta);
      await ensurePaidOrderAccounting(order);
      return NextResponse.redirect(completedOrderUrl(payu.baseUrl, order, meta, txnid, amount), 303);
    }

    // Atomically claim this callback. The old read-then-update guard allowed
    // two simultaneous PayU retries to both pass and duplicate credits,
    // referrals, notifications and active plans.
    const claimed = await prisma.$transaction(async (tx) => {
      const orderClaim = await tx.order.updateMany({
        where: {
          id: order.id,
          status: { in: ["PENDING_PAYMENT", "PAYMENT_FAILED"] },
          paymentStatus: { in: ["PENDING", "FAILED"] },
        },
        data: { status: "CONFIRMED", paymentStatus: "SUCCESS", payuPaymentId: mihpayid },
      });
      if (orderClaim.count !== 1) return false;
      const paymentClaim = await tx.payment.updateMany({
        where: { orderId: order.id, status: { in: ["PENDING", "FAILED"] } },
        data: { status: "SUCCESS", payuPaymentId: mihpayid, paidAt: new Date() },
      });
      if (paymentClaim.count !== 1) throw new Error("Pending payment row missing during PayU confirmation");
      return true;
    });

    if (!claimed) {
      const latest = await prisma.order.findUnique({ where: { id: order.id }, select: { status: true, paymentStatus: true } });
      if (latest && isPaidOrderState(latest)) {
        await ensurePurchasedEntitlement(order, meta);
        await ensurePaidOrderAccounting(order);
        return NextResponse.redirect(completedOrderUrl(payu.baseUrl, order, meta, txnid, amount), 303);
      }
      return NextResponse.redirect(`${payu.baseUrl}/checkout?error=order_state&txnid=${txnid}`, 303);
    }

    // Fulfillment comes before non-critical rewards and notifications. If the
    // process stops after payment confirmation, the next signed callback takes
    // the confirmed-order path above and repairs the missing entitlement.
    await ensurePurchasedEntitlement(order, meta);
    await ensurePaidOrderAccounting(order);

    // ════════════════════ NOTIFICATIONS (16A) ════════════════════
    try {
      const userForNotif = await prisma.user.findUnique({
        where: { id: order.userId },
        select: { name: true, email: true, phone: true },
      });
      const planLookupSlug = meta.planSlug || "";
      const planForNotif = planLookupSlug
        ? await prisma.mealPlan.findUnique({
            where: { slug: planLookupSlug },
            select: { displayName: true, slug: true },
          })
        : null;
      const planName = planForNotif?.displayName || planForNotif?.slug || (meta.isDigital ? "Digital Plan" : "Meal Plan");

      const customerResult = await sendNotification({
        userId: order.userId,
        toEmail: userForNotif?.email || email,
        toPhone: userForNotif?.phone || undefined,
        toName: userForNotif?.name || firstname,
        templateKey: "order_confirmed",
        vars: { orderNumber: order.orderNumber, planName, amount: String(order.totalRs) },
      });
      if (customerResult.errors.length) {
        console.error("[PayU] customer confirmation notification incomplete", customerResult.errors);
      }
      await notifyStaffByRoles(["OWNER", "ADMIN"], "staff_new_order", {
        orderNumber: order.orderNumber,
        customerName: userForNotif?.name || firstname,
        planName,
        amount: String(order.totalRs),
      });
    } catch (e) {
      console.error("[PayU] notification dispatch failed", e);
    }

    // ════════════════════ DIGITAL PATH ════════════════════
    if (meta.isDigital) {
      return NextResponse.redirect(`${payu.baseUrl}/dashboard?digital=1&order=${order.orderNumber}`, 303);
    }

    // ════════════════════ À LA CARTE PATH ════════════════════
    // A single-meal basket has no plan to activate. Without this branch the
    // physical path below runs resolvePurchasedPlan() with meta.planSlug
    // undefined and either logs "paid but NO meal plan found" or, worse,
    // resolves a default plan and creates a 30-day UserActivePlan for someone
    // who bought one salad. The order is already CONFIRMED and the payment
    // SUCCESS by this point; a dish order is complete at that.
    if (meta.kind === "DISH") {
      return NextResponse.redirect(
        `${payu.baseUrl}/order/confirmation?order=${order.orderNumber}`,
        303,
      );
    }

    // ════════════════════ PHYSICAL PATH ════════════════════
    return NextResponse.redirect(
      `${payu.baseUrl}/order/confirmation?txnid=${txnid}&amount=${amount}&order=${order.orderNumber}&window=${meta.deliveryWindow === "EVENING" ? "EVENING" : "MORNING"}`, 303
    );
  } catch (err) {
    console.error("[PayU success handler error]", err);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || req.nextUrl.origin;
    return NextResponse.redirect(`${baseUrl}/checkout?error=server_error`, 303);
  }
}

export async function GET(req: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || req.nextUrl.origin;
  return NextResponse.redirect(new URL("/plans", baseUrl), 303);
}
