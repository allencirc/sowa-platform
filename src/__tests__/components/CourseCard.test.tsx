import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CourseCard } from "@/components/courses/CourseCard";
import type { Course } from "@/lib/types";

const mockCourse: Course = {
  slug: "gwo-basic-safety",
  title: "GWO Basic Safety Training",
  provider: "Wind Training Ireland",
  providerType: "Industry",
  description: "GWO accredited safety training.",
  deliveryFormat: "In-Person",
  location: "Cork, Ireland",
  duration: "5 days",
  cost: 0,
  costNotes: "Skillnet funded",
  nextStartDate: "2025-09-15",
  skills: ["safety-management"],
  careerRelevance: ["turbine-tech"],
  tags: ["gwo", "safety"],
};

describe("CourseCard", () => {
  it("renders course title", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText("GWO Basic Safety Training")).toBeInTheDocument();
  });

  it("renders provider name", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText("Wind Training Ireland")).toBeInTheDocument();
  });

  it("renders delivery format badge", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText("In-Person")).toBeInTheDocument();
  });

  it("renders Free badge for zero-cost courses", () => {
    render(<CourseCard course={mockCourse} />);
    // Both the badge and the price display show "Free" for cost=0
    const freeElements = screen.getAllByText("Free");
    expect(freeElements.length).toBeGreaterThanOrEqual(1);
  });

  it("does not render Free badge for paid courses", () => {
    render(<CourseCard course={{ ...mockCourse, cost: 2500 }} />);
    // Should show the price, not "Free" badge (but "Free" text from formatCurrency won't appear)
    expect(screen.queryByText("Free")).not.toBeInTheDocument();
  });

  it("renders duration", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText("5 days")).toBeInTheDocument();
  });

  it("renders location when provided", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText("Cork, Ireland")).toBeInTheDocument();
  });

  it("does not render location when not provided", () => {
    render(
      <CourseCard course={{ ...mockCourse, location: undefined }} />
    );
    expect(screen.queryByText("Cork, Ireland")).not.toBeInTheDocument();
  });

  it("renders cost notes", () => {
    render(<CourseCard course={mockCourse} />);
    expect(screen.getByText("Skillnet funded")).toBeInTheDocument();
  });

  it("links to course detail page", () => {
    render(<CourseCard course={mockCourse} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/training/gwo-basic-safety");
  });

  it("renders NFQ level badge when provided", () => {
    render(
      <CourseCard course={{ ...mockCourse, nfqLevel: 7 }} />
    );
    expect(screen.getByText("NFQ Level 7")).toBeInTheDocument();
  });
});
