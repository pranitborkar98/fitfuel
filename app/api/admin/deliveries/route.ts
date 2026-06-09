// app/api/admin/deliveries/route.ts
// Phase 10 + 15-RBAC -- admin view + control of today's deliveries.
//   GET            -> today's deliveries (all drivers)
//   POST assign    -> { action:"assign", deliveryId, driverId|null }
//   POST dispatch  -> { action:"dispatch", deliveryIds:[...] }
// Dispatch surface only (OWNER/ADMIN/DISPATCH). Returns customer PII, so a
// KITCHEN role is rejected with 403.

import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/admin-auth";
import { notifyDriverWhatsApp } from "@/lib/notify-driver";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function todayWindow() {
  const nowIST = new Date(Date.now() + 5.5 * 60 * 60 * 1000);
  const start = new Date(
    Date.UTC(nowIST.getUTCFullYear(), nowIST.getUTCMonth(), nowIST.getUTCDate())
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function GET() {
  const admin = await requireApiRole("dispatch");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { start, end } = todayWindow();
  const deliveries = await prisma.delivery.findMany({
    where: { deliveryDate: { gte: start, lt: end } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      status: true,
      mealsIncluded: true,
      deliveredAt: true,
      assignedDriverId: true,
      trackingNotes: true,
      customerConfirmedAt: true,
      deliveryWindow: true,
      order: {
        select: {
          orderNumber: true,
          totalRs: true,
          paymentMethod: true,
          user: { select: { name: true, phone: true } },
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
  return NextResponse.json({ deliveries });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("dispatch");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as {
    action?: "assign" | "dispatch";
    deliveryId?: string;
    driverId?: string | null;
    deliveryIds?: string[];
  };

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
      const updated = await prisma.delivery.update({
        where: { id: body.deliveryId },
        data: {
          assignedDriverId: driver.id,
          driverName: driver.name,
          driverPhone: driver.phone,
        },
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

  if (body.action === "dispatch") {
    const ids = body.deliveryIds ?? [];
    if (ids.length === 0) {
      return NextResponse.json({ error: "deliveryIds required" }, { status: 400 });
    }

    const toDispatch = await prisma.delivery.findMany({
      where: {
        id: { in: ids },
        assignedDriverId: { not: null },
        status: { in: ["PREPARING", "PACKED"] },
      },
      select: {
        id: true,
        assignedDriverId: true,
        driverName: true,
        driverPhone: true,
      },
    });

    if (toDispatch.length === 0) {
      return NextResponse.json(
        { error: "Nothing to dispatch -- assign a driver first" },
        { status: 400 }
      );
    }

    await prisma.delivery.updateMany({
      where: { id: { in: toDispatch.map((d) => d.id) } },
      data: { status: "OUT_FOR_DELIVERY" },
    });

    const driverStops: Record<string, { name: string; phone: string; count: number }> = {};
    for (const d of toDispatch) {
      if (!d.assignedDriverId || !d.driverPhone) continue;
      if (!driverStops[d.assignedDriverId]) {
        driverStops[d.assignedDriverId] = {
          name: d.driverName ?? "Driver",
          phone: d.driverPhone,
          count: 0,
        };
      }
      driverStops[d.assignedDriverId].count += 1;
    }

    const driverIds = Object.keys(driverStops);
    const drivers = await prisma.driver.findMany({
      where: { id: { in: driverIds } },
      select: { id: true, accessToken: true },
    });
    const tokenMap: Record<string, string> = {};
    for (const dr of drivers) tokenMap[dr.id] = dr.accessToken;

    const notifyPromises = driverIds.map((dId) => {
      const info = driverStops[dId];
      const token = tokenMap[dId];
      if (!token) return Promise.resolve();
      return notifyDriverWhatsApp({
        driverName: info.name,
        driverPhone: info.phone,
        driverToken: token,
        stopCount: info.count,
      });
    });
    Promise.allSettled(notifyPromises).catch(() => {});

    return NextResponse.json({ dispatched: toDispatch.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
