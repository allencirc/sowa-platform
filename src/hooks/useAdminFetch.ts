"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseAdminFetchOptions {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, string>;
  sortBy?: string;
  order?: "asc" | "desc";
}

export function useAdminFetch<T>(endpoint: string, options: UseAdminFetchOptions = {}) {
  const { page = 1, limit = 20, search, filters, sortBy, order } = options;
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize filters to avoid object reference changes triggering re-fetches
  const filtersKey = JSON.stringify(filters ?? {});
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchData = useCallback(async () => {
    const filters = filtersRef.current;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (sortBy) params.set("sortBy", sortBy);
      if (order) params.set("order", order);
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v) params.set(k, v);
        });
      }

      const res = await fetch(`${endpoint}?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

      const json: PaginatedResponse<T> = await res.json();
      setData(json.data);
      setTotal(json.pagination.total);
      setTotalPages(json.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, limit, search, sortBy, order, filtersKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, total, totalPages, loading, error, refetch: fetchData };
}

export async function adminDelete(endpoint: string): Promise<void> {
  const res = await fetch(endpoint, { method: "DELETE" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Delete failed: ${res.statusText}`);
  }
}

export async function adminPost<T>(endpoint: string, data: unknown): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Create failed: ${res.statusText}`);
  }
  return res.json();
}

export async function adminPatch<T>(endpoint: string, data: unknown): Promise<T> {
  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Update failed: ${res.statusText}`);
  }
  return res.json();
}
