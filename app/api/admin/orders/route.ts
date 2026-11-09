// app/api/admin/orders/route.ts
// Phase 15F — order payment reconciliation.
//   POST { action:"setPaymentStatus", id, paymentStatus }
// Orders surface (OWNER/ADMIN). Marking SUCCESS on a still-unpaid order also
// flips its status to CONFIRMED. Re-submitting SUCCESS safely repairs any
// missing entitlement, coupon, credit or referral accounting.

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ensurePaidOrderAccounting, reversePaidOrderAccounting } from "@/lib/order-accounting";
import { ensurePurchasedEntitlement, revokePurchasedEntitlement } from "@/lib/order-entitlement";
import { getPayuConfig } from "@/lib/payu-config";
import { requestPayuRefund } from "@/lib/payu-refund";
import { readJson } from "@/lib/validation/core";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";
const orderStatusSchema = z.object({
  action: z.literal("setPaymentStatus"),
  id: z.string().cuid(),
  paymentStatus: z.enum(["PENDING", "SUCCESS", "FAILED", "REFUNDED"]),
}).strict();

// refundViaPayu moves money at PayU and only then records the refund. It is
// separate from "Record refund" (setPaymentStatus REFUNDED), which records a
// refund already made in the PayU dashboard and never calls PayU.
const refundViaPayuSchema = z.object({
  action: z.literal("refundViaPayu"),
  id: z.string().cuid(),
  amountRs: z.number().int().min(1).optional(),
}).strict();

