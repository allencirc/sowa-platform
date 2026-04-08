-- CreateEnum
CREATE TYPE "SubscriptionTopic" AS ENUM ('Careers', 'Training', 'Events', 'Research', 'News', 'Diagnostic');

-- CreateEnum
CREATE TYPE "SubscriptionFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "diagnostic_sessions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "scores" JSONB NOT NULL,
    "maxPossible" JSONB NOT NULL,
    "topRoleFamilies" TEXT[],
    "topSkillGaps" TEXT[],
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "referrerSource" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_sessions_sessionId_key" ON "diagnostic_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "diagnostic_sessions_completedAt_idx" ON "diagnostic_sessions"("completedAt");

-- CreateIndex
CREATE INDEX "diagnostic_sessions_locale_idx" ON "diagnostic_sessions"("locale");
