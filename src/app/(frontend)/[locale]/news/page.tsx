import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { getAllNews } from "@/lib/queries";

import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "News",
  description:
    "Latest news and updates from Ireland's offshore wind energy sector. Industry developments, policy changes, and sector growth.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "News — Offshore Wind Energy Ireland",
    description:
      "Latest news and updates from Ireland's offshore wind energy sector.",
    url: "/news",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "News — SOWA",
    description:
      "Latest news from Ireland's offshore wind energy sector.",
  },
};

export default async function NewsPage() {
  const articles = await getAllNews();

  return (
    <>
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            News
          </h1>
          <p className="text-text-secondary max-w-2xl">
            The latest updates from Ireland&apos;s offshore wind energy sector.
          </p>
        </Container>
      </section>

      <section className="py-10 sm:py-14 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/news/${article.slug}`}
                className="group block bg-surface-card rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                {/* Featured image */}
                <div className="h-44 relative overflow-hidden bg-gradient-to-br from-primary/80 to-accent/60">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                      }}
                    />
                  )}
                  <Badge
                    variant="default"
                    className="absolute top-3 left-3 bg-white/90 text-text-primary z-10"
                  >
                    {article.category}
                  </Badge>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(article.date)}
                  </div>

                  <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-sm text-text-secondary line-clamp-3 mb-4">
                    {article.excerpt}
                  </p>

                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark group-hover:text-accent-dark transition-colors">
                    Read More
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
