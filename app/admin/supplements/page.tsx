// app/admin/supplements/page.tsx
// Phase 18-2 — Admin entry for supplements catalog + affiliate links + analytics.
// Auth-gated to OWNER + ADMIN via SURFACE_ROLES.

import { requireSurface } from "@/lib/admin-auth";
import SupplementsAdminClient from "./SupplementsAdminClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireSurface("supplements");
  return <SupplementsAdminClient />;
}
