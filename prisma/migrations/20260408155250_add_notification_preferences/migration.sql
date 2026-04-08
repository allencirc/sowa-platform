-- CreateEnum
CREATE TYPE "SubscriptionTopic" AS ENUM ('Careers', 'Training', 'Events', 'Research', 'News', 'Diagnostic');

-- CreateEnum
CREATE TYPE "SubscriptionFrequency" AS ENUM ('WEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "registrations" ADD COLUMN     "attendedAt" TIMESTAMP(3);

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

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "topics" "SubscriptionTopic"[],
    "frequency" "SubscriptionFrequency" NOT NULL DEFAULT 'WEEKLY',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT NOT NULL,
    "unsubscribeToken" TEXT NOT NULL,
    "gdprConsent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_sessions_sessionId_key" ON "diagnostic_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "diagnostic_sessions_completedAt_idx" ON "diagnostic_sessions"("completedAt");

-- CreateIndex
CREATE INDEX "diagnostic_sessions_locale_idx" ON "diagnostic_sessions"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_email_key" ON "subscriptions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_verificationToken_key" ON "subscriptions"("verificationToken");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_unsubscribeToken_key" ON "subscriptions"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "subscriptions_verificationToken_idx" ON "subscriptions"("verificationToken");

-- CreateIndex
CREATE INDEX "subscriptions_unsubscribeToken_idx" ON "subscriptions"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_event_key" ON "notification_preferences"("userId", "event");

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
