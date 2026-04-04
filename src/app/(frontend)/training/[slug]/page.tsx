import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  MapPin,
  Calendar,
  Award,
  Building2,
  CreditCard,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkillBadge } from "@/components/careers/SkillBadge";
import { CareerCard } from "@/components/careers/CareerCard";
import {
  getCourseBySlug,
  getAllCourses,
  getCareerBySlug,
  getSkillBySlug,
} from "@/lib/queries";
import { formatDate, formatCurrency } from "@/lib/utils";

interface CourseDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllCourses().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: CourseDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return { title: "Course Not Found" };
  const desc = course.description.slice(0, 160);
  return {
    title: `${course.title} — Training`,
    description: desc,
    alternates: { canonical: `/training/${course.slug}` },
    openGraph: {
      title: `${course.title} — Offshore Wind Training`,
      description: desc,
      url: `/training/${course.slug}`,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${course.title} — SOWA`,
      description: desc,
    },
  };
}

const formatBadgeMap: Record<string, "info" | "success" | "accent" | "default"> = {
  "In-Person": "info",
  Online: "success",
  Blended: "accent",
  "Self-Paced": "default",
};

export default async function CourseDetailPage({ params }: CourseDetailProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const skills = course.skills
    .map((s) => getSkillBySlug(s))
    .filter((s): s is NonNullable<typeof s> => s !== undefined);

  const relatedCareers = course.careerRelevance
    .map((s) => getCareerBySlug(s))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  const infoItems = [
    {
      icon: Clock,
      label: "Duration",
      value: course.duration,
    },
    {
      icon: CreditCard,
      label: "Cost",
      value:
        course.cost === 0
          ? "Free"
          : formatCurrency(course.cost),
      note: course.costNotes,
      highlight: course.cost === 0,
    },
    {
      icon: Calendar,
      label: "Next Start",
      value: course.nextStartDate
        ? formatDate(course.nextStartDate)
        : "Contact provider",
    },
    {
      icon: MapPin,
      label: "Location",
      value: course.location ?? "Online",
    },
    {
      icon: Award,
      label: "Certification",
      value: course.certificationAwarded ?? "Certificate of Completion",
    },
    {
      icon: Building2,
      label: "Provider",
      value: course.provider,
    },
  ];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Training", href: "/training" },
          { label: course.title, href: `/training/${course.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={formatBadgeMap[course.deliveryFormat] ?? "default"}>
                {course.deliveryFormat}
              </Badge>
              {course.accredited && (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Accredited
                </Badge>
              )}
              {course.nfqLevel && (
                <Badge variant="primary">NFQ Level {course.nfqLevel}</Badge>
              )}
              {course.cost === 0 && (
                <Badge variant="success">Free</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-3">
              {course.title}
            </h1>

            <p className="text-lg text-text-secondary">
              {course.provider}
            </p>
          </div>
        </Container>
      </section>

      {/* Key Info Grid */}
      <section className="bg-white border-b border-gray-100">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-gray-100 -mx-1">
            {infoItems.map((item) => (
              <div key={item.label} className="px-5 py-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <item.icon className="h-4 w-4 text-accent" />
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                    {item.label}
                  </span>
                </div>
                <p
                  className={`text-base font-semibold ${
                    item.highlight
                      ? "text-secondary"
                      : "text-text-primary"
                  }`}
                >
                  {item.value}
                </p>
                {item.note && (
                  <p className="text-xs text-secondary mt-0.5">{item.note}</p>
                )}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Body content */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <div className="max-w-3xl space-y-12">
            {/* About */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-3">
                About This Course
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* Entry Requirements */}
            {course.entryRequirements && (
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-3">
                  Entry Requirements
                </h2>
                <p className="text-text-secondary leading-relaxed">
                  {course.entryRequirements}
                </p>
              </div>
            )}

            {/* Skills You'll Gain */}
            {skills.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-4">
                  Skills You&apos;ll Gain
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <SkillBadge key={skill.slug} skill={skill} />
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary to-primary-light rounded-xl p-6 sm:p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Interested in this course?
              </h3>
              <p className="text-white/80 mb-5 text-sm">
                Register your interest and we&apos;ll connect you with the
                training provider.
              </p>
              <Button
                variant="secondary"
                size="lg"
                className="shadow-lg"
              >
                Register Interest
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Related Careers */}
      {relatedCareers.length > 0 && (
        <section className="py-12 sm:py-16 bg-surface">
          <Container>
            <h2 className="text-2xl font-bold text-text-primary mb-6">
              Related Careers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedCareers.map((career) => (
                <CareerCard key={career.slug} career={career} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
