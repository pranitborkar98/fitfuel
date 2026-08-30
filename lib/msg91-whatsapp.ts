// lib/msg91-whatsapp.ts
// MSG91 WhatsApp Business API — template message sender.
// Docs: https://docs.msg91.com/whatsapp-business-api
// Env required: MSG91_AUTH_KEY, MSG91_WHATSAPP_INTEGRATED_NUMBER
// Optional: MSG91_WHATSAPP_NAMESPACE (only needed for some Meta tenants)

import { indiaMobileE164 } from "@/lib/phone";

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY || "";
const MSG91_WHATSAPP_INTEGRATED_NUMBER =
  process.env.MSG91_WHATSAPP_INTEGRATED_NUMBER || "";
const MSG91_WHATSAPP_NAMESPACE = process.env.MSG91_WHATSAPP_NAMESPACE || "";

export interface SendWhatsAppTemplateInput {
  to: string; // E.164 without + (e.g. "919876543210") or 10-digit IN
  templateName: string; // the Meta-approved template name
  language?: string; // default "en"
  variables: string[]; // ordered body variable values
}

export async function sendWhatsAppTemplate(
  input: SendWhatsAppTemplateInput
): Promise<string> {
  if (!MSG91_AUTH_KEY || !MSG91_WHATSAPP_INTEGRATED_NUMBER) {
    throw new Error("MSG91 WhatsApp not configured (env vars missing)");
  }

  const to = normalizePhone(input.to);
  if (!to) throw new Error("Invalid phone");

  const components: Record<string, { type: string; value: string }> = {};
  input.variables.forEach((v, i) => {
    components[`body_${i + 1}`] = { type: "text", value: String(v) };
  });

  const body = {
    integrated_number: MSG91_WHATSAPP_INTEGRATED_NUMBER,
    content_type: "template",
    payload: {
      to,
      type: "template",
      template: {
        name: input.templateName,
        language: {
          code: input.language || "en",
          policy: "deterministic",
        },
        ...(MSG91_WHATSAPP_NAMESPACE
          ? { namespace: MSG91_WHATSAPP_NAMESPACE }
          : {}),
        to_and_components: [
          {
            to: [to],
            components,
          },
        ],
      },
    },
  };

  const res = await fetch(
    "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: MSG91_AUTH_KEY,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `MSG91 WhatsApp ${res.status}: ${text.slice(0, 250)}`
    );
  }

  const payload: unknown = await res.json().catch(() => null);
  const requestId = providerRequestId(payload);
  const providerError = providerErrorMessage(payload);
  if (providerError) throw new Error(`MSG91 WhatsApp rejected the message: ${providerError}`);
  return requestId ?? "msg91-accepted";
}

function normalizePhone(p: string): string {
  return indiaMobileE164(p) ?? "";
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function providerRequestId(payload: unknown): string | null {
  const root = record(payload);
  if (!root) return null;
  if (typeof root.request_id === "string" && root.request_id) return root.request_id;
  const data = record(root.data);
  return typeof data?.id === "string" && data.id ? data.id : null;
}

function providerErrorMessage(payload: unknown): string | null {
  const root = record(payload);
  if (!root) return null;
  const explicitlyFailed = root.success === false || root.status === false || root.type === "error";
  if (!explicitlyFailed) return null;
  if (typeof root.message === "string") return root.message.slice(0, 250);
  if (typeof root.error === "string") return root.error.slice(0, 250);
  return "Provider returned an unsuccessful response.";
}
