"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
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
import type { Event } from "@/lib/types";

const typeOptions = [
  { label: "All Types", value: "" },
  { label: "Workshop", value: "Workshop" },
  { label: "Webinar", value: "Webinar" },
  { label: "Conference", value: "Conference" },
  { label: "Networking", value: "Networking" },
  { label: "Training", value: "Training" },
  { label: "Roadshow", value: "Roadshow" },
];

export default function AdminEventsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const filters: Record<string, string> = {};
  if (type) filters.type = type;
  if (statusFilter) filters.status = statusFilter;

  const { data, totalPages, loading, refetch } = useAdminFetch<Event & { status?: string }>(
    "/api/events",
    { page, search, filters }
  );

  const columns: Column<Event & { status?: string }>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (row) => <span className="font-medium text-text-primary">{row.title}</span>,
    },
    {
      key: "type",
      label: "Type",
      render: (row) => <Badge variant="accent">{row.type}</Badge>,
    },
    {
      key: "startDate",
      label: "Date",
      render: (row) => <span className="text-text-secondary">{formatDate(row.startDate)}</span>,
    },
    {
      key: "locationType",
      label: "Location",
      render: (row) => (
        <div>
          <Badge variant={row.locationType === "Virtual" ? "info" : row.locationType === "Hybrid" ? "warning" : "default"}>
            {row.locationType}
          </Badge>
          {row.location && <p className="mt-1 text-xs text-text-muted">{row.location}</p>}
        </div>
      ),
    },
    {
      key: "capacity",
      label: "Capacity",
      render: (row) => <span className="text-text-secondary">{row.capacity ?? "—"}</span>,
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
          <Link href={`/admin/events/${row.slug}/edit`}>
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
          <h1 className="text-2xl font-bold text-text-primary">Events</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage events, workshops, and webinars.</p>
        </div>
        <Link href="/admin/events/new">
          <Button><Plus className="h-4 w-4" /> Add Event</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Search events..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
        </div>
        <Select options={typeOptions} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className="w-full sm:w-48" />
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
          <DataTable columns={columns} data={data} rowKey={(row) => row.slug} onRowClick={(row) => router.push(`/admin/events/${row.slug}/edit`)} emptyMessage="No events found." />
          <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </>
      )}

      <DeleteDialog
        open={!!deleteSlug}
        onClose={() => setDeleteSlug(null)}
        onConfirm={async () => { if (deleteSlug) { await adminDelete(`/api/events/${deleteSlug}`); refetch(); } }}
        title="Delete Event?"
        description="This will permanently remove this event."
      />
    </div>
  );
}
