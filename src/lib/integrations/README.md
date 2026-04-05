# Third-Party Content Integrations

This directory contains the adapter layer that lets the SOWA platform pull
content (courses, events) from third-party systems without coupling the
domain model to any one source. It implements the approach described in
`docs/architecture.md` § Third-Party Content Integrations and answers the
requirement in Appendix 1, paragraphs 313–323 of the tender.

## Named sources

The tender explicitly names these sources as candidates for integration:

| Source             | Kind   | Status   |
| ------------------ | ------ | -------- |
| Eventbrite         | EVENT  | stub     |
| careersportal.ie   | COURSE | reserved |
| Fetchcourses.ie    | COURSE | reserved |
| Qualifax.ie        | COURSE | reserved |
| Bespoke platforms  | either | reserved |
| `MANUAL`           | either | live     |

"Stub" means the adapter exists and implements the interface but returns
an empty array. "Reserved" means the `SourceId` is allocated but no adapter
file has been added yet. Final scope is confirmed in the post-award
kick-off workshop (Appendix 1 § 322).

## The adapter pattern

Every source is a `ContentSourceAdapter`:

```ts
interface ContentSourceAdapter {
  readonly source: SourceId;
  readonly name: string;
  fetch(): Promise<NormalisedItem[]>;
}
```

Adapters own: auth, pagination, rate-limit compliance, and mapping the
source's native shape into `NormalisedItem`. They do **not** own: database
writes, retry / circuit-breaker policy, or scheduling — those live in the
sync runner that consumes the registry.

`NormalisedItem` is a superset shape that maps cleanly onto either the
`Course` or `Event` Prisma model, depending on `kind`. The upsert key is
`(source, externalId)`; the `source` and `externalId` columns on `courses`
and `events` exist precisely so this upsert is safe and idempotent.

## Adding a new source

1. Create a new file in this directory, e.g. `fetchcourses.ts`, exporting a
   `ContentSourceAdapter` instance.
2. Add the id to the `SourceId` union in `types.ts` **and** to the
   `ContentSource` enum in `prisma/schema.prisma` (this needs a migration).
3. Register the adapter in `registry.ts`.
4. Add a vitest case in `src/__tests__/lib/integrations.test.ts` asserting
   the adapter implements the interface and, if stubbed, returns `[]`
   without throwing.
5. Document auth, rate limits, and pagination behaviour in a comment at
   the top of the adapter file.

## Auth and secrets

Credentials are loaded from environment variables only. They are never
hardcoded, never committed, and never logged. In production they live in
the hosting provider's secret store (e.g. Vercel Environment Variables,
AWS Secrets Manager). Outbound calls are restricted to an allowlist of
documented source endpoints.

## Error handling

The sync runner (not this directory) wraps each `fetch()` call with:

- Retry with exponential backoff (3 attempts, jittered) for transient
  5xx and network errors.
- A per-source circuit breaker that trips after sustained failure and
  auto-resets after a cool-down.
- Structured logging of request id, status, item counts, and duration.
- Admin alerting (email + ops channel) on circuit trip or repeated failure.

Adapters themselves should throw on genuine errors and resolve (possibly
to `[]`) on "no new content".
