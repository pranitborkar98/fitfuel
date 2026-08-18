// app/api/cron/generate-deliveries/route.ts
// Phase 11 -- the delivery generator. Runs nightly (Vercel Cron, 17:30 UTC).
// For every ACTIVE subscriber whose plan covers tomorrow (and didn't skip it),
// it creates ONE delivery -- all their meals together -- stamped with the
// customer's chosen window (MORNING / EVENING). Idempotent: re-running won't
// create duplicates.
//
// Phase 15B: subscriber selection + skip filtering now come from the SHARED
// resolver in lib/production.ts, so this cron and the Kitchen Production
// Dashboard can never disagree about who eats tomorrow (Decision P15-1).
//
// Manual test (with your CRON_SECRET):
//   curl -H "Authorization: Bearer <CRON_SECRET>" \
//     "https://fitfuel-eosin.vercel.app/api/cron/generate-deliveries?date=2026-06-05"

import { prisma } from "@/lib/prisma";
import { getActiveSubscribersForDate, targetDayUTC, ymd } from "@/lib/production";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// which meals go in the (single) drop, based on what they subscribed to
function mealsFor(m: string | null | undefined): string[] {
  switch (m) {
    case "BREAKFAST_LUNCH": return ["Breakfast", "Lunch"];
    case "SNACK_DINNER": return ["Snack", "Dinner"];
    case "ALL_FOUR": return ["Breakfast", "Lunch", "Snack", "Dinner"];
    default: return ["Breakfast", "Lunch", "Snack", "Dinner"];
  }
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" automatically.
  //
  // FAILS CLOSED. This was `if (expected && ...)`, which skipped the check
  // entirely whenever CRON_SECRET was unset — so any environment that lost the
  // variable (a fresh preview deployment, a half-finished rotation) silently
  // exposed a public endpoint that WRITES Delivery rows. An absent secret is
  // the case you most need the gate for, not the case to waive it in.
  // app/api/cron/snapshot-consistency already had it this way round; this is
  // the two of them agreeing.
  const expected = process.env.CRON_SECRET;
  if (!expected || req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const override = req.nextUrl.searchParams.get("date");
  const first = targetDayUTC(override);

  // TWO DAYS OF LOOKAHEAD, FROM ONE CRON.
  //
  // A single nightly run is a single point of failure: if it does not fire, the
  // kitchen wakes at 04:00 to no cook sheet and nobody is fed. The obvious fix
  // is a second cron a few hours before service — but this project is on
  // Vercel's Hobby plan, which allows a maximum of two cron jobs and both slots
  // are already taken (this job and snapshot-consistency). A third entry is
  // rejected at deploy time.
  //
  // So each run generates tomorrow AND the day after. A missed run is covered
  // by the previous night's second day, which means one skipped execution can
  // no longer starve a morning.
  //
  // This is only safe because the 21:00 cutoff now lives in
  // UserActivePlan.startDate, stamped at purchase (lib/order-cutoff.ts), rather
  // than in this job's schedule. Generating a day early therefore cannot
  // "lock in" the wrong subscriber set: anyone who orders tomorrow for the day
  // after simply has no Delivery row yet, and tomorrow's run creates it, because
  // the idempotency check below is per (orderId, deliveryDate) rather than
  // per-date. Hobby crons also fire at an approximate time within the hour,
  // which for the same reason no longer changes who eats.
  //
  // An explicit ?date= replay stays single-day, so a manual repair does exactly
  // what the operator asked for and nothing more.
  const targets = override ? [first] : [first, new Date(first.getTime() + 86_400_000)];

  const days: { date: string; activePlans: number; created: number; alreadyExisted: number; skipped: number }[] = [];
  let created = 0;
  let already = 0;

  for (const date of targets) {
    // Shared predicate: active, physical, in-range, has order, skip-filtered.
    const { total, served, skipped } = await getActiveSubscribersForDate(date);
    let dayCreated = 0;
    let dayAlready = 0;

    for (const plan of served) {
      // already generated (idempotent re-run)?
      const exists = await prisma.delivery.findFirst({
        where: { orderId: plan.orderId!, deliveryDate: date },
        select: { id: true },
      });
      if (exists) {
        dayAlready++;
        continue;
      }

      await prisma.delivery.create({
        data: {
          orderId: plan.orderId!,
          deliveryDate: date,
          status: "PREPARING",
          mealsIncluded: mealsFor(plan.mealsPerDay),
          deliveryWindow: plan.deliveryWindow ?? "MORNING", // MORNING / EVENING
        },
      });
      dayCreated++;
    }

    created += dayCreated;
    already += dayAlready;
    days.push({ date: ymd(date), activePlans: total, created: dayCreated, alreadyExisted: dayAlready, skipped });
  }

  return NextResponse.json({
    // `date` kept for anything already reading the old shape.
    date: ymd(first),
    days,
    created,
    alreadyExisted: already,
  });
}
