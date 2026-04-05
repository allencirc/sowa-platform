-- CreateEnum
CREATE TYPE "ContentSource" AS ENUM ('MANUAL', 'EVENTBRITE', 'CAREERSPORTAL', 'FETCHCOURSES', 'QUALIFAX');

-- AlterTable
ALTER TABLE "courses"
  ADD COLUMN "source" "ContentSource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "externalId" TEXT;

-- AlterTable
ALTER TABLE "events"
  ADD COLUMN "source" "ContentSource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "courses_source_externalId_key" ON "courses"("source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "events_source_externalId_key" ON "events"("source", "externalId");
