// lib/msg91-whatsapp.ts
// MSG91 WhatsApp Business API — template message sender.
// Docs: https://docs.msg91.com/whatsapp-business-api
// Env required: MSG91_AUTH_KEY, MSG91_WHATSAPP_INTEGRATED_NUMBER
// Optional: MSG91_WHATSAPP_NAMESPACE (only needed for some Meta tenants)

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

  const json: any = await res.json().catch(() => ({}));
  return json?.request_id || json?.data?.id || "msg91-ok";
}

function normalizePhone(p: string): string {
  let s = String(p || "").replace(/\D/g, "");
  if (s.length === 10) s = "91" + s; // India default
  if (s.length < 11) return "";
  return s;
}
