/**
 * Marketing pixel configuration validation.
 *
 * Returns the configuration status for Meta Pixel and LinkedIn Insight Tag
 * based on environment variables. Used by the admin settings page and
 * validated at build time via import.
 */

export interface PixelStatus {
  configured: boolean;
  id: string;
}

export interface PixelConfig {
  meta: PixelStatus;
  linkedin: PixelStatus;
}

export function getPixelConfig(): PixelConfig {
  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
  const linkedinId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID ?? "";

  return {
    meta: {
      configured: metaId.length > 0,
      id: metaId,
    },
    linkedin: {
      configured: linkedinId.length > 0,
      id: linkedinId,
    },
  };
}

/**
 * Events fired by each pixel. Used for documentation on the settings page.
 */
export const META_PIXEL_EVENTS = [
  { event: "PageView", trigger: "Every page load (automatic)" },
  { event: "Lead", trigger: "Diagnostic completion, outbound course clicks" },
  {
    event: "CompleteRegistration",
    trigger: "Course or event registration",
  },
  { event: "Subscribe", trigger: "Newsletter signup" },
] as const;

export const LINKEDIN_EVENTS = [
  { event: "Page view", trigger: "Every page load (automatic via Insight Tag)" },
] as const;
