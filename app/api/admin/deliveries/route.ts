// Today's dispatch board API. OWNER/ADMIN/DISPATCH only.

import { requireApiRole } from "@/lib/admin-auth";
import { todayIndiaDate } from "@/lib/date-only";
import { notifyDriverWhatsApp } from "@/lib/notify-driver";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const assignSchema = z
  .object({
    action: z.literal("assign"),
    deliveryId: z.string().cuid(),
    driverId: z.string().cuid().nullable(),
  })
  .strict();
const dispatchSchema = z
  .object({
    action: z.literal("dispatch"),
    deliveryIds: z.array(z.string().cuid()).min(1).max(200),
  })
  .strict();
const actionSchema = z.discriminatedUnion("action", [assignSchema, dispatchSchema]);

function todayWindow() {
  const start = todayIndiaDate();
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("dispatch");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const { start, end } = todayWindow();
  const deliveries = await prisma.delivery.findMany({
    where: { deliveryDate: { gte: start, lt: end } },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      deliveryDate: true,
      status: true,
      mealsIncluded: true,
      deliveredAt: true,
      assignedDriverId: true,
      trackingNotes: true,
      customerConfirmedAt: true,
      customerIssueNote: true,
      deliveryWindow: true,
      order: {
        select: {
          orderNumber: true,
          totalRs: true,
          paymentMethod: true,
          paymentStatus: true,
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
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, actionSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  try {
    if (body.action === "assign") {
      const delivery = await prisma.delivery.findUnique({
        where: { id: body.deliveryId },
        select: { id: true, status: true },
      });
      if (!delivery) return NextResponse.json({ error: "Delivery not found." }, { status: 404 });
      if (delivery.status === "DELIVERED" || delivery.status === "FAILED_DELIVERY") {
        return NextResponse.json({ error: "Completed deliveries cannot be reassigned." }, { status: 409 });
      }

      if (!body.driverId) {
        const updated = await prisma.delivery.update({
          where: { id: body.deliveryId },
          data: { assignedDriverId: null, driverName: null, driverPhone: null },
          select: { id: true, assignedDriverId: true },
        });
        return NextResponse.json({ delivery: updated });
      }

      const driver = await prisma.driver.findUnique({
        where: { id: body.driverId },
        select: { id: true, name: true, phone: true, isActive: true },
      });
      if (!driver?.isActive) {
        return NextResponse.json({ error: "Choose an active driver." }, { status: 400 });
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
    }

    const requestedIds = [...new Set(body.deliveryIds)];
    const toDispatch = await prisma.delivery.findMany({
      where: {
        id: { in: requestedIds },
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
    if (!toDispatch.length) {
      return NextResponse.json(
        { error: "Nothing is ready to dispatch. Assign an active driver first." },
        { status: 409 },
      );
    }

    const dispatchedIds = toDispatch.map((delivery) => delivery.id);
    await prisma.delivery.updateMany({
      where: { id: { in: dispatchedIds }, status: { in: ["PREPARING", "PACKED"] } },
      data: { status: "OUT_FOR_DELIVERY" },
    });

    const driverStops = new Map<string, { name: string; phone: string; count: number }>();
    for (const delivery of toDispatch) {
      if (!delivery.assignedDriverId || !delivery.driverPhone) continue;
      const current = driverStops.get(delivery.assignedDriverId);
      if (current) current.count += 1;
      else {
        driverStops.set(delivery.assignedDriverId, {
          name: delivery.driverName ?? "Driver",
          phone: delivery.driverPhone,
          count: 1,
        });
      }
    }

    const driverIds = [...driverStops.keys()];
    const drivers = await prisma.driver.findMany({
      where: { id: { in: driverIds }, isActive: true },
      select: { id: true, accessToken: true },
    });
    const tokenByDriver = new Map(drivers.map((driver) => [driver.id, driver.accessToken]));
    const notifications = await Promise.allSettled(
      driverIds.map(async (driverId) => {
        const info = driverStops.get(driverId);
        const token = tokenByDriver.get(driverId);
        if (!info || !token) return;
        await notifyDriverWhatsApp({
          driverName: info.name,
          driverPhone: info.phone,
          driverToken: token,
          stopCount: info.count,
        });
      }),
    );
    const notificationFailures = notifications.filter((result) => result.status === "rejected").length;

    return NextResponse.json({
      dispatched: dispatchedIds.length,
      dispatchedIds,
      skipped: requestedIds.length - dispatchedIds.length,
      notificationFailures,
    });
  } catch (error: unknown) {
    console.error("[admin/deliveries] operation failed", error);
    return NextResponse.json({ error: "Delivery operation failed." }, { status: 500 });
  }
}
