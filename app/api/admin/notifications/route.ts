// app/api/admin/notifications/route.ts
// Phase 16A: admin surface API. OWNER/ADMIN only.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/admin-auth";
import { sendNotification } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireApiRole("notifications");
  if (!gate) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = prisma as any;
  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "templates";

  if (tab === "logs") {
    const status = searchParams.get("status");
    const key = searchParams.get("key");
    const channel = searchParams.get("channel");
    const q = searchParams.get("q");
    const where: any = {};
    if (status) where.status = status;
    if (key) where.templateKey = key;
    if (channel) where.channel = channel;
    if (q) {
      where.OR = [
        { userEmail: { contains: q, mode: "insensitive" } },
        { userPhone: { contains: q } },
      ];
    }
    const logs = await db.notificationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json({ logs });
  }

  // default: templates
  const templates = await db.notificationTemplate.findMany({
    orderBy: { key: "asc" },
  });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const gate = await requireApiRole("notifications");
  if (!gate) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { action, data } = body;
  const db = prisma as any;

  if (action === "updateTemplate") {
    if (!data?.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    let waVars = data.whatsappVariables;
    if (Array.isArray(waVars)) waVars = JSON.stringify(waVars);
    if (typeof waVars === "string" && waVars.trim() === "") waVars = null;

    const updated = await db.notificationTemplate.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description || null,
        channel: data.channel,
        category: data.category,
        active: data.active !== false,
        whatsappTemplateName: data.whatsappTemplateName || null,
        whatsappLanguage: data.whatsappLanguage || "en",
        whatsappVariables: waVars,
        emailSubject: data.emailSubject || null,
        emailBody: data.emailBody || null,
      },
    });
    return NextResponse.json({ ok: true, template: updated });
  }

  if (action === "toggleActive") {
    if (!data?.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const t = await db.notificationTemplate.findUnique({
      where: { id: data.id },
    });
    if (!t) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const updated = await db.notificationTemplate.update({
      where: { id: data.id },
      data: { active: !t.active },
    });
    return NextResponse.json({ ok: true, template: updated });
  }

  if (action === "testSend") {
    const { templateKey, toEmail, toPhone, vars } = data || {};
    if (!templateKey) {
      return NextResponse.json(
        { error: "templateKey required" },
        { status: 400 }
      );
    }
    const result = await sendNotification({
      templateKey,
      toEmail: toEmail || undefined,
      toPhone: toPhone || undefined,
      toName: (vars && vars.name) || "Test",
      vars: vars || {},
    });
    return NextResponse.json({ ok: true, result });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}