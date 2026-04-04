"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, ChevronDown, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  allowCreate?: boolean;
  onCreateOption?: (value: string) => void;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  error,
  allowCreate,
  onCreateOption,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.value.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const remove = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const selectedLabels = value.map(
    (v) => options.find((o) => o.value === v)?.label ?? v
  );

  const showCreate =
    allowCreate &&
    search.trim() &&
    !options.some((o) => o.value === search.trim() || o.label.toLowerCase() === search.toLowerCase());

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 transition-colors cursor-pointer",
          open && "border-accent ring-2 ring-accent/20",
          error && "border-status-error"
        )}
        onClick={() => setOpen(true)}
      >
        {selectedLabels.map((label, i) => (
          <span
            key={value[i]}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {label}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(value[i]);
              }}
              className="hover:text-primary-dark"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-sm text-text-muted">{placeholder}</span>
        )}
        <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-text-muted" />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 && !showCreate && (
              <p className="px-3 py-2 text-sm text-text-muted">No options found.</p>
            )}
            {filtered.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                    selected
                      ? "bg-primary/5 text-primary"
                      : "text-text-primary hover:bg-gray-50"
                  )}
                  onClick={() => toggle(opt.value)}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      selected
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300"
                    )}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  {opt.label}
                </button>
              );
            })}
            {showCreate && (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-secondary hover:bg-secondary/5"
                onClick={() => {
                  onCreateOption?.(search.trim());
                  setSearch("");
                }}
              >
                + Create &ldquo;{search.trim()}&rdquo;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
