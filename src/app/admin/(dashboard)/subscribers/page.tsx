import { prisma } from "@/lib/prisma";
import { Mail, CheckCircle, XCircle, Clock, CalendarDays } from "lucide-react";
import { SubscribersTable } from "@/components/admin/subscribers/SubscribersTable";

export const metadata = {
  title: "Subscribers",
};

export default async function AdminSubscribersPage() {
  const limit = 20;

  const [subscribers, total, verifiedCount, weeklyCount, monthlyCount] = await Promise.all([
    prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { verified: true } }),
    prisma.subscription.count({ where: { frequency: "WEEKLY" } }),
    prisma.subscription.count({ where: { frequency: "MONTHLY" } }),
  ]);

  const unverifiedCount = total - verifiedCount;

  const serialized = subscribers.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  const stats = [
    { label: "Total", value: total, icon: Mail, color: "bg-accent/10 text-accent-dark" },
    {
      label: "Verified",
      value: verifiedCount,
      icon: CheckCircle,
      color: "bg-secondary/10 text-secondary-dark",
    },
    {
      label: "Unverified",
      value: unverifiedCount,
      icon: XCircle,
      color: "bg-status-warning/10 text-status-warning",
    },
    { label: "Weekly", value: weeklyCount, icon: Clock, color: "bg-accent/10 text-accent-dark" },
    {
      label: "Monthly",
      value: monthlyCount,
      icon: CalendarDays,
      color: "bg-accent/10 text-accent-dark",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Subscribers</h1>
          <p className="text-sm text-text-secondary">Manage newsletter subscriptions</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-text-secondary">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      <SubscribersTable
        initialData={serialized}
        initialTotal={total}
        initialPage={1}
        initialLimit={limit}
      />
    </div>
  );
}
