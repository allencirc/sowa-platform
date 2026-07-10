import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getAllResearch, getFeaturedResearch, getSiteSettings } from "@/lib/queries";
import { ResearchListClient } from "./ResearchListClient";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const description = `Explore the latest research, reports, and publications on Ireland's ${settings.sectorName} workforce and skills landscape.`;
  return {
    title: "Research & Publications",
    description,
    alternates: { canonical: "/research" },
    openGraph: {
      title: `Research & Publications — ${settings.sectorTitle}`,
      description: `Research, reports, and publications on Ireland's ${settings.sectorName} workforce and skills landscape.`,
      url: "/research",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Research & Publications — ${settings.siteName}`,
      description: `Research and publications on Ireland's ${settings.sectorName} workforce.`,
    },
  };
}

export default async function ResearchPage() {
  const research = await getAllResearch();
  const featured = await getFeaturedResearch();
  const settings = await getSiteSettings();

  return (
    <>
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            Research &amp; Publications
          </h1>
          <p className="text-text-secondary max-w-2xl">
            Key reports, workforce studies, and policy documents shaping Ireland&apos;s{" "}
            {settings.sectorName} sector.
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
