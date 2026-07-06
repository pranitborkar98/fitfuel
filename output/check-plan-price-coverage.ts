import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT mp.tier::text AS tier,
           mp.category::text AS category,
           COUNT(DISTINCT mp.id)::int AS plans,
           COUNT(DISTINCT mp."productId")::int AS plans_with_product_link,
           COUNT(pp.id)::int AS price_rows_via_product
    FROM meal_plans mp
    LEFT JOIN plan_prices pp
      ON pp."productId" = mp."productId" AND pp."isDigital" = false
    GROUP BY mp.tier, mp.category
    ORDER BY mp.tier, mp.category;
  `
  console.table(rows)

  const orphans = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*)::int AS unlinked_plans
    FROM meal_plans
    WHERE "productId" IS NULL;
  `
  console.log('\nMealPlans with no productId link:', orphans[0]?.unlinked_plans)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())