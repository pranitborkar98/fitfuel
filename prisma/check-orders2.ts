import { prisma } from "../lib/prisma";
async function main() {
  const orders = await prisma.order.findMany({
    where: { status: "CONFIRMED" },
    include: { address: true }
  });
  for (const o of orders) {
    console.log(JSON.stringify({
      num: o.orderNumber,
      mealsPerDay: o.mealsPerDay,
      duration: o.duration,
      totalRs: o.totalRs,
      mealPlanType: o.mealPlanType,
      addressLine: o.address?.line1,
      startDate: o.startDate,
      endDate: o.endDate,
    }, null, 2));
  }
}
main().finally(() => prisma.$disconnect());