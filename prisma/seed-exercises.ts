// prisma/seed-exercises.ts
// Fetches ~873 exercises from free-exercise-db and upserts into Neon
// Run: npx tsx prisma/seed-exercises.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// Load .env.local (where DATABASE_URL lives in Next.js projects)
dotenv.config({ path: ".env" });

const pool    = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const EXERCISES_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

interface RawExercise {
  id: string;
  name: string;
  category: string;
  level: string;
  force: string | null;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  images: string[];
}

async function main() {
  console.log("⏳ Fetching exercises from free-exercise-db...");

  const res = await fetch(EXERCISES_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

  const exercises: RawExercise[] = await res.json();
  console.log(`✅ Fetched ${exercises.length} exercises`);

  console.log("⏳ Upserting into Neon (batches of 50)...");

  let upserted = 0;
  const BATCH = 50;

  for (let i = 0; i < exercises.length; i += BATCH) {
    const batch = exercises.slice(i, i + BATCH);

    await Promise.all(
      batch.map((ex) =>
        prisma.exercise.upsert({
          where: { id: ex.id },
          update: {
            name:             ex.name,
            category:         ex.category,
            level:            ex.level,
            force:            ex.force     ?? null,
            mechanic:         ex.mechanic  ?? null,
            equipment:        ex.equipment ?? null,
            primaryMuscles:   ex.primaryMuscles,
            secondaryMuscles: ex.secondaryMuscles,
            instructions:     ex.instructions,
            images:           ex.images,
          },
          create: {
            id:               ex.id,
            name:             ex.name,
            category:         ex.category,
            level:            ex.level,
            force:            ex.force     ?? null,
            mechanic:         ex.mechanic  ?? null,
            equipment:        ex.equipment ?? null,
            primaryMuscles:   ex.primaryMuscles,
            secondaryMuscles: ex.secondaryMuscles,
            instructions:     ex.instructions,
            images:           ex.images,
          },
        })
      )
    );

    upserted += batch.length;
    process.stdout.write(`\r   ${upserted}/${exercises.length} done...`);
  }

  console.log(`\n✅ Seeded ${upserted} exercises into Neon`);

  // Sanity check — breakdown by category
  const counts = await prisma.exercise.groupBy({
    by: ["category"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  console.log("\n📊 Breakdown by category:");
  counts.forEach((c) =>
    console.log(`   ${c.category.padEnd(30)} ${c._count.id}`)
  );

  const total = await prisma.exercise.count();
  console.log(`\n   Total in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
