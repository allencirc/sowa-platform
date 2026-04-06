"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowRight, FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import type { SearchResult } from "@/lib/types";

const typeConfig: Record<
  SearchResult["type"],
  { label: string; variant: "primary" | "accent" | "secondary" | "info" | "warning"; href: string }
> = {
  career: { label: "Career", variant: "primary", href: "/careers" },
  course: { label: "Course", variant: "accent", href: "/training" },
  event: { label: "Event", variant: "secondary", href: "/events" },
  research: { label: "Research", variant: "info", href: "/research" },
  news: { label: "News", variant: "warning", href: "/news" },
};

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Fetch search results from API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data: SearchResult[]) => {
        if (!cancelled) setResults(data);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  // Group results by type
  const grouped = useMemo(() => {
    const map = new Map<SearchResult["type"], SearchResult[]>();
    for (const r of results) {
      const arr = map.get(r.type) ?? [];
      arr.push(r);
      map.set(r.type, arr);
    }
    return map;
  }, [results]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      router.push(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
    },
    [query, router],
  );

  return (
    <>
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">Search</h1>

          {/* Search input */}
          <form
            onSubmit={handleSubmit}
            className="max-w-2xl"
            role="search"
            aria-label="Site search"
          >
            <label htmlFor="global-search" className="sr-only">
              Search the site
            </label>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted"
                aria-hidden="true"
              />
              <input
                id="global-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search careers, courses, events, research..."
                className="w-full pl-12 pr-4 py-4 text-lg bg-white border border-gray-200 rounded-xl text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none transition-colors"
                autoFocus
              />
            </div>
          </form>
        </Container>
      </section>

      <section className="py-10 sm:py-14 bg-white" aria-live="polite" aria-atomic="true">
        <Container>
          {query.trim() === "" ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-text-muted/30 mx-auto mb-4" />
              <p className="text-lg text-text-secondary">
                Start typing to search across all content
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-text-muted/30 mx-auto mb-4" />
              <p className="text-lg text-text-secondary mb-2">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-sm text-text-muted">
                Try adjusting your search terms or browse our content sections.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-text-secondary mb-8">
                Found <span className="font-semibold text-text-primary">{results.length}</span>{" "}
                result{results.length !== 1 && "s"} for &ldquo;{query}&rdquo;
              </p>

              <div className="space-y-10">
                {Array.from(grouped.entries()).map(([type, items]) => {
                  const config = typeConfig[type];
                  return (
                    <div key={type}>
                      <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                        <Badge variant={config.variant}>{config.label}</Badge>
                        <span className="text-text-muted text-sm font-normal">
                          ({items.length})
                        </span>
                      </h2>

                      <div className="space-y-3">
                        {items.map((result) => (
                          <Link
                            key={`${result.type}-${result.slug}`}
                            href={`${config.href}/${result.slug}`}
                            className="group block bg-surface-card rounded-xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-md hover:border-gray-200"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors mb-1">
                                  {result.title}
                                </h3>
                                <p className="text-sm text-text-secondary line-clamp-2">
                                  {result.excerpt}
                                </p>
                              </div>
                              <ArrowRight className="h-5 w-5 text-text-muted shrink-0 mt-1 transition-transform group-hover:translate-x-0.5 group-hover:text-accent-dark" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
