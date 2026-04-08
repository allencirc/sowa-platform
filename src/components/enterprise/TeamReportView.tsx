"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Users,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSkillDisplayName } from "@/lib/team-report";
import type { AggregatedTeamData } from "@/lib/team-report";

interface SuggestedCourse {
  slug: string;
  title: string;
  provider: string;
  cost: number;
  duration: string;
  deliveryFormat: string;
  matchedSkills: string[];
}

interface TeamReportData {
  teamName: string;
  responseCount: number;
  threshold: number;
  expiresAt: string | null;
  createdAt: string;
  aggregated: AggregatedTeamData;
  aiReport: { markdown: string } | null;
  reportGeneratedAt: string | null;
  suggestedCourses?: SuggestedCourse[];
}

interface TeamReportViewProps {
  data: TeamReportData;
  managerToken: string;
  locale?: string;
}

const SEVERITY_COLORS = {
  high: "#DC2626",
  medium: "#F59E0B",
  low: "#00A878",
};

const ROLE_FAMILY_COLORS = ["#0C2340", "#00A878", "#4A90D9", "#F59E0B", "#7C3AED", "#EA580C"];

export function TeamReportView({
  data: initialData,
  managerToken,
  locale = "en",
}: TeamReportViewProps) {
  const [data, setData] = useState<TeamReportData>(initialData);
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/team/report/${managerToken}/regenerate`, {
        method: "POST",
      });
      if (res.ok) {
        const updated = await res.json();
        setData((prev) => ({
          ...prev,
          aiReport: updated.aiReport,
          reportGeneratedAt: updated.reportGeneratedAt,
        }));
      }
    } catch {
      // Failed to regenerate
    } finally {
      setRegenerating(false);
    }
  }, [managerToken]);

  const { aggregated } = data;

  // Radar chart data
  const radarData = useMemo(
    () =>
      Object.entries(aggregated.avgScores)
        .filter(([, avg]) => avg > 0)
        .map(([slug, avg]) => ({
          skill: getSkillDisplayName(slug),
          score: Math.round(avg),
          fullMark: 100,
        }))
        .sort((a, b) => a.skill.localeCompare(b.skill)),
    [aggregated.avgScores],
  );

  // Role family bar chart data
  const roleFamilyData = useMemo(
    () =>
      Object.entries(aggregated.roleFamilyDistribution)
        .map(([family, count]) => ({ family, count }))
        .sort((a, b) => b.count - a.count),
    [aggregated.roleFamilyDistribution],
  );

  // Top gaps
  const topGaps = aggregated.topTeamGaps
    .filter((g) => g.severity === "high" || g.severity === "medium")
    .slice(0, 6);

  // Strengths
  const strengths = aggregated.topTeamGaps
    .filter((g) => g.severity === "low")
    .sort((a, b) => b.avgPercent - a.avgPercent)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-surface print:bg-white">
      {/* Header */}
      <div className="bg-primary text-white py-12 sm:py-16">
        <Container>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-secondary" />
                <span className="text-sm font-medium text-white/60 uppercase tracking-wider">
                  Team Report
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{data.teamName}</h1>
              <p className="text-white/60">
                {data.responseCount} of {data.threshold} responses received
                {data.responseCount >= data.threshold && (
                  <span className="ml-2 inline-flex items-center gap-1 text-secondary text-sm">
                    <TrendingUp className="h-4 w-4" /> Threshold reached
                  </span>
                )}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={regenerating || data.responseCount === 0}
              className="border-white/30 text-white hover:bg-white/10 print:hidden"
            >
              <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
              {regenerating ? "Generating..." : "Regenerate Report"}
            </Button>
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-10 space-y-10">
          {data.responseCount === 0 ? (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h2 className="text-xl font-bold text-text-primary mb-2">No Responses Yet</h2>
              <p className="text-text-secondary max-w-md mx-auto">
                Share the team assessment link with your team members. Results will appear here as
                they complete the diagnostic.
              </p>
            </div>
          ) : (
            <>
              {/* Radar Chart */}
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Team Skills Overview
                </h2>
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={380}>
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#E5E7EB" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "#6B7280" }} />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                      />
                      <Radar
                        dataKey="score"
                        stroke="#00A878"
                        fill="#00A878"
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Gaps & Strengths */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Top Gaps */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-status-warning" />
                    Priority Skill Gaps
                  </h2>
                  {topGaps.length === 0 ? (
                    <p className="text-sm text-text-muted">No significant gaps identified.</p>
                  ) : (
                    <div className="space-y-3">
                      {topGaps.map((gap) => (
                        <div key={gap.skill}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-text-primary">
                              {getSkillDisplayName(gap.skill)}
                            </span>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${SEVERITY_COLORS[gap.severity]}15`,
                                color: SEVERITY_COLORS[gap.severity],
                              }}
                            >
                              {gap.avgPercent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${gap.avgPercent}%`,
                                backgroundColor: SEVERITY_COLORS[gap.severity],
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Strengths */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-secondary" />
                    Team Strengths
                  </h2>
                  {strengths.length === 0 ? (
                    <p className="text-sm text-text-muted">
                      No strong areas identified yet — more responses may reveal strengths.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {strengths.map((s) => (
                        <div key={s.skill}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-text-primary">
                              {getSkillDisplayName(s.skill)}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary-dark">
                              {s.avgPercent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-secondary transition-all"
                              style={{ width: `${s.avgPercent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Role Family Distribution */}
              {roleFamilyData.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-text-primary mb-6">
                    Team Role Family Distribution
                  </h2>
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={roleFamilyData} layout="vertical">
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="family"
                          width={160}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                          {roleFamilyData.map((_, idx) => (
                            <Cell
                              key={idx}
                              fill={ROLE_FAMILY_COLORS[idx % ROLE_FAMILY_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}

              {/* Suggested Courses */}
              {data.suggestedCourses && data.suggestedCourses.length > 0 && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-secondary" />
                    Recommended Courses for Your Team
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {data.suggestedCourses.map((course) => (
                      <Link
                        key={course.slug}
                        href={`/${locale}/training/${course.slug}`}
                        className="group block rounded-xl border border-gray-100 p-5 hover:border-secondary/30 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-sm font-semibold text-text-primary group-hover:text-secondary-dark leading-snug">
                            {course.title}
                          </h3>
                          <ExternalLink className="h-4 w-4 text-text-muted flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-xs text-text-secondary mb-3">{course.provider}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary">
                            {course.cost === 0 ? "Free" : `€${course.cost}`}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary">
                            {course.deliveryFormat}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-surface text-text-secondary">
                            {course.duration}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {course.matchedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary-dark font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* AI Report */}
              {data.aiReport && "markdown" in data.aiReport && (
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text-primary">
                      AI Training Needs Analysis
                    </h2>
                    {data.reportGeneratedAt && (
                      <span className="text-xs text-text-muted">
                        Generated{" "}
                        {new Date(data.reportGeneratedAt).toLocaleDateString("en-IE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none text-text-primary prose-headings:text-text-primary prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-ul:my-2 prose-li:my-0.5">
                    <MarkdownRenderer content={(data.aiReport as { markdown: string }).markdown} />
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

/**
 * Simple markdown renderer — handles ##, **, -, numbered lists.
 * Good enough for AI report output without pulling in a full library.
 */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    key++;
    const trimmed = line.trimEnd();

    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2 key={key} className="text-lg font-bold mt-6 mb-3">
          {formatInline(trimmed.slice(3))}
        </h2>,
      );
    } else if (trimmed.startsWith("### ")) {
      elements.push(
        <h3 key={key} className="text-base font-semibold mt-4 mb-2">
          {formatInline(trimmed.slice(4))}
        </h3>,
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <li key={key} className="ml-4 list-disc text-sm leading-relaxed">
          {formatInline(trimmed.slice(2))}
        </li>,
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s/, "");
      elements.push(
        <li key={key} className="ml-4 list-decimal text-sm leading-relaxed">
          {formatInline(text)}
        </li>,
      );
    } else if (trimmed === "") {
      elements.push(<br key={key} />);
    } else {
      elements.push(
        <p key={key} className="text-sm leading-relaxed mb-2">
          {formatInline(trimmed)}
        </p>,
      );
    }
  }

  return <>{elements}</>;
}

function formatInline(text: string): React.ReactNode {
  // Handle **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
