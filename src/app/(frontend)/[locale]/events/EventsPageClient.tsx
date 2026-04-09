"use client";

import { useMemo, useState } from "react";
import { CalendarDays, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarView } from "@/components/events/CalendarView";
import { CalendarLegend } from "@/components/events/CalendarLegend";
import { EventsListClient } from "./EventsListClient";
import type { CalendarItem } from "@/components/events/CalendarView";
import type { Event, Course } from "@/lib/types";

/* ── Colour mapping for calendar chips ─────────────────────── */

const calendarColorMap: Record<string, string> = {
  Conference: "bg-primary",
  Webinar: "bg-accent",
  Workshop: "bg-secondary",
  Networking: "bg-status-info",
  Training: "bg-status-warning",
  Roadshow: "bg-accent-light",
  Course: "bg-[#7C3AED]",
};

/* ── Component ─────────────────────────────────────────────── */

interface EventsPageClientProps {
  events: Event[];
  courses: Course[];
}

export function EventsPageClient({ events, courses }: EventsPageClientProps) {
  const [view, setView] = useState<"list" | "calendar">("list");

  const calendarItems: CalendarItem[] = useMemo(() => {
    const eventItems: CalendarItem[] = events.map((e) => ({
      kind: "event",
      slug: e.slug,
      title: e.title,
      date: e.startDate.slice(0, 10),
      href: `/events/${e.slug}`,
      colorClass: calendarColorMap[e.type] ?? "bg-gray-400",
      typeBadge: e.type,
    }));

    const courseItems: CalendarItem[] = courses
      .filter((c): c is Course & { nextStartDate: string } => !!c.nextStartDate)
      .map((c) => ({
        kind: "course",
        slug: c.slug,
        title: c.title,
        date: c.nextStartDate.slice(0, 10),
        href: `/training/${c.slug}`,
        colorClass: calendarColorMap.Course,
        typeBadge: "Course",
      }));

    return [...eventItems, ...courseItems];
  }, [events, courses]);

  return (
    <div>
      {/* Controls row */}
      <div className="flex items-center gap-3 mb-8">
        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer",
              view === "list"
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer",
              view === "calendar"
                ? "bg-white text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary",
            )}
            aria-label="Calendar view"
          >
            <CalendarDays className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
        </div>
      </div>

      {/* View content */}
      {view === "list" ? (
        <EventsListClient events={events} />
      ) : (
        <div>
          <CalendarView items={calendarItems} />
          <CalendarLegend className="mt-4 pt-4 border-t border-gray-100" />
        </div>
      )}
    </div>
  );
}
