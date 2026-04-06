import { prisma } from "@/lib/prisma";
import { ClipboardList } from "lucide-react";
import { RegistrationsTable } from "@/components/admin/registrations/RegistrationsTable";

export const metadata = {
  title: "Registrations",
};

export default async function AdminRegistrationsPage() {
  const limit = 20;

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.registration.count(),
  ]);

  const serialized = registrations.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary-dark">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Registrations</h1>
          <p className="text-sm text-text-secondary">Manage event and course registrations</p>
        </div>
      </div>

      <RegistrationsTable
        initialData={serialized}
        initialTotal={total}
        initialPage={1}
        initialLimit={limit}
      />
    </div>
  );
}
