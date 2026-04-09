import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StaggeredList } from "@/components/ui/StaggeredList";
import { EventCard } from "@/components/events/EventCard";
import { getAllEvents } from "@/lib/queries";

export async function UpcomingEvents() {
  const events = (await getAllEvents())
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <Container>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">What&apos;s On</h2>
            <p className="mt-2 text-text-secondary">
              Events, webinars, and workshops for the OWE community.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark hover:text-accent-dark transition-colors"
          >
            View all events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard key={event.slug} event={event} />
          ))}
        </StaggeredList>

        <div className="mt-6 sm:hidden">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark"
          >
            View all events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
