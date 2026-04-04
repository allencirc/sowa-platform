import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ResearchCard } from "@/components/research/ResearchCard";
import { getAllResearch, getFeaturedResearch } from "@/lib/queries";

export function LatestResearch() {
  const featured = getFeaturedResearch();
  const others = getAllResearch()
    .filter((r) => r.slug !== featured?.slug)
    .sort((a, b) => b.publicationDate.localeCompare(a.publicationDate))
    .slice(0, 2);

  if (!featured) return null;

  return (
    <section className="py-16 sm:py-20 bg-surface">
      <Container>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">
              Latest Research
            </h2>
            <p className="mt-2 text-text-secondary">
              Policy, workforce data, and industry insights.
            </p>
          </div>
          <Link
            href="/research"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-dark transition-colors"
          >
            View all research
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Featured — takes 1 col on mobile, spans left col on desktop */}
          <ResearchCard research={featured} featured className="lg:row-span-2" />

          {/* Two smaller cards */}
          {others.map((r) => (
            <ResearchCard key={r.slug} research={r} className="lg:col-span-2" />
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/research"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
          >
            View all research
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
