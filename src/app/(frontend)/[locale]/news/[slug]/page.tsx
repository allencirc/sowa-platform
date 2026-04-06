import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { getNewsBySlug, getAllNews } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

interface NewsDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    return (await getAllNews()).map((n) => ({ slug: n.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: NewsDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  const title = article.metaTitle || `${article.title} — News`;
  const desc = article.metaDescription || article.excerpt.slice(0, 160);
  return {
    title,
    description: desc,
    ...(article.metaKeywords && { keywords: article.metaKeywords }),
    alternates: { canonical: `/news/${article.slug}` },
    openGraph: {
      title: article.metaTitle || article.title,
      description: desc,
      url: `/news/${article.slug}`,
      type: "article",
      publishedTime: article.date,
      authors: [article.author],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle || `${article.title} — SOWA`,
      description: desc,
    },
  };
}

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "News", href: "/news" },
          { label: article.title, href: `/news/${article.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <div className="max-w-3xl">
            <Badge variant="primary" className="mb-4">
              {article.category}
            </Badge>

            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-text-secondary">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-accent-dark" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent-dark" />
                <span>{formatDate(article.date)}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Hero image */}
      {article.image && (
        <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-100">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}

      {/* Article body */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <article className="max-w-3xl">
            <div className="prose prose-lg max-w-none text-text-secondary leading-relaxed">
              {article.content.split("\n\n").map((paragraph, i) => (
                <p key={i} className="mb-6">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm font-semibold text-accent-dark hover:text-accent-dark transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to News
              </Link>
            </div>
          </article>
        </Container>
      </section>
    </>
  );
}
