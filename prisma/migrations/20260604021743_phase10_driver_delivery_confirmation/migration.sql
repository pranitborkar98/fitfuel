-- AlterTable
ALTER TABLE "deliveries" ADD COLUMN     "assignedDriverId" TEXT,
ADD COLUMN     "customerConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "customerIssueNote" TEXT;

-- CreateTable
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "franchiseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drivers_accessToken_key" ON "drivers"("accessToken");

-- CreateIndex
CREATE INDEX "drivers_accessToken_idx" ON "drivers"("accessToken");

-- CreateIndex
CREATE INDEX "drivers_franchiseId_idx" ON "drivers"("franchiseId");

-- CreateIndex
CREATE INDEX "deliveries_assignedDriverId_idx" ON "deliveries"("assignedDriverId");

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_assignedDriverId_fkey" FOREIGN KEY ("assignedDriverId") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
