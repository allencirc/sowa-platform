-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('EXPIRED_DATE', 'STALE', 'OUTDATED');

-- CreateTable
CREATE TABLE "freshness_alerts" (
    "id" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "contentId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,

    CONSTRAINT "freshness_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "freshness_alerts_resolvedAt_idx" ON "freshness_alerts"("resolvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "freshness_alerts_contentType_contentId_alertType_key" ON "freshness_alerts"("contentType", "contentId", "alertType");

-- AddForeignKey
ALTER TABLE "freshness_alerts" ADD CONSTRAINT "freshness_alerts_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
