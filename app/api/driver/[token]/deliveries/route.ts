// Driver's India-calendar delivery list. The URL token is a bearer credential.

import { todayIndiaDate } from "@/lib/date-only";
import { DELIVERY_WINDOWS, normalizeDeliveryWindow } from "@/lib/delivery-windows";
import { sendNotification } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length > 200) {
    return NextResponse.json({ error: "Invalid or inactive driver link" }, { status: 404 });
  }

  const driver = await prisma.driver.findUnique({
    where: { accessToken: token },
    select: { id: true, name: true, phone: true, isActive: true },
  });
  if (!driver?.isActive) {
    return NextResponse.json({ error: "Invalid or inactive driver link" }, { status: 404 });
  }
  const rl = await enforceRateLimit(req, "read", `driver:${driver.id}`);
  if (!rl.ok) return rl.response;

  const start = todayIndiaDate();
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const deliveries = await prisma.delivery.findMany({
    where: {
      assignedDriverId: driver.id,
      deliveryDate: { gte: start, lt: end },
    },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      status: true,
      mealsIncluded: true,
      deliveredAt: true,
      customerConfirmedAt: true,
      customerIssueNote: true,
      trackingNotes: true,
      deliveryWindow: true,
      dispatchNotifiedAt: true,
      order: {
        select: {
          orderNumber: true,
          totalRs: true,
          paymentMethod: true,
          paymentStatus: true,
          userId: true,
          user: { select: { name: true, email: true, phone: true } },
          address: {
            select: {
              line1: true,
              line2: true,
              area: true,
              city: true,
              pincode: true,
              landmark: true,
            },
          },
        },
      },
    },
  });

  // Only an actually-dispatched stop may tell a customer that it is on the way.
  const candidates = deliveries.filter(
    (delivery) => delivery.status === "OUT_FOR_DELIVERY" && !delivery.dispatchNotifiedAt,
  );
  await Promise.all(
    candidates.map(async (delivery) => {
      try {
        const claim = await prisma.delivery.updateMany({
          where: {
            id: delivery.id,
            status: "OUT_FOR_DELIVERY",
            dispatchNotifiedAt: null,
          },
          data: { dispatchNotifiedAt: new Date() },
        });
        if (!claim.count) return;

        const result = await sendNotification({
          userId: delivery.order.userId,
          toEmail: delivery.order.user.email || undefined,
          toPhone: delivery.order.user.phone || undefined,
          toName: delivery.order.user.name || undefined,
          templateKey: "delivery_dispatched",
          vars: {
            windowLabel: DELIVERY_WINDOWS[normalizeDeliveryWindow(delivery.deliveryWindow)].time,
            driverName: driver.name || "Driver",
            driverPhone: driver.phone || "",
          },
        });
        if (result.errors.length || result.email === "failed" || result.whatsapp === "failed") {
          await prisma.delivery.updateMany({
            where: { id: delivery.id, status: "OUT_FOR_DELIVERY" },
            data: { dispatchNotifiedAt: null },
          });
        }
      } catch (error: unknown) {
        await prisma.delivery.updateMany({
          where: { id: delivery.id, status: "OUT_FOR_DELIVERY" },
          data: { dispatchNotifiedAt: null },
        }).catch(() => undefined);
        console.error("[driver/deliveries] dispatch notification failed", error);
      }
    }),
  );

  return NextResponse.json({
    driverName: driver.name,
    deliveries,
  });
}