const adminOrderActionSchema = z.union([orderStatusSchema, refundViaPayuSchema]);

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("orders");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, adminOrderActionSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  if (body.action === "setPaymentStatus") {
    try {
      const data: Prisma.OrderUpdateInput = { paymentStatus: body.paymentStatus };
      const before = await prisma.order.findUnique({
        where: { id: body.id },
        select: {
          id: true, userId: true, orderNumber: true, status: true, paymentStatus: true,
          paymentMethod: true, totalRs: true, creditAppliedRs: true, notes: true,
          couponCode: true, discountRs: true, referralAttribution: true,
        },
      });
      if (!before) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      if (before.paymentStatus === body.paymentStatus) {
        if (body.paymentStatus === "SUCCESS") {
          await ensurePurchasedEntitlement(before);
          await ensurePaidOrderAccounting(before);
        }
        return NextResponse.json({
          ok: true,
          unchanged: true,
          reconciled: body.paymentStatus === "SUCCESS",
          order: { id: before.id, paymentStatus: before.paymentStatus, status: before.status },
        });
      }
      if (before.paymentStatus === "REFUNDED" && body.paymentStatus !== "REFUNDED") {
        return NextResponse.json({ error: "A refunded payment is final. Create a new order if the customer pays again." }, { status: 409 });
      }
      if (before.paymentStatus === "SUCCESS" && ["PENDING", "FAILED"].includes(body.paymentStatus)) {
        return NextResponse.json({ error: "A paid order can only be moved to Refunded." }, { status: 409 });
      }
      if (body.paymentStatus === "PENDING") {
        return NextResponse.json({ error: "A failed or completed payment cannot be moved back to Pending." }, { status: 409 });
      }
      if (body.paymentStatus === "REFUNDED" && before.paymentStatus !== "SUCCESS") {
        return NextResponse.json({ error: "Only a successful payment can be refunded." }, { status: 409 });
      }
      if (body.paymentStatus === "SUCCESS") {
        if (before.status === "PENDING_PAYMENT" || before.status === "PAYMENT_FAILED") {
          data.status = "CONFIRMED";
        }
      }
      if (body.paymentStatus === "REFUNDED") data.status = "REFUNDED";
      if (body.paymentStatus === "FAILED") {
        data.status = before.status === "PENDING_PAYMENT" ? "PAYMENT_FAILED" : "CANCELLED";
      }
      const order = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({ where: { id: body.id }, data });
        const paymentData: Prisma.PaymentUpdateInput = {
          status: body.paymentStatus,
          ...(body.paymentStatus === "SUCCESS" && before.paymentStatus !== "SUCCESS" ? { paidAt: new Date() } : {}),
          ...(["PENDING", "FAILED"].includes(body.paymentStatus) ? { paidAt: null } : {}),
          ...(body.paymentStatus === "FAILED"
            ? { failureReason: `Marked failed by ${admin.email ?? admin.id}` }
            : body.paymentStatus !== "REFUNDED" ? { failureReason: null } : {}),
        };
        await tx.payment.upsert({
          where: { orderId: body.id },
          update: paymentData,
          create: {
            orderId: body.id,
            method: before.paymentMethod,
            amountRs: before.totalRs,
            status: body.paymentStatus,
            ...(body.paymentStatus === "SUCCESS" ? { paidAt: new Date() } : {}),
            ...(body.paymentStatus === "FAILED" ? { failureReason: `Marked failed by ${admin.email ?? admin.id}` } : {}),
          },
        });
        await tx.adminNote.create({
          data: {
            userId: before.userId,
            authorId: admin.id,
            note: `Order ${before.orderNumber}: payment ${before.paymentStatus} → ${body.paymentStatus}; order ${before.status} → ${updated.status}.`,
          },
        });
        return updated;
      });
      if (body.paymentStatus === "SUCCESS") {
        await ensurePurchasedEntitlement(order);
        await ensurePaidOrderAccounting(order);
      }
      if (body.paymentStatus === "REFUNDED") {
        await reversePaidOrderAccounting(order);
        await revokePurchasedEntitlement(order.id);
      } else if (body.paymentStatus === "FAILED") {
        await reversePaidOrderAccounting(order);
        await revokePurchasedEntitlement(order.id);
      }
      return NextResponse.json({ ok: true, order: { id: order.id, paymentStatus: order.paymentStatus, status: order.status } });
    } catch (error: unknown) {
      console.error("[admin/orders] reconciliation failed", error);
      return NextResponse.json({ error: "Order reconciliation failed." }, { status: 500 });
    }
  }

  if (body.action === "refundViaPayu") {
    try {
      const payu = getPayuConfig();
      if (!payu) return NextResponse.json({ error: "Online payment is not configured." }, { status: 503 });
      const before = await prisma.order.findUnique({
        where: { id: body.id },
        select: {
          id: true, userId: true, orderNumber: true, status: true, paymentStatus: true,
          paymentMethod: true, totalRs: true, payuTxnId: true, payuPaymentId: true,
          notes: true, couponCode: true, discountRs: true, referralAttribution: true,
          creditAppliedRs: true,
        },
      });
      if (!before) return NextResponse.json({ error: "Order not found" }, { status: 404 });
      if (before.paymentMethod !== "PAYU") {
        return NextResponse.json({ error: "Only PayU orders can be refunded through PayU." }, { status: 409 });
      }
      if (before.paymentStatus !== "SUCCESS") {
        return NextResponse.json({ error: "Only a successful payment can be refunded." }, { status: 409 });
      }
      if (!before.payuPaymentId || !before.payuTxnId) {
        return NextResponse.json({ error: "This order has no PayU payment reference, so PayU cannot refund it." }, { status: 409 });
      }
      const amountRs = body.amountRs ?? before.totalRs;
      if (amountRs > before.totalRs) {
        return NextResponse.json({ error: "Refund amount cannot exceed the order total." }, { status: 400 });
      }

      // Money moves first. The order is only marked refunded after PayU
      // accepts the refund, so a refused refund leaves no state change.
      const result = await requestPayuRefund(payu, {
        mihpayid: before.payuPaymentId,
        txnid: before.payuTxnId,
        amountRs,
      });
      if (!result.ok) {
        return NextResponse.json({ error: `PayU refund failed: ${result.error}` }, { status: 502 });
      }

      const refundRecord: Prisma.InputJsonObject = {
        source: "payu_refund",
        requestId: result.requestId,
        mihpayid: result.mihpayid,
        bankRefNum: result.bankRefNum,
        amountRs,
        at: new Date().toISOString(),
      };
      const mergeRefundRecord = (existing: Prisma.JsonValue | null): Prisma.InputJsonObject => {
        if (typeof existing === "object" && existing !== null && !Array.isArray(existing)) {
          return { ...existing, refund: refundRecord };
        }
        return { refund: refundRecord };
      };

      // A partial refund leaves the order paid. Only the refund record and
      // an admin note are added; nothing is reversed.
      if (amountRs !== before.totalRs) {
        await prisma.$transaction(async (tx) => {
          const payment = await tx.payment.findUnique({ where: { orderId: before.id }, select: { rawResponse: true } });
          const rawResponse = mergeRefundRecord(payment?.rawResponse ?? null);
          await tx.payment.upsert({
            where: { orderId: before.id },
            update: { rawResponse },
            create: {
              orderId: before.id,
              method: before.paymentMethod,
              amountRs: before.totalRs,
              status: "SUCCESS",
              payuTxnId: before.payuTxnId,
              payuPaymentId: before.payuPaymentId,
              rawResponse,
            },
          });
          await tx.adminNote.create({
            data: {
              userId: before.userId,
              authorId: admin.id,
              note: `Order ${before.orderNumber}: partial PayU refund of Rs ${amountRs} accepted (request ${result.requestId}); order stays paid.`,
            },
          });
        });
        return NextResponse.json({
          ok: true,
          partial: true,
          requestId: result.requestId,
          order: { id: before.id, paymentStatus: before.paymentStatus, status: before.status },
        });
      }

      const order = await prisma.$transaction(async (tx) => {
        const updated = await tx.order.update({
          where: { id: before.id },
          data: { paymentStatus: "REFUNDED", status: "REFUNDED" },
        });
        const payment = await tx.payment.findUnique({ where: { orderId: before.id }, select: { rawResponse: true } });
        const rawResponse = mergeRefundRecord(payment?.rawResponse ?? null);
        await tx.payment.upsert({
          where: { orderId: before.id },
          update: { status: "REFUNDED", rawResponse },
          create: {
            orderId: before.id,
            method: before.paymentMethod,
            amountRs: before.totalRs,
            status: "REFUNDED",
            payuTxnId: before.payuTxnId,
            payuPaymentId: before.payuPaymentId,
            rawResponse,
          },
        });
        await tx.adminNote.create({
          data: {
            userId: before.userId,
            authorId: admin.id,
            note: `Order ${before.orderNumber}: PayU refund of Rs ${amountRs} accepted (request ${result.requestId}); payment SUCCESS to REFUNDED.`,
          },
        });
        return updated;
      });
      await reversePaidOrderAccounting(order);
      await revokePurchasedEntitlement(order.id);
      return NextResponse.json({
        ok: true,
        requestId: result.requestId,
        order: { id: order.id, paymentStatus: order.paymentStatus, status: order.status },
      });
    } catch (error: unknown) {
      console.error("[admin/orders] PayU refund failed", error);
      return NextResponse.json({ error: "PayU refund failed." }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
