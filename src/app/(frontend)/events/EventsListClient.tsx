"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Monitor, Globe, ArrowRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Event } from "@/lib/types";

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

function formatEventDate(dateString: string): string {
  const d = new Date(dateString);
  return (
    d.toLocaleDateString("en-IE", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    ", " +
    d.toLocaleTimeString("en-IE", {
      hour: "numeric",
      minute: "2-digit",
    })
  );
}

interface EventsListClientProps {
  events: Event[];
}

export function EventsListClient({ events }: EventsListClientProps) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const now = new Date().toISOString();

  const { upcoming, past } = useMemo(() => {
    const upcoming = events
      .filter((e) => e.startDate >= now)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    const past = events
      .filter((e) => e.startDate < now)
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
    return { upcoming, past };
  }, [events, now]);

  const displayed = tab === "upcoming" ? upcoming : past;

  return (
    <div>
      {/* Toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-8">
        <button
          onClick={() => setTab("upcoming")}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer",
            tab === "upcoming"
              ? "bg-white text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setTab("past")}
          className={cn(
            "px-5 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer",
            tab === "past"
              ? "bg-white text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          )}
        >
          Past ({past.length})
        </button>
      </div>

      {/* Events list */}
      {displayed.length > 0 ? (
        <div className="space-y-4">
          {displayed.map((event) => {
            const LocationIcon = locationIcons[event.locationType] ?? MapPin;
            return (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="group block bg-surface-card rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-gray-200"
              >
                {/* Event image */}
                {event.image && (
                  <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-primary/80 to-accent/60">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 100vw"
                    />
                  </div>
                )}
                <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  {/* Date block */}
                  <div className="hidden sm:flex flex-col items-center justify-center bg-primary/5 rounded-xl w-20 h-20 shrink-0">
                    <span className="text-2xl font-bold text-primary leading-none">
                      {new Date(event.startDate).getDate()}
                    </span>
                    <span className="text-xs font-semibold text-primary/70 uppercase mt-1">
                      {new Date(event.startDate).toLocaleDateString("en-IE", {
                        month: "short",
                      })}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant={typeVariant[event.type] ?? "default"}>
                        {event.type}
                      </Badge>
                      <Badge variant="default">
                        <LocationIcon className="h-3 w-3 mr-1" />
                        {event.locationType}
                      </Badge>
                      {event.capacity && (
                        <Badge variant="default">
                          {event.capacity} places
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-text-primary mb-1.5 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary mb-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-accent" />
                        {formatEventDate(event.startDate)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                      {event.description}
                    </p>

                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:text-accent-dark transition-colors">
                      View Details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-text-muted/40 mx-auto mb-4" />
          <p className="text-lg text-text-secondary">
            No {tab} events at this time
          </p>
          <p className="text-sm text-text-muted mt-1">
            Check back soon for updates.
          </p>
        </div>
      )}
    </div>
  );
}
