import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StaggeredList } from "@/components/ui/StaggeredList";
import { CareerCard } from "@/components/careers/CareerCard";
import { getAllCareers } from "@/lib/queries";

export async function FeaturedCareers() {
  const careers = (await getAllCareers()).slice(0, 4);

  return (
    <section className="py-16 sm:py-20 bg-white">
      <Container>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">Career Pathways</h2>
            <p className="mt-2 text-text-secondary">
              Explore roles across Ireland&apos;s offshore wind energy sector.
            </p>
          </div>
          <Link
            href="/careers"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark hover:text-accent-dark transition-colors"
          >
            View all careers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Horizontal scroll on small, grid on large */}
        <StaggeredList className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {careers.map((career) => (
            <CareerCard
              key={career.slug}
              career={career}
              className="min-w-[280px] snap-start shrink-0 lg:min-w-0"
            />
          ))}
        </StaggeredList>

        <div className="mt-6 sm:hidden">
          <Link
            href="/careers"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark"
          >
            View all careers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
