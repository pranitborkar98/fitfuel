// prisma/seed-supplements.ts
// Phase 18-1 — Port the static catalog from lib/supplements-data.ts into DB.
//
// Idempotent: re-running upserts by slug. Links are NOT created here —
// affiliate URLs are added separately (via Prisma Studio for v1, admin UI in 18-2).
//
// Run once:   npx tsx prisma\seed-supplements.ts
//
// What gets migrated:
//   - 13 categories (protein, performance, recovery, vitamins, …)
//   - All Supplement rows from SUPPLEMENTS[] in lib/supplements-data.ts
//   - All rich educational content (mechanism, evidence, warnings, etc.)
//
// What does NOT get migrated (handle separately):
//   - Affiliate URLs (SupplementLink rows) — populate manually after seed
//   - STACKS configuration — stays in lib/supplements-data.ts as a slug-list
//     (curated bundles are config, not catalog)

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

import { SUPPLEMENTS } from "../lib/supplements-data";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
const db = prisma as any;

// Map static category slugs → human-readable display names + display order.
// Add new categories here if you add more in the future.
const CATEGORY_META: Record<string, { name: string; emoji?: string; sortOrder: number }> = {
  protein:    { name: "Protein",            emoji: "\uD83E\uDD69", sortOrder: 1 },  // 🥩
  performance:{ name: "Performance",        emoji: "\u26A1",         sortOrder: 2 },  // ⚡
  recovery:   { name: "Recovery",           emoji: "\uD83D\uDC8A", sortOrder: 3 },  // 💊
  vitamins:   { name: "Vitamins",           emoji: "\uD83C\uDF4A", sortOrder: 4 },  // 🍊
  minerals:   { name: "Minerals",           emoji: "\u2728",         sortOrder: 5 },  // ✨
  adaptogens: { name: "Adaptogens",         emoji: "\uD83C\uDF3F", sortOrder: 6 },  // 🌿
  health:     { name: "General Health",     emoji: "\u2764\uFE0F",  sortOrder: 7 },  // ❤️
  joints:     { name: "Joint Support",      emoji: "\uD83E\uDDB4", sortOrder: 8 },  // 🦴
  gut:        { name: "Gut Health",         emoji: "\uD83E\uDDA0", sortOrder: 9 },  // 🦠
  weight:     { name: "Weight Management",  emoji: "\u2696\uFE0F",  sortOrder: 10 }, // ⚖️
  hormones:   { name: "Hormones",           emoji: "\uD83C\uDF21\uFE0F", sortOrder: 11 }, // 🌡️
  cognitive:  { name: "Cognitive",          emoji: "\uD83E\uDDE0", sortOrder: 12 }, // 🧠
  sleep:      { name: "Sleep",              emoji: "\uD83C\uDF19", sortOrder: 13 }, // 🌙
};

function goalToEnum(g: string): string {
  return g.toUpperCase(); // "muscle_gain" → "MUSCLE_GAIN"
}

async function main() {
  console.log("→ Phase 18-1 supplement catalog migration starting…");
  console.log(`→ Found ${SUPPLEMENTS.length} static supplements to migrate.`);

  // ───────────────── 1. Categories ─────────────────
  const usedCategorySlugs = Array.from(new Set(SUPPLEMENTS.map((s: any) => s.category)));
  const categoryMap: Record<string, string> = {}; // slug → categoryId

  for (const slug of usedCategorySlugs) {
    const meta = CATEGORY_META[slug] || { name: slug, sortOrder: 99 };
    const cat = await db.supplementCategory.upsert({
      where: { slug },
      create: { slug, name: meta.name, emoji: meta.emoji, sortOrder: meta.sortOrder, isActive: true },
      update: { name: meta.name, emoji: meta.emoji, sortOrder: meta.sortOrder },
    });
    categoryMap[slug] = cat.id;
    console.log(`  ✓ Category: ${slug} (${cat.name})`);
  }

  // ───────────────── 2. Supplements ─────────────────
  let created = 0;
  let updated = 0;

  for (const s of SUPPLEMENTS) {
    const slug = s.id; // static `id` is already the slug
    const categoryId = categoryMap[s.category];
    if (!categoryId) {
      console.warn(`  ! Skipping ${slug} — unknown category "${s.category}"`);
      continue;
    }

    const existing = await db.supplement.findUnique({ where: { slug }, select: { id: true } });

    const data: any = {
      name: s.name,
      aka: s.aka || [],
      tagline: s.tagline || null,
      description: s.description || null,
      mechanism: s.mechanism || null,
      benefits: s.benefits || [],
      dosage: s.dosage || null,
      timing: s.timing || null,
      onsetTime: s.onsetTime || null,
      halfLife: s.halfLife || null,
      form: s.form || null,
      cyclingRequired: !!s.cyclingRequired,
      cyclingProtocol: s.cyclingProtocol || null,
      stacksWith: s.stacksWith || [],
      avoidWith: s.avoidWith || [],
      warnings: s.warnings || null,
      sideEffects: s.sideEffects || [],
      genderNotes: s.genderNotes || null,
      ageNotes: s.ageNotes || null,
      evidenceLevel: s.evidenceLevel || null,
      studyCount: s.studyCount || null,
      keyStudyFindings: s.keyStudyFindings || [],
      priceRange: s.priceRange || null,
      valueRating: s.valueRating || null,
      veganFriendly: !!s.veganFriendly,
      certificationNote: s.certificationNote || null,
      popular: !!s.popular,
      indiaAvailability: s.indiaAvailability || null,
      indiaNote: s.indiaNote || null,
      emoji: s.emoji || null,
      accentColor: s.accent || null,
      recommendedFor: (s.goals || []).map(goalToEnum),
      categoryId,
      isActive: true,
    };

    await db.supplement.upsert({
      where: { slug },
      create: { slug, ...data },
      update: data,
    });

    if (existing) updated++;
    else created++;
  }

  console.log(`\n→ Done. ${created} created, ${updated} updated.`);
  console.log("→ Categories:", Object.keys(categoryMap).length);
  console.log("\nNext steps:");
  console.log("  1. Open Prisma Studio:  npx prisma studio");
  console.log("  2. Add SupplementLink rows manually for each product");
  console.log("     (or wait for Phase 18-2 admin UI)");
  console.log("  3. Each link needs: supplementId, network, affiliateUrl, priceRs, mrpRs");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
