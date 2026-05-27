/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "meal_plans" ALTER COLUMN "cycleLengthDays" SET DEFAULT 30;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "avgRating" DOUBLE PRECISION,
ADD COLUMN     "swapAwayCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "referredBy" TEXT,
ADD COLUMN     "weeklyConsistencyScore" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referralCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_referralCode_key" ON "users"("referralCode");
