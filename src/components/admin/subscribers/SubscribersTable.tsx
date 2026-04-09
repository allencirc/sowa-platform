"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Search, Download, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  topics: string[];
  frequency: "WEEKLY" | "MONTHLY";
  verified: boolean;
  gdprConsent: boolean;
  createdAt: string;
}

interface SubscribersTableProps {
  initialData: Subscriber[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
}

const topicOptions = [
  { label: "All Topics", value: "" },
  { label: "Careers", value: "CAREERS" },
  { label: "Training", value: "TRAINING" },
  { label: "Events", value: "EVENTS" },
  { label: "Research", value: "RESEARCH" },
  { label: "News", value: "NEWS" },
  { label: "Diagnostic", value: "DIAGNOSTIC" },
];

const verifiedOptions = [
  { label: "All", value: "" },
  { label: "Verified", value: "true" },
  { label: "Unverified", value: "false" },
];

export function SubscribersTable({
  initialData,
  initialTotal,
  initialPage,
  initialLimit,
}: SubscribersTableProps) {
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = initialLimit;
  const totalPages = Math.ceil(total / limit);

  const fetchData = async (
    newPage: number,
    newSearch?: string,
    newTopic?: string,
    newVerified?: string,
  ) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(newPage));
    params.set("limit", String(limit));
    const s = newSearch ?? search;
    const t = newTopic ?? topicFilter;
    const v = newVerified ?? verifiedFilter;
    if (s) params.set("search", s);
    if (t) params.set("topic", t);
    if (v) params.set("verified", v);

    try {
      const res = await fetch(`/api/admin/subscribers?${params}`);
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
    fetchData(1, value, topicFilter, verifiedFilter);
  };

  const handleTopicChange = (value: string) => {
    setTopicFilter(value);
    fetchData(1, search, value, verifiedFilter);
  };

  const handleVerifiedChange = (value: string) => {
    setVerifiedFilter(value);
    fetchData(1, search, topicFilter, value);
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (topicFilter) params.set("topic", topicFilter);
    if (verifiedFilter) params.set("verified", verifiedFilter);
    if (search) params.set("search", search);
    window.open(`/api/admin/subscribers/export?${params}`, "_blank");
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
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
          </div>
        </div>
        <Select
          id="filter-topic"
          options={topicOptions}
          value={topicFilter}
          onChange={(e) => handleTopicChange(e.target.value)}
        />
        <Select
          id="filter-verified"
          options={verifiedOptions}
          value={verifiedFilter}
          onChange={(e) => handleVerifiedChange(e.target.value)}
        />
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Results count */}
      <p className="mb-3 text-sm text-text-secondary">
        {total} subscriber{total !== 1 ? "s" : ""} found
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-surface">
            <tr>
              <th className="px-4 py-3 font-semibold text-text-primary">Email</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Name</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Topics</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Frequency</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Verified</th>
              <th className="px-4 py-3 font-semibold text-text-primary">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                  No subscribers found.
                </td>
              </tr>
            ) : (
              data.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-text-primary">{sub.email}</td>
                  <td className="px-4 py-3 text-text-secondary">{sub.name || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {sub.topics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic.charAt(0) + topic.slice(1).toLowerCase()}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={sub.frequency === "WEEKLY" ? "accent" : "default"}>
                      {sub.frequency === "WEEKLY" ? "Weekly" : "Monthly"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {sub.verified ? (
                      <CheckCircle className="h-5 w-5 text-secondary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-text-muted" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted whitespace-nowrap">
                    {formatDate(sub.createdAt)}
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
