import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthError } from "@/lib/auth-utils";
import { applyRateLimit, parseBody, errorResponse } from "@/lib/api-utils";
import { updateSiteSettingsSchema } from "@/lib/validations";
import { DEFAULT_SITE_SETTINGS } from "@/lib/theme-defaults";

export async function GET(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!row) {
      return NextResponse.json(DEFAULT_SITE_SETTINGS);
    }

    return NextResponse.json({
      colorPrimary: row.colorPrimary ?? DEFAULT_SITE_SETTINGS.colorPrimary,
      colorPrimaryLight: row.colorPrimaryLight ?? DEFAULT_SITE_SETTINGS.colorPrimaryLight,
      colorPrimaryDark: row.colorPrimaryDark ?? DEFAULT_SITE_SETTINGS.colorPrimaryDark,
      colorSecondary: row.colorSecondary ?? DEFAULT_SITE_SETTINGS.colorSecondary,
      colorSecondaryLight: row.colorSecondaryLight ?? DEFAULT_SITE_SETTINGS.colorSecondaryLight,
      colorSecondaryDark: row.colorSecondaryDark ?? DEFAULT_SITE_SETTINGS.colorSecondaryDark,
      colorAccent: row.colorAccent ?? DEFAULT_SITE_SETTINGS.colorAccent,
      colorAccentLight: row.colorAccentLight ?? DEFAULT_SITE_SETTINGS.colorAccentLight,
      colorAccentDark: row.colorAccentDark ?? DEFAULT_SITE_SETTINGS.colorAccentDark,
      headingFont: row.headingFont,
      bodyFont: row.bodyFont,
      logoUrl: row.logoUrl,
      faviconUrl: row.faviconUrl,
      footerText: row.footerText,
      socialLinks: row.socialLinks,
    });
  } catch (err) {
    console.error("GET /api/settings error:", err);
    return errorResponse("Failed to fetch site settings");
  }
}

export async function PUT(request: NextRequest) {
  const rateLimited = applyRateLimit(request);
  if (rateLimited) return rateLimited;

  let user;
  try {
    user = await requireRole(["ADMIN"]);
  } catch (err) {
    if (err instanceof AuthError) return errorResponse(err.message, err.status);
    throw err;
  }

  const parsed = await parseBody(request, updateSiteSettingsSchema);
  if (parsed.error) return parsed.error;

  try {
    // Prisma requires Prisma.JsonNull instead of null for nullable Json fields
    const socialLinks =
      parsed.data.socialLinks === null
        ? Prisma.JsonNull
        : parsed.data.socialLinks === undefined
          ? undefined
          : (parsed.data.socialLinks as unknown as Prisma.InputJsonValue);

    const { socialLinks: _sl, ...rest } = parsed.data;
    const dbData = { ...rest, socialLinks, updatedById: user.id };

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: dbData,
      create: { id: "default", ...dbData },
    });

    revalidateTag("site-settings", "default");

    return NextResponse.json({
      colorPrimary: updated.colorPrimary ?? DEFAULT_SITE_SETTINGS.colorPrimary,
      colorPrimaryLight: updated.colorPrimaryLight ?? DEFAULT_SITE_SETTINGS.colorPrimaryLight,
      colorPrimaryDark: updated.colorPrimaryDark ?? DEFAULT_SITE_SETTINGS.colorPrimaryDark,
      colorSecondary: updated.colorSecondary ?? DEFAULT_SITE_SETTINGS.colorSecondary,
      colorSecondaryLight: updated.colorSecondaryLight ?? DEFAULT_SITE_SETTINGS.colorSecondaryLight,
      colorSecondaryDark: updated.colorSecondaryDark ?? DEFAULT_SITE_SETTINGS.colorSecondaryDark,
      colorAccent: updated.colorAccent ?? DEFAULT_SITE_SETTINGS.colorAccent,
      colorAccentLight: updated.colorAccentLight ?? DEFAULT_SITE_SETTINGS.colorAccentLight,
      colorAccentDark: updated.colorAccentDark ?? DEFAULT_SITE_SETTINGS.colorAccentDark,
      headingFont: updated.headingFont,
      bodyFont: updated.bodyFont,
      logoUrl: updated.logoUrl,
      faviconUrl: updated.faviconUrl,
      footerText: updated.footerText,
      socialLinks: updated.socialLinks,
    });
  } catch (err) {
    console.error("PUT /api/settings error:", err);
    return errorResponse("Failed to update site settings");
  }
}
