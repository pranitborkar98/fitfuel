import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ addresses: [] });
  }

  const addresses = await (prisma as any).address.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take:    5,
  });

  return NextResponse.json({ addresses });
}
