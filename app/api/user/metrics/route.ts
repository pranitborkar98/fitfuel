import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson, readQuery } from "@/lib/validation/core";
import { metricsQuerySchema, metricsPostSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await enforceRateLimit(req, "read", session.user.id);
  if (!rl.ok) return rl.response;
  const q = readQuery(req, metricsQuerySchema);
  if (!q.ok) return q.response;
  const limit = q.data.limit;

  const readings = await prisma.bodyMetric.findMany({
    where:   { userId: session.user.id },
    orderBy: { measuredAt: "desc" },
    take:    limit,
  });

  return NextResponse.json({ readings });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;
  const parsed = await readJson(req, metricsPostSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const {
    weight, bmi, bodyFatRate, fatFreeWeight, subcutaneousFat,
    visceralFat, bodyWater, skeletalMuscle, muscleMass, boneMass,
    protein, bmr, bodyAge, recordedAt,
  } = body;

  const extraFields: Record<string, number> = {};
  if (fatFreeWeight   != null) extraFields.fatFreeWeight   = fatFreeWeight;
  if (subcutaneousFat != null) extraFields.subcutaneousFat = subcutaneousFat;
  if (skeletalMuscle  != null) extraFields.skeletalMuscle  = skeletalMuscle;
  if (bmr             != null) extraFields.bmr              = bmr;
  const notesJson = Object.keys(extraFields).length > 0
    ? JSON.stringify(extraFields)
    : undefined;

  const reading = await prisma.bodyMetric.create({
    data: {
      userId:      session.user.id,
      weightKg:    weight        ?? null,
      bmi:         bmi           ?? null,
      bodyFatPct:  bodyFatRate   ?? null,
      muscleMassKg: muscleMass   ?? null,
      waterPct:    bodyWater     ?? null,
      boneMassKg:  boneMass      ?? null,
      visceralFat: visceralFat   ?? null,
      metabolicAge: bodyAge != null ? Math.round(bodyAge) : null,
      proteinPct:  protein       ?? null,
      source:      body.source   ?? "manual",
      notes:       notesJson,
      measuredAt:  recordedAt ? new Date(recordedAt) : new Date(),
    },
  });

  return NextResponse.json({ reading }, { status: 201 });
}
