import type { ContentSourceAdapter, SourceId } from "./types";
import { eventbriteAdapter } from "./eventbrite";

/**
 * Registry of all third-party content source adapters, keyed by `SourceId`.
 *
 * The registry is the single entry point for any sync worker, admin tool,
 * or scheduled job that wants to pull external content. Sources named in
 * the tender (Eventbrite, careersportal.ie, Fetchcourses.ie, Qualifax.ie)
 * are present as stubs so the architectural capability is visible; live
 * implementations are activated per-source once scope is confirmed in the
 * post-award kick-off workshop.
 *
 * Adding a new source:
 *   1. Implement `ContentSourceAdapter` in a new file next to this one.
 *   2. Add the id to `SourceId` in `types.ts` and to the Prisma
 *      `ContentSource` enum (requires a migration).
 *   3. Register the adapter instance here.
 *   4. Add a vitest case in `__tests__/lib/integrations.test.ts`.
 *
 * `MANUAL` is the default for content created directly in the admin UI;
 * it has no adapter because it has no external source to pull from.
 */
export const adapters: Partial<Record<SourceId, ContentSourceAdapter>> = {
  EVENTBRITE: eventbriteAdapter,
  // CAREERSPORTAL: careersPortalAdapter,  // stub pending workshop scope
  // FETCHCOURSES:  fetchCoursesAdapter,   // stub pending workshop scope
  // QUALIFAX:      qualifaxAdapter,       // stub pending workshop scope
};

/** Look up an adapter by source id. Returns `undefined` for `MANUAL`. */
export function getAdapter(source: SourceId): ContentSourceAdapter | undefined {
  return adapters[source];
}

/** List all registered adapters. Stable order for logging and admin UI. */
export function listAdapters(): ContentSourceAdapter[] {
  return Object.values(adapters).filter(
    (a): a is ContentSourceAdapter => a !== undefined,
  );
}
