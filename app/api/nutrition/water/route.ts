// app/api/nutrition/water/route.ts
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateOnly, parseDateOnly, todayIndiaDate } from "@/lib/date-only";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson, readQuery } from "@/lib/validation/core";
import { waterQuerySchema, waterPostSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await enforceRateLimit(req, "read", session.user.id);
  if (!rl.ok) return rl.response;
  const q = readQuery(req, waterQuerySchema);
  if (!q.ok) return q.response;

  const date = q.data.date ? parseDateOnly(q.data.date) : todayIndiaDate();
  if (!date) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  const log = await prisma.waterLog.findUnique({
    where: { userId_entryDate: { userId: session.user.id, entryDate: date } },
  });

  return NextResponse.json({
    amountMl: log?.amountMl ?? 0,
    date: formatDateOnly(date),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, waterPostSchema);
  if (!parsed.ok) return parsed.response;
  const { date, amountMl, action } = parsed.data;

  const entryDate = date ? parseDateOnly(date) : todayIndiaDate();
  if (!entryDate) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  if (entryDate.getTime() > todayIndiaDate().getTime()) {
    return NextResponse.json({ error: "Future water entries are not allowed" }, { status: 400 });
  }

  const existing = await prisma.waterLog.findUnique({
    where: { userId_entryDate: { userId: session.user.id, entryDate } },
  });

  let newAmount: number;
  if (action === "set")           newAmount = Math.max(0, Number(amountMl));
  else if (action === "subtract") newAmount = Math.max(0, (existing?.amountMl ?? 0) - Number(amountMl));
  else                            newAmount = (existing?.amountMl ?? 0) + Number(amountMl);
  newAmount = Math.min(20_000, Math.round(newAmount));

  const log = await prisma.waterLog.upsert({
    where:  { userId_entryDate: { userId: session.user.id, entryDate } },
    update: { amountMl: newAmount },
    create: { userId: session.user.id, entryDate, amountMl: newAmount },
  });

  return NextResponse.json(log);
}
