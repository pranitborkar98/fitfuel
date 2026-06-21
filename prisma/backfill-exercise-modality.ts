/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config"; // ← load .env so DATABASE_URL is set before lib/prisma builds the pool
// prisma/backfill-exercise-modality.ts
// EX-1: assign `modality` + real `met` to every Exercise, derived from the
// free-exercise-db category + equipment. Idempotent — safe to re-run.
//
//   npx tsx prisma/backfill-exercise-modality.ts
//
// modality vocabulary: strength | cardio | hiit | calisthenics | mobility | sport
// (sport is reserved for future curated content; nothing in free-db maps to it.)

import { prisma } from "../lib/prisma";

const db = prisma as any;

async function main() {
  console.log("⏳ Backfilling exercise modality + MET...");

  // 1. cardio
  await db.exercise.updateMany({
    where: { category: "cardio" },
    data: { modality: "cardio", met: 7.0 },
  });

  // 2. plyometrics → HIIT-capable (explosive, interval-friendly)
  await db.exercise.updateMany({
    where: { category: "plyometrics" },
    data: { modality: "hiit", met: 8.0 },
  });

  // 3. stretching → mobility
  await db.exercise.updateMany({
    where: { category: "stretching" },
    data: { modality: "mobility", met: 2.5 },
  });

  // 4. heavy barbell disciplines → strength, vigorous
  await db.exercise.updateMany({
    where: { category: { in: ["strongman", "powerlifting", "olympic weightlifting"] } },
    data: { modality: "strength", met: 6.0 },
  });

  // 5. strength: split bodyweight (calisthenics) vs loaded (strength)
  await db.exercise.updateMany({
    where: { category: "strength", equipment: { in: ["body only", "none"] } },
    data: { modality: "calisthenics", met: 4.5 },
  });
  await db.exercise.updateMany({
    where: { category: "strength", equipment: { notIn: ["body only", "none"] } },
    data: { modality: "strength", met: 5.0 },
  });
  // strength rows with NULL equipment → treat as bodyweight calisthenics
  await db.exercise.updateMany({
    where: { category: "strength", equipment: null },
    data: { modality: "calisthenics", met: 4.5 },
  });

  // Report
  const groups = await db.exercise.groupBy({
    by: ["modality"],
    _count: { id: true },
  });
  console.log("\n📊 Modality breakdown:");
  groups
    .sort((a: any, b: any) => b._count.id - a._count.id)
    .forEach((g: any) => console.log(`   ${String(g.modality).padEnd(14)} ${g._count.id}`));

  console.log("\n✅ Backfill complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
