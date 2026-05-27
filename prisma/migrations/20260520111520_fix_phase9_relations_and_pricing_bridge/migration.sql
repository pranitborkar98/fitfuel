/*
  Warnings:

  - You are about to drop the column `foodEntryId` on the `meal_logs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mealLogId]` on the table `food_entries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mealPlanId,duration,mealsPerDay]` on the table `plan_prices` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "food_entries" ADD COLUMN     "mealLogId" TEXT;

-- AlterTable
ALTER TABLE "meal_logs" DROP COLUMN "foodEntryId";

-- AlterTable
ALTER TABLE "plan_prices" ADD COLUMN     "mealPlanId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_active_plans" ADD COLUMN     "duration" "PlanDuration",
ADD COLUMN     "mealsPerDay" "MealsPerDay";

-- CreateIndex
CREATE UNIQUE INDEX "food_entries_mealLogId_key" ON "food_entries"("mealLogId");

-- CreateIndex
CREATE UNIQUE INDEX "plan_prices_mealPlanId_duration_mealsPerDay_key" ON "plan_prices"("mealPlanId", "duration", "mealsPerDay");

-- AddForeignKey
ALTER TABLE "plan_prices" ADD CONSTRAINT "plan_prices_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_entries" ADD CONSTRAINT "food_entries_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "meal_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_productId_fkey" FOREIGN KEY ("productId") REFERENCES "meal_plan_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_active_plans" ADD CONSTRAINT "user_active_plans_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
