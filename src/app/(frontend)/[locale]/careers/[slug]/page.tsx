import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Briefcase, TrendingUp, MapPin, GraduationCap, Shield } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { Badge, SectorBadge } from "@/components/ui/Badge";
import { SkillBadge } from "@/components/careers/SkillBadge";
import { MiniPathway } from "@/components/careers/MiniPathway";
import { CourseCard } from "@/components/courses/CourseCard";
import {
  getCareerBySlug,
  getCoursesByCareer,
  getSkillsByCareer,
  getAllCareers,
} from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

interface CareerDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    return (await getAllCareers()).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: CareerDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);
  if (!career) return { title: "Career Not Found" };
  const title = career.metaTitle || `${career.title} — Careers`;
  const desc = career.metaDescription || career.description.slice(0, 160);
  return {
    title,
    description: desc,
    ...(career.metaKeywords && { keywords: career.metaKeywords }),
    alternates: { canonical: `/careers/${career.slug}` },
    openGraph: {
      title: career.metaTitle || `${career.title} — Offshore Wind Career`,
      description: desc,
      url: `/careers/${career.slug}`,
      type: "article",
      section: career.sector,
    },
    twitter: {
      card: "summary_large_image",
      title: career.metaTitle || `${career.title} — SOWA`,
      description: desc,
    },
  };
}

export default async function CareerDetailPage({ params }: CareerDetailProps) {
  const { slug } = await params;
  const career = await getCareerBySlug(slug);
  if (!career) notFound();

  const [skills, relatedCourses] = await Promise.all([
    getSkillsByCareer(career.slug),
    getCoursesByCareer(career.slug),
  ]);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Careers", href: "/careers" },
          { label: career.title, href: `/careers/${career.slug}` },
        ]}
      />

      {/* Hero */}
      <section className="bg-surface py-10 sm:py-14">
        <Container>
          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-4">
              <SectorBadge sector={career.sector} />
              <Badge variant="default">{career.entryLevel}</Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              {career.title}
            </h1>

            {career.salaryRange && (
              <div className="flex items-center gap-2 text-lg font-semibold text-secondary-dark">
                <Briefcase className="h-5 w-5" />
                {formatCurrency(career.salaryRange.min)} – {formatCurrency(career.salaryRange.max)}
                <span className="text-sm font-normal text-text-muted">per year</span>
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <div className="max-w-3xl space-y-12">
            {/* About */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-accent-dark" />
                About This Role
              </h2>
              <p className="text-text-secondary leading-relaxed">{career.description}</p>
            </div>

            {/* Key Responsibilities */}
            {career.keyResponsibilities && career.keyResponsibilities.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-3">Key Responsibilities</h2>
                <ul className="space-y-2">
                  {career.keyResponsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-secondary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills & Qualifications */}
            <div>
              <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-accent-dark" />
                Skills &amp; Qualifications
              </h2>

              {skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
                    Core Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <SkillBadge key={skill.slug} skill={skill} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide mb-3">
                  Qualifications
                </h3>
                <ul className="space-y-2">
                  {career.qualifications.map((q, i) => (
                    <li key={i} className="flex items-start gap-3 text-text-secondary">
                      <Shield className="h-4 w-4 text-secondary-dark shrink-0 mt-0.5" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Working Conditions */}
            {career.workingConditions && (
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent-dark" />
                  Working Conditions
                </h2>
                <p className="text-text-secondary leading-relaxed">{career.workingConditions}</p>
              </div>
            )}

            {/* Growth Outlook */}
            {career.growthOutlook && (
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-text-primary mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary-dark" />
                  Growth Outlook
                </h2>
                <p className="text-text-primary font-medium leading-relaxed">
                  {career.growthOutlook}
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Related Training */}
      {relatedCourses.length > 0 && (
        <section className="py-12 sm:py-16 bg-surface">
          <Container>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Related Training</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedCourses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Career Pathway */}
      <section className="py-12 sm:py-16 bg-white">
        <Container>
          <h2 className="text-2xl font-bold text-text-primary mb-8">Career Pathway</h2>
          <div className="max-w-2xl mx-auto">
            <MiniPathway career={career} />
          </div>
        </Container>
      </section>
    </>
  );
}
