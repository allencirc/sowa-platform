import Link from "next/link";
import Image from "next/image";
import { FileText, ArrowRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Research } from "@/lib/types";

interface ResearchCardProps {
  research: Research;
  featured?: boolean;
  className?: string;
}

export function ResearchCard({ research, featured = false, className }: ResearchCardProps) {
  return (
    <Link
      href={`/research/${research.slug}`}
      className={cn(
        "group block bg-surface-card rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Header image */}
      <div
        className={cn(
          "relative overflow-hidden bg-gradient-to-br from-primary to-primary-light flex items-center justify-center",
          featured ? "h-48" : "h-32",
        )}
      >
        {research.image ? (
          <Image
            src={research.image}
            alt={research.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        ) : (
          <FileText className={cn("text-white/20", featured ? "h-20 w-20" : "h-12 w-12")} />
        )}
      </div>

      <div className={cn("p-5", featured && "p-6")}>
        <div className="flex flex-wrap gap-2 mb-3">
          {research.categories.map((cat) => (
            <Badge key={cat} variant="primary">
              {cat}
            </Badge>
          ))}
        </div>

        <h3
          className={cn(
            "font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors",
            featured ? "text-xl" : "text-base",
          )}
        >
          {research.title}
        </h3>

        <p className="text-sm text-text-secondary mb-1">{research.author}</p>
        <p className="text-sm text-text-muted mb-3">
          {research.organisation} &middot; {formatDate(research.publicationDate)}
        </p>

        {featured && (
          <p className="text-sm text-text-secondary line-clamp-3 mb-4">{research.summary}</p>
        )}

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark group-hover:text-accent-dark transition-colors">
          Read more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
