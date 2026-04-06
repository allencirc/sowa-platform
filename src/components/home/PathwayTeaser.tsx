import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function PathwayTeaser() {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-light text-text-inverse">
      {/* Decorative dots grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        {/* Decorative pathway lines */}
        <svg
          className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[300px] opacity-10 hidden lg:block"
          viewBox="0 0 600 300"
        >
          <circle cx="100" cy="80" r="24" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="280" cy="150" r="24" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="460" cy="100" r="24" stroke="white" strokeWidth="2" fill="none" />
          <circle cx="380" cy="240" r="24" stroke="white" strokeWidth="2" fill="none" />
          <line
            x1="124"
            y1="80"
            x2="256"
            y2="150"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <line x1="304" y1="150" x2="436" y2="100" stroke="white" strokeWidth="1.5" />
          <line
            x1="280"
            y1="174"
            x2="380"
            y2="216"
            stroke="white"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
        </svg>
      </div>

      <Container className="relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-secondary/20 text-secondary-dark mb-6">
            <GitBranch className="h-7 w-7" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">See How Careers Connect</h2>

          <p className="text-lg text-white/70 mb-8 leading-relaxed">
            Explore an interactive map showing how careers connect across the offshore wind sector —
            from entry-level roles to senior leadership.
          </p>

          <Link href="/careers">
            <Button size="lg" variant="secondary">
              Discover Your Path
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
}
