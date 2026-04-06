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
import type { NewsArticle } from "@/lib/types";

export default function AdminNewsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const filters: Record<string, string> = {};
  if (statusFilter) filters.status = statusFilter;

  const { data, totalPages, loading, refetch } = useAdminFetch<NewsArticle & { status?: string }>(
    "/api/news",
    { page, search, filters },
  );

  const columns: Column<NewsArticle & { status?: string }>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-medium text-text-primary">{row.title}</span>
          <p className="mt-0.5 text-xs text-text-muted line-clamp-1">{row.excerpt}</p>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (row) => <Badge variant="primary">{row.category}</Badge>,
    },
    {
      key: "author",
      label: "Author",
      render: (row) => <span className="text-text-secondary">{row.author}</span>,
    },
    {
      key: "date",
      label: "Date",
      render: (row) => <span className="text-text-secondary">{formatDate(row.date)}</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge
          status={(row.status as "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED") ?? "DRAFT"}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/news/${row.slug}/edit`}>
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
          <h1 className="text-2xl font-bold text-text-primary">News</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage news articles and announcements.
          </p>
        </div>
        <Link href="/admin/news/new">
          <Button>
            <Plus className="h-4 w-4" /> Add Article
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search news..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
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
          <DataTable
            columns={columns}
            data={data}
            rowKey={(row) => row.slug}
            onRowClick={(row) => router.push(`/admin/news/${row.slug}/edit`)}
            emptyMessage="No news articles found."
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
            await adminDelete(`/api/news/${deleteSlug}`);
            refetch();
          }
        }}
        title="Delete Article?"
        description="This will permanently remove this news article."
      />
    </div>
  );
}
