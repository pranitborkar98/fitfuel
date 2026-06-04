// app/api/admin/deliveries/route.ts
// Phase 10 â€” admin view + control of today's deliveries.
//   GET            -> today's deliveries (all drivers)
//   POST assign    -> { action:"assign", deliveryId, driverId|null }
//   POST dispatch  -> { action:"dispatch", deliveryIds:[...] }  (PREPARING/PACKED -> OUT_FOR_DELIVERY)

import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function todayWindow() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { start, end } = todayWindow();
  const deliveries = await prisma.delivery.findMany({
    where: { deliveryDate: { gte: start, lt: end } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    select: {
      id: true, status: true, mealsIncluded: true, deliveredAt: true,
      assignedDriverId: true, trackingNotes: true, customerConfirmedAt: true,
      order: {
        select: {
          orderNumber: true, totalRs: true, paymentMethod: true,
          user: { select: { name: true, phone: true } },
          address: { select: { line1: true, line2: true, area: true, city: true, pincode: true, landmark: true } },
        },
      },
    },
  });
  return NextResponse.json({ deliveries });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    action?: "assign" | "dispatch";
    deliveryId?: string;
    driverId?: string | null;
    deliveryIds?: string[];
  };

  // â”€â”€ assign a driver to a delivery (driverId null = unassign) â”€â”€
  if (body.action === "assign") {
    if (!body.deliveryId) {
      return NextResponse.json({ error: "deliveryId required" }, { status: 400 });
    }
    if (body.driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: body.driverId },
        select: { id: true, name: true, phone: true, isActive: true },
      });
      if (!driver || !driver.isActive) {
        return NextResponse.json({ error: "Driver not found or inactive" }, { status: 400 });
      }
      // also denormalise driverName/driverPhone (the Delivery model carries them)
      const updated = await prisma.delivery.update({
        where: { id: body.deliveryId },
        data: { assignedDriverId: driver.id, driverName: driver.name, driverPhone: driver.phone },
        select: { id: true, assignedDriverId: true },
      });
      return NextResponse.json({ delivery: updated });
    } else {
      const updated = await prisma.delivery.update({
        where: { id: body.deliveryId },
        data: { assignedDriverId: null, driverName: null, driverPhone: null },
        select: { id: true, assignedDriverId: true },
      });
      return NextResponse.json({ delivery: updated });
    }
  }

  // â”€â”€ dispatch: flip assigned, not-yet-out deliveries to OUT_FOR_DELIVERY â”€â”€
  if (body.action === "dispatch") {
    const ids = body.deliveryIds ?? [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "deliveryIds required" }, { status: 400 });
    }
    const result = await prisma.delivery.updateMany({
      where: {
        id: { in: ids },
        assignedDriverId: { not: null }, // can't dispatch what isn't assigned
        status: { in: ["PREPARING", "PACKED"] },
      },
      data: { status: "OUT_FOR_DELIVERY" },
    });
    if (result.count === 0) {
      return NextResponse.json(
        { error: "Nothing dispatched â€” assign a driver first" },
        { status: 400 }
      );
    }
    return NextResponse.json({ dispatched: result.count });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}