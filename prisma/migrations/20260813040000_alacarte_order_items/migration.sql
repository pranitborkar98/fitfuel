-- À LA CARTE ORDER ITEMS
--
-- Until now an OrderItem could only be a subscription: diet, duration and
-- mealsPerDay were NOT NULL and productId pointed at a MealPlanProduct. A
-- single dish has none of those, so the basket could not become an order and
-- settled over WhatsApp — PayU was wired and unreachable for dishes.
--
-- This migration is WIDENING ONLY. It adds columns and relaxes three NOT NULL
-- constraints. Nothing is dropped and no existing row changes: the 14 existing
-- order_items keep their values and take kind = 'PLAN' from the default.

-- CreateEnum
CREATE TYPE "OrderItemKind" AS ENUM ('PLAN', 'DISH');

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "addOnKind" TEXT,
ADD COLUMN     "addOnLabel" TEXT,
ADD COLUMN     "dishId" TEXT,
ADD COLUMN     "dishName" TEXT,
ADD COLUMN     "kind" "OrderItemKind" NOT NULL DEFAULT 'PLAN',
ALTER COLUMN "diet" DROP NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL,
ALTER COLUMN "mealsPerDay" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "order_items_kind_idx" ON "order_items"("kind");
