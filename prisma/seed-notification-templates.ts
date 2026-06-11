// prisma/seed-notification-templates.ts
// Seeds default notification templates. Idempotent (upsert by key).
// Run: npx tsx --env-file=.env.local prisma/seed-notification-templates.ts
//
// Phase 16A wiring update: delivery_dispatched, staff_new_order, staff_delivery_issue
// changed from WHATSAPP-only to BOTH (so they work via email until WAHA is wired).

import { prisma } from "../lib/prisma";

interface SeedTpl {
  key: string;
  name: string;
  description: string;
  channel: "WHATSAPP" | "EMAIL" | "BOTH";
  category: string;
  isStaff?: boolean;
  whatsappTemplateName?: string;
  whatsappVariables?: string[];
  emailSubject?: string;
  emailBody?: string;
}

const EMAIL_SHELL = (
  heading: string,
  bodyHtml: string,
  ctaText?: string,
  ctaHref?: string
) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#080808;color:#eaeaea;line-height:1.55">
  <div style="font-family:'Syne',Arial,sans-serif;font-size:24px;color:#84cc16;font-weight:700;letter-spacing:-0.5px">FITFUEL</div>
  <h1 style="font-size:22px;margin:28px 0 12px;color:#fff;font-weight:700">${heading}</h1>
  <div style="color:#bbb;font-size:15px">${bodyHtml}</div>
  ${
    ctaText && ctaHref
      ? `<a href="${ctaHref}" style="display:inline-block;background:#84cc16;color:#000;padding:12px 24px;text-decoration:none;font-weight:700;border-radius:4px;margin-top:24px">${ctaText}</a>`
      : ""
  }
  <p style="color:#555;margin-top:40px;font-size:12px;border-top:1px solid #1a1a1a;padding-top:16px">FitFuel \u00B7 Pune \u00B7 Questions? Reply to this email or WhatsApp us.</p>
</div>`;

const STAFF_SHELL = (
  heading: string,
  rows: Array<[string, string]>
) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#080808;color:#eaeaea;line-height:1.55">
  <div style="font-size:11px;color:#84cc16;font-weight:700;letter-spacing:1px;text-transform:uppercase">FITFUEL \u00B7 STAFF ALERT</div>
  <h1 style="font-size:20px;margin:14px 0 16px;color:#fff;font-weight:700">${heading}</h1>
  <table style="width:100%;border-collapse:collapse">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 0;color:#888;font-size:13px;border-top:1px solid #1a1a1a">${k}</td><td style="padding:8px 0;text-align:right;color:#eee;font-size:13px;border-top:1px solid #1a1a1a">${v}</td></tr>`
      )
      .join("")}
  </table>
  <p style="color:#555;margin-top:32px;font-size:12px">Sent automatically by FitFuel.</p>
