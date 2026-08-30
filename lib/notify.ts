// lib/notify.ts
// Unified notification sender \u2014 WhatsApp (MSG91) + Email (Resend).
// Reads templates from DB. Respects per-user prefs. Logs every send.
// Phase 16C: added `wasRecentlySent` helper for nudge idempotency.

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppTemplate } from "@/lib/msg91-whatsapp";
import type { NotificationPreference, Prisma, Role } from "@prisma/client";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "FitFuel <hello@fitfuel.in>";

export interface SendNotificationInput {
  userId?: string | null;
  toPhone?: string;
  toEmail?: string;
  toName?: string;
  templateKey: string;
  vars?: Record<string, string | number>;
  /** Keys containing application-built HTML fragments. Never populate from request input. */
  trustedHtmlVars?: readonly string[];
}

export interface SendResult {
  whatsapp?: "sent" | "skipped" | "failed";
  email?: "sent" | "skipped" | "failed";
  errors: string[];
}

type TemplateVars = Record<string, string | number>;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || "unknown");
}

function optedOut(preferences: NotificationPreference | null, category: string): boolean {
  if (!preferences) return false;
  if (category === "orderUpdates") return !preferences.orderUpdates;
  if (category === "deliveryUpdates") return !preferences.deliveryUpdates;
  if (category === "weeklyDigest") return !preferences.weeklyDigest;
  if (category === "morningPush") return !preferences.morningPush;
  if (category === "eveningRecap") return !preferences.eveningRecap;
  if (category === "nudges") return !preferences.nudges;
  if (category === "marketing") return !preferences.marketing;
  return false;
}

export async function sendNotification(
  input: SendNotificationInput
): Promise<SendResult> {
  const result: SendResult = { errors: [] };

  const tpl = await prisma.notificationTemplate.findUnique({
    where: { key: input.templateKey },
  });
  if (!tpl) {
    result.errors.push(`Template not found: ${input.templateKey}`);
    return result;
  }
  if (!tpl.active) {
    result.errors.push(`Template inactive: ${input.templateKey}`);
    return result;
  }

  let phone = input.toPhone;
  let email = input.toEmail;
  let name = input.toName || "there";
  let prefs: NotificationPreference | null = null;

  if (input.userId) {
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: { notificationPreference: true },
    });
    if (!user) {
      result.errors.push(`User not found: ${input.userId}`);
      return result;
    }
    phone = phone || user.phone || undefined;
    email = email || user.email || undefined;
    name = input.toName || user.name || name;
    prefs = user.notificationPreference;
  }

  const vars: TemplateVars = { ...(input.vars || {}), name };

  const wantsWhatsApp = tpl.channel === "WHATSAPP" || tpl.channel === "BOTH";
  const wantsEmail = tpl.channel === "EMAIL" || tpl.channel === "BOTH";

  if (!tpl.isStaff && prefs && tpl.category) {
    if (optedOut(prefs, tpl.category)) {
      await logSend({
        userId: input.userId || null,
        userEmail: email || null,
        userPhone: phone || null,
        templateKey: tpl.key,
        channel: tpl.channel,
        status: "SKIPPED",
        error: `User opted out of ${tpl.category}`,
        payload: vars,
      });
      result.whatsapp = "skipped";
      result.email = "skipped";
      return result;
    }
  }

  if (wantsWhatsApp) {
    const channelEnabled =
      tpl.isStaff || !prefs || prefs.whatsappEnabled !== false;
    if (!channelEnabled || !phone) {
      result.whatsapp = "skipped";
      await logSend({
        userId: input.userId || null,
        userEmail: email || null,
        userPhone: phone || null,
        templateKey: tpl.key,
        channel: "WHATSAPP",
        status: "SKIPPED",
        error: !phone ? "No phone" : "WhatsApp disabled",
        payload: vars,
      });
    } else {
      try {
        const ref = await sendWhatsAppTemplate({
          to: phone,
          templateName: tpl.whatsappTemplateName || tpl.key,
          language: tpl.whatsappLanguage || "en",
          variables: extractWhatsAppVars(tpl.whatsappVariables, vars),
        });
        result.whatsapp = "sent";
        await logSend({
          userId: input.userId || null,
          userEmail: email || null,
          userPhone: phone,
          templateKey: tpl.key,
          channel: "WHATSAPP",
          status: "SENT",
          provider: "msg91",
          providerRef: ref,
          payload: vars,
        });
      } catch (error: unknown) {
        result.whatsapp = "failed";
        result.errors.push(`WhatsApp: ${errorMessage(error)}`);
        await logSend({
          userId: input.userId || null,
          userEmail: email || null,
          userPhone: phone || null,
          templateKey: tpl.key,
          channel: "WHATSAPP",
          status: "FAILED",
          provider: "msg91",
          error: errorMessage(error).slice(0, 500),
          payload: vars,
        });
      }
    }
  }

  if (wantsEmail) {
    const channelEnabled =
      tpl.isStaff || !prefs || prefs.emailEnabled !== false;
    if (!channelEnabled || !email || !resend) {
      result.email = "skipped";
      await logSend({
        userId: input.userId || null,
        userEmail: email || null,
        userPhone: phone || null,
        templateKey: tpl.key,
        channel: "EMAIL",
        status: "SKIPPED",
        error: !email
          ? "No email"
          : !resend
          ? "Resend not configured"
          : "Email disabled",
        payload: vars,
      });
    } else {
      try {
        const subject = renderTemplate(tpl.emailSubject || "FitFuel", vars);
        const html = renderHtmlTemplate(
          tpl.emailBody || "",
          vars,
          new Set(input.trustedHtmlVars || []),
        );
        const response = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject,
          html,
        });
        if (response.error) throw new Error(response.error.message);
        result.email = "sent";
        await logSend({
          userId: input.userId || null,
          userEmail: email,
          userPhone: phone || null,
          templateKey: tpl.key,
          channel: "EMAIL",
          status: "SENT",
          provider: "resend",
          providerRef: response.data?.id || null,
          payload: vars,
        });
      } catch (error: unknown) {
        result.email = "failed";
        result.errors.push(`Email: ${errorMessage(error)}`);
        await logSend({
          userId: input.userId || null,
          userEmail: email || null,
          userPhone: phone || null,
          templateKey: tpl.key,
          channel: "EMAIL",
          status: "FAILED",
          provider: "resend",
          error: errorMessage(error).slice(0, 500),
          payload: vars,
        });
      }
    }
  }

  return result;
}

