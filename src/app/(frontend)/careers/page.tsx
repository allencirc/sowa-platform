import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PathwayMap } from "@/components/careers/PathwayMap";
import { CareerFilters } from "@/components/careers/CareerFilters";
import { getAllCareers } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Career Pathways",
  description:
    "Explore 12 career pathways across Ireland's offshore wind energy sector. View interactive maps, salary ranges, and progression routes.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Career Pathways — Offshore Wind Energy",
    description:
      "Explore 12 career pathways across Ireland's offshore wind energy sector. View interactive maps, salary ranges, and progression routes.",
    url: "/careers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Pathways — SOWA",
    description:
      "Explore 12 career pathways across Ireland's offshore wind energy sector.",
  },
};

export default async function CareersPage() {
  const careers = await getAllCareers();

  return (
    <>
      {/* Pathway Map hero */}
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
              Career Pathways
            </h1>
            <p className="text-text-secondary max-w-2xl">
              Explore how careers connect across the offshore wind sector — from
              entry-level roles to senior leadership. Click any role to learn more.
            </p>
          </div>
          <PathwayMap careers={careers} />
        </Container>
      </section>

      {/* Career grid */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <CareerFilters careers={careers} />
        </Container>
      </section>
    </>
  );
}
