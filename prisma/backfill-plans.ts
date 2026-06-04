import { prisma } from "../lib/prisma";
async function main() {
  const orders = await prisma.order.findMany({ where: { status: "CONFIRMED", userActivePlans: { none: {} } }, include: { items: true } });
  const mealPlan = await prisma.mealPlan.findFirst();
  const DUR_DAYS: Record<string, number> = { TRIAL_DAY: 1, WEEKLY: 7, BI_WEEKLY: 14, MONTHLY_EXCL_WEEKENDS: 26, ONE_MONTH: 30, TWO_MONTH: 60, THREE_MONTH: 90 };
  let created = 0;
  for (const order of orders) {
    const item = order.items[0];
    const durEnum = (item?.duration as string) ?? "ONE_MONTH";
    const mealEnum = (item?.mealsPerDay as string) ?? "SNACK_DINNER";
    const days = DUR_DAYS[durEnum] ?? 30;
    const startDate = order.createdAt ?? new Date();
    const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + days);
    await prisma.userActivePlan.create({ data: { userId: order.userId, mealPlanId: mealPlan!.id, orderId: order.id, startDate, endDate, currentDay: 1, status: "active", mealsPerDay: mealEnum as any, duration: durEnum as any, deliveryWindow: "MORNING" as any, skipDates: [] } });
    console.log("Created plan for:", order.orderNumber); created++;
  }
  console.log("Done. Created:", created);
}
main().catch(console.error).finally(() => prisma.$disconnect());