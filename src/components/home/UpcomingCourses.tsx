import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StaggeredList } from "@/components/ui/StaggeredList";
import { CourseCard } from "@/components/courses/CourseCard";
import { getAllCourses } from "@/lib/queries";

export async function UpcomingCourses() {
  const courses = (await getAllCourses())
    .filter((c) => c.nextStartDate)
    .sort((a, b) => (a.nextStartDate ?? "").localeCompare(b.nextStartDate ?? ""))
    .slice(0, 3);

  return (
    <section className="py-16 sm:py-20 bg-surface">
      <Container>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">Start Your Training</h2>
            <p className="mt-2 text-text-secondary">
              Upcoming courses from accredited Irish providers.
            </p>
          </div>
          <Link
            href="/training"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark hover:text-accent-dark transition-colors"
          >
            View all courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </StaggeredList>

        <div className="mt-6 sm:hidden">
          <Link
            href="/training"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-dark"
          >
            View all courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
