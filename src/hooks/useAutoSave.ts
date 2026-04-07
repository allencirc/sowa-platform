"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { adminPost, adminPatch } from "@/hooks/useAdminFetch";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  contentType: "careers" | "courses" | "events" | "news" | "research";
  slug: string | null;
  mode: "create" | "edit";
  getValues: () => Record<string, unknown>;
  isDirty: boolean;
  debounceMs?: number;
  onCreated?: (slug: string) => void;
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;
  saveDraft: () => Promise<void>;
  error: string | null;
}

/**
 * Recursively clean form values for safe JSON serialisation:
 * - Converts NaN → undefined (so JSON.stringify drops the key)
 * - Removes objects that become empty after cleaning (e.g. salaryRange with two NaN fields)
 */
function cleanValues(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "number" && Number.isNaN(value)) continue;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      const cleaned = cleanValues(value as Record<string, unknown>);
      if (Object.keys(cleaned).length > 0) result[key] = cleaned;
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function useAutoSave({
  contentType,
  slug,
  mode,
  getValues,
  isDirty,
  debounceMs = 30_000,
  onCreated,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const createdSlugRef = useRef<string | null>(slug);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const savingRef = useRef(false);
  const onCreatedRef = useRef(onCreated);
  onCreatedRef.current = onCreated;

  // Track when slug prop changes (e.g. after URL replace in edit mode)
  useEffect(() => {
    if (slug) createdSlugRef.current = slug;
  }, [slug]);

  const saveDraft = useCallback(async () => {
    const values = cleanValues(getValues());
    const titleVal = values.title;
    const slugVal = values.slug;

    // Need at least a title and slug to save
    if (!titleVal || !slugVal) return;
    if (savingRef.current) return;

    // Abort any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    savingRef.current = true;
    setSaveStatus("saving");
    setError(null);

    try {
      const currentSlug = createdSlugRef.current;
      const isFirstCreate = mode === "create" && !currentSlug;
      const endpoint = `/api/${contentType}`;

      if (isFirstCreate) {
        const result = await adminPost<{ slug: string }>(`${endpoint}?draft=true`, values);
        createdSlugRef.current = result.slug;
        onCreatedRef.current?.(result.slug);
      } else {
        await adminPatch(`${endpoint}/${currentSlug}`, values);
      }

      setSaveStatus("saved");
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
    } catch (err) {
      // Ignore aborted requests
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSaveStatus("error");
      setError(err instanceof Error ? err.message : "Auto-save failed");
    } finally {
      savingRef.current = false;
    }
  }, [getValues, mode, contentType]);

  // Track dirty state changes and debounce auto-save
  useEffect(() => {
    if (isDirty) {
      setHasUnsavedChanges(true);

      // Reset debounce timer
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        saveDraft();
      }, debounceMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, debounceMs, saveDraft]);

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { saveStatus, lastSavedAt, hasUnsavedChanges, saveDraft, error };
}
