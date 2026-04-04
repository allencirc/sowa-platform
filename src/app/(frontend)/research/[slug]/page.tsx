import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Calendar, Building2, User, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getResearchBySlug, getAllResearch } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

interface ResearchDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getAllResearch()).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: ResearchDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const research = await getResearchBySlug(slug);
  if (!research) return { title: "Research Not Found" };
  const desc = research.summary.slice(0, 160);
  return {
    title: `${research.title} — Research`,
    description: desc,
    alternates: { canonical: `/research/${research.slug}` },
    openGraph: {
      title: `${research.title} — SOWA Research`,
      description: desc,
      url: `/research/${research.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${research.title} — SOWA`,
      description: desc,
    },
  };
}

export default async function ResearchDetailPage({
  params,
}: ResearchDetailProps) {
  const { slug } = await params;
  const research = await getResearchBySlug(slug);
  if (!research) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Research", href: "/research" },
          { label: research.title, href: `/research/${research.slug}` },
        ]}
      />

      {/* Hero image */}
      {research.image && (
        <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100">
          <Image
            src={research.image}
            alt={research.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}

      {/* Hero */}
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {research.categories.map((cat) => (
                <Badge key={cat} variant="primary">
                  {cat}
                </Badge>
              ))}
              {research.isFeatured && (
                <Badge variant="success">Featured</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
              {research.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-text-secondary">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-accent" />
                <span className="font-medium">{research.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" />
                <span>{research.organisation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span>{formatDate(research.publicationDate)}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Body */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <div className="max-w-3xl space-y-10">
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                Summary
              </h2>
              <p className="text-text-secondary leading-relaxed text-lg">
                {research.summary}
              </p>
            </div>

            {/* Download CTA */}
            <div className="bg-surface rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-text-primary mb-1">
                  Download Full Report
                </h3>
                <p className="text-sm text-text-secondary">
                  Access the complete publication in PDF format.
                </p>
              </div>
              <Button variant="primary">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>

            {/* Back */}
            <Link
              href="/research"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-dark transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Research
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
