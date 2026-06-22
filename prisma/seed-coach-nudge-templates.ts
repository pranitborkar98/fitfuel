// prisma/seed-coach-nudge-templates.ts
// AI Coach proactive nudges — notification templates. Idempotent (upsert by key).
// EMAIL-only for now: WhatsApp template names require MSG91/Meta approval, so we
// don't wire WhatsApp until those are approved (flip channel to "BOTH" + add
// whatsappTemplateName/whatsappVariables then). Category "nudges" so it respects
// the user's NotificationPreference.nudges toggle (sendNotification gates on it).
//
// Run: npx tsx --env-file=.env.local prisma/seed-coach-nudge-templates.ts

import { prisma } from "../lib/prisma";

interface SeedTpl {
  key: string;
  name: string;
  description: string;
  channel: "WHATSAPP" | "EMAIL" | "BOTH";
  category: string;
  emailSubject: string;
  emailBody: string;
}

// Mirrors the EMAIL_SHELL used in seed-notification-templates.ts (dark + lime).
const EMAIL_SHELL = (
  heading: string,
  bodyHtml: string,
  ctaText?: string,
  ctaHref?: string,
) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#080808;color:#eaeaea;line-height:1.55">
  <div style="font-family:'Syne',Arial,sans-serif;font-size:24px;color:#84cc16;font-weight:700;letter-spacing:-0.5px">FITFUEL</div>
  <div style="font-size:11px;color:#84cc16;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-top:18px">A note from your coach</div>
  <h1 style="font-size:22px;margin:10px 0 12px;color:#fff;font-weight:700">${heading}</h1>
  <div style="color:#bbb;font-size:15px">${bodyHtml}</div>
  ${ctaText && ctaHref ? `<a href="${ctaHref}" style="display:inline-block;background:#84cc16;color:#000;padding:12px 24px;text-decoration:none;font-weight:700;border-radius:4px;margin-top:24px">${ctaText}</a>` : ""}
  <p style="color:#555;margin-top:40px;font-size:12px;border-top:1px solid #1a1a1a;padding-top:16px">FitFuel \u00B7 Pune \u00B7 <a href="https://fitfuel.in/dashboard/notification-settings" style="color:#666;text-decoration:underline">Manage notifications</a></p>
</div>`;

const TEMPLATES: SeedTpl[] = [
  {
    key: "coach_plateau",
    name: "Coach — plateau detected",
    description: "Weight trend flat / recalibration stalled in a movement goal",
    channel: "EMAIL",
    category: "nudges",
    emailSubject: "Your {{goalWord}} has stalled \u2014 let's adjust",
    emailBody: EMAIL_SHELL(
      "Time to recalibrate, {{name}}",
      `<p>Your weight {{goalWord}} has held flat for about two weeks. That's normal \u2014 it just means your body has adapted and the targets need a nudge.</p><p>Open your Weekly Review and apply the recommended calorie adjustment in one tap. Small change, momentum back.</p>`,
      "Review &amp; recalibrate",
      "https://fitfuel.in/dashboard",
    ),
  },
  {
    key: "coach_milestone",
    name: "Coach — target reached",
    description: "Current weight crossed target weight (direction-aware)",
    channel: "EMAIL",
    category: "nudges",
    emailSubject: "You hit your target, {{name}}",
    emailBody: EMAIL_SHELL(
      "You hit {{targetWeight}} kg",
      `<p>That's the goal you set \u2014 reached. This is the hard part most people never get to, and you logged your way here.</p><p>Let's lock it in: time to set the next target or switch to a maintenance plan so the progress holds.</p>`,
      "Plan what's next",
      "https://fitfuel.in/dashboard",
    ),
  },
  {
    key: "coach_missed_workouts",
    name: "Coach — missed workouts",
    description: "Active on meals but zero workouts logged in the window",
    channel: "EMAIL",
    category: "nudges",
    emailSubject: "The gym's gone quiet, {{name}}",
    emailBody: EMAIL_SHELL(
      "Let's get a session in, {{name}}",
      `<p>Your meals are on track, but there are no workouts logged this week. Training is what turns a deficit into definition \u2014 don't leave it on the table.</p><p>Even one short session counts. Your plan already has today's recommended workout ready.</p>`,
      "Today's workout",
      "https://fitfuel.in/dashboard",
    ),
  },
  {
    key: "coach_low_rating",
    name: "Coach — low-rated meal",
    description: "A recent meal was rated 1\u20132",
    channel: "EMAIL",
    category: "nudges",
    emailSubject: "Not every meal's a hit \u2014 let's fix that",
    emailBody: EMAIL_SHELL(
      "Saw that, {{name}}",
      `<p>One of your recent meals didn't land. That's useful \u2014 it's exactly how we tune your plan to what you'll actually enjoy eating.</p><p>You can request a swap for the same slot, same macros, different dish. Tell us what missed and we'll sort it.</p>`,
      "Request a swap",
      "https://fitfuel.in/dashboard",
    ),
  },
];

async function main() {
  const db = prisma as any;
  let created = 0;
  let updated = 0;
  for (const t of TEMPLATES) {
    const existing = await db.notificationTemplate.findUnique({ where: { key: t.key } });
    await db.notificationTemplate.upsert({
      where: { key: t.key },
      create: { ...t, active: true, isStaff: false },
      update: {
        name: t.name,
        description: t.description,
        channel: t.channel,
        category: t.category,
        emailSubject: t.emailSubject,
        emailBody: t.emailBody,
        active: true,
      },
    });
    if (existing) updated++;
    else created++;
    console.log(`  ${existing ? "updated" : "created"}  ${t.key}`);
  }
  console.log(`\nCoach nudge templates seeded: ${created} created, ${updated} updated.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await (prisma as any).$disconnect();
  });
