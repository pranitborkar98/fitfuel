// app/dashboard/progress/page.tsx
// Phase 11, progress tracking. Auth guarded, all chart data fetched server
// side and handed to the client, which owns only the metric toggle.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getProgressData } from "@/lib/progress";
import { screen, body, label, APP_MAX } from "@/app/_app/theme";
import ProgressClient from "./ProgressClient";

export const metadata: Metadata = { title: "Progress" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: APP_MAX, margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/progress");
  }

  const data = await getProgressData(session.user.id);

  return (
    <div style={{ ...WRAP, paddingTop: 26 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={screen()}>Progress</h1>
        <span style={label(12)}>Consistency and the trend line</span>
      </header>
      {data.planName ? (
        <p style={body(14, { margin: "12px 0 0" })}>{data.planName}, last 30 days.</p>
      ) : null}

      <ProgressClient data={data} />
    </div>
  );
}
