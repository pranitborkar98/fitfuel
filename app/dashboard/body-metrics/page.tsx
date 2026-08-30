import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BodyMetricsClient from "./BodyMetricsClient";

export const metadata = {
  title: "Body measurements — FitFuel",
  description: "Track weight and consumer-scale body-composition estimates over time.",
};

export default async function BodyMetricsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/body-metrics");

  // Fetch user + their profile (height, age, gender for BIA calculations)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      profile: {
        select: {
          heightCm: true,
          age: true,
          gender: true,
        },
      },
    },
  });

  // Fetch latest body metric reading
  // const latest = await prisma.bodyMetric.findFirst({
  //   where: { userId: session.user.id },
  //   orderBy: { recordedAt: "desc" },
  // });

  return <BodyMetricsClient user={user} />;
}