</div>`;

const TEMPLATES: SeedTpl[] = [
  {
    key: "order_confirmed",
    name: "Order confirmed (customer)",
    description: "Fires after PayU success or COD order placement",
    channel: "BOTH",
    category: "orderUpdates",
    whatsappTemplateName: "ff_order_confirmed",
    whatsappVariables: ["name", "orderNumber", "planName", "amount"],
    emailSubject: "Order confirmed \u2014 {{orderNumber}}",
    emailBody: EMAIL_SHELL(
      "Hi {{name}}, your order is confirmed",
      `<p>Welcome to FitFuel. Here are your order details:</p>
       <table style="width:100%;margin:20px 0;border-collapse:collapse">
         <tr><td style="padding:8px 0;color:#888">Order #</td><td style="padding:8px 0;text-align:right;color:#eee">{{orderNumber}}</td></tr>
         <tr><td style="padding:8px 0;color:#888;border-top:1px solid #1a1a1a">Plan</td><td style="padding:8px 0;text-align:right;color:#eee;border-top:1px solid #1a1a1a">{{planName}}</td></tr>
         <tr><td style="padding:8px 0;color:#888;border-top:1px solid #1a1a1a">Amount</td><td style="padding:8px 0;text-align:right;color:#84cc16;font-weight:700;border-top:1px solid #1a1a1a">&#8377;{{amount}}</td></tr>
       </table>
       <p style="color:#888;font-size:13px">Deliveries start as scheduled. You'll get a ping when your meal is on the way.</p>`,
      "Go to dashboard",
      "https://fitfuel.in/dashboard"
    ),
  },
  {
    key: "delivery_dispatched",
    name: "Delivery on the way (customer)",
    description: "Fires on first GET to driver app for the day (per-delivery, idempotent)",
    channel: "BOTH",
    category: "deliveryUpdates",
    whatsappTemplateName: "ff_delivery_dispatched",
    whatsappVariables: ["name", "windowLabel", "driverName", "driverPhone"],
    emailSubject: "Your FitFuel meal is on the way",
    emailBody: EMAIL_SHELL(
      "Hi {{name}}, your meal is on the way",
      `<p>Today's delivery is out for {{windowLabel}}.</p>
       <table style="width:100%;margin:20px 0;border-collapse:collapse">
         <tr><td style="padding:8px 0;color:#888">Driver</td><td style="padding:8px 0;text-align:right;color:#eee">{{driverName}}</td></tr>
         <tr><td style="padding:8px 0;color:#888;border-top:1px solid #1a1a1a">Contact</td><td style="padding:8px 0;text-align:right;color:#84cc16;border-top:1px solid #1a1a1a">{{driverPhone}}</td></tr>
       </table>
       <p style="color:#888;font-size:13px">Please confirm receipt on your dashboard once it arrives.</p>`,
      "Open dashboard",
      "https://fitfuel.in/dashboard"
    ),
  },
  {
    key: "delivery_issue_ack",
    name: "Delivery issue acknowledged (customer)",
    description: "Fires when customer reports a delivery issue",
    channel: "BOTH",
    category: "deliveryUpdates",
    whatsappTemplateName: "ff_delivery_issue_ack",
    whatsappVariables: ["name"],
    emailSubject: "We received your delivery issue report",
    emailBody: EMAIL_SHELL(
      "We're on it, {{name}}",
      `<p>We received your report about today's delivery. Our team will reach out within 2 hours to resolve it.</p>
       <p style="color:#888;font-size:13px">Thanks for flagging \u2014 your feedback is how we get better every week.</p>`
    ),
  },
  {
    key: "staff_new_order",
    name: "New order alert (staff)",
    description: "Fires to OWNER/ADMIN when an order is placed",
    channel: "BOTH",
    category: "staff",
    isStaff: true,
    whatsappTemplateName: "ff_staff_new_order",
    whatsappVariables: ["orderNumber", "customerName", "planName", "amount"],
    emailSubject: "[FitFuel] New order {{orderNumber}}",
    emailBody: STAFF_SHELL("New order placed", [
      ["Order #", "{{orderNumber}}"],
      ["Customer", "{{customerName}}"],
      ["Plan", "{{planName}}"],
      ["Amount", "&#8377;{{amount}}"],
    ]),
  },
  {
    key: "staff_delivery_issue",
    name: "Delivery issue alert (staff)",
    description: "Fires to OWNER/DISPATCH when a customer reports a delivery issue",
    channel: "BOTH",
    category: "staff",
    isStaff: true,
    whatsappTemplateName: "ff_staff_delivery_issue",
    whatsappVariables: ["customerName", "orderNumber", "issue"],
    emailSubject: "[FitFuel] Delivery issue \u2014 order {{orderNumber}}",
    emailBody: STAFF_SHELL("Delivery issue reported", [
      ["Customer", "{{customerName}}"],
      ["Order #", "{{orderNumber}}"],
      ["Issue", "{{issue}}"],
    ]),
  },
];

async function main() {
  const db = prisma as any;
  for (const t of TEMPLATES) {
    const data = {
      name: t.name,
      description: t.description,
      channel: t.channel,
      category: t.category,
      isStaff: t.isStaff || false,
      whatsappTemplateName: t.whatsappTemplateName || null,
      whatsappVariables: t.whatsappVariables
        ? JSON.stringify(t.whatsappVariables)
        : null,
      emailSubject: t.emailSubject || null,
      emailBody: t.emailBody || null,
    };
    await db.notificationTemplate.upsert({
      where: { key: t.key },
      update: data,
      create: { key: t.key, active: true, ...data },
    });
    console.log(`\u2713 ${t.key}`);
  }
  console.log(`\nSeeded ${TEMPLATES.length} templates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
