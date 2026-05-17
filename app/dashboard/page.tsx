import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard");

  const [orders, user] = await Promise.all([
    (prisma as any).order.findMany({
      where:   { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take:    10,
      include: { items: true },
    }),
    (prisma as any).user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, image: true, role: true },
    }),
  ]);

  return <DashboardClient session={session} orders={orders} user={user} />;
}