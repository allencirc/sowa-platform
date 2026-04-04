import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getAllCourses } from "@/lib/queries";
import { CourseListingClient } from "./CourseListingClient";

export const metadata: Metadata = {
  title: "Training & Courses",
  description:
    "Find accredited courses, certifications, and training programmes for offshore wind careers in Ireland. Filter by format, NFQ level, provider, and cost.",
  alternates: { canonical: "/training" },
  openGraph: {
    title: "Training & Courses — Offshore Wind Energy",
    description:
      "Find accredited courses, certifications, and training programmes for offshore wind careers in Ireland.",
    url: "/training",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Training & Courses — SOWA",
    description:
      "Accredited courses and training for offshore wind careers in Ireland.",
  },
};

export default function TrainingPage() {
  const courses = getAllCourses();

  return (
    <>
      {/* Hero header */}
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-2">
            Training &amp; Courses
          </h1>
          <p className="text-text-secondary max-w-2xl">
            Find accredited courses, certifications, and training programmes for
            offshore wind careers
          </p>
        </Container>
      </section>

      {/* Listing */}
      <section className="py-10 sm:py-14 bg-white">
        <Container>
          <Suspense fallback={<CourseListingSkeleton />}>
            <CourseListingClient courses={courses} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}

function CourseListingSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar placeholder */}
      <div className="hidden lg:block w-64 shrink-0 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
      {/* Cards placeholder */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 bg-gray-100 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
