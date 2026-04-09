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

interface SubscriptionSync {
  email: string;
  topics: string[];
  frequency: string;
  verified: boolean;
}

export async function syncSubscription(data: SubscriptionSync): Promise<void> {
  // No-op until HubSpot integration is configured
  if (!process.env.HUBSPOT_API_KEY) return;

  // When real: create/update contact, set custom properties:
  //   sowa_topic_careers (bool), sowa_topic_training (bool), etc.
  //   sowa_subscription_frequency (enum: WEEKLY/MONTHLY)
  //   sowa_subscription_verified (bool)
  console.log(
    "[HubSpot] Would sync subscription:",
    data.email,
    data.topics,
    data.frequency,
    data.verified,
  );
}

interface DiagnosticResultsSync {
  email: string;
  name?: string;
  topGaps: string[];
  recommendedCareers: string[];
}

export async function syncDiagnosticResults(data: DiagnosticResultsSync): Promise<void> {
  // No-op until HubSpot integration is configured
  if (!process.env.HUBSPOT_API_KEY) return;

  console.log("[HubSpot] Would sync diagnostic results:", data.email, data.topGaps);
}

interface ContactInquirySync {
  email: string;
  name: string;
  organisation?: string;
  subject: string;
  message: string;
}

export async function syncContactInquiry(data: ContactInquirySync): Promise<void> {
  // No-op until HubSpot integration is configured
  if (!process.env.HUBSPOT_API_KEY) return;

  console.log("[HubSpot] Would sync contact inquiry:", data.email, data.subject);
}

export function getSyncStatus(): SyncStatus {
  return {
    configured: !!process.env.HUBSPOT_API_KEY,
    portalId: process.env.HUBSPOT_PORTAL_ID ?? null,
    newsletterListId: process.env.HUBSPOT_NEWSLETTER_LIST_ID ?? null,
  };
}
