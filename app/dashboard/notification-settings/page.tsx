// app/dashboard/notification-settings/page.tsx
// Phase 16C \u2014 customer-facing notification preference toggles.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import NotificationSettingsClient from "./NotificationSettingsClient";

export const dynamic = "force-dynamic";

export default async function NotificationSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/notification-settings");
  }

  const db = prisma as any;
  let prefs = await db.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });
  if (!prefs) {
    prefs = await db.notificationPreference.create({
      data: { userId: session.user.id },
    });
  }

  return <NotificationSettingsClient initialPrefs={prefs} />;
}
