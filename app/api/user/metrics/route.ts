import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── GET /api/user/metrics — fetch all readings for current user ─────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "30", 10);

  const readings = await prisma.bodyMetric.findMany({
    where:   { userId: session.user.id },
    orderBy: { measuredAt: "desc" },
    take:    limit,
  });

  return NextResponse.json({ readings });
}

// ─── POST /api/user/metrics — save a new reading ─────────────────────────────
// Field mapping: BodyMetricsClient → schema.prisma
//   weight          → weightKg
//   bodyFatRate     → bodyFatPct
//   muscleMass      → muscleMassKg
//   bodyWater       → waterPct
//   boneMass        → boneMassKg
//   bodyAge         → metabolicAge  (Int in schema — rounded)
//   bmi             → bmi           ✅ same
//   visceralFat     → visceralFat   ✅ same
//   protein         → proteinPct
//   subcutaneousFat → stored in notes JSON (not a schema column)
//   skeletalMuscle  → stored in notes JSON (not a schema column)
//   fatFreeWeight   → stored in notes JSON (not a schema column)
//   bmr             → stored in notes JSON (not a schema column)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const {
    weight, bmi, bodyFatRate, fatFreeWeight, subcutaneousFat,
    visceralFat, bodyWater, skeletalMuscle, muscleMass, boneMass,
    protein, bmr, bodyAge, recordedAt,
  } = body;

  // Pack the 4 fields not in schema into the notes column as JSON
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