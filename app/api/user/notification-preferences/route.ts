// app/api/user/notification-preferences/route.ts
// Phase 16C — user-facing notification preference toggles.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { notificationPrefsSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

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
  const body = parsed.data as Record<string, boolean | undefined>;

  const updateData: Record<string, boolean> = {};
  for (const f of EDITABLE_FIELDS) {
    if (typeof body[f] === "boolean") updateData[f] = body[f] as boolean;
  }

  const db = prisma as any;
  const updated = await db.notificationPreference.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...updateData },
    update: updateData,
  });

  return NextResponse.json({ ok: true, prefs: updated });
}
