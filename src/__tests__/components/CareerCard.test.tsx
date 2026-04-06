import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CareerCard } from "@/components/careers/CareerCard";
import type { Career } from "@/lib/types";

const mockCareer: Career = {
  slug: "turbine-tech",
  title: "Offshore Wind Turbine Technician",
  sector: "Operations & Maintenance",
  entryLevel: "Entry",
  description: "Install, maintain and repair offshore wind turbines.",
  salaryRange: { min: 35000, max: 55000 },
  qualifications: ["Level 6 cert"],
  skills: ["mechanical-systems"],
  pathwayConnections: [],
  relatedCourses: [],
};

describe("CareerCard", () => {
  it("renders career title", () => {
    render(<CareerCard career={mockCareer} />);
    expect(screen.getByText("Offshore Wind Turbine Technician")).toBeInTheDocument();
  });

  it("renders sector badge", () => {
    render(<CareerCard career={mockCareer} />);
    expect(screen.getByText("Operations & Maintenance")).toBeInTheDocument();
  });

  it("renders entry level badge", () => {
    render(<CareerCard career={mockCareer} />);
    expect(screen.getByText("Entry")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<CareerCard career={mockCareer} />);
    expect(
      screen.getByText("Install, maintain and repair offshore wind turbines."),
    ).toBeInTheDocument();
  });

  it("renders salary range when provided", () => {
    render(<CareerCard career={mockCareer} />);
    // formatCurrency formats as EUR
    expect(screen.getByText(/€35,000/)).toBeInTheDocument();
    expect(screen.getByText(/€55,000/)).toBeInTheDocument();
  });

  it("does not render salary when not provided", () => {
    const { salaryRange, ...noSalary } = mockCareer;
    render(<CareerCard career={{ ...noSalary, salaryRange: undefined } as Career} />);
    expect(screen.queryByText(/€/)).not.toBeInTheDocument();
  });

  it("links to career detail page", () => {
    render(<CareerCard career={mockCareer} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/careers/turbine-tech");
  });

  it("renders Explore CTA", () => {
    render(<CareerCard career={mockCareer} />);
    expect(screen.getByText("Explore")).toBeInTheDocument();
  });
});
