// app/api/driver/[token]/deliveries/route.ts
// Phase 10 — driver's today deliveries. Authed by the token in the URL (no session).

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const driver = await prisma.driver.findUnique({
    where: { accessToken: token },
    select: { id: true, name: true, isActive: true },
  });
  if (!driver || !driver.isActive) {
    return NextResponse.json({ error: "Invalid or inactive driver link" }, { status: 404 });
  }

  // today's window (UTC midnight, matches the app's date convention)
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
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
      order: {
        select: {
          orderNumber: true,
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

  return NextResponse.json({ driverName: driver.name, deliveries });
}
