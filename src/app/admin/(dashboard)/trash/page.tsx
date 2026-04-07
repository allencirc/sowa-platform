"use client";

import { useState } from "react";
import { Trash2, RotateCcw, AlertTriangle, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { Pagination } from "@/components/admin/Pagination";
import { BulkActionBar } from "@/components/admin/BulkActionBar";
import { useAdminFetch, adminPost, adminDelete } from "@/hooks/useAdminFetch";

interface TrashItem {
  id: string;
  slug: string;
  title: string;
  contentType: string;
  contentTypeLabel: string;
  deletedAt: string;
  deletedBy: string;
}

const typeOptions = [
  { label: "All Types", value: "" },
  { label: "Careers", value: "CAREER" },
  { label: "Courses", value: "COURSE" },
  { label: "Events", value: "EVENT" },
  { label: "Research", value: "RESEARCH" },
  { label: "News", value: "NEWS" },
];

export default function AdminTrashPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [purgeSlug, setPurgeSlug] = useState<{
    slug: string;
    contentType: string;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [restoring, setRestoring] = useState<string | null>(null);

  const filters: Record<string, string> = {};
  if (typeFilter) filters.contentType = typeFilter;

  const { data, totalPages, loading, refetch } = useAdminFetch<TrashItem>("/api/admin/trash", {
    page,
    search,
    filters,
  });

  const handleRestore = async (item: TrashItem) => {
    setRestoring(item.slug);
    try {
      await adminPost("/api/admin/trash", {
        contentType: item.contentType,
        slug: item.slug,
      });
      refetch();
    } finally {
      setRestoring(null);
    }
  };

  const handleBulkAction = async (action: string, _contentType?: string, _status?: string) => {
    // For trash, bulk actions work per-item since items may span content types
    // Group selected items by content type
    const selectedItems = data.filter((item) => selectedIds.has(item.id));
    const grouped = new Map<string, string[]>();
    for (const item of selectedItems) {
      const existing = grouped.get(item.contentType) ?? [];
      existing.push(item.id);
      grouped.set(item.contentType, existing);
    }

    for (const [contentType, ids] of grouped) {
      await adminPost("/api/admin/bulk", {
        action,
        contentType,
        ids,
      });
    }

    setSelectedIds(new Set());
    refetch();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const daysUntilPurge = (dateStr: string) => {
    const deleted = new Date(dateStr);
    const purgeDate = new Date(deleted.getTime() + 30 * 86400000);
    const now = new Date();
    return Math.max(0, Math.ceil((purgeDate.getTime() - now.getTime()) / 86400000));
  };

  const columns: Column<TrashItem>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (row) => <span className="font-medium text-text-primary">{row.title}</span>,
    },
    {
      key: "contentType",
      label: "Type",
      render: (row) => <Badge variant="accent">{row.contentTypeLabel}</Badge>,
    },
    {
      key: "deletedBy",
      label: "Deleted By",
      render: (row) => <span className="text-sm text-text-secondary">{row.deletedBy}</span>,
    },
    {
      key: "deletedAt",
      label: "Deleted",
      render: (row) => (
        <div>
          <span className="text-sm text-text-secondary">{formatDate(row.deletedAt)}</span>
          <span className="ml-2 text-xs text-text-muted">
            ({daysUntilPurge(row.deletedAt)}d until auto-purge)
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-32",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRestore(row);
            }}
            disabled={restoring === row.slug}
          >
            <RotateCcw className="h-4 w-4 text-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setPurgeSlug({
                slug: row.slug,
                contentType: row.contentType,
              });
            }}
          >
            <Trash2 className="h-4 w-4 text-status-error" />
          </Button>
        </div>
      ),
    },
  ];

  // Filter by search client-side (the API doesn't support search on trash)
  const filteredData = search
    ? data.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
    : data;

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-error/10">
            <Trash2 className="h-5 w-5 text-status-error" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Trash</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Deleted items are automatically purged after 30 days.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search trash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-44"
        />
      </div>

      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          actions={[
            {
              label: "Restore Selected",
              icon: RotateCcw,
              onClick: () => handleBulkAction("restore"),
            },
          ]}
        />
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={filteredData}
            rowKey={(row) => row.id}
            emptyMessage="Trash is empty."
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
          />
          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <DeleteDialog
        open={!!purgeSlug}
        onClose={() => setPurgeSlug(null)}
        onConfirm={async () => {
          if (purgeSlug) {
            await adminDelete("/api/admin/trash", {
              contentType: purgeSlug.contentType,
              slug: purgeSlug.slug,
            });
            refetch();
          }
        }}
        title="Permanently Delete?"
        description="This item will be permanently deleted and cannot be recovered."
        isSoftDelete={false}
      />
    </div>
  );
}
