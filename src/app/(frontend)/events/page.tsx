import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getAllEvents } from "@/lib/queries";
import { EventsListClient } from "./EventsListClient";

export const metadata: Metadata = {
  title: "Events & Workshops — SOWA",
  description:
    "Upcoming conferences, webinars, workshops, and roadshows for Ireland's offshore wind energy sector.",
};

export default function EventsPage() {
  const events = getAllEvents();

  return (
    <>
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            Events &amp; Workshops
          </h1>
          <p className="text-text-secondary max-w-2xl">
            Join our conferences, webinars, workshops, and roadshows to connect
            with the offshore wind energy community.
          </p>
        </Container>
      </section>

      <section className="py-10 sm:py-14 bg-white">
        <Container>
          <EventsListClient events={events} />
        </Container>
      </section>
    </>
  );
}
