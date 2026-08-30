// lib/notify-driver.ts
// Phase 10 — MSG91 WhatsApp notification sent to driver on dispatch.
//
// Required env vars:
//   MSG91_AUTH_KEY
//   MSG91_WA_TEMPLATE_ID
//   MSG91_WA_INTEGRATED_NUMBER
//   NEXT_PUBLIC_BASE_URL

import { indiaMobileE164 } from "@/lib/phone";

export interface NotifyDriverPayload {
  driverName: string;
  driverPhone: string;
  driverToken: string;
  stopCount: number;
}

export async function notifyDriverWhatsApp(payload: NotifyDriverPayload): Promise<void> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_WA_TEMPLATE_ID;
  const integratedNumber = process.env.MSG91_WA_INTEGRATED_NUMBER;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  if (!authKey || !templateId || !integratedNumber) {
    console.warn(
      "[notify-driver] Skipping WhatsApp. MSG91_WA_TEMPLATE_ID or MSG91_WA_INTEGRATED_NUMBER not set."
    );
    return;
  }

  const firstName = payload.driverName.split(" ")[0];
  const driverLink = `${baseUrl}/driver/${payload.driverToken}`;
  const recipient = indiaMobileE164(payload.driverPhone);
  if (!recipient) {
    console.error("[notify-driver] Invalid driver phone; notification not sent.");
    return;
  }

  const body = {
    integrated_number: integratedNumber,
    content_type: "template",
    payload: {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: "fitfuel_driver_dispatch",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: firstName },
              { type: "text", text: String(payload.stopCount) },
              { type: "text", text: driverLink },
            ],
          },
        ],
      },
      to: recipient,
    },
  };

  try {
    const res = await fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[notify-driver] MSG91 request failed", res.status);
    } else {
      console.info("[notify-driver] WhatsApp dispatch notification sent.");
    }
  } catch (err) {
    console.error("[notify-driver] fetch failed", err);
  }
}
