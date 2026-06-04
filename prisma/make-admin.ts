// prisma/make-admin.ts
// Phase 10 â€” promote a user to OWNER so they can open /admin.
// You log in once with Google (creates your User row as CUSTOMER), then run this.
//
// Run: npx tsx prisma/make-admin.ts you@email.com
//      npx tsx prisma/make-admin.ts you@email.com ADMIN   (default is OWNER)

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const email = process.argv[2];
  const role = (process.argv[3] ?? "OWNER").toUpperCase();

  if (!email) {
    console.error("âŒ Usage: npx tsx prisma/make-admin.ts <email> [OWNER|ADMIN]");
    process.exit(1);
  }
  if (role !== "OWNER" && role !== "ADMIN") {
    console.error("âŒ Role must be OWNER or ADMIN");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  if (!user) {
    console.error(`âŒ No user with email ${email}. Log in with Google once first, then re-run.`);
    process.exit(1);
  }

  await prisma.user.update({ where: { email }, data: { role: role as "OWNER" | "ADMIN" } });
  console.log(`âœ… ${user.name ?? email} is now ${role}. Open /admin`);
}

main()
  .catch(e => { console.error("âŒ Failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });