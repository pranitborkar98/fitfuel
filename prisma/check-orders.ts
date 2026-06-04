import { prisma } from "../lib/prisma";
async function main() {
  const orders = await prisma.order.findMany({
    where: { status: "CONFIRMED" },
    include: { userActivePlans: true, address: true, user: true }
  });
  for (const o of orders) {
    console.log(`${o.orderNumber} | ${o.user?.name} | plans: ${o.userActivePlans.length} | ${o.mealsPerDay} | ${o.duration}`);
  }
}
main().finally(() => prisma.$disconnect());