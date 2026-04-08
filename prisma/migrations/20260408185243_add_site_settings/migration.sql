-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "colorPrimary" TEXT,
    "colorPrimaryLight" TEXT,
    "colorPrimaryDark" TEXT,
    "colorSecondary" TEXT,
    "colorSecondaryLight" TEXT,
    "colorSecondaryDark" TEXT,
    "colorAccent" TEXT,
    "colorAccentLight" TEXT,
    "colorAccentDark" TEXT,
    "headingFont" TEXT,
    "bodyFont" TEXT,
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "footerText" TEXT,
    "socialLinks" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
