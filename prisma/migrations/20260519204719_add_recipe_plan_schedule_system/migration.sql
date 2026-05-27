-- CreateEnum
CREATE TYPE "MealSlot" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('STANDARD', 'PREMIUM', 'LUXURY');

-- CreateEnum
CREATE TYPE "PlanCategory" AS ENUM ('STANDARD', 'LIFESTYLE_MEDICAL', 'SPORTS', 'CORPORATE', 'DIGITAL');

-- CreateEnum
CREATE TYPE "DietVariant" AS ENUM ('VEG', 'EGG', 'NON_VEG', 'JAIN', 'VEGAN');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'OWNER';

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "allergies" TEXT[],
ADD COLUMN     "calorieTarget" INTEGER,
ADD COLUMN     "dietaryRestrictions" TEXT[],
ADD COLUMN     "healthConditions" TEXT[],
ADD COLUMN     "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "targetWeightKg" DOUBLE PRECISION,
ADD COLUMN     "tdee" INTEGER;

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "cuisineType" TEXT NOT NULL,
    "mealType" "MealSlot" NOT NULL,
    "dietaryTags" TEXT[],
    "planCategories" TEXT[],
    "tierAvailability" "PlanTier"[],
    "servingSizeGrams" INTEGER NOT NULL,
    "prepTimeMins" INTEGER NOT NULL,
    "cookTimeMins" INTEGER NOT NULL,
    "difficulty" TEXT NOT NULL,
    "equipmentNeeded" TEXT[],
    "allergens" TEXT[],
    "shelfLifeHours" INTEGER NOT NULL,
    "packagingType" TEXT NOT NULL,
    "kitchenStation" TEXT NOT NULL,
    "costPerServing" DECIMAL(65,30),
    "seasonTags" TEXT[],
    "rotationGroup" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "caloriesPerServing" INTEGER NOT NULL,
    "proteinGrams" DECIMAL(65,30) NOT NULL,
    "carbsGrams" DECIMAL(65,30) NOT NULL,
    "fatGrams" DECIMAL(65,30) NOT NULL,
    "fibreGrams" DECIMAL(65,30) NOT NULL,
    "caloriesPer100g" INTEGER NOT NULL,
    "proteinPer100g" DECIMAL(65,30) NOT NULL,
    "carbsPer100g" DECIMAL(65,30) NOT NULL,
    "fatPer100g" DECIMAL(65,30) NOT NULL,
    "fibrePer100g" DECIMAL(65,30) NOT NULL,
    "ironMg" DECIMAL(65,30),
    "calciumMg" DECIMAL(65,30),
    "vitaminDMcg" DECIMAL(65,30),
    "vitaminCMg" DECIMAL(65,30),
    "vitaminB12Mcg" DECIMAL(65,30),
    "folateMcg" DECIMAL(65,30),
    "sodiumMg" DECIMAL(65,30),
    "potassiumMg" DECIMAL(65,30),
    "omegaThreeGrams" DECIMAL(65,30),
    "zincMg" DECIMAL(65,30),
    "magnesiumMg" DECIMAL(65,30),
    "seleniumMcg" DECIMAL(65,30),
    "glycaemicIndex" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ingredients" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "foodItemId" TEXT NOT NULL,
    "quantityGrams" DECIMAL(65,30) NOT NULL,
    "cookedWeightFactor" DECIMAL(65,30) NOT NULL DEFAULT 1.0,
    "prepNote" TEXT,
    "isOptional" BOOLEAN NOT NULL DEFAULT false,
    "substituteFor" TEXT,
    "orderInRecipe" INTEGER NOT NULL,

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_steps" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "durationMins" INTEGER,
    "temperatureC" INTEGER,
    "technique" TEXT,
    "kitchenNote" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "recipe_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "PlanCategory" NOT NULL,
    "subCategory" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "longDescription" TEXT NOT NULL,
    "whoIsItFor" TEXT NOT NULL,
    "keyPrinciples" TEXT[],
    "whatIsAvoided" TEXT[],
    "dietaryVariant" "DietVariant" NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "avgCaloriesPerDay" INTEGER NOT NULL,
    "avgProteinGrams" INTEGER NOT NULL,
    "avgCarbsGrams" INTEGER NOT NULL,
    "avgFatGrams" INTEGER NOT NULL,
    "cycleLengthDays" INTEGER NOT NULL DEFAULT 60,
    "mealsPerDay" INTEGER NOT NULL DEFAULT 4,
    "nutritionistName" TEXT,
    "nutritionistCred" TEXT,
    "nutritionistBio" TEXT,
    "medicalDisclaimer" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "accentColor" TEXT,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_schedule_slots" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "mealSlot" "MealSlot" NOT NULL,
    "recipeId" TEXT NOT NULL,
    "servingMultiplier" DECIMAL(65,30) NOT NULL DEFAULT 1.0,

    CONSTRAINT "plan_schedule_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_active_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "orderId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "currentDay" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'active',
    "pausedUntil" TIMESTAMP(3),
    "skipDates" TIMESTAMP(3)[],
    "calorieTarget" INTEGER,
    "proteinTarget" INTEGER,
    "carbTarget" INTEGER,
    "fatTarget" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_active_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userActivePlanId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "mealSlot" "MealSlot" NOT NULL,
    "logDate" DATE NOT NULL,
    "plannedGrams" INTEGER NOT NULL,
    "actualGrams" INTEGER,
    "confirmedAt" TIMESTAMP(3),
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER,
    "ratingNote" TEXT,
    "foodEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_schedules" (
    "id" TEXT NOT NULL,
    "mealPlanCategory" TEXT NOT NULL,
    "tier" "PlanTier" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weeklyStructure" JSONB NOT NULL,
    "daysPerWeek" INTEGER NOT NULL,
    "sessionDurationMins" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_schedule_days" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "focusArea" TEXT NOT NULL,
    "exercises" JSONB NOT NULL,
    "estimatedCalories" INTEGER NOT NULL,
    "isRestDay" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "exercise_schedule_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "recipes_slug_key" ON "recipes"("slug");

-- CreateIndex
CREATE INDEX "recipes_mealType_idx" ON "recipes"("mealType");

-- CreateIndex
CREATE INDEX "recipes_rotationGroup_idx" ON "recipes"("rotationGroup");

-- CreateIndex
CREATE UNIQUE INDEX "meal_plans_slug_key" ON "meal_plans"("slug");

-- CreateIndex
CREATE INDEX "meal_plans_category_idx" ON "meal_plans"("category");

-- CreateIndex
CREATE INDEX "meal_plans_subCategory_idx" ON "meal_plans"("subCategory");

-- CreateIndex
CREATE INDEX "plan_schedule_slots_mealPlanId_dayNumber_idx" ON "plan_schedule_slots"("mealPlanId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "plan_schedule_slots_mealPlanId_dayNumber_mealSlot_key" ON "plan_schedule_slots"("mealPlanId", "dayNumber", "mealSlot");

-- CreateIndex
CREATE INDEX "user_active_plans_userId_status_idx" ON "user_active_plans"("userId", "status");

-- CreateIndex
CREATE INDEX "user_active_plans_endDate_idx" ON "user_active_plans"("endDate");

-- CreateIndex
CREATE INDEX "meal_logs_userId_logDate_idx" ON "meal_logs"("userId", "logDate");

-- CreateIndex
CREATE INDEX "meal_logs_userActivePlanId_idx" ON "meal_logs"("userActivePlanId");

-- CreateIndex
CREATE INDEX "exercise_schedules_mealPlanCategory_idx" ON "exercise_schedules"("mealPlanCategory");

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_foodItemId_fkey" FOREIGN KEY ("foodItemId") REFERENCES "food_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_schedule_slots" ADD CONSTRAINT "plan_schedule_slots_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_schedule_slots" ADD CONSTRAINT "plan_schedule_slots_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_active_plans" ADD CONSTRAINT "user_active_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_active_plans" ADD CONSTRAINT "user_active_plans_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_userActivePlanId_fkey" FOREIGN KEY ("userActivePlanId") REFERENCES "user_active_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_schedule_days" ADD CONSTRAINT "exercise_schedule_days_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "exercise_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
