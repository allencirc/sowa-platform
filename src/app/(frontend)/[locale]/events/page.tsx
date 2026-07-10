import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SubscriptionWidget } from "@/components/frontend/SubscriptionWidget";
import { getAllEvents, getAllCourses, getSiteSettings } from "@/lib/queries";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { EventsPageClient } from "./EventsPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const description = `Upcoming conferences, webinars, workshops, and roadshows for Ireland's ${settings.sectorName} sector. Register for in-person and virtual events.`;
  return {
    title: "Events & Workshops",
    description,
    alternates: { canonical: "/events" },
    openGraph: {
      title: `Events & Workshops — ${settings.sectorTitle}`,
      description: `Upcoming conferences, webinars, workshops, and roadshows for Ireland's ${settings.sectorName} sector.`,
      url: "/events",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Events & Workshops — ${settings.siteName}`,
      description: `Conferences, webinars, and workshops for Ireland's ${settings.sectorName} sector.`,
    },
  };
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const [events, courses, dict, settings] = await Promise.all([
    getAllEvents(),
    getAllCourses(),
    getDictionary(locale),
    getSiteSettings(),
  ]);

  return (
    <>
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            Events &amp; Workshops
          </h1>
          <p className="text-text-secondary max-w-2xl">
            Join our conferences, webinars, workshops, and roadshows to connect with the{" "}
            {settings.sectorName} community.
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
