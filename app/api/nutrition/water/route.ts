// app/api/nutrition/water/route.ts
// GET   /api/nutrition/water?date=YYYY-MM-DD  — get ml for the day
// POST  /api/nutrition/water                  — add/subtract/set water

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();
  date.setUTCHours(0, 0, 0, 0);

  const log = await prisma.waterLog.findUnique({
    where: { userId_entryDate: { userId: session.user.id, entryDate: date } },
  });

  return NextResponse.json({
    amountMl: log?.amountMl ?? 0,
    date: date.toISOString().split("T")[0],
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { date, amountMl, action = "add" } = body;

  if (!amountMl) {
    return NextResponse.json({ error: "amountMl required" }, { status: 400 });
  }

  const entryDate = date ? new Date(date) : new Date();
  entryDate.setUTCHours(0, 0, 0, 0);

  const existing = await prisma.waterLog.findUnique({
    where: { userId_entryDate: { userId: session.user.id, entryDate } },
  });

  let newAmount: number;
  if (action === "set")           newAmount = Math.max(0, Number(amountMl));
  else if (action === "subtract") newAmount = Math.max(0, (existing?.amountMl ?? 0) - Number(amountMl));
  else                            newAmount = (existing?.amountMl ?? 0) + Number(amountMl);

  const log = await prisma.waterLog.upsert({
    where:  { userId_entryDate: { userId: session.user.id, entryDate } },
    update: { amountMl: newAmount },
    create: { userId: session.user.id, entryDate, amountMl: newAmount },
  });

  return NextResponse.json(log);
}
