"use client";

import { useCallback, useEffect, useState } from "react";
import { Target, TrendingUp, Users, Globe, Download, AlertTriangle, Loader2 } from "lucide-react";
import { CompletionsChart } from "./CompletionsChart";
import { SkillScoresRadar } from "./SkillScoresRadar";
import { SkillGapsBar } from "./SkillGapsBar";
import { RoleFamiliesPie } from "./RoleFamiliesPie";
import { DateRangeFilter, type DateRange } from "./DateRangeFilter";

// ─── Types ───────────────────────────────────────────────

interface AnalyticsData {
  totalCompletions: number;
  completionsByDate: { date: string; count: number }[];
  averageScoresByCategory: Record<string, number>;
  topSkillGaps: { slug: string; name: string; count: number }[];
  topRoleFamilies: { key: string; label: string; count: number }[];
  localeBreakdown: { locale: string; count: number }[];
  dateRange: { from: string | null; to: string };
}

interface Props {
  userRole: string;
}

// ─── Helpers ─────────────────────────────────────────────

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-1 text-3xl font-bold text-text-primary">{value}</p>
          {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark">
          {icon}
        </div>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IE").format(n);
}

// ─── Dashboard ───────────────────────────────────────────

export function DiagnosticAnalyticsDashboard({ userRole }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ preset: "90d" });

  const fetchData = useCallback(async (range: DateRange) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
    if (range.preset && !range.from) {
      const days = range.preset === "7d" ? 7 : range.preset === "28d" ? 28 : 90;
      const from = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
      const to = new Date().toISOString().split("T")[0];
      params.set("from", from);
      params.set("to", to);
    }

    try {
      const res = await fetch(`/api/admin/diagnostic/analytics?${params}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError((err as Error).message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange, fetchData]);

  const handleExportCSV = async () => {
    const params = new URLSearchParams();
    if (dateRange.from) params.set("from", dateRange.from);
    if (dateRange.to) params.set("to", dateRange.to);
    if (dateRange.preset && !dateRange.from) {
      const days = dateRange.preset === "7d" ? 7 : dateRange.preset === "28d" ? 28 : 90;
      params.set("from", new Date(Date.now() - days * 86400000).toISOString().split("T")[0]);
      params.set("to", new Date().toISOString().split("T")[0]);
    }
    params.set("export", "csv");

    const res = await fetch(`/api/admin/diagnostic/analytics?${params}`);
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sowa-diagnostic-analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <h2 className="text-base font-semibold text-red-900">Could not load analytics</h2>
            <p className="mt-1 break-words text-sm text-red-900/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {userRole === "ADMIN" && (
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={loading || !data}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-text-primary shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      ) : data ? (
        <>
          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total completions"
              value={formatNumber(data.totalCompletions)}
              icon={<Target className="h-5 w-5" />}
            />
            <MetricCard
              label="Top role family"
              value={data.topRoleFamilies[0]?.label ?? "—"}
              hint={
                data.topRoleFamilies[0]
                  ? `${formatNumber(data.topRoleFamilies[0].count)} times`
                  : undefined
              }
              icon={<TrendingUp className="h-5 w-5" />}
            />
            <MetricCard
              label="Top skill gap"
              value={data.topSkillGaps[0]?.name ?? "—"}
              hint={
                data.topSkillGaps[0]
                  ? `${formatNumber(data.topSkillGaps[0].count)} users`
                  : undefined
              }
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              label="Locales"
              value={String(data.localeBreakdown.length)}
              hint={data.localeBreakdown
                .slice(0, 3)
                .map((l) => l.locale)
                .join(", ")}
              icon={<Globe className="h-5 w-5" />}
            />
          </div>

          {/* Charts row 1: line + radar */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-surface-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Completions over time
              </h2>
              {data.completionsByDate.length > 0 ? (
                <CompletionsChart data={data.completionsByDate} />
              ) : (
                <p className="py-12 text-center text-sm text-text-muted">
                  No completions in this period.
                </p>
              )}
            </div>
            <div className="rounded-xl bg-surface-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Average skill scores by category
              </h2>
              <SkillScoresRadar data={data.averageScoresByCategory} />
            </div>
          </div>

          {/* Charts row 2: bar + pie */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-surface-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Most common skill gaps
              </h2>
              {data.topSkillGaps.length > 0 ? (
                <SkillGapsBar data={data.topSkillGaps} />
              ) : (
                <p className="py-12 text-center text-sm text-text-muted">No gap data yet.</p>
              )}
            </div>
            <div className="rounded-xl bg-surface-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Most recommended role families
              </h2>
              {data.topRoleFamilies.length > 0 ? (
                <RoleFamiliesPie data={data.topRoleFamilies} />
              ) : (
                <p className="py-12 text-center text-sm text-text-muted">
                  No role family data yet.
                </p>
              )}
            </div>
          </div>

          {/* Locale breakdown */}
          {data.localeBreakdown.length > 1 && (
            <div className="rounded-xl bg-surface-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">Locale breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-2 font-medium text-text-secondary">Locale</th>
                      <th className="pb-2 text-right font-medium text-text-secondary">
                        Completions
                      </th>
                      <th className="pb-2 text-right font-medium text-text-secondary">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.localeBreakdown.map((row) => (
                      <tr key={row.locale} className="border-b border-gray-50">
                        <td className="py-2 font-medium text-text-primary">{row.locale}</td>
                        <td className="py-2 text-right tabular-nums text-text-secondary">
                          {formatNumber(row.count)}
                        </td>
                        <td className="py-2 text-right tabular-nums text-text-secondary">
                          {data.totalCompletions > 0
                            ? `${((row.count / data.totalCompletions) * 100).toFixed(1)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <p className="text-xs text-text-muted">
            Data sourced from anonymous diagnostic sessions stored in the platform database.
            {data.dateRange.from && data.dateRange.to
              ? ` Showing ${data.dateRange.from} to ${data.dateRange.to}.`
              : ""}
          </p>
        </>
      ) : null}
    </div>
  );
}
