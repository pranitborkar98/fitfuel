// lib/notify.ts
// Unified notification sender — WhatsApp (MSG91) + Email (Resend).
// Reads templates from DB. Respects per-user prefs. Logs every send.

import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppTemplate } from "@/lib/msg91-whatsapp";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "FitFuel <hello@fitfuel.in>";

export interface SendNotificationInput {
  /** When set, recipient + prefs come from the User row. */
  userId?: string | null;
  /** Overrides (or use these directly for staff sends). */
  toPhone?: string;
  toEmail?: string;
  toName?: string;
  /** Template key (e.g. "order_confirmed"). */
  templateKey: string;
  /** Variables for interpolation. `name` is auto-filled when userId is set. */
  vars?: Record<string, string | number>;
}

export interface SendResult {
  whatsapp?: "sent" | "skipped" | "failed";
  email?: "sent" | "skipped" | "failed";
  errors: string[];
}

export async function sendNotification(
  input: SendNotificationInput
): Promise<SendResult> {
  const result: SendResult = { errors: [] };
  const db = prisma as any;

  // 1. Template
  const tpl = await db.notificationTemplate.findUnique({
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

  // 2. Resolve recipient + prefs
  let phone = input.toPhone;
  let email = input.toEmail;
  let name = input.toName || "there";
  let prefs: any = null;

  if (input.userId) {
    const user = await db.user.findUnique({
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

  const vars: Record<string, any> = { ...(input.vars || {}), name };

  const wantsWhatsApp = tpl.channel === "WHATSAPP" || tpl.channel === "BOTH";
  const wantsEmail = tpl.channel === "EMAIL" || tpl.channel === "BOTH";

  // 3. Category opt-out (skip for staff templates)
  if (!tpl.isStaff && prefs && tpl.category) {
    if (prefs[tpl.category] === false) {
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

  // 4. Send WhatsApp
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
      } catch (e: any) {
        result.whatsapp = "failed";
        result.errors.push(`WhatsApp: ${e?.message || "unknown"}`);
        await logSend({
          userId: input.userId || null,
          userEmail: email || null,
          userPhone: phone || null,
          templateKey: tpl.key,
          channel: "WHATSAPP",
          status: "FAILED",
          provider: "msg91",
          error: String(e?.message || e || "unknown").slice(0, 500),
          payload: vars,
        });
      }
    }
  }

  // 5. Send Email
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
        const html = renderTemplate(tpl.emailBody || "", vars);
        const r: any = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject,
          html,
        });
        result.email = "sent";
        await logSend({
          userId: input.userId || null,
          userEmail: email,
          userPhone: phone || null,
          templateKey: tpl.key,
          channel: "EMAIL",
          status: "SENT",
          provider: "resend",
          providerRef: r?.data?.id || r?.id || null,
          payload: vars,
        });
      } catch (e: any) {
        result.email = "failed";
        result.errors.push(`Email: ${e?.message || "unknown"}`);
        await logSend({
          userId: input.userId || null,
          userEmail: email || null,
          userPhone: phone || null,
          templateKey: tpl.key,
          channel: "EMAIL",
          status: "FAILED",
          provider: "resend",
          error: String(e?.message || e || "unknown").slice(0, 500),
          payload: vars,
        });
      }
    }
  }

  return result;
}

/**
 * Fire-and-forget — use inside API routes so notifications never block the response.
 */
export function fireNotification(input: SendNotificationInput): void {
  sendNotification(input).catch((e) => {
    console.error("[notify] fire failed", input.templateKey, e);
  });
}

/**
 * Fan out a notification to all users with a given role.
 * Used for staff alerts (new order → OWNER/ADMIN, delivery issue → OWNER/DISPATCH).
 */
export async function notifyStaffByRoles(
  roles: string[],
  templateKey: string,
  vars: Record<string, string | number>
): Promise<void> {
  const db = prisma as any;
  const staff = await db.user.findMany({
    where: { role: { in: roles as any } },
    select: { id: true, email: true, phone: true, name: true },
  });
  for (const s of staff) {
    fireNotification({
      userId: s.id,
      toEmail: s.email || undefined,
      toPhone: s.phone || undefined,
      toName: s.name || undefined,
      templateKey,
      vars,
    });
  }
}

function renderTemplate(tpl: string, vars: Record<string, any>): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) =>
    String(vars[key] ?? "")
  );
}

function extractWhatsAppVars(
  varsJson: string | null,
  vars: Record<string, any>
): string[] {
  if (!varsJson) return [];
  try {
    const list: string[] = JSON.parse(varsJson);
    return list.map((k) => String(vars[k] ?? ""));
  } catch {
    return [];
  }
}

async function logSend(data: any) {
  try {
    await (prisma as any).notificationLog.create({ data });
  } catch (e) {
    console.error("[notify] log failed", e);
  }
}
