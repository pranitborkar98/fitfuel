/*
  Warnings:

  - The values [LIFESTYLE_CUSTOM] on the enum `MealPlanType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MealPlanType_new" AS ENUM ('MUSCLE_GAIN', 'WEIGHT_LOSS', 'BALANCED_DIET', 'OFFICE_EMPLOYEE', 'JAIN_DIET', 'HEALTHY_SEX_LIFESTYLE', 'ALCOHOL_RECOVERY', 'SMOKING_RECOVERY', 'DIABETES_MANAGEMENT', 'PCOS_HORMONAL_BALANCE', 'THYROID_SUPPORT', 'HYPERTENSION_DASH', 'POST_SURGERY_RECOVERY', 'MENTAL_HEALTH_STRESS', 'GUT_HEALTH_IBS', 'ANTI_AGING_LONGEVITY', 'CUSTOM_PERSONALIZED');
ALTER TABLE "meal_plan_products" ALTER COLUMN "planType" TYPE "MealPlanType_new" USING ("planType"::text::"MealPlanType_new");
ALTER TYPE "MealPlanType" RENAME TO "MealPlanType_old";
ALTER TYPE "MealPlanType_new" RENAME TO "MealPlanType";
DROP TYPE "public"."MealPlanType_old";
COMMIT;

-- AlterTable
ALTER TABLE "meal_plan_products" ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phase" INTEGER NOT NULL DEFAULT 3;