export function fireNotification(input: SendNotificationInput): void {
  sendNotification(input).catch((e) => {
    console.error("[notify] fire failed", input.templateKey, e);
  });
}

export async function notifyStaffByRoles(
  roles: readonly Role[],
  templateKey: string,
  vars: Record<string, string | number>
): Promise<void> {
  const staff = await prisma.user.findMany({
    where: { role: { in: [...roles] } },
    select: { id: true, email: true, phone: true, name: true },
  });
  const sends = await Promise.allSettled(staff.map((staffMember) =>
    sendNotification({
      userId: staffMember.id,
      toEmail: staffMember.email || undefined,
      toPhone: staffMember.phone || undefined,
      toName: staffMember.name || undefined,
      templateKey,
      vars,
    }),
  ));
  const failures = sends.filter((result) => result.status === "rejected");
  if (failures.length) console.error(`[notify] ${failures.length} staff notification send(s) rejected`);
}

/**
 * Phase 16C: nudge idempotency gate.
 * Returns true if a SENT row exists for this (userId, templateKey) within
 * the given window. Used to avoid sending the same nudge twice in a row.
 */
export async function wasRecentlySent(
  userId: string,
  templateKey: string,
  withinHours: number
): Promise<boolean> {
  const cutoff = new Date(Date.now() - withinHours * 3600_000);
  const recent = await prisma.notificationLog.findFirst({
    where: {
      userId,
      templateKey,
      status: "SENT",
      createdAt: { gt: cutoff },
    },
    select: { id: true },
  });
  return !!recent;
}

function renderTemplate(tpl: string, vars: TemplateVars): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) =>
    String(vars[key] ?? "")
  );
}

function renderHtmlTemplate(
  template: string,
  vars: Record<string, unknown>,
  trustedHtmlVars: ReadonlySet<string>,
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = String(vars[key] ?? "");
    return trustedHtmlVars.has(key) ? value : escapeHtml(value);
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractWhatsAppVars(
  varsJson: string | null,
  vars: TemplateVars,
): string[] {
  if (!varsJson) return [];
  try {
    const parsed: unknown = JSON.parse(varsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((key): key is string => typeof key === "string").map((key) => String(vars[key] ?? ""));
  } catch {
    return [];
  }
}

async function logSend(data: Prisma.NotificationLogUncheckedCreateInput) {
  try {
    await prisma.notificationLog.create({ data });
  } catch (error: unknown) {
    console.error("[notify] log failed", error);
  }
}
