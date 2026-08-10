// app/dashboard/profile/page.tsx
//
// The frame is server rendered: title, who you are signed in as, and the
// wrap. The form below it is the only part with state.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { C, screen, body, label, APP_MAX } from "@/app/_app/theme";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: APP_MAX, margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true, email: true, phone: true, image: true,
      profile: { select: { dietPreference: true, fitnessGoal: true, gender: true } },
    },
  });

  if (!user) redirect("/auth/signin?callbackUrl=/dashboard/profile");

  return (
    <div style={{ ...WRAP, paddingTop: 26 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={screen()}>Profile</h1>
        <span style={label(12)}>Your details and plan</span>
      </header>
      <p style={{ ...body(14, { color: C.dim }), margin: "12px 0 0" }}>
        Signed in as {user.email}
      </p>

      <ProfileClient
        initial={{
          name: user.name ?? "",
          phone: user.phone ?? "",
          dietPreference: user.profile?.dietPreference ?? "",
          fitnessGoal: user.profile?.fitnessGoal ?? "",
          gender: user.profile?.gender ?? "",
        }}
        email={user.email ?? ""}
      />
    </div>
  );
}
