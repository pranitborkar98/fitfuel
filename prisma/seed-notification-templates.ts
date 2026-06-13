// prisma/seed-notification-templates.ts
// Phase 16A + 16B + 16C + 17A templates. Idempotent (upsert by key).
// Run: npx tsx --env-file=.env.local prisma/seed-notification-templates.ts

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
  ${ctaText && ctaHref ? `<a href="${ctaHref}" style="display:inline-block;background:#84cc16;color:#000;padding:12px 24px;text-decoration:none;font-weight:700;border-radius:4px;margin-top:24px">${ctaText}</a>` : ""}
  <p style="color:#555;margin-top:40px;font-size:12px;border-top:1px solid #1a1a1a;padding-top:16px">FitFuel \u00B7 Pune \u00B7 <a href="https://fitfuel.in/dashboard/notification-settings" style="color:#666;text-decoration:underline">Manage notifications</a></p>
</div>`;

const STAFF_SHELL = (
  heading: string,
  rows: Array<[string, string]>
) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#080808;color:#eaeaea;line-height:1.55">
  <div style="font-size:11px;color:#84cc16;font-weight:700;letter-spacing:1px;text-transform:uppercase">FITFUEL \u00B7 STAFF ALERT</div>
  <h1 style="font-size:20px;margin:14px 0 16px;color:#fff;font-weight:700">${heading}</h1>
  <table style="width:100%;border-collapse:collapse">
    ${rows.map(([k, v]) => `<tr><td style="padding:8px 0;color:#888;font-size:13px;border-top:1px solid #1a1a1a">${k}</td><td style="padding:8px 0;text-align:right;color:#eee;font-size:13px;border-top:1px solid #1a1a1a">${v}</td></tr>`).join("")}
  </table>
  <p style="color:#555;margin-top:32px;font-size:12px">Sent automatically by FitFuel.</p>
</div>`;

