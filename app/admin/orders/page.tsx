// app/admin/orders/page.tsx
// Phase 15F — orders admin view (read-only).

import { requireSurface } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import OrdersView from "./OrdersView";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireSurface("orders");
  const db = prisma as any;

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true, orderNumber: true, status: true, paymentMethod: true, paymentStatus: true,
      subtotalRs: true, gstRs: true, discountRs: true, totalRs: true, couponCode: true,
      payuTxnId: true, createdAt: true, startDate: true, endDate: true,
      user: { select: { name: true, email: true, phone: true } },
      address: { select: { area: true, city: true, pincode: true } },
      items: { select: { diet: true, duration: true, mealsPerDay: true, totalRs: true, quantity: true } },
    },
  });

  return <OrdersView orders={JSON.parse(JSON.stringify(orders))} />;
}
