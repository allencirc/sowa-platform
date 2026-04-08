import Link from "next/link";
import { BarChart3, Stethoscope, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchGa4Overview } from "@/lib/integrations/ga4";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";

export const metadata = {
  title: "Analytics — SOWA Admin",
  description:
    "Site traffic, top content, diagnostic completions, and conversion events from Google Analytics 4.",
};

const DEFAULT_DAYS = 28;

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [ga4, registrationsTotal, registrationsRange] = await Promise.all([
    fetchGa4Overview(DEFAULT_DAYS),
    prisma.registration.count(),
    prisma.registration.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - DEFAULT_DAYS * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary">
            <BarChart3 className="h-6 w-6 text-secondary-dark" />
            Analytics
          </h1>
          <p className="mt-1 text-text-secondary">
            Site traffic, top content, diagnostic completions, and conversion events.
          </p>
        </div>
      </div>

      {/* Diagnostic Insights link */}
      <Link
        href="/admin/analytics/diagnostic"
        className="mb-6 flex items-center justify-between rounded-xl border border-secondary/20 bg-secondary/5 px-6 py-4 transition-colors hover:bg-secondary/10"
      >
        <div className="flex items-center gap-3">
          <Stethoscope className="h-5 w-5 text-secondary-dark" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Diagnostic Insights</p>
            <p className="text-xs text-text-secondary">
              Skill gaps, role family trends, and completion analytics from the diagnostic tool.
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-secondary-dark" />
      </Link>

      <AnalyticsDashboard
        initialGa4={ga4}
        initialRegistrationsTotal={registrationsTotal}
        initialRegistrationsRange={registrationsRange}
        initialDays={DEFAULT_DAYS}
      />
    </div>
  );
}
