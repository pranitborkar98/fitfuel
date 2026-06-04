// app/admin/page.tsx
// Phase 10 â€” the dispatch board. Loads today's deliveries + drivers server-side.

import { prisma } from "@/lib/prisma";
import DispatchClient from "./DispatchClient";

export const dynamic = "force-dynamic";

function todayWindow() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0); // matches the driver route's date convention
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export default async function DispatchPage() {
  const { start, end } = todayWindow();

  const [deliveries, drivers] = await Promise.all([
    prisma.delivery.findMany({
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
        order: {
          select: {
            orderNumber: true,
            totalRs: true,
            paymentMethod: true,
            user: { select: { name: true, phone: true } },
            address: {
              select: { line1: true, line2: true, area: true, city: true, pincode: true, landmark: true },
            },
          },
        },
      },
    }),
    prisma.driver.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true },
    }),
  ]);

  return <DispatchClient initialDeliveries={deliveries} drivers={drivers} />;
}