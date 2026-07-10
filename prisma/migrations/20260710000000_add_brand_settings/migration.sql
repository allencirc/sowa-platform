-- Brand identity fields for white-label deployments.
-- All nullable: absent values fall back to DEFAULT_SITE_SETTINGS in code.
ALTER TABLE "site_settings"
  ADD COLUMN "siteName" TEXT,
  ADD COLUMN "siteFullName" TEXT,
  ADD COLUMN "siteTagline" TEXT,
  ADD COLUMN "sectorName" TEXT,
  ADD COLUMN "sectorTitle" TEXT,
  ADD COLUMN "sectorContext" TEXT,
  ADD COLUMN "contactEmail" TEXT;
