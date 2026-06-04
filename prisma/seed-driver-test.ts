// prisma/seed-driver-test.ts
// Phase 10 — create a test driver, give it a token, and make sure it has at least
// one delivery for TODAY so you can open the link and try the flow.
//
// Run: npx tsx prisma/seed-driver-test.ts
// Then open the printed /driver/<token> URL on your phone.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { randomBytes } from "crypto";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  // 1. Create (or reuse) a test driver with a stable token
  const TOKEN = "test-driver-" + randomBytes(8).toString("hex");
  let driver = await prisma.driver.findFirst({ where: { name: "Test Driver" }, select: { id: true, accessToken: true } });
  if (!driver) {
    driver = await prisma.driver.create({
      data: { name: "Test Driver", phone: "9999999999", accessToken: TOKEN, isActive: true },
      select: { id: true, accessToken: true },
    });
    console.log("✅ Created Test Driver");
  } else {
    console.log("♻️  Reusing existing Test Driver");
  }

  // 2. Ensure at least one delivery for TODAY assigned to this driver
  const start = new Date(); start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);

  const existingToday = await prisma.delivery.count({
    where: { assignedDriverId: driver.id, deliveryDate: { gte: start, lt: end } },
  });

  if (existingToday === 0) {
    // try to attach unassigned deliveries for today first
    const unassigned = await prisma.delivery.findMany({
      where: { assignedDriverId: null, deliveryDate: { gte: start, lt: end } },
      select: { id: true }, take: 5,
    });
    if (unassigned.length > 0) {
      await prisma.delivery.updateMany({
        where: { id: { in: unassigned.map(d => d.id) } },
        data: { assignedDriverId: driver.id },
      });
      console.log(`✅ Assigned ${unassigned.length} existing delivery(ies) for today to the test driver`);
    } else {
      // create one test delivery from any existing order
      const order = await prisma.order.findFirst({ select: { id: true } });
      if (order) {
        await prisma.delivery.create({
          data: {
            orderId: order.id,
            deliveryDate: start,
            status: "OUT_FOR_DELIVERY",
            mealsIncluded: ["Breakfast", "Lunch", "Snack", "Dinner"],
            assignedDriverId: driver.id,
          },
        });
        console.log("✅ Created 1 test delivery for today (from an existing order)");
      } else {
        console.log("⚠️  No orders in DB — driver page will show 'no deliveries today'. Place a test order first.");
      }
    }
  } else {
    console.log(`ℹ️  Driver already has ${existingToday} delivery(ies) today`);
  }

  console.log("\n🔗 Open this on your phone:");
  console.log(`   /driver/${driver.accessToken}`);
  console.log(`   (full: https://fitfuel-eosin.vercel.app/driver/${driver.accessToken})`);
}

main()
  .catch(e => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
