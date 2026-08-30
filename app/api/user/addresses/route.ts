import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ addresses: [] });
  }
  const limit = await enforceRateLimit(req, "read", session.user.id);
  if (!limit.ok) return limit.response;

  const addresses = await prisma.address.findMany({
    where:   { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take:    5,
  });

  return NextResponse.json({ addresses });
}
