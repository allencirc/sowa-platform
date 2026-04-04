"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge, SectorBadge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Pagination } from "@/components/admin/Pagination";
import { useAdminFetch, adminDelete } from "@/hooks/useAdminFetch";
import type { Career } from "@/lib/types";

const sectorOptions = [
  { label: "All Sectors", value: "" },
  { label: "Operations & Maintenance", value: "Operations & Maintenance" },
  { label: "Marine Operations", value: "Marine Operations" },
  { label: "Survey & Design", value: "Survey & Design" },
  { label: "Health, Safety & Environment", value: "Health, Safety & Environment" },
  { label: "Electrical", value: "Electrical" },
  { label: "Policy & Regulation", value: "Policy & Regulation" },
  { label: "Project Management", value: "Project Management" },
];

export default function AdminCareersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const filters: Record<string, string> = {};
  if (sector) filters.sector = sector;
  if (statusFilter) filters.status = statusFilter;

  const { data, totalPages, loading, refetch } = useAdminFetch<Career & { status?: string }>(
    "/api/careers",
    { page, search, filters }
  );

  const columns: Column<Career & { status?: string }>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-text-primary">{row.title}</span>
      ),
    },
    {
      key: "sector",
      label: "Sector",
      render: (row) => <SectorBadge sector={row.sector} />,
    },
    {
      key: "entryLevel",
      label: "Level",
      render: (row) => <Badge variant="accent">{row.entryLevel}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={(row.status as "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT"} />
      ),
    },
    {
      key: "skills",
      label: "Skills",
      render: (row) => (
        <span className="text-text-secondary">{row.skills.length}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/careers/${row.slug}/edit`}>
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteSlug(row.slug);
            }}
          >
            <Trash2 className="h-4 w-4 text-status-error" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Career Profiles</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage career pathways and role descriptions.
          </p>
        </div>
        <Link href="/admin/careers/new">
          <Button>
            <Plus className="h-4 w-4" /> Add Career
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search careers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select
          options={sectorOptions}
          value={sector}
          onChange={(e) => {
            setSector(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-56"
        />
        <Select
          options={[
            { label: "All Statuses", value: "" },
            { label: "Draft", value: "DRAFT" },
            { label: "In Review", value: "IN_REVIEW" },
            { label: "Published", value: "PUBLISHED" },
            { label: "Archived", value: "ARCHIVED" },
          ]}
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-44"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-text-muted">
          Loading...
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data}
            rowKey={(row) => row.slug}
            onRowClick={(row) => router.push(`/admin/careers/${row.slug}/edit`)}
            emptyMessage="No careers found. Create your first career profile."
          />
          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <DeleteDialog
        open={!!deleteSlug}
        onClose={() => setDeleteSlug(null)}
        onConfirm={async () => {
          if (deleteSlug) {
            await adminDelete(`/api/careers/${deleteSlug}`);
            refetch();
          }
        }}
        title="Delete Career?"
        description="This will permanently remove this career profile and all associated pathway connections."
      />
    </div>
  );
}
