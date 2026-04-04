import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getAllResearch, getFeaturedResearch } from "@/lib/queries";
import { ResearchListClient } from "./ResearchListClient";

export const metadata: Metadata = {
  title: "Research & Publications",
  description:
    "Explore the latest research, reports, and publications on Ireland's offshore wind energy workforce and skills landscape.",
  alternates: { canonical: "/research" },
  openGraph: {
    title: "Research & Publications — Offshore Wind Energy",
    description:
      "Research, reports, and publications on Ireland's offshore wind energy workforce and skills landscape.",
    url: "/research",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Research & Publications — SOWA",
    description:
      "Research and publications on Ireland's offshore wind workforce.",
  },
};

export default function ResearchPage() {
  const research = getAllResearch();
  const featured = getFeaturedResearch();

  return (
    <>
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            Research &amp; Publications
          </h1>
          <p className="text-text-secondary max-w-2xl">
            Key reports, workforce studies, and policy documents shaping
            Ireland&apos;s offshore wind energy sector.
          </p>
        </Container>
      </section>

      <section className="py-10 sm:py-14 bg-white">
        <Container>
          <ResearchListClient research={research} featured={featured} />
        </Container>
      </section>
    </>
  );
}
