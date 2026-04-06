"use client";

import { ExternalLink } from "lucide-react";
import { trackOutboundCourseClick } from "@/lib/analytics";

interface EnrolWithProviderLinkProps {
  courseId: string;
  courseTitle: string;
  provider: string;
  signupUrl: string;
}

/**
 * External "Enrol with Provider" CTA that fires the `outbound_course_click`
 * GA4 conversion event (+ Meta Lead) before navigating.
 */
export function EnrolWithProviderLink({
  courseId,
  courseTitle,
  provider,
  signupUrl,
}: EnrolWithProviderLinkProps) {
  return (
    <a
      href={signupUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-analytics-context="course-enrol-cta"
      onClick={() =>
        trackOutboundCourseClick({
          course_id: courseId,
          course_title: courseTitle,
          provider,
          destination_url: signupUrl,
        })
      }
      className="inline-flex items-center gap-2 rounded-lg bg-secondary hover:bg-secondary-dark text-white font-semibold px-6 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary"
    >
      Enrol with Provider
      <ExternalLink className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">(opens in new tab)</span>
    </a>
  );
}
