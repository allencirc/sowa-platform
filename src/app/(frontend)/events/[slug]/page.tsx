import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Monitor,
  Globe,
  Users,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { RegisterButton } from "@/components/registration/RegisterButton";
import { getEventBySlug, getAllEvents } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

interface EventDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getAllEvents()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: EventDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };
  const desc = event.description.slice(0, 160);
  return {
    title: `${event.title} — Events`,
    description: desc,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title: `${event.title} — SOWA Event`,
      description: desc,
      url: `/events/${event.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} — SOWA`,
      description: desc,
    },
  };
}

const typeVariant: Record<
  string,
  "primary" | "accent" | "secondary" | "info" | "warning" | "default"
> = {
  Conference: "primary",
  Webinar: "accent",
  Workshop: "secondary",
  Networking: "info",
  Training: "warning",
  Roadshow: "info",
};

const locationIcons: Record<string, typeof MapPin> = {
  Physical: MapPin,
  Virtual: Monitor,
  Hybrid: Globe,
};

function formatEventDateTime(dateString: string): string {
  const d = new Date(dateString);
  return (
    d.toLocaleDateString("en-IE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " at " +
    d.toLocaleTimeString("en-IE", {
      hour: "numeric",
      minute: "2-digit",
    })
  );
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-IE", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function EventDetailPage({ params }: EventDetailProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const LocationIcon = locationIcons[event.locationType] ?? MapPin;

  const enableRegistration = process.env.ENABLE_EVENT_REGISTRATION === "true";

  let registeredCount = 0;
  if (event.capacity) {
    registeredCount = await prisma.registration.count({
      where: {
        type: "EVENT",
        contentId: event.slug,
        status: { not: "CANCELLED" },
      },
    });
  }

  const isFull = event.capacity ? registeredCount >= event.capacity : false;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events" },
          { label: event.title, href: `/events/${event.slug}` },
        ]}
      />

      {/* Hero image */}
      {event.image && (
        <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      {/* Hero */}
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={typeVariant[event.type] ?? "default"}>
                {event.type}
              </Badge>
              <Badge variant="default">
                <LocationIcon className="h-3 w-3 mr-1" />
                {event.locationType}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
              {event.title}
            </h1>

            {/* Info row */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 text-text-secondary">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent-dark" />
                <span className="font-medium">
                  {formatEventDateTime(event.startDate)}
                </span>
              </div>

              {event.endDate && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent-dark" />
                  <span>
                    Until {formatTime(event.endDate)}
                  </span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent-dark" />
                  <span>{event.location}</span>
                </div>
              )}

              {event.capacity && (
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-accent-dark" />
                  <span>
                    {registeredCount} / {event.capacity} places
                    {isFull && (
                      <span className="ml-1 text-status-error font-medium">(Full)</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <div className="max-w-3xl space-y-10">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                About This Event
              </h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* CTA */}
            {enableRegistration && !isFull && (
              <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 sm:p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Interested in attending?
                </h3>
                <p className="text-white/80 mb-5 text-sm">
                  Register your place and we&apos;ll send you all the details.
                </p>
                <RegisterButton
                  type="EVENT"
                  contentId={event.slug}
                  contentTitle={event.title}
                  showDietary
                />
              </div>
            )}
            {enableRegistration && isFull && (
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl p-6 sm:p-8 text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  This event is fully booked
                </h3>
                <p className="text-white/80 text-sm">
                  All places have been taken. Please check back for future events.
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
