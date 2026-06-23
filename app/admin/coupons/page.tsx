// app/admin/coupons/page.tsx
// R-PRICE-c (#193) — admin coupon management. Coupons surface (OWNER/ADMIN).
import { requireSurface } from "@/lib/admin-auth";
import CouponsClient from "./CouponsClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireSurface("coupons");
  return <CouponsClient />;
}
