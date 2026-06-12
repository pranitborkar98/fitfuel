// app/api/user/notification-preferences/route.ts
// Phase 16C \u2014 user-facing notification preference toggles.
// GET returns current prefs (auto-create row with defaults if missing).
// POST updates allowed fields (transactional categories are NOT editable here).

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Fields the user is allowed to toggle. orderUpdates + deliveryUpdates are
// intentionally excluded \u2014 those are transactional and must always fire.
const EDITABLE_FIELDS = [
  "weeklyDigest",
  "morningPush",
  "eveningRecap",
  "nudges",
  "marketing",
  "emailEnabled",
  "whatsappEnabled",
] as const;

async function getOrCreatePrefs(userId: string) {
  const db = prisma as any;
  let prefs = await db.notificationPreference.findUnique({ where: { userId } });
  if (!prefs) {
    prefs = await db.notificationPreference.create({ data: { userId } });
  }
  return prefs;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prefs = await getOrCreatePrefs(session.user.id);
  return NextResponse.json({ prefs });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  const updateData: Record<string, boolean> = {};
  for (const f of EDITABLE_FIELDS) {
    if (typeof body[f] === "boolean") updateData[f] = body[f];
  }

  const db = prisma as any;
  const updated = await db.notificationPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...updateData },
    update: updateData,
  });

  return NextResponse.json({ ok: true, prefs: updated });
}
