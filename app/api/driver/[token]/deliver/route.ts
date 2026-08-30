// Driver completion action. The URL token is a bearer credential and every
// mutation is constrained to an active stop assigned to that driver.

import { ensurePaidOrderAccounting } from "@/lib/order-accounting";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const deliveryResultSchema = z
  .object({
    deliveryId: z.string().cuid(),
    result: z.enum(["delivered", "failed"]),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length > 200) {
    return NextResponse.json({ error: "Invalid or inactive driver link" }, { status: 404 });
  }

  const driver = await prisma.driver.findUnique({
    where: { accessToken: token },
    select: { id: true, isActive: true },
  });
  if (!driver?.isActive) {
    return NextResponse.json({ error: "Invalid or inactive driver link" }, { status: 404 });
  }
  const rl = await enforceRateLimit(req, "mutation", `driver:${driver.id}`);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, deliveryResultSchema);
  if (!parsed.ok) return parsed.response;
  const { deliveryId, result, note } = parsed.data;
  if (result === "failed" && (!note || note.length < 3)) {
    return NextResponse.json({ error: "Add a short reason for the failed delivery." }, { status: 400 });
  }

  const existing = await prisma.delivery.findFirst({
    where: { id: deliveryId, assignedDriverId: driver.id },
    select: {
      id: true,
      status: true,
      order: {
        select: {
          id: true,
          userId: true,
          status: true,
          paymentMethod: true,
          paymentStatus: true,
          totalRs: true,
          creditAppliedRs: true,
          couponCode: true,
          discountRs: true,
        },
      },
    },
  });
  if (!existing) {
    return NextResponse.json({ error: "Delivery not found for this driver." }, { status: 404 });
  }
  if (existing.status !== "OUT_FOR_DELIVERY") {
    return NextResponse.json({ error: "Only an active, dispatched stop can be completed." }, { status: 409 });
  }
  if (["CANCELLED", "REFUNDED"].includes(existing.order.status)) {
    return NextResponse.json({ error: "This order is no longer active. Contact dispatch." }, { status: 409 });
  }

  try {
    const delivery = await prisma.$transaction(async (tx) => {
      const claim = await tx.delivery.updateMany({
        where: {
          id: deliveryId,
          assignedDriverId: driver.id,
          status: "OUT_FOR_DELIVERY",
        },
        data:
          result === "delivered"
            ? { status: "DELIVERED", deliveredAt: new Date(), trackingNotes: note || null }
            : { status: "FAILED_DELIVERY", deliveredAt: null, trackingNotes: note! },
      });
      if (claim.count !== 1) throw new Error("DELIVERY_ALREADY_COMPLETED");

      if (
        result === "delivered" &&
        existing.order.paymentMethod === "CASH_ON_DELIVERY" &&
        existing.order.paymentStatus !== "SUCCESS"
      ) {
        if (existing.order.paymentStatus === "REFUNDED") {
          throw new Error("ORDER_PAYMENT_FINAL");
        }
        await tx.order.update({
          where: { id: existing.order.id },
          data: { paymentStatus: "SUCCESS" },
        });
        await tx.payment.upsert({
          where: { orderId: existing.order.id },
          update: { status: "SUCCESS", paidAt: new Date(), failureReason: null },
          create: {
            orderId: existing.order.id,
            method: "CASH_ON_DELIVERY",
            status: "SUCCESS",
            amountRs: existing.order.totalRs,
            paidAt: new Date(),
          },
        });
      }

      return tx.delivery.findUniqueOrThrow({
        where: { id: deliveryId },
        select: { id: true, status: true, deliveredAt: true, trackingNotes: true },
      });
    });

    const collectedCod = result === "delivered" && existing.order.paymentMethod === "CASH_ON_DELIVERY";
    if (collectedCod) {
      await ensurePaidOrderAccounting({
        ...existing.order,
        paymentStatus: "SUCCESS",
      }).catch((error: unknown) => {
        console.error("[driver/deliver] COD accounting needs reconciliation", existing.order.id, error);
      });
    }

    return NextResponse.json({ success: true, delivery, paymentCollected: collectedCod });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "DELIVERY_ALREADY_COMPLETED") {
      return NextResponse.json({ error: "This stop was already completed." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "ORDER_PAYMENT_FINAL") {
      return NextResponse.json({ error: "This payment is final. Contact dispatch." }, { status: 409 });
    }
    console.error("[driver/deliver] completion failed", error);
    return NextResponse.json({ error: "Could not complete this stop. Try again." }, { status: 500 });
  }
}
