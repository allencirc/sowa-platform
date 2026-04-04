"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Pagination } from "@/components/admin/Pagination";
import { useAdminFetch, adminDelete } from "@/hooks/useAdminFetch";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { Research } from "@/lib/types";

export default function AdminResearchPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;

  const { data, totalPages, loading, refetch } = useAdminFetch<Research & { status?: string }>(
    "/api/research",
    { page, search, filters }
  );

  const columns: Column<Research & { status?: string }>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary">{row.title}</span>
          {row.isFeatured && <Star className="h-4 w-4 fill-status-warning text-status-warning" />}
        </div>
      ),
    },
    {
      key: "author",
      label: "Author",
      render: (row) => (
        <div>
          <span className="text-text-primary">{row.author}</span>
          <p className="text-xs text-text-muted">{row.organisation}</p>
        </div>
      ),
    },
    {
      key: "publicationDate",
      label: "Published",
      render: (row) => <span className="text-text-secondary">{formatDate(row.publicationDate)}</span>,
    },
    {
      key: "categories",
      label: "Categories",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.categories.slice(0, 2).map((c) => (
            <Badge key={c} variant="default">{c}</Badge>
          ))}
          {row.categories.length > 2 && <Badge variant="default">+{row.categories.length - 2}</Badge>}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge status={(row.status as "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT"} />
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/research/${row.slug}/edit`}>
            <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteSlug(row.slug); }}>
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
          <h1 className="text-2xl font-bold text-text-primary">Research</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage research papers and reports.</p>
        </div>
        <Link href="/admin/research/new">
          <Button><Plus className="h-4 w-4" /> Add Research</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Search research..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
        </div>
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
        <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
      ) : (
        <>
          <DataTable columns={columns} data={data} rowKey={(row) => row.slug} onRowClick={(row) => router.push(`/admin/research/${row.slug}/edit`)} emptyMessage="No research found." />
          <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </>
      )}

      <DeleteDialog
        open={!!deleteSlug}
        onClose={() => setDeleteSlug(null)}
        onConfirm={async () => { if (deleteSlug) { await adminDelete(`/api/research/${deleteSlug}`); refetch(); } }}
        title="Delete Research?"
        description="This will permanently remove this research item."
      />
    </div>
  );
}
