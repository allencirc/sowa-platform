"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ResearchCard } from "@/components/research/ResearchCard";
import { cn, formatDate } from "@/lib/utils";
import type { Research } from "@/lib/types";

interface ResearchListClientProps {
  research: Research[];
  featured: Research | undefined;
}

export function ResearchListClient({ research, featured }: ResearchListClientProps) {
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    research.forEach((r) => r.categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, [research]);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeCategory) return research;
    return research.filter((r) => r.categories.includes(activeCategory));
  }, [research, activeCategory]);

  // Non-featured items (exclude featured from grid if showing all)
  const gridItems = filtered.filter((r) => (activeCategory ? true : r.slug !== featured?.slug));

  return (
    <div>
      {/* Featured hero card */}
      {featured && !activeCategory && (
        <Link
          href={`/research/${featured.slug}`}
          className="group block bg-gradient-to-br from-primary to-primary-light rounded-2xl overflow-hidden mb-10 transition-shadow duration-200 hover:shadow-xl hover:shadow-primary/10"
        >
          <div className="flex flex-col md:flex-row">
            {/* Decorative side */}
            <div className="md:w-80 shrink-0 flex items-center justify-center py-10 md:py-0">
              <FileText className="h-24 w-24 text-white/15" />
            </div>
            {/* Content */}
            <div className="flex-1 bg-white/5 backdrop-blur-sm p-6 sm:p-8 md:p-10">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="success">Featured</Badge>
                {featured.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-white/10 text-white/80"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-secondary-light transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm text-white/70 mb-1">{featured.author}</p>
              <p className="text-sm text-white/50 mb-4">
                {featured.organisation} &middot; {formatDate(featured.publicationDate)}
              </p>
              <p className="text-white/80 leading-relaxed mb-6 line-clamp-3">{featured.summary}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-dark group-hover:text-secondary-light transition-colors">
                Read More
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer",
            !activeCategory
              ? "bg-primary text-white"
              : "bg-gray-100 text-text-secondary hover:bg-gray-200",
          )}
        >
          All
        </button>
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer",
              activeCategory === cat
                ? "bg-primary text-white"
                : "bg-gray-100 text-text-secondary hover:bg-gray-200",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {gridItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridItems.map((r) => (
            <ResearchCard key={r.slug} research={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FileText className="h-12 w-12 text-text-muted/40 mx-auto mb-4" />
          <p className="text-lg text-text-secondary">No publications in this category</p>
        </div>
      )}
    </div>
  );
}
