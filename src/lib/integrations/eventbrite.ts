import type { ContentSourceAdapter, NormalisedItem } from "./types";

/**
 * Eventbrite adapter — STUB.
 *
 * This adapter implements the `ContentSourceAdapter` contract so the
 * integration surface exists in code and in types, but it does not yet
 * make any live HTTP calls. Final scope (including whether Eventbrite is
 * turned on at launch) is confirmed in the post-award kick-off workshop,
 * per Appendix 1 paragraph 322 of the tender.
 *
 * When activated, `fetch()` will:
 *   1. Read the API token from `process.env.EVENTBRITE_API_TOKEN`
 *      (never hardcoded; managed via the hosting provider's secret store).
 *   2. Call `GET https://www.eventbriteapi.com/v3/organizations/{ORG_ID}/events/`
 *      with header `Authorization: Bearer <token>` and query params for
 *      `status=live`, `order_by=start_asc`, and a page cursor.
 *   3. Follow `pagination.continuation` until exhausted, respecting the
 *      documented Eventbrite rate limit (1000 requests/hour/token).
 *   4. Map each event to a `NormalisedItem` with `kind: "EVENT"`,
 *      `externalId: event.id`, ISO start/end strings, and the canonical
 *      event URL.
 *   5. Return the full list; the sync runner handles upsert-by
 *      (source, externalId), retry with exponential backoff on transient
 *      failures, and circuit-breaker tripping on sustained errors.
 *
 * Until activated, it returns an empty array. This keeps the registry and
 * any downstream sync job safely no-op.
 */
export const eventbriteAdapter: ContentSourceAdapter = {
  source: "EVENTBRITE",
  name: "Eventbrite",
  async fetch(): Promise<NormalisedItem[]> {
    // TODO(integration): live Eventbrite implementation.
    //
    // const token = process.env.EVENTBRITE_API_TOKEN;
    // const orgId = process.env.EVENTBRITE_ORG_ID;
    // if (!token || !orgId) {
    //   throw new Error("Eventbrite credentials not configured");
    // }
    //
    // const items: NormalisedItem[] = [];
    // let continuation: string | undefined;
    // do {
    //   const url = new URL(
    //     `https://www.eventbriteapi.com/v3/organizations/${orgId}/events/`,
    //   );
    //   url.searchParams.set("status", "live");
    //   url.searchParams.set("order_by", "start_asc");
    //   if (continuation) url.searchParams.set("continuation", continuation);
    //
    //   const res = await fetch(url, {
    //     headers: { Authorization: `Bearer ${token}` },
    //   });
    //   if (!res.ok) {
    //     throw new Error(`Eventbrite ${res.status}: ${await res.text()}`);
    //   }
    //   const body = await res.json();
    //   for (const ev of body.events ?? []) {
    //     items.push({
    //       source: "EVENTBRITE",
    //       externalId: ev.id,
    //       kind: "EVENT",
    //       title: ev.name?.text ?? "",
    //       description: ev.description?.text ?? "",
    //       url: ev.url,
    //       startDate: ev.start?.utc,
    //       endDate: ev.end?.utc,
    //       location: ev.venue?.address?.localized_address_display,
    //       raw: ev,
    //     });
    //   }
    //   continuation = body.pagination?.has_more_items
    //     ? body.pagination.continuation
    //     : undefined;
    // } while (continuation);
    //
    // return items;

    return [];
  },
};
