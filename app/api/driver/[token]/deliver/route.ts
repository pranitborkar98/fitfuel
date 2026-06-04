// app/api/driver/[token]/deliver/route.ts
// Phase 10 — driver marks a delivery delivered or failed. Token-authed; verifies
// the delivery is actually assigned to this driver before mutating.

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const driver = await prisma.driver.findUnique({
    where: { accessToken: token },
    select: { id: true, isActive: true },
  });
  if (!driver || !driver.isActive) {
    return NextResponse.json({ error: "Invalid or inactive driver link" }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    deliveryId?: string;
    result?: string;
    note?: string;
  };
  const { deliveryId, result, note } = body;

  if (!deliveryId || (result !== "delivered" && result !== "failed")) {
    return NextResponse.json(
      { error: "deliveryId and result ('delivered' | 'failed') required" },
      { status: 400 }
    );
  }

  // ownership check — the delivery must belong to THIS driver
  const existing = await prisma.delivery.findFirst({
    where: { id: deliveryId, assignedDriverId: driver.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Delivery not found for this driver" }, { status: 404 });
  }

  const updated = await prisma.delivery.update({
    where: { id: deliveryId },
    data:
      result === "delivered"
        ? { status: "DELIVERED", deliveredAt: new Date(), trackingNotes: note ?? undefined }
        : { status: "FAILED_DELIVERY", trackingNotes: note ?? undefined },
    select: { id: true, status: true, deliveredAt: true },
  });

  return NextResponse.json({ success: true, delivery: updated });
}
