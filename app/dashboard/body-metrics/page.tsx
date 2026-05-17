import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BodyMetricsClient from "./BodyMetricsClient";

export const metadata = {
  title: "Body Metrics — FitFuel",
  description: "Track your 13 body composition parameters with MEDITIVE BLE scale.",
};

export default async function BodyMetricsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/body-metrics");

  // Fetch user profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true },
  });

  // Fetch latest body metric reading (if model exists)
  // const latest = await prisma.bodyMetric.findFirst({
  //   where: { userId: session.user.id },
  //   orderBy: { recordedAt: "desc" },
  // });

  return <BodyMetricsClient user={user} />;
}
