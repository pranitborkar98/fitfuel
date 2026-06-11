// app/admin/notifications/page.tsx
import { requireSurface } from "@/lib/admin-auth";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireSurface("notifications");
  return <NotificationsClient />;
}
