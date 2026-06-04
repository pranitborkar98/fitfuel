import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });
import { prisma } from "../lib/prisma";
async function main() {
  const orders = await prisma.order.count();
  const plans = await prisma.userActivePlan.count();
  const users = await prisma.user.count();
  console.log("Orders:", orders);
  console.log("UserActivePlans:", plans);
  console.log("Users:", users);
}
main().finally(() => prisma.$disconnect());