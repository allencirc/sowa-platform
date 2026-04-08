/*
  Warnings:

  - You are about to drop the column `attendedAt` on the `registrations` table. All the data in the column will be lost.
  - You are about to drop the `diagnostic_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "registrations" DROP COLUMN "attendedAt";

-- DropTable
DROP TABLE "diagnostic_sessions";

-- DropEnum
DROP TYPE "SubscriptionFrequency";

-- DropEnum
DROP TYPE "SubscriptionTopic";
