import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchClient } from "./SearchClient";

export const metadata: Metadata = {
  title: "Search — SOWA",
  description: "Search across careers, courses, events, research, and news.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="py-32 text-center text-text-muted">Loading search…</div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
