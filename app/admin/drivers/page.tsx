// app/admin/drivers/page.tsx
// Phase 10 â€” driver roster. Create drivers, get their shareable link, activate/deactivate.

import { prisma } from "@/lib/prisma";
import DriversClient from "./DriversClient";

export const dynamic = "force-dynamic";

export default async function DriversPage() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  const drivers = await prisma.driver.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      phone: true,
      accessToken: true,
      isActive: true,
      _count: {
        select: {
          deliveries: { where: { deliveryDate: { gte: start, lt: end } } },
        },
      },
    },
  });

  return <DriversClient initialDrivers={drivers} />;
}