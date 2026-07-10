import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { AudienceCards } from "@/components/home/AudienceCards";
import { FeaturedCareers } from "@/components/home/FeaturedCareers";
import { PathwayTeaser } from "@/components/home/PathwayTeaser";
import { UpcomingCourses } from "@/components/home/UpcomingCourses";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { DiagnosticCTA } from "@/components/home/DiagnosticCTA";
import { LatestResearch } from "@/components/home/LatestResearch";
import { StatsBar } from "@/components/home/StatsBar";
import { SubscriptionWidget } from "@/components/frontend/SubscriptionWidget";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getSiteSettings } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteTitle = `${settings.siteName} — ${settings.siteFullName}`;
  const description = `Ireland's national careers platform for ${settings.sectorName}. Explore career pathways, training courses, events, and skills diagnostics.`;
  return {
    title: siteTitle,
    description: `Ireland's national careers platform for ${settings.sectorName}. Explore career pathways, training courses, events, and skills diagnostics for the sector.`,
    alternates: { canonical: "/" },
    openGraph: {
      title: siteTitle,
      description,
      url: "/",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description,
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const dict = await getDictionary(locale);

  return (
    <>
      <HeroSection dict={dict.hero} />
      <AudienceCards />
      <FeaturedCareers />
      <PathwayTeaser />
      <UpcomingCourses />
      <UpcomingEvents />
      <DiagnosticCTA />
      <LatestResearch />
      <StatsBar />
      <SubscriptionWidget dict={dict.subscription} locale={locale} />
    </>
  );
}
