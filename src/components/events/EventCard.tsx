import Link from "next/link";
import { MapPin, Monitor, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Event } from "@/lib/types";

const typeVariant: Record<string, "primary" | "accent" | "secondary" | "info" | "warning" | "default"> = {
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
  return d.toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }) + ", " + d.toLocaleTimeString("en-IE", {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const LocationIcon = locationIcons[event.locationType] ?? MapPin;

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group block bg-surface-card rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={typeVariant[event.type] ?? "default"}>
            {event.type}
          </Badge>
          <Badge variant="default">
            <LocationIcon className="h-3 w-3 mr-1" />
            {event.locationType}
          </Badge>
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm font-medium text-accent-dark mb-2">
          {formatEventDate(event.startDate)}
        </p>

        {event.location && (
          <p className="text-sm text-text-secondary mb-3">
            {event.location}
          </p>
        )}

        <p className="text-sm text-text-secondary line-clamp-2">
          {event.description}
        </p>
      </div>
    </Link>
  );
}
