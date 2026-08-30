// Admin notification templates, logs, and deliberate test sends. OWNER/ADMIN only.

import { requireApiRole } from "@/lib/admin-auth";
import { sendNotification } from "@/lib/notify";
import { indiaMobileE164 } from "@/lib/phone";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson, readQuery } from "@/lib/validation/core";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const CHANNELS = ["WHATSAPP", "EMAIL", "BOTH"] as const;
const CATEGORIES = [
  "orderUpdates",
  "deliveryUpdates",
  "weeklyDigest",
  "morningPush",
  "eveningRecap",
  "nudges",
  "marketing",
  "staff",
] as const;

const querySchema = z
  .object({
    tab: z.enum(["templates", "logs"]).default("templates"),
    status: z.enum(["QUEUED", "SENT", "FAILED", "SKIPPED"]).optional(),
    key: z.string().trim().min(1).max(120).optional(),
    channel: z.enum(CHANNELS).optional(),
    q: z.string().trim().min(1).max(120).optional(),
  })
  .strict();

const idSchema = z.string().trim().min(1).max(60);
const templateNameSchema = z
  .string()
  .trim()
  .max(120)
  .refine((value) => !value || /^[a-z0-9_]+$/.test(value), "WhatsApp template names use lowercase letters, numbers, and underscores.");
const emailSchema = z.union([z.literal(""), z.string().trim().email().max(254)]);

const updateTemplateSchema = z
  .object({
    action: z.literal("updateTemplate"),
    data: z
      .object({
        id: idSchema,
        name: z.string().trim().min(1).max(120),
        description: z.string().trim().max(500).default(""),
        channel: z.enum(CHANNELS),
        category: z.enum(CATEGORIES),
        active: z.boolean().default(true),
        whatsappTemplateName: templateNameSchema.default(""),
        whatsappLanguage: z.string().trim().regex(/^[a-z]{2}(?:_[A-Z]{2})?$/, "Use a language such as en or en_US.").default("en"),
        whatsappVariables: z.union([z.string().max(2_000), z.array(z.string().max(50)).max(30)]).default(""),
        emailSubject: z.string().trim().max(200).default(""),
        emailBody: z.string().max(100_000).default(""),
      })
      .strict(),
  })
  .strict();

const toggleSchema = z
  .object({
    action: z.literal("toggleActive"),
    data: z.object({ id: idSchema }).strict(),
  })
  .strict();

const testSendSchema = z
  .object({
    action: z.literal("testSend"),
    data: z
      .object({
        templateKey: z.string().trim().min(1).max(120),
        toEmail: emailSchema.optional().default(""),
        toPhone: z.string().trim().max(24).optional().default(""),
        vars: z
          .record(
            z.string().regex(/^[A-Za-z][A-Za-z0-9_]{0,49}$/),
            z.union([z.string().max(500), z.number().finite()]),
          )
          .refine((value) => Object.keys(value).length <= 30, "Use at most 30 test variables.")
          .default({}),
      })
      .strict(),
  })
  .strict();

const notificationActionSchema = z.discriminatedUnion("action", [
  updateTemplateSchema,
  toggleSchema,
  testSendSchema,
]);

