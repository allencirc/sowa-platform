"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Trash2, Copy, Check, Search, Image as ImageIcon, Film, Music } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DeleteDialog } from "@/components/admin/DeleteDialog";
import { cn } from "@/lib/utils";

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  category?: "image" | "video" | "audio";
  variants?: Record<string, string>;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteFile, setDeleteFile] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const json = await res.json();
      setFiles(json.data ?? []);
    } catch {
      setError("Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Upload failed");
      }

      fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!deleteFile) return;
    const res = await fetch(`/api/media?filename=${encodeURIComponent(deleteFile)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
    fetchFiles();
  };

  const copyUrl = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  };

  const filtered = files.filter((f) => f.filename.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Media Library</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Upload and manage images, audio, and video for content.
          </p>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,audio/mpeg,audio/wav"
            onChange={handleUpload}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload Media"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-status-error/10 px-4 py-3 text-sm text-status-error">
          {error}
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center text-text-muted">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50">
          <ImageIcon className="h-12 w-12 text-text-muted" />
          <p className="text-sm text-text-muted">
            {files.length === 0 ? "No media uploaded yet." : "No files match your search."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((file) => (
            <div
              key={file.filename}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-surface-card shadow-sm"
            >
              <div className="relative aspect-square bg-gray-100">
                {file.category === "video" ? (
                  <div className="flex h-full w-full items-center justify-center bg-gray-900/5">
                    <Film className="h-12 w-12 text-text-muted" />
                  </div>
                ) : file.category === "audio" ? (
                  <div className="flex h-full w-full items-center justify-center bg-gray-900/5">
                    <Music className="h-12 w-12 text-text-muted" />
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={file.variants?.thumb ?? file.url}
                    alt={file.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/90 text-text-primary hover:bg-white"
                    onClick={() => copyUrl(file.url)}
                  >
                    {copied === file.url ? (
                      <Check className="h-4 w-4 text-secondary-dark" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/90 text-status-error hover:bg-white"
                    onClick={() => setDeleteFile(file.filename)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-text-primary">{file.filename}</p>
                <p className="text-xs text-text-muted">{formatFileSize(file.size)}</p>
                {file.variants && Object.keys(file.variants).length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {Object.entries(file.variants).map(([label, url]) => (
                      <button
                        key={label}
                        onClick={() => copyUrl(url)}
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                          copied === url
                            ? "bg-secondary/20 text-secondary-dark"
                            : "bg-gray-100 text-text-secondary hover:bg-accent/10 hover:text-accent-dark",
                        )}
                        title={`Copy ${label} URL`}
                      >
                        {copied === url ? "Copied!" : label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteDialog
        open={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={handleDelete}
        title="Delete File?"
        description="This will permanently remove this file. Any content referencing it will show a broken link."
      />
    </div>
  );
}
