"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Archive } from "lucide-react";

interface ResolveButtonProps {
  alertId: string;
}

export function ResolveButton({ alertId }: ResolveButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  async function resolve(action: "resolve" | "resolve_and_archive") {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/freshness-alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setLoading(false);
      setShowOptions(false);
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" disabled={loading} onClick={() => resolve("resolve")}>
          <CheckCircle className="h-3.5 w-3.5" />
          {loading ? "..." : "Resolve"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => setShowOptions(!showOptions)}
          className="px-1.5"
        >
          <span className="text-xs">▾</span>
        </Button>
      </div>
      {showOptions && (
        <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-md">
          <button
            onClick={() => resolve("resolve_and_archive")}
            disabled={loading}
            className="flex w-full items-center gap-2 whitespace-nowrap px-4 py-2 text-left text-sm text-text-secondary hover:bg-gray-50"
          >
            <Archive className="h-3.5 w-3.5" />
            Resolve & Archive
          </button>
        </div>
      )}
    </div>
  );
}