const TEMPLATES: SeedTpl[] = [
  // ─── 16A ───
  { key: "order_confirmed", name: "Order confirmed (customer)", description: "Fires after PayU success or COD order placement", channel: "BOTH", category: "orderUpdates", whatsappTemplateName: "ff_order_confirmed", whatsappVariables: ["name", "orderNumber", "planName", "amount"], emailSubject: "Order confirmed \u2014 {{orderNumber}}", emailBody: EMAIL_SHELL("Hi {{name}}, your order is confirmed", `<p>Welcome to FitFuel. Here are your order details:</p><table style="width:100%;margin:20px 0;border-collapse:collapse"><tr><td style="padding:8px 0;color:#888">Order #</td><td style="padding:8px 0;text-align:right;color:#eee">{{orderNumber}}</td></tr><tr><td style="padding:8px 0;color:#888;border-top:1px solid #1a1a1a">Plan</td><td style="padding:8px 0;text-align:right;color:#eee;border-top:1px solid #1a1a1a">{{planName}}</td></tr><tr><td style="padding:8px 0;color:#888;border-top:1px solid #1a1a1a">Amount</td><td style="padding:8px 0;text-align:right;color:#84cc16;font-weight:700;border-top:1px solid #1a1a1a">&#8377;{{amount}}</td></tr></table><p style="color:#888;font-size:13px">Deliveries start as scheduled.</p>`, "Go to dashboard", "https://fitfuel.in/dashboard") },
  { key: "delivery_dispatched", name: "Delivery on the way (customer)", description: "Fires on first GET to driver app for the day", channel: "BOTH", category: "deliveryUpdates", whatsappTemplateName: "ff_delivery_dispatched", whatsappVariables: ["name", "windowLabel", "driverName", "driverPhone"], emailSubject: "Your FitFuel meal is on the way", emailBody: EMAIL_SHELL("Hi {{name}}, your meal is on the way", `<p>Today's delivery is out for {{windowLabel}}.</p><table style="width:100%;margin:20px 0;border-collapse:collapse"><tr><td style="padding:8px 0;color:#888">Driver</td><td style="padding:8px 0;text-align:right;color:#eee">{{driverName}}</td></tr><tr><td style="padding:8px 0;color:#888;border-top:1px solid #1a1a1a">Contact</td><td style="padding:8px 0;text-align:right;color:#84cc16;border-top:1px solid #1a1a1a">{{driverPhone}}</td></tr></table><p style="color:#888;font-size:13px">Please confirm receipt on your dashboard once it arrives.</p>`, "Open dashboard", "https://fitfuel.in/dashboard") },
  { key: "delivery_issue_ack", name: "Delivery issue acknowledged (customer)", description: "Fires when customer reports a delivery issue", channel: "BOTH", category: "deliveryUpdates", whatsappTemplateName: "ff_delivery_issue_ack", whatsappVariables: ["name"], emailSubject: "We received your delivery issue report", emailBody: EMAIL_SHELL("We're on it, {{name}}", `<p>We received your report about today's delivery. Our team will reach out within 2 hours to resolve it.</p><p style="color:#888;font-size:13px">Thanks for flagging \u2014 your feedback is how we get better every week.</p>`) },
  { key: "staff_new_order", name: "New order alert (staff)", description: "Fires to OWNER/ADMIN when an order is placed", channel: "BOTH", category: "staff", isStaff: true, whatsappTemplateName: "ff_staff_new_order", whatsappVariables: ["orderNumber", "customerName", "planName", "amount"], emailSubject: "[FitFuel] New order {{orderNumber}}", emailBody: STAFF_SHELL("New order placed", [["Order #", "{{orderNumber}}"], ["Customer", "{{customerName}}"], ["Plan", "{{planName}}"], ["Amount", "&#8377;{{amount}}"]]) },
  { key: "staff_delivery_issue", name: "Delivery issue alert (staff)", description: "Fires to OWNER/DISPATCH when a customer reports a delivery issue", channel: "BOTH", category: "staff", isStaff: true, whatsappTemplateName: "ff_staff_delivery_issue", whatsappVariables: ["customerName", "orderNumber", "issue"], emailSubject: "[FitFuel] Delivery issue \u2014 order {{orderNumber}}", emailBody: STAFF_SHELL("Delivery issue reported", [["Customer", "{{customerName}}"], ["Order #", "{{orderNumber}}"], ["Issue", "{{issue}}"]]) },

  // ─── 16B ───
  { key: "weekly_digest", name: "Weekly Digest (customer)", description: "Sunday \u2014 last 7 days summary", channel: "BOTH", category: "weeklyDigest", whatsappTemplateName: "ff_weekly_digest", whatsappVariables: ["name", "score", "label"], emailSubject: "Your FitFuel week \u2014 score {{score}}", emailBody: EMAIL_SHELL("Hi {{name}}, here's your week", `<p>You finished the week with a consistency score of:</p><div style="text-align:center;margin:24px 0"><div style="font-size:64px;color:#84cc16;font-weight:800;letter-spacing:-2px;line-height:1">{{score}}</div><div style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-top:4px">{{label}}</div></div><p style="color:#aaa;font-size:14px;margin-bottom:8px">Breakdown by habit:</p><table style="width:100%;border-collapse:collapse;margin-top:8px"><tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #1a1a1a">Meals logged</td><td style="padding:10px 0;text-align:right;color:#eee;font-size:13px;border-top:1px solid #1a1a1a">{{mealsPoints}}</td></tr><tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #1a1a1a">Workouts</td><td style="padding:10px 0;text-align:right;color:#eee;font-size:13px;border-top:1px solid #1a1a1a">{{workoutsPoints}}</td></tr><tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #1a1a1a">Hydration</td><td style="padding:10px 0;text-align:right;color:#eee;font-size:13px;border-top:1px solid #1a1a1a">{{waterPoints}}</td></tr><tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #1a1a1a">Weigh-ins</td><td style="padding:10px 0;text-align:right;color:#eee;font-size:13px;border-top:1px solid #1a1a1a">{{weighInPoints}}</td></tr><tr><td style="padding:10px 0;color:#888;font-size:13px;border-top:1px solid #1a1a1a">No-skips</td><td style="padding:10px 0;text-align:right;color:#eee;font-size:13px;border-top:1px solid #1a1a1a">{{noSkipPoints}}</td></tr></table><p style="color:#888;font-size:13px;margin-top:24px">Keep it going \u2014 small wins compound.</p>`, "See your full progress", "https://fitfuel.in/dashboard") },
  { key: "morning_meal_preview", name: "Morning meal preview (customer)", description: "Daily 7 AM IST \u2014 today's meals + log nudge", channel: "BOTH", category: "morningPush", whatsappTemplateName: "ff_morning_preview", whatsappVariables: ["name", "totalCalories"], emailSubject: "Today's plate \u2014 {{totalCalories}} cal", emailBody: EMAIL_SHELL("Good morning, {{name}}", `<p>Here's what's on your plate today:</p><table style="width:100%;border-collapse:collapse;margin:20px 0">{{mealsList}}</table><p style="color:#84cc16;font-size:13px;font-weight:600">Total: {{totalCalories}} calories</p><p style="color:#888;font-size:13px;margin-top:20px">Don't forget to log yesterday's workouts and weigh-in.</p>`, "Log on dashboard", "https://fitfuel.in/dashboard") },
  { key: "evening_recap", name: "Evening recap (customer)", description: "Daily 9 PM IST \u2014 tomorrow preview + log reminder", channel: "BOTH", category: "eveningRecap", whatsappTemplateName: "ff_evening_recap", whatsappVariables: ["name"], emailSubject: "How was today? Quick log + tomorrow preview", emailBody: EMAIL_SHELL("Closing out the day, {{name}}", `<p>Two quick things before bed:</p><ol style="color:#bbb;font-size:14px;padding-left:20px;margin:16px 0"><li style="margin-bottom:8px">Log today's meals and weigh-in if you haven't already.</li><li>Here's tomorrow's plate so you can plan ahead:</li></ol><table style="width:100%;border-collapse:collapse;margin:16px 0">{{mealsList}}</table><p style="color:#84cc16;font-size:13px;font-weight:600">Tomorrow's total: {{totalCalories}} calories</p><p style="color:#888;font-size:13px;margin-top:20px">Consistency compounds. See you tomorrow.</p>`, "Log today", "https://fitfuel.in/dashboard") },

  // ─── 16C ───
  { key: "payment_pending", name: "Payment pending (customer)", description: "Fires 24h after order placed if payment still pending (non-COD)", channel: "BOTH", category: "nudges", whatsappTemplateName: "ff_payment_pending", whatsappVariables: ["name", "orderNumber", "amount"], emailSubject: "Complete your FitFuel order \u2014 {{orderNumber}}", emailBody: EMAIL_SHELL("Hi {{name}}, your order is waiting", `<p>Your order <strong style="color:#eee">{{orderNumber}}</strong> for <strong style="color:#84cc16">&#8377;{{amount}}</strong> is still pending payment.</p><p>Complete payment now to start your meals on schedule \u2014 we hold your slot for 48 hours after which the order is automatically cancelled.</p>`, "Complete payment", "https://fitfuel.in/dashboard") },
  { key: "plan_ending", name: "Plan ending soon (customer)", description: "Fires 2\u20133 days before UserActivePlan.endDate", channel: "BOTH", category: "nudges", whatsappTemplateName: "ff_plan_ending", whatsappVariables: ["name", "planName", "daysLeft"], emailSubject: "Your FitFuel plan ends in {{daysLeft}} days", emailBody: EMAIL_SHELL("Hi {{name}}, time to renew", `<p>Your <strong style="color:#eee">{{planName}}</strong> ends in <strong style="color:#84cc16">{{daysLeft}} days</strong>.</p><p>Renew now to keep your streak going without a break in deliveries. Don't let the consistency you've built reset.</p>`, "Renew now", "https://fitfuel.in/plans") },
  { key: "re_engagement", name: "Re-engagement (customer)", description: "Fires max 1x/week to active subs with no meal logs in 3+ days", channel: "BOTH", category: "nudges", whatsappTemplateName: "ff_re_engagement", whatsappVariables: ["name"], emailSubject: "Quick check-in from FitFuel", emailBody: EMAIL_SHELL("Hi {{name}}, how's it going?", `<p>We noticed you haven't logged any meals in the last few days.</p><p>Quick reminder: logging takes 30 seconds and is where your consistency score comes from. Even rough estimates count.</p><p style="color:#888;font-size:13px">The data also makes our weekly insights actually useful for you.</p>`, "Log meals", "https://fitfuel.in/dashboard") },

  // ─── 17A ───
  {
    key: "partner_referral_earned",
    name: "Referral earned (referrer/partner)",
    description: "Fires when a referee's first paid order completes \u2014 sent to the referrer (customer or partner)",
    channel: "BOTH",
    category: "nudges",
    whatsappTemplateName: "ff_partner_referral_earned",
    whatsappVariables: ["name", "refereeName", "rewardLabel"],
    emailSubject: "You just earned a referral reward",
    emailBody: EMAIL_SHELL(
      "Nice work, {{name}}",
      `<p><strong style="color:#eee">{{refereeName}}</strong> just placed their first FitFuel order \u2014 thanks to you.</p>
       <div style="background:#0a1505;border:1px solid #1f3a08;border-radius:6px;padding:16px;margin:20px 0;text-align:center">
         <div style="font-size:13px;color:#84cc16;text-transform:uppercase;letter-spacing:1px;font-weight:600">Your reward</div>
         <div style="font-size:20px;color:#fff;font-weight:700;margin-top:6px">{{rewardLabel}}</div>
       </div>
       <p style="color:#888;font-size:13px">Keep sharing your code \u2014 every paid signup compounds.</p>`,
      "View your referrals",
      "https://fitfuel.in/dashboard/referrals"
    ),
  },
];

async function main() {
  const db = prisma as any;
  for (const t of TEMPLATES) {
    const data = {
      name: t.name, description: t.description, channel: t.channel, category: t.category,
      isStaff: t.isStaff || false,
      whatsappTemplateName: t.whatsappTemplateName || null,
      whatsappVariables: t.whatsappVariables ? JSON.stringify(t.whatsappVariables) : null,
      emailSubject: t.emailSubject || null, emailBody: t.emailBody || null,
    };
    await db.notificationTemplate.upsert({ where: { key: t.key }, update: data, create: { key: t.key, active: true, ...data } });
    console.log(`\u2713 ${t.key}`);
  }
  console.log(`\nSeeded ${TEMPLATES.length} templates`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
