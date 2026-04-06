import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Calendar,
  FileText,
  Newspaper,
  Users,
  Plus,
  ArrowRight,
  Clock,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HubSpotSyncWidget } from "@/components/admin/HubSpotSyncWidget";
import { formatDate } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  href: string;
}

function StatCard({ label, value, icon, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl bg-surface-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary">{label}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-text-muted" />
    </Link>
  );
}

const typeLabels: Record<string, string> = {
  career: "Career",
  course: "Course",
  event: "Event",
  research: "Research",
  news: "News",
};

const typeColors: Record<string, "primary" | "secondary" | "accent" | "info" | "warning"> = {
  career: "primary",
  course: "secondary",
  event: "accent",
  research: "info",
  news: "warning",
};

interface RecentItem {
  type: string;
  title: string;
  slug: string;
  date: Date;
}

export default async function AdminDashboardPage() {
  const session = await auth();

  const [careers, courses, events, research, news, users, registrations] = await Promise.all([
    prisma.career.count(),
    prisma.course.count(),
    prisma.event.count(),
    prisma.research.count(),
    prisma.newsArticle.count(),
    prisma.user.count(),
    prisma.registration.count(),
  ]);

  // Get recent activity across all content types
  const [recentCareers, recentCourses, recentEvents, recentResearch, recentNews] =
    await Promise.all([
      prisma.career.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { title: true, slug: true, updatedAt: true },
      }),
      prisma.course.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { title: true, slug: true, updatedAt: true },
      }),
      prisma.event.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { title: true, slug: true, updatedAt: true },
      }),
      prisma.research.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { title: true, slug: true, updatedAt: true },
      }),
      prisma.newsArticle.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { title: true, slug: true, updatedAt: true },
      }),
    ]);

  const recentItems: RecentItem[] = [
    ...recentCareers.map((c) => ({
      type: "career",
      title: c.title,
      slug: c.slug,
      date: c.updatedAt,
    })),
    ...recentCourses.map((c) => ({
      type: "course",
      title: c.title,
      slug: c.slug,
      date: c.updatedAt,
    })),
    ...recentEvents.map((e) => ({
      type: "event",
      title: e.title,
      slug: e.slug,
      date: e.updatedAt,
    })),
    ...recentResearch.map((r) => ({
      type: "research",
      title: r.title,
      slug: r.slug,
      date: r.updatedAt,
    })),
    ...recentNews.map((n) => ({ type: "news", title: n.title, slug: n.slug, date: n.updatedAt })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10);

  const hrefMap: Record<string, (slug: string) => string> = {
    career: (slug) => `/admin/careers/${slug}/edit`,
    course: (slug) => `/admin/courses/${slug}/edit`,
    event: (slug) => `/admin/events/${slug}/edit`,
    research: (slug) => `/admin/research/${slug}/edit`,
    news: (slug) => `/admin/news/${slug}/edit`,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-1 text-text-secondary">
          Here&apos;s an overview of the SOWA platform content.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Careers"
          value={careers}
          icon={<Briefcase className="h-6 w-6" />}
          href="/admin/careers"
        />
        <StatCard
          label="Courses"
          value={courses}
          icon={<GraduationCap className="h-6 w-6" />}
          href="/admin/courses"
        />
        <StatCard
          label="Events"
          value={events}
          icon={<Calendar className="h-6 w-6" />}
          href="/admin/events"
        />
        <StatCard
          label="Research"
          value={research}
          icon={<FileText className="h-6 w-6" />}
          href="/admin/research"
        />
        <StatCard
          label="News Articles"
          value={news}
          icon={<Newspaper className="h-6 w-6" />}
          href="/admin/news"
        />
        <StatCard
          label="Registrations"
          value={registrations}
          icon={<ClipboardList className="h-6 w-6" />}
          href="/admin/registrations"
        />
        <StatCard
          label="Users"
          value={users}
          icon={<Users className="h-6 w-6" />}
          href="/admin/users"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Quick Actions + HubSpot */}
        <div className="space-y-6">
          <div className="rounded-xl bg-surface-card p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-text-primary">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              <Link href="/admin/careers/new">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4" />
                  Add Career Profile
                </Button>
              </Link>
              <Link href="/admin/courses/new">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4" />
                  Add Course
                </Button>
              </Link>
              <Link href="/admin/events/new">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </Link>
              <Link href="/admin/research/new">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4" />
                  Add Research
                </Button>
              </Link>
              <Link href="/admin/news/new">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4" />
                  Add News Article
                </Button>
              </Link>
            </div>
          </div>

          <HubSpotSyncWidget />
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl bg-surface-card p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
            <Clock className="h-5 w-5 text-text-secondary" />
            Recent Activity
          </h2>
          {recentItems.length === 0 ? (
            <p className="text-sm text-text-muted">No recent activity.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentItems.map((item, i) => (
                <Link
                  key={`${item.type}-${item.slug}-${i}`}
                  href={hrefMap[item.type](item.slug)}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                >
                  <Badge variant={typeColors[item.type] ?? "default"}>
                    {typeLabels[item.type] ?? item.type}
                  </Badge>
                  <span className="flex-1 truncate text-sm font-medium text-text-primary">
                    {item.title}
                  </span>
                  <span className="shrink-0 text-xs text-text-muted">
                    {formatDate(item.date.toISOString())}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
