/**
 * HubSpot integration stub.
 * Replace with actual HubSpot API calls when integration is configured.
 */

interface RegistrationSync {
  email: string;
  name: string;
  phone?: string;
  organisation?: string;
  role?: string;
  contentType: "EVENT" | "COURSE";
  contentId: string;
}

interface NewsletterSync {
  email: string;
  topics: string[];
}

interface SyncStatus {
  configured: boolean;
  portalId: string | null;
  newsletterListId: string | null;
}

export async function syncRegistration(data: RegistrationSync): Promise<void> {
  // No-op until HubSpot integration is configured
  if (!process.env.HUBSPOT_API_KEY) return;

  console.log("[HubSpot] Would sync registration:", data.email, data.contentType, data.contentId);
}

export async function syncNewsletterSubscription(data: NewsletterSync): Promise<void> {
  // No-op until HubSpot integration is configured
  if (!process.env.HUBSPOT_API_KEY) return;

  console.log("[HubSpot] Would sync newsletter subscription:", data.email, data.topics);
}

export function getSyncStatus(): SyncStatus {
  return {
    configured: !!process.env.HUBSPOT_API_KEY,
    portalId: process.env.HUBSPOT_PORTAL_ID ?? null,
    newsletterListId: process.env.HUBSPOT_NEWSLETTER_LIST_ID ?? null,
  };
}
