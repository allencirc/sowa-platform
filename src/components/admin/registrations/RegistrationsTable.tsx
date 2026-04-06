"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Registration {
  id: string;
  type: "EVENT" | "COURSE";
  contentId: string;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  role: string | null;
  dietaryRequirements: string | null;
  additionalNotes: string | null;
  gdprConsent: boolean;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}

interface RegistrationsTableProps {
  initialData: Registration[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
}

const statusColors: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "error",
};

const typeOptions = [
  { label: "All Types", value: "" },
  { label: "Event", value: "EVENT" },
  { label: "Course", value: "COURSE" },
];

const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const statusUpdateOptions = [
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function RegistrationsTable({
  initialData,
  initialTotal,
  initialPage,
  initialLimit,
}: RegistrationsTableProps) {
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = initialLimit;
  const totalPages = Math.ceil(total / limit);

  const fetchData = async (
    newPage: number,
    newSearch?: string,
    newType?: string,
    newStatus?: string,
  ) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    params.set("limit", String(limit));
    if (newSearch ?? search) params.set("search", newSearch ?? search);
    if (newType ?? typeFilter) params.set("type", newType ?? typeFilter);
    if (newStatus ?? statusFilter) params.set("status", newStatus ?? statusFilter);

    try {
      const res = await fetch(`/api/admin/registrations?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
        setTotal(json.pagination.total);
        setPage(json.pagination.page);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchData(1, value, typeFilter, statusFilter);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    fetchData(1, search, value, statusFilter);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchData(1, search, typeFilter, value);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setData((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, status: newStatus as Registration["status"] } : r,
          ),
        );
      }
    } catch {
      // silently fail — user will see no change
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);
    window.open(`/api/admin/registrations/export?${params}`, "_blank");
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by name, email, or organisation..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
          </div>
        </div>
        <Select
          id="filter-type"
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => handleTypeChange(e.target.value)}
        />
        <Select
          id="filter-status"
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
        />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Results count */}
      <p className="mb-3 text-sm text-text-secondary">
        {total} registration{total !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-surface">
            <tr>
              <th className="px-4 py-3 font-semibold text-text-primary">Name</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Email</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Type</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Content</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Organisation</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Status</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                  No registrations found.
                </td>
              </tr>
            ) : (
              data.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-text-primary">{reg.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{reg.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={reg.type === "EVENT" ? "accent" : "secondary"}>
                      {reg.type === "EVENT" ? "Event" : "Course"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">
                    {reg.contentId}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{reg.organisation || "—"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={reg.status}
                      onChange={(e) => handleStatusUpdate(reg.id, e.target.value)}
                      className={`rounded-md border px-2 py-1 text-xs font-medium ${
                        reg.status === "CONFIRMED"
                          ? "border-secondary/30 bg-secondary/10 text-secondary-dark"
                          : reg.status === "CANCELLED"
                            ? "border-status-error/30 bg-status-error/10 text-status-error"
                            : "border-status-warning/30 bg-status-warning/10 text-status-warning"
                      }`}
                    >
                      {statusUpdateOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                    {formatDate(reg.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => fetchData(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => fetchData(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
