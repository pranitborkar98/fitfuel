// app/dashboard/progress/page.tsx
// Phase 11 — Progress Tracking page (server component).
// Auth-guarded. Fetches all chart data server-side, passes to the client.

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getProgressData } from "@/lib/progress";
import ProgressClient from "./ProgressClient";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/api/auth/signin?callbackUrl=/dashboard/progress");
  }

  const data = await getProgressData(session.user.id);

  return <ProgressClient data={data} userName={session.user.name ?? null} />;
}
