import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "@/components/events/EventCard";
import type { Event } from "@/lib/types";

const mockEvent: Event = {
  slug: "wind-conference",
  title: "Ireland Offshore Wind Conference 2025",
  type: "Conference",
  startDate: "2025-10-15T09:00:00Z",
  endDate: "2025-10-15T17:00:00Z",
  locationType: "Physical",
  location: "Convention Centre Dublin",
  description: "The premier Irish offshore wind event.",
  capacity: 200,
};

describe("EventCard", () => {
  it("renders event title", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Ireland Offshore Wind Conference 2025")).toBeInTheDocument();
  });

  it("renders event type badge", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Conference")).toBeInTheDocument();
  });

  it("renders location type badge", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Physical")).toBeInTheDocument();
  });

  it("renders event location", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("Convention Centre Dublin")).toBeInTheDocument();
  });

  it("renders event description", () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText("The premier Irish offshore wind event.")).toBeInTheDocument();
  });

  it("links to event detail page", () => {
    render(<EventCard event={mockEvent} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/events/wind-conference");
  });

  it("does not render location when not provided", () => {
    render(<EventCard event={{ ...mockEvent, location: undefined }} />);
    expect(screen.queryByText("Convention Centre Dublin")).not.toBeInTheDocument();
  });

  it("renders formatted date", () => {
    render(<EventCard event={mockEvent} />);
    // The formatted date should contain October or Oct and 2025
    const dateElement = screen.getByText(/Oct.*2025|2025.*Oct/i);
    expect(dateElement).toBeInTheDocument();
  });
});
