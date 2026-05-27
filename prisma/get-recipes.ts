import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const recipes = await prisma.recipe.findMany({
    select: { id: true, slug: true, mealType: true },
    orderBy: { mealType: 'asc' }
  })
  console.log(JSON.stringify(recipes, null, 2))
  await prisma.$disconnect()
  await pool.end()
}

main()
