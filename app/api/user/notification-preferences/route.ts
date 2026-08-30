// app/api/user/notification-preferences/route.ts
// Phase 16C — user-facing notification preference toggles.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { notificationPrefsSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

async function getOrCreatePrefs(userId: string) {
  return prisma.notificationPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rl = await enforceRateLimit(req, "read", session.user.id);
  if (!rl.ok) return rl.response;
  const prefs = await getOrCreatePrefs(session.user.id);
  return NextResponse.json({ prefs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, notificationPrefsSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;
  const updateData = {
    ...(body.weeklyDigest !== undefined ? { weeklyDigest: body.weeklyDigest } : {}),
    ...(body.morningPush !== undefined ? { morningPush: body.morningPush } : {}),
    ...(body.eveningRecap !== undefined ? { eveningRecap: body.eveningRecap } : {}),
    ...(body.nudges !== undefined ? { nudges: body.nudges } : {}),
    ...(body.marketing !== undefined ? { marketing: body.marketing } : {}),
    ...(body.emailEnabled !== undefined ? { emailEnabled: body.emailEnabled } : {}),
    ...(body.whatsappEnabled !== undefined ? { whatsappEnabled: body.whatsappEnabled } : {}),
  };
  const updated = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...updateData },
    update: updateData,
  });

  return NextResponse.json({ ok: true, prefs: updated });
}
