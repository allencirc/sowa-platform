import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SubscriptionWidget } from "@/components/frontend/SubscriptionWidget";
import { getAllEvents, getAllCourses } from "@/lib/queries";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { EventsPageClient } from "./EventsPageClient";

export const metadata: Metadata = {
  title: "Events & Workshops",
  description:
    "Upcoming conferences, webinars, workshops, and roadshows for Ireland's offshore wind energy sector. Register for in-person and virtual events.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Events & Workshops — Offshore Wind Energy",
    description:
      "Upcoming conferences, webinars, workshops, and roadshows for Ireland's offshore wind energy sector.",
    url: "/events",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Events & Workshops — SOWA",
    description: "Conferences, webinars, and workshops for Ireland's offshore wind sector.",
  },
};

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const [events, courses, dict] = await Promise.all([
    getAllEvents(),
    getAllCourses(),
    getDictionary(locale),
  ]);

  return (
    <>
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            Events &amp; Workshops
          </h1>
          <p className="text-text-secondary max-w-2xl">
            Join our conferences, webinars, workshops, and roadshows to connect with the offshore
            wind energy community.
          </p>
        </Container>
      </section>

      <section className="py-10 sm:py-14 bg-white">
        <Container>
          <EventsPageClient events={events} courses={courses} />
        </Container>
      </section>

      {/* Subscribe CTA */}
      <SubscriptionWidget dict={dict.subscription} locale={locale} variant="compact" />
    </>
  );
}
