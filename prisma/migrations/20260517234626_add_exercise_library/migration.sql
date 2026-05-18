/*
  Warnings:

  - You are about to drop the column `commonMistakes` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `gifUrl` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `muscleGroups` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `setsReps` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `exercises` table. All the data in the column will be lost.
  - You are about to drop the column `videoUrl` on the `exercises` table. All the data in the column will be lost.
  - The `instructions` column on the `exercises` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `workout_logs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `exercises` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_userId_fkey";

-- DropIndex
DROP INDEX "exercises_slug_key";

-- AlterTable
ALTER TABLE "exercises" DROP COLUMN "commonMistakes",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "gifUrl",
DROP COLUMN "isActive",
DROP COLUMN "muscleGroups",
DROP COLUMN "setsReps",
DROP COLUMN "slug",
DROP COLUMN "updatedAt",
DROP COLUMN "videoUrl",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "force" TEXT,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "mechanic" TEXT,
ADD COLUMN     "primaryMuscles" TEXT[],
ADD COLUMN     "secondaryMuscles" TEXT[],
ALTER COLUMN "equipment" DROP NOT NULL,
ALTER COLUMN "equipment" SET DATA TYPE TEXT,
DROP COLUMN "instructions",
ADD COLUMN     "instructions" TEXT[];

-- DropTable
DROP TABLE "workout_logs";

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "date" DATE NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "durationMins" INTEGER,
    "caloriesBurned" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "id" TEXT NOT NULL,
    "workoutSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderInSession" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sets" (
    "id" TEXT NOT NULL,
    "workoutExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "reps" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "durationSecs" INTEGER,
    "distanceM" DOUBLE PRECISION,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "workout_sets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_sessions_userId_date_idx" ON "workout_sessions"("userId", "date");

-- CreateIndex
CREATE INDEX "exercises_category_idx" ON "exercises"("category");

-- CreateIndex
CREATE INDEX "exercises_level_idx" ON "exercises"("level");

-- CreateIndex
CREATE INDEX "exercises_equipment_idx" ON "exercises"("equipment");

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "workout_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