function parseVariables(value: string | string[]): { value: string | null; error?: string } {
  let variables: unknown = value;
  if (typeof value === "string") {
    if (!value.trim()) return { value: null };
    try {
      variables = JSON.parse(value);
    } catch {
      return { value: null, error: "WhatsApp variables must be a JSON array." };
    }
  }
  if (!Array.isArray(variables) || variables.length > 30) {
    return { value: null, error: "WhatsApp variables must be an array with at most 30 names." };
  }
  const names = variables.map((item) => (typeof item === "string" ? item.trim() : ""));
  if (names.some((name) => !/^[A-Za-z][A-Za-z0-9_]{0,49}$/.test(name))) {
    return { value: null, error: "Variable names must start with a letter and contain only letters, numbers, or underscores." };
  }
  if (new Set(names).size !== names.length) {
    return { value: null, error: "WhatsApp variable names must be unique." };
  }
  return { value: JSON.stringify(names) };
}

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("notifications");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = readQuery(req, querySchema);
  if (!parsed.ok) return parsed.response;
  const query = parsed.data;

  if (query.tab === "logs") {
    const where: Prisma.NotificationLogWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.key ? { templateKey: query.key } : {}),
      ...(query.channel ? { channel: query.channel } : {}),
      ...(query.q
        ? {
            OR: [
              { userEmail: { contains: query.q, mode: "insensitive" } },
              { userPhone: { contains: query.q } },
            ],
          }
        : {}),
    };
    const logs = await prisma.notificationLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        userId: true,
        userEmail: true,
        userPhone: true,
        templateKey: true,
        channel: true,
        status: true,
        provider: true,
        providerRef: true,
        error: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ logs });
  }

  const templates = await prisma.notificationTemplate.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ templates });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("notifications");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, notificationActionSchema, { maxBytes: 128 * 1024 });
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  try {
    if (body.action === "updateTemplate") {
      const current = await prisma.notificationTemplate.findUnique({
        where: { id: body.data.id },
        select: { id: true, isStaff: true },
      });
      if (!current) return NextResponse.json({ error: "Template not found." }, { status: 404 });
      if (current.isStaff !== (body.data.category === "staff")) {
        return NextResponse.json(
          { error: current.isStaff ? "Staff templates must stay in the staff category." : "Customer templates cannot be moved into the staff category." },
          { status: 400 },
        );
      }

      const wantsWhatsApp = body.data.channel === "WHATSAPP" || body.data.channel === "BOTH";
      const wantsEmail = body.data.channel === "EMAIL" || body.data.channel === "BOTH";
      if (wantsWhatsApp && !body.data.whatsappTemplateName) {
        return NextResponse.json({ error: "WhatsApp templates need an approved template name." }, { status: 400 });
      }
      if (wantsEmail && (!body.data.emailSubject || !body.data.emailBody.trim())) {
        return NextResponse.json({ error: "Email templates need both a subject and body." }, { status: 400 });
      }

      const waVariables = parseVariables(body.data.whatsappVariables);
      if (waVariables.error) return NextResponse.json({ error: waVariables.error }, { status: 400 });

      const updated = await prisma.notificationTemplate.update({
        where: { id: body.data.id },
        data: {
          name: body.data.name,
          description: body.data.description || null,
          channel: body.data.channel,
          category: body.data.category,
          active: body.data.active,
          whatsappTemplateName: body.data.whatsappTemplateName || null,
          whatsappLanguage: body.data.whatsappLanguage,
          whatsappVariables: waVariables.value,
          emailSubject: body.data.emailSubject || null,
          emailBody: body.data.emailBody || null,
        },
      });
      return NextResponse.json({ ok: true, template: updated });
    }

    if (body.action === "toggleActive") {
      const current = await prisma.notificationTemplate.findUnique({
        where: { id: body.data.id },
        select: { active: true },
      });
      if (!current) return NextResponse.json({ error: "Template not found." }, { status: 404 });
      const updated = await prisma.notificationTemplate.update({
        where: { id: body.data.id },
        data: { active: !current.active },
      });
      return NextResponse.json({ ok: true, template: updated });
    }

    const template = await prisma.notificationTemplate.findUnique({
      where: { key: body.data.templateKey },
      select: { channel: true, active: true },
    });
    if (!template) return NextResponse.json({ error: "Template not found." }, { status: 404 });
    if (!template.active) return NextResponse.json({ error: "Activate the template before testing it." }, { status: 409 });

    const phone = body.data.toPhone ? indiaMobileE164(body.data.toPhone) : null;
    if (body.data.toPhone && !phone) {
      return NextResponse.json({ error: "Enter a valid Indian mobile number." }, { status: 400 });
    }
    if (!body.data.toEmail && !phone) {
      return NextResponse.json({ error: "Enter an email address or Indian mobile number." }, { status: 400 });
    }
    const wantsEmail = template.channel === "EMAIL" || template.channel === "BOTH";
    const wantsWhatsApp = template.channel === "WHATSAPP" || template.channel === "BOTH";
    if (wantsEmail && !body.data.toEmail && !wantsWhatsApp) {
      return NextResponse.json({ error: "This template needs a test email address." }, { status: 400 });
    }
    if (wantsWhatsApp && !phone && !wantsEmail) {
      return NextResponse.json({ error: "This template needs a test mobile number." }, { status: 400 });
    }

    const result = await sendNotification({
      templateKey: body.data.templateKey,
      toEmail: body.data.toEmail || undefined,
      toPhone: phone || undefined,
      toName: typeof body.data.vars.name === "string" ? body.data.vars.name : "Test",
      vars: body.data.vars,
    });
    if (result.errors.length) {
      return NextResponse.json({ ok: false, error: "Test send did not complete.", result }, { status: 502 });
    }
    return NextResponse.json({ ok: true, result });
  } catch (error: unknown) {
    console.error("[admin/notifications] operation failed", error);
    return NextResponse.json({ error: "Notification operation failed." }, { status: 500 });
  }
}
