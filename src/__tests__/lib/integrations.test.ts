import { describe, it, expect } from "vitest";
import { listAdapters, getAdapter } from "@/lib/integrations/registry";
import type { ContentSourceAdapter } from "@/lib/integrations/types";

function isAdapter(value: unknown): value is ContentSourceAdapter {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.source === "string" &&
    typeof a.name === "string" &&
    typeof a.fetch === "function"
  );
}

describe("third-party content integration registry", () => {
  it("every registered adapter implements ContentSourceAdapter", () => {
    const adapters = listAdapters();
    expect(adapters.length).toBeGreaterThan(0);
    for (const adapter of adapters) {
      expect(isAdapter(adapter)).toBe(true);
    }
  });

  it("Eventbrite stub is registered and returns an empty array without throwing", async () => {
    const adapter = getAdapter("EVENTBRITE");
    expect(adapter).toBeDefined();
    expect(adapter?.source).toBe("EVENTBRITE");

    const items = await adapter!.fetch();
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(0);
  });
});
