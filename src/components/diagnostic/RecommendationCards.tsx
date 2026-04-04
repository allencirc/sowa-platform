"use client";

import Link from "next/link";
import { ArrowRight, Compass, BookOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CareerCard } from "@/components/careers/CareerCard";
import { CourseCard } from "@/components/courses/CourseCard";
import type { DiagnosticResult } from "@/lib/types";

interface RecommendationCardsProps {
  result: DiagnosticResult;
}

export function RecommendationCards({ result }: RecommendationCardsProps) {
  return (
    <div className="space-y-16">
      {/* Recommended Careers */}
      {result.recommendedCareers.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10">
              <Compass className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                Recommended Careers
              </h3>
              <p className="text-sm text-text-secondary">
                Based on your interests and current skills
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.recommendedCareers.map((career) => (
              <CareerCard key={career.slug} career={career} />
            ))}
          </div>
        </div>
      )}

      {/* Recommended Training */}
      {result.recommendedCourses.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/10">
              <BookOpen className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-primary">
                Recommended Training
              </h3>
              <p className="text-sm text-text-secondary">
                Courses that address your identified skill gaps
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.recommendedCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-4 pt-4">
        <Link href="/careers">
          <Button variant="primary" size="lg">
            <Compass className="h-5 w-5" />
            Explore All Careers
          </Button>
        </Link>
        <Link href="/training">
          <Button variant="outline" size="lg">
            <BookOpen className="h-5 w-5" />
            Browse Training
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => window.location.reload()}
        >
          <RotateCcw className="h-5 w-5" />
          Take Again
        </Button>
      </div>
    </div>
  );
}
