"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface RowResult {
  row: number;
  status: "valid" | "invalid";
  slug?: string;
  title?: string;
  errors?: { path: string; message: string }[];
}

interface ImportResponse {
  dryRun: boolean;
  totalRows: number;
  validCount: number;
  invalidCount: number;
  createdCount: number;
  rows: RowResult[];
  errors: { row: number; path: string; message: string }[];
}

interface Props {
  onImported?: () => void;
}

export function CourseImportDropzone({ onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setConfirmed(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const upload = useCallback(
    async (f: File, dryRun: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const body = new FormData();
        body.append("file", f);
        body.append("dryRun", dryRun ? "true" : "false");
        const res = await fetch("/api/admin/courses/import", {
          method: "POST",
          body,
        });
        const json = await res.json();
        if (!res.ok) {
          setError(json.error ?? "Import failed");
          setPreview(null);
          return;
        }
        setPreview(json as ImportResponse);
        if (!dryRun) {
          setConfirmed(true);
          onImported?.();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed");
      } finally {
        setLoading(false);
      }
    },
    [onImported],
  );

  const handleFile = (f: File) => {
    const lower = f.name.toLowerCase();
    if (!lower.endsWith(".csv") && !lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
      setError("Please upload a .csv or .xlsx file");
      return;
    }
    setFile(f);
    setPreview(null);
    setError(null);
    setConfirmed(false);
    void upload(f, true); // dry run on drop
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div className="rounded-lg border border-surface-card bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Batch import courses</h2>
          <p className="text-xs text-text-secondary">
            Upload a .csv or .xlsx file. Use <code className="rounded bg-surface px-1">|</code> to
            separate skill, career and tag values. Dry run runs automatically on upload.
          </p>
        </div>
        {(file || preview) && (
          <Button variant="ghost" size="sm" onClick={reset} disabled={loading}>
            Clear
          </Button>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-8 text-center transition-colors",
          dragOver ? "border-accent bg-accent/5" : "border-text-muted/30 hover:border-accent/60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={onChange}
        />
        {file ? (
          <>
            <FileSpreadsheet className="h-8 w-8 text-accent" />
            <p className="text-sm font-medium text-text-primary">{file.name}</p>
            <p className="text-xs text-text-secondary">{(file.size / 1024).toFixed(1)} KB</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-text-muted" />
            <p className="text-sm text-text-secondary">Drop file here or click to browse</p>
            <p className="text-xs text-text-muted">CSV or XLSX · max 5 MB</p>
          </>
        )}
      </div>

      {loading && <p className="mt-3 text-sm text-text-secondary">Processing file…</p>}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-md bg-status-error/10 px-3 py-2 text-sm text-status-error">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {preview && (
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Total rows" value={preview.totalRows} />
            <Stat label="Valid" value={preview.validCount} tone="success" />
            <Stat
              label="Invalid"
              value={preview.invalidCount}
              tone={preview.invalidCount > 0 ? "error" : "muted"}
            />
          </div>

          {preview.rows.length > 0 && (
            <div className="max-h-80 overflow-auto rounded-md border border-text-muted/20">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-surface">
                  <tr>
                    <th className="px-2 py-1.5">#</th>
                    <th className="px-2 py-1.5">Status</th>
                    <th className="px-2 py-1.5">Slug</th>
                    <th className="px-2 py-1.5">Title</th>
                    <th className="px-2 py-1.5">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((r) => (
                    <tr key={r.row} className="border-t border-text-muted/10">
                      <td className="px-2 py-1.5 align-top text-text-muted">{r.row}</td>
                      <td className="px-2 py-1.5 align-top">
                        {r.status === "valid" ? (
                          <span className="inline-flex items-center gap-1 text-status-success">
                            <CheckCircle2 className="h-3.5 w-3.5" /> valid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-status-error">
                            <XCircle className="h-3.5 w-3.5" /> invalid
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5 align-top font-mono text-[11px] text-text-secondary">
                        {r.slug ?? "—"}
                      </td>
                      <td className="px-2 py-1.5 align-top text-text-primary">{r.title ?? "—"}</td>
                      <td className="px-2 py-1.5 align-top text-status-error">
                        {r.errors?.length
                          ? r.errors.map((e, i) => (
                              <div key={i}>
                                <span className="font-mono">{e.path}</span>: {e.message}
                              </div>
                            ))
                          : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!confirmed && file && preview.validCount > 0 && (
            <div className="flex items-center justify-end gap-2">
              <p className="mr-auto text-xs text-text-secondary">
                {preview.invalidCount > 0
                  ? `Importing will create ${preview.validCount} valid row${preview.validCount === 1 ? "" : "s"} and skip ${preview.invalidCount} invalid.`
                  : `Ready to import ${preview.validCount} row${preview.validCount === 1 ? "" : "s"}.`}
              </p>
              <Button onClick={() => file && upload(file, false)} disabled={loading}>
                Confirm import
              </Button>
            </div>
          )}

          {confirmed && (
            <div className="flex items-center gap-2 rounded-md bg-status-success/10 px-3 py-2 text-sm text-status-success">
              <CheckCircle2 className="h-4 w-4" />
              Imported {preview.createdCount} course{preview.createdCount === 1 ? "" : "s"}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "error" | "muted";
}) {
  const toneCls =
    tone === "success"
      ? "text-status-success"
      : tone === "error"
        ? "text-status-error"
        : tone === "muted"
          ? "text-text-muted"
          : "text-text-primary";
  return (
    <div className="rounded-md border border-text-muted/20 bg-surface px-3 py-2">
      <div className={cn("text-xl font-semibold", toneCls)}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-text-muted">{label}</div>
    </div>
  );
}
