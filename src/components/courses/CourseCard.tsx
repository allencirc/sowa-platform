import Link from "next/link";
import { Calendar, MapPin, Clock } from "lucide-react";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Course } from "@/lib/types";

const formatBadgeMap: Record<string, "info" | "success" | "accent" | "default"> = {
  "In-Person": "info",
  Online: "success",
  Blended: "accent",
  "Self-Paced": "default",
};

interface CourseCardProps {
  course: Course;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  return (
    <Link
      href={`/training/${course.slug}`}
      className={cn(
        "group block bg-surface-card rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant={formatBadgeMap[course.deliveryFormat] ?? "default"}>
            {course.deliveryFormat}
          </Badge>
          {course.cost === 0 && (
            <Badge variant="success">Free</Badge>
          )}
          {course.nfqLevel && (
            <Badge variant="primary">NFQ Level {course.nfqLevel}</Badge>
          )}
        </div>

        <h3 className="text-lg font-semibold text-text-primary mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-sm text-text-secondary mb-4">
          {course.provider}
        </p>

        <div className="space-y-1.5 text-sm text-text-secondary">
          {course.nextStartDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-text-muted shrink-0" />
              <span>{formatDate(course.nextStartDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-text-muted shrink-0" />
            <span>{course.duration}</span>
          </div>
          {course.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-text-muted shrink-0" />
              <span>{course.location}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-base font-semibold text-text-primary">
            {formatCurrency(course.cost)}
          </span>
          {course.costNotes && (
            <span className="text-xs text-secondary-dark font-medium">
              {course.costNotes}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
