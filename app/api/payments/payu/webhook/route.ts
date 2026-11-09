// app/api/payments/payu/webhook/route.ts
// PayU server-to-server payment webhook (IPN).
//
// PayU can be configured, via the PayU integration team, to POST the same
// payment response object it sends to the success and failure URLs to this
// URL as well, over a server-to-server form post. That is the whole point of
// this endpoint: when a customer pays and closes the browser before PayU
// posts back to the success URL, the order would otherwise stay
// PENDING_PAYMENT with no server-side reconciliation. A verified webhook
// notification repairs that.
//
// Verification is the same reverse hash as the browser callbacks
// (lib/payu-response.ts). An unverified notification changes nothing and gets
// a 400. A verified notification is recorded on the Payment row, and a
// verified success for a still-unpaid order confirms it through the same
// atomic claim the success route uses, so entitlement and accounting are
// repaired exactly once. The success and failure redirect flow is untouched:
// this route never redirects.
//
// Setup still needed at PayU (needs chintu / the PayU account): the webhook
// URL must be registered with PayU against the ws_online_response parameter,
// and the live merchant key and salt must be configured. Until then this
// route receives nothing, which is safe.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyStaffByRoles, sendNotification } from "@/lib/notify";
import { getPayuConfig } from "@/lib/payu-config";
import { ensurePurchasedEntitlement, parseOrderMeta, type OrderMeta } from "@/lib/order-entitlement";
import { ensurePaidOrderAccounting } from "@/lib/order-accounting";
import { payuAmountMatches, readPayuResponse, safePayuFailureMessage, verifyPayuResponse, type PayuResponse } from "@/lib/payu-response";
import type { Order, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

function isPaidOrderState(order: { paymentStatus: string; status: string }) {
  return order.paymentStatus === "SUCCESS" && ["CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED"].includes(order.status);
}

function webhookRecord(response: PayuResponse): Prisma.InputJsonObject {
  return {
    source: "payu_webhook",
    status: response.status,
    mihpayid: response.mihpayid || null,
    unmappedStatus: response.unmappedStatus || null,
    receivedAt: new Date().toISOString(),
  };
}

function mergeRawResponse(existing: Prisma.JsonValue | null, record: Prisma.InputJsonObject): Prisma.InputJsonObject {
  if (typeof existing === "object" && existing !== null && !Array.isArray(existing)) {
    return { ...existing, webhook: record };
  }
  return existing === null || existing === undefined ? { webhook: record } : { previous: existing, webhook: record };
}

async function recordWebhookOnPayment(orderId: string, response: PayuResponse, amountRs: number): Promise<void> {
  const payment = await prisma.payment.findUnique({ where: { orderId }, select: { rawResponse: true } });
  const record = webhookRecord(response);
  await prisma.payment.upsert({
    where: { orderId },
    update: {
      payuPaymentId: response.mihpayid || undefined,
      rawResponse: mergeRawResponse(payment?.rawResponse ?? null, record),
    },
    create: {
      orderId,
      method: "PAYU",
      status: "PENDING",
      amountRs,
      payuTxnId: response.txnid,
      payuPaymentId: response.mihpayid || null,
      rawResponse: { webhook: record },
    },
  });
}

async function notifyConfirmation(order: Order, meta: OrderMeta, email: string, firstname: string): Promise<void> {
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
      console.error("[PayU webhook] customer confirmation notification incomplete", customerResult.errors);
    }
    await notifyStaffByRoles(["OWNER", "ADMIN"], "staff_new_order", {
      orderNumber: order.orderNumber,
      customerName: userForNotif?.name || firstname,
      planName,
      amount: String(order.totalRs),
    });
  } catch (error: unknown) {
    console.error("[PayU webhook] notification dispatch failed", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const payu = getPayuConfig();
    if (!payu) {
      console.error("[PayU webhook] Missing or invalid payment configuration");
      return NextResponse.json({ error: "Payment callback is not configured." }, { status: 503 });
    }

    const response = readPayuResponse(await req.formData());
    const { status, txnid, amount, firstname, email, mihpayid } = response;

    // Fail closed: no signature, no state change of any kind.
    if (!verifyPayuResponse(response, payu)) {
      console.error("[PayU webhook] Hash mismatch", { txnid });
      return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    const matchingOrders = await prisma.order.findMany({ where: { payuTxnId: txnid }, take: 2 });
    if (matchingOrders.length !== 1) {
      console.error(
        matchingOrders.length > 1 ? "[PayU webhook] Duplicate transaction id on orders" : "[PayU webhook] Signed notification for unknown order",
        { txnid },
      );
      return NextResponse.json({ received: true, action: "ignored", reason: matchingOrders.length > 1 ? "duplicate_txnid" : "unknown_txnid" });
    }
    const order = matchingOrders[0];

    // Belt-and-braces: the hash already covers `amount`, but also cross-check
    // it against what THIS order is supposed to cost before confirming anything.
    if (!payuAmountMatches(amount, Number(order.totalRs))) {
      console.error("[PayU webhook] Amount mismatch", { txnid, posted: amount, expected: order.totalRs });
      return NextResponse.json({ received: true, action: "ignored", reason: "amount_mismatch" });
    }

    const meta = parseOrderMeta(order.notes);
    await recordWebhookOnPayment(order.id, response, Number(order.totalRs));

    if (status !== "success") {
      if (isPaidOrderState(order)) {
        return NextResponse.json({ received: true, action: "recorded", orderNumber: order.orderNumber });
      }
      const safeMsg = safePayuFailureMessage(response.errorMessage);
      await prisma.$transaction(async (tx) => {
        await tx.order.updateMany({
          where: { id: order.id, status: "PENDING_PAYMENT", paymentStatus: "PENDING" },
          data: { status: "PAYMENT_FAILED", paymentStatus: "FAILED", payuPaymentId: mihpayid || null },
        });
        await tx.payment.updateMany({
          where: { orderId: order.id, status: "PENDING" },
          data: { status: "FAILED", payuPaymentId: mihpayid || null, failureReason: safeMsg },
        });
      });
      console.error("[PayU webhook] Payment failed", { txnid, reason: safeMsg });
      return NextResponse.json({ received: true, action: "failed", orderNumber: order.orderNumber });
    }

    // A later notification is a repair opportunity. Each operation below is
    // idempotent, including after the kitchen or driver advances the order.
    if (isPaidOrderState(order)) {
      await ensurePurchasedEntitlement(order, meta);
      await ensurePaidOrderAccounting(order);
      return NextResponse.json({ received: true, action: "recorded", orderNumber: order.orderNumber });
    }

    // Atomically claim this notification, with the same guard as the success
    // route, so a webhook and a browser callback racing each other confirm
    // the order exactly once.
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
      if (paymentClaim.count !== 1) throw new Error("Pending payment row missing during PayU webhook confirmation");
      return true;
    });

    if (!claimed) {
      const latest = await prisma.order.findUnique({ where: { id: order.id }, select: { status: true, paymentStatus: true } });
      if (latest && isPaidOrderState(latest)) {
        await ensurePurchasedEntitlement(order, meta);
        await ensurePaidOrderAccounting(order);
        return NextResponse.json({ received: true, action: "recorded", orderNumber: order.orderNumber });
      }
      console.error("[PayU webhook] Order state did not allow confirmation", { txnid });
      return NextResponse.json({ received: true, action: "ignored", reason: "order_state" });
    }

    await ensurePurchasedEntitlement(order, meta);
    await ensurePaidOrderAccounting(order);
    await notifyConfirmation(order, meta, email, firstname);
    console.log("[PayU webhook] Order confirmed from webhook", { txnid, orderNumber: order.orderNumber });
    return NextResponse.json({ received: true, action: "confirmed", orderNumber: order.orderNumber });
  } catch (error: unknown) {
    console.error("[PayU webhook handler error]", error);
    return NextResponse.json({ error: "Webhook could not be processed." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "PayU webhook accepts POST only." }, { status: 405 });
}
