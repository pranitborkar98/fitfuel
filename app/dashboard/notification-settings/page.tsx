// app/dashboard/notification-settings/page.tsx
// Phase 16C, customer facing notification preference toggles.
//
// The server owns the frame: title, the standing promise about order and
// delivery mail, and the wrap. Only the toggles and the save have state, so
// only they are a client component. DESIGN.md §7.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { screen, body, label, APP_MAX } from "@/app/_app/theme";
import NotificationSettingsClient from "./NotificationSettingsClient";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: APP_MAX, margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

export default async function NotificationSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/notification-settings");
  }

  let prefs = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });
  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { userId: session.user.id },
    });
  }

  return (
    <div style={{ ...WRAP, paddingTop: 26 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={screen()}>Notifications</h1>
        <span style={label(12)}>What we send, and when</span>
      </header>
      <p style={body(14, { margin: "12px 0 0", maxWidth: "62ch" })}>
        Order confirmations and delivery updates always send. Everything below is yours to
        turn off.
      </p>

      <NotificationSettingsClient
        initialPrefs={{
          weeklyDigest: prefs.weeklyDigest,
          morningPush: prefs.morningPush,
          eveningRecap: prefs.eveningRecap,
          nudges: prefs.nudges,
          marketing: prefs.marketing,
          emailEnabled: prefs.emailEnabled,
          whatsappEnabled: prefs.whatsappEnabled,
        }}
      />
    </div>
  );
}
