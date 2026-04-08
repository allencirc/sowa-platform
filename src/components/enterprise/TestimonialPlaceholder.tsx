import { Quote } from "lucide-react";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n";

export function TestimonialPlaceholder({ dict }: { dict: Dictionary }) {
  const { testimonials } = dict.enterprise;

  return (
    <section className="py-16 sm:py-20 bg-surface">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
            {testimonials.title}
          </h2>
          <p className="text-sm text-text-muted">{testimonials.placeholder}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.quotes.map((item) => (
            <figure
              key={item.company}
              className="relative bg-surface-card rounded-xl border border-gray-100 p-6 pl-8 border-l-4 border-l-secondary"
            >
              <Quote
                className="absolute top-4 right-4 h-6 w-6 text-secondary/20"
                aria-hidden="true"
              />
              <blockquote className="text-sm text-text-secondary leading-relaxed mb-4 italic">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption>
                <p className="text-sm font-semibold text-text-primary">{item.author}</p>
                <p className="text-xs text-text-muted">{item.company}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
