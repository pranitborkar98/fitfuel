// app/api/cron/generate-deliveries/route.ts
// Phase 11 -- the delivery generator. Runs nightly (Vercel Cron, 11 PM IST).
// For every ACTIVE subscriber whose plan covers tomorrow (and didn't skip it),
// it creates ONE delivery -- all their meals together -- stamped with the
// customer's chosen window (MORNING / EVENING). Idempotent: re-running won't
// create duplicates.
//
// Manual test (with your CRON_SECRET):
//   curl -H "Authorization: Bearer <CRON_SECRET>" \
//     "https://fitfuel-eosin.vercel.app/api/cron/generate-deliveries?date=2026-06-05"

import { prisma } from "@/lib/prisma";
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

// target = tomorrow at UTC midnight (matches the board/driver "today" query convention).
// ?date=YYYY-MM-DD overrides, for testing.
function targetDay(override: string | null): Date {
  if (override) return new Date(`${override}T00:00:00.000Z`);
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function sameUTCDate(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" automatically.
  const expected = process.env.CRON_SECRET;
  if (expected && req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = targetDay(req.nextUrl.searchParams.get("date"));

  const plans = await prisma.userActivePlan.findMany({
   where: {
  status: "active",
  isDigital: false,           // Phase 13D: exclude cook-at-home digital buyers
  startDate: { lte: date },
  endDate: { gte: date },
  orderId: { not: null },
},
    select: {
      id: true,
      orderId: true,
      mealsPerDay: true,
      deliveryWindow: true,
      skipDates: true,
    },
  });

  let created = 0;
  let skipped = 0;
  let already = 0;

  for (const plan of plans) {
    // customer skipped this date?
    if (plan.skipDates?.some(sd => sameUTCDate(new Date(sd), date))) {
      skipped++;
      continue;
    }
    // already generated (idempotent re-run)?
    const exists = await prisma.delivery.findFirst({
      where: { orderId: plan.orderId!, deliveryDate: date },
      select: { id: true },
    });
    if (exists) {
      already++;
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
    created++;
  }

  return NextResponse.json({
    date: date.toISOString().slice(0, 10),
    activePlans: plans.length,
    created,
    alreadyExisted: already,
    skipped,
  });
}