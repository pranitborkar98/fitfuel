// app/driver/[token]/page.tsx
// Phase 10 — driver delivery view. Public route; the token IS the auth.

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DriverClient from "./DriverClient";

export const dynamic = "force-dynamic";

export default async function DriverPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const driver = await prisma.driver.findUnique({
    where: { accessToken: token },
    select: { name: true, isActive: true },
  });

  if (!driver || !driver.isActive) notFound();

  return <DriverClient token={token} driverName={driver.name} />;
}
