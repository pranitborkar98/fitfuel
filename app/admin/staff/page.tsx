// app/admin/staff/page.tsx
// Phase 15-STAFF — owner-only staff & roles management.

import { requireSurface } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import StaffClient from "./StaffClient";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const me = await requireSurface("staff"); // OWNER only

  const staff = await prisma.user.findMany({
    where: { role: { in: ["OWNER", "ADMIN", "KITCHEN", "DISPATCH"] } },
    orderBy: [{ role: "asc" }, { email: "asc" }],
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  return <StaffClient initialStaff={staff} meId={me.id} />;
}
