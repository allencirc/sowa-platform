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

export const metadata: Metadata = {
  title: "SOWA — Skillnet Offshore Wind Academy",
  description:
    "Ireland's national careers platform for offshore wind energy. Explore career pathways, training courses, events, and skills diagnostics for the offshore wind sector.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "SOWA — Skillnet Offshore Wind Academy",
    description:
      "Ireland's national careers platform for offshore wind energy. Explore career pathways, training courses, events, and skills diagnostics.",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOWA — Skillnet Offshore Wind Academy",
    description:
      "Ireland's national careers platform for offshore wind energy. Explore career pathways, training courses, events, and skills diagnostics.",
  },
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const dict = await getDictionary(locale);

  return (
    <>
      <HeroSection />
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
