import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const dupes = await prisma.$queryRaw<any[]>`
    SELECT "mealPlanId", duration::text, "mealsPerDay"::text, bundle::text, "isDigital", COUNT(*)::int AS n
    FROM plan_prices
    WHERE "mealPlanId" IS NOT NULL
    GROUP BY "mealPlanId", duration, "mealsPerDay", bundle, "isDigital"
    HAVING COUNT(*) > 1
    ORDER BY n DESC
    LIMIT 20;
  `
  console.log(`Duplicate groups on new key: ${dupes.length}`)
  if (dupes.length) console.table(dupes)
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())