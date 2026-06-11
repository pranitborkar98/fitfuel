// app/api/driver/[token]/deliveries/route.ts
// Phase 10 — driver's today deliveries. Authed by the token in the URL (no session).
// Phase 16A: fires `delivery_dispatched` to the customer on first GET per delivery
//           (idempotent via Delivery.dispatchNotifiedAt). Atomic conditional update
//           prevents duplicate sends if the driver opens the app multiple times.

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { fireNotification } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const driver = await prisma.driver.findUnique({
    where: { accessToken: token },
    select: { id: true, name: true, phone: true, isActive: true },
  });
  if (!driver || !driver.isActive) {
    return NextResponse.json({ error: "Invalid or inactive driver link" }, { status: 404 });
  }

  // today's window (UTC midnight, matches the app's date convention)
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const deliveries = await (prisma as any).delivery.findMany({
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
          userId: true,
          user: { select: { name: true, email: true, phone: true } },
          address: {
            select: {
              line1: true, line2: true, area: true,
              city: true, pincode: true, landmark: true,
            },
          },
        },
      },
    },
  });

  // ────────────── Phase 16A: dispatch notification ──────────────
  // Atomic per-delivery: conditional updateMany ensures only ONE GET
  // triggers the notification even if the driver opens the app twice.
  const candidates = deliveries.filter((d: any) => !d.dispatchNotifiedAt);
  for (const d of candidates) {
    try {
      const res = await (prisma as any).delivery.updateMany({
        where: { id: d.id, dispatchNotifiedAt: null },
        data:  { dispatchNotifiedAt: new Date() },
      });
      if (res.count > 0) {
        fireNotification({
          userId: d.order?.userId,
          toEmail: d.order?.user?.email || undefined,
          toPhone: d.order?.user?.phone || undefined,
          toName:  d.order?.user?.name  || undefined,
          templateKey: "delivery_dispatched",
          vars: {
            windowLabel: d.deliveryWindow === "EVENING" ? "5\u20138 PM" : "7\u201310 AM",
            driverName:  driver.name || "Driver",
            driverPhone: driver.phone || "",
          },
        });
      }
    } catch (e) {
      console.error("[driver/deliveries] dispatch-notify failed (non-blocking)", e);
    }
  }

  return NextResponse.json({ driverName: driver.name, deliveries });
}
