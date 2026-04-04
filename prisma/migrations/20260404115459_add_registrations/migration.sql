-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('EVENT', 'COURSE');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "type" "RegistrationType" NOT NULL,
    "contentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organisation" TEXT,
    "role" TEXT,
    "dietaryRequirements" TEXT,
    "additionalNotes" TEXT,
    "gdprConsent" BOOLEAN NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registrations_type_contentId_idx" ON "registrations"("type", "contentId");

-- CreateIndex
CREATE INDEX "registrations_email_idx" ON "registrations"("email");
