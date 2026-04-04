import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Container } from "@/components/ui/Container";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div className="bg-white border-b border-gray-100">
      <Container>
        <nav aria-label="Breadcrumb" className="py-3">
          <ol className="flex items-center gap-1.5 text-sm">
            <li>
              <Link
                href="/"
                className="text-text-muted hover:text-primary transition-colors"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
            {items.map((item, i) => {
              const isLast = i === items.length - 1;
              return (
                <li key={item.href} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                  {isLast ? (
                    <span className="text-text-primary font-medium" aria-current="page">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-text-muted hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </Container>
    </div>
  );
}
