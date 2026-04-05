/**
 * Third-party content integration types.
 *
 * These types define the contract for all external content adapters
 * (Eventbrite, careersportal.ie, Fetchcourses.ie, Qualifax.ie, bespoke
 * platforms, and future sources such as eTenders).
 *
 * The platform is deliberately systems-agnostic: each source is implemented
 * as an adapter that normalises external data into a shape that maps cleanly
 * onto our Prisma `Course` and `Event` models. Final scope for which sources
 * go live is confirmed in the post-award kick-off workshop, as per Appendix 1
 * paragraph 322 of the tender.
 */

/**
 * Identifies a third-party content source. Mirrors the `ContentSource`
 * enum in prisma/schema.prisma so adapter output can be upserted by
 * (source, externalId).
 */
export type SourceId =
  | "EVENTBRITE"
  | "CAREERSPORTAL"
  | "FETCHCOURSES"
  | "QUALIFAX"
  | "MANUAL";

/**
 * The content kinds an adapter may produce. Courses and events are the
 * primary targets of the tender's third-party integration requirement.
 */
export type NormalisedItemKind = "COURSE" | "EVENT";

/**
 * A normalised content item. Fields are intentionally a superset that can
 * be mapped onto either the `Course` or `Event` Prisma model depending on
 * `kind`. Adapters must return UTC ISO-8601 strings for any date fields.
 *
 * Upsert key: `(source, externalId)`.
 */
export interface NormalisedItem {
  /** Source system that produced this item. */
  source: SourceId;
  /** Stable identifier from the source system. Unique within the source. */
  externalId: string;
  /** Course or Event — determines which Prisma model we upsert into. */
  kind: NormalisedItemKind;
  /** Human-readable title. */
  title: string;
  /** Plain-text or HTML summary/description. */
  description: string;
  /** Canonical URL on the source system, for attribution and deep-linking. */
  url?: string;
  /** ISO-8601 start datetime (events) or next start date (courses). */
  startDate?: string;
  /** ISO-8601 end datetime (events only). */
  endDate?: string;
  /** Free-form location string. */
  location?: string;
  /** Provider / organiser name, e.g. "UCD Professional Academy". */
  provider?: string;
  /** Source-specific raw payload retained for audit/debug. */
  raw?: unknown;
}

/**
 * The contract every adapter must implement.
 *
 * Adapters are thin wrappers around a single source. They own:
 *   - auth (API key / OAuth token loaded from env vars, never hardcoded)
 *   - pagination
 *   - rate-limit compliance
 *   - mapping the source's native shape into `NormalisedItem`
 *
 * They do NOT own:
 *   - database writes (the sync worker upserts the returned items)
 *   - retry / circuit-breaker policy (the sync runner wraps `fetch()`)
 *   - scheduling (cron / admin-triggered sync)
 */
export interface ContentSourceAdapter {
  /** The source this adapter represents. */
  readonly source: SourceId;
  /** Human-readable name for logs and admin UI. */
  readonly name: string;
  /**
   * Fetch the current window of content from the source and return it
   * normalised. Must resolve (possibly to an empty array) rather than
   * throw on "no new content" — throw only on genuine errors.
   */
  fetch(): Promise<NormalisedItem[]>;
}
