import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

prisma.foodItem.findMany({
  select: { id: true, name: true, per100Calories: true, per100Protein: true }
})
  .then(items => items.forEach(i => console.log(`${i.id} | ${i.name} | ${i.per100Calories} kcal | ${i.per100Protein}g protein`)))
  .finally(() => prisma.$disconnect())