import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiagnosticCTA } from "@/components/home/DiagnosticCTA";

describe("DiagnosticCTA", () => {
  it("renders heading text", () => {
    render(<DiagnosticCTA />);
    expect(screen.getByText("Not sure where to start?")).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<DiagnosticCTA />);
    expect(screen.getByText(/Assess your OWE skills in 5 minutes/)).toBeInTheDocument();
  });

  it("renders Start Assessment button", () => {
    render(<DiagnosticCTA />);
    expect(screen.getByText("Start Assessment")).toBeInTheDocument();
  });

  it("links to diagnostic page", () => {
    render(<DiagnosticCTA />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/diagnostic");
  });
});
