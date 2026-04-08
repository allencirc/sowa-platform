import { Stethoscope } from "lucide-react";
import { auth } from "@/lib/auth";
import { DiagnosticAnalyticsDashboard } from "@/components/admin/diagnostic-analytics/DiagnosticAnalyticsDashboard";

export const metadata = {
  title: "Diagnostic Insights — SOWA Admin",
  description:
    "Anonymous diagnostic session analytics: completions, skill gaps, role family trends, and locale breakdown.",
};

export default async function DiagnosticAnalyticsPage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-text-primary">
          <Stethoscope className="h-6 w-6 text-secondary-dark" />
          Diagnostic Insights
        </h1>
        <p className="mt-1 text-text-secondary">
          Anonymous usage analytics from the skills diagnostic tool. No personal data stored.
        </p>
      </div>

      <DiagnosticAnalyticsDashboard userRole={session.user.role} />
    </div>
  );
}
