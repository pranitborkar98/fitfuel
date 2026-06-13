// app/admin/partners/page.tsx
import { requireSurface } from "@/lib/admin-auth";
import PartnersClient from "./PartnersClient";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  await requireSurface("partners");
  return <PartnersClient />;
}
