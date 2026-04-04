"use client";

import { EventForm } from "@/components/admin/events/EventForm";

export default function NewEventPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Add Event</h1>
        <p className="mt-1 text-sm text-text-secondary">Create a new event or workshop.</p>
      </div>
      <EventForm mode="create" />
    </div>
  );
}
