import { BarChart3 } from "lucide-react";
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

      <AnalyticsDashboard
        initialGa4={ga4}
        initialRegistrationsTotal={registrationsTotal}
        initialRegistrationsRange={registrationsRange}
        initialDays={DEFAULT_DAYS}
      />
    </div>
  );
}
