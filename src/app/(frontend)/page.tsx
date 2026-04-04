import { HeroSection } from "@/components/home/HeroSection";
import { AudienceCards } from "@/components/home/AudienceCards";
import { FeaturedCareers } from "@/components/home/FeaturedCareers";
import { PathwayTeaser } from "@/components/home/PathwayTeaser";
import { UpcomingCourses } from "@/components/home/UpcomingCourses";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { DiagnosticCTA } from "@/components/home/DiagnosticCTA";
import { LatestResearch } from "@/components/home/LatestResearch";
import { StatsBar } from "@/components/home/StatsBar";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";

export default function HomePage() {
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
      <NewsletterSignup />
    </>
  );
}
