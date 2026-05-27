import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const plan = await prisma.mealPlan.findUnique({
    where: { slug: 'weight-loss-non-veg' },
    select: { id: true, slug: true, displayName: true }
  })
  console.log(JSON.stringify(plan, null, 2))
  await prisma.$disconnect()
  await pool.end()
}

main()
