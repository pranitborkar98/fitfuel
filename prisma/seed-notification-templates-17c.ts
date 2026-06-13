// prisma/seed-notification-templates-17c.ts
// Phase 17C-1 — seed two new notification templates.
//
// Run once:   npx tsx prisma\seed-notification-templates-17c.ts
//
// Safe to re-run (upserts on `key`).
//
// Schema match (per schema.prisma, model NotificationTemplate):
//   key (unique), name, category, channel, isStaff,
//   emailSubject, emailBody, active

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
const db = prisma as any;

const TEMPLATES = [
  {
    key: "staff_new_partner_application",
    name: "Staff — new partner application",
    description: "Sent to OWNER/ADMIN when a new partner applies via /partners/apply.",
    category: "partner",
    channel: "EMAIL",
    isStaff: true,
    active: true,
    emailSubject: "New partner application: {{partnerName}} ({{partnerType}})",
    emailBody: `<p>A new partner has applied via /partners/apply:</p>
<ul>
  <li><strong>Name:</strong> {{partnerName}}</li>
  <li><strong>Type:</strong> {{partnerType}}</li>
  <li><strong>Code:</strong> {{partnerCode}}</li>
</ul>
<p>Review and approve here: <a href="{{adminUrl}}">{{adminUrl}}</a></p>`,
  },
  {
    key: "partner_payout_paid",
    name: "Partner — payout paid",
    description: "Sent to a partner-owner when their monthly payout is marked PAID.",
    category: "partner",
    channel: "EMAIL",
    isStaff: false,
    active: true,
    emailSubject: "Your FitFuel payout of \u20B9{{amountRs}} has been paid",
    emailBody: `<p>Hi {{partnerName}},</p>
<p>Your FitFuel referral payout for <strong>{{period}}</strong> has been paid.</p>
<ul>
  <li><strong>Amount:</strong> \u20B9{{amountRs}}</li>
  <li><strong>Payment reference:</strong> {{paymentRef}}</li>
</ul>
<p>Thanks for partnering with us. Keep sharing your code!</p>`,
  },
];

async function main() {
  for (const t of TEMPLATES) {
    await db.notificationTemplate.upsert({
      where: { key: t.key },
      create: t,
      update: {
        name: t.name,
        description: t.description,
        category: t.category,
        channel: t.channel,
        isStaff: t.isStaff,
        active: t.active,
        emailSubject: t.emailSubject,
        emailBody: t.emailBody,
      },
    });
    console.log("Upserted template:", t.key);
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
