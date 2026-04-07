"use client";

import { useState, useEffect } from "react";

let cachedResult: boolean | null = null;

export function useAIEnabled(): { aiAvailable: boolean; loading: boolean } {
  const [aiAvailable, setAiAvailable] = useState(cachedResult ?? false);
  const [loading, setLoading] = useState(cachedResult === null);

  useEffect(() => {
    if (cachedResult !== null) return;

    fetch("/api/admin/ai-status")
      .then((r) => r.json())
      .then((data: { available: boolean }) => {
        cachedResult = data.available;
        setAiAvailable(data.available);
      })
      .catch(() => {
        cachedResult = false;
        setAiAvailable(false);
      })
      .finally(() => setLoading(false));
  }, []);

  return { aiAvailable, loading };
}
