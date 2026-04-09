import { describe, it, expect } from "vitest";
import { prismaMock } from "../mocks/prisma";
import { detectStaleContent, upsertAlerts } from "@/lib/freshness-check";

// Fixed reference date for deterministic tests: 2026-06-15
const NOW = new Date("2026-06-15T12:00:00Z");

describe("detectStaleContent", () => {
  it("flags courses with past nextStartDate as EXPIRED_DATE", async () => {
    prismaMock.course.findMany.mockResolvedValue([
      { id: "c1", slug: "wind-basics", title: "Wind Basics" } as never,
    ]);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.research.findMany.mockResolvedValue([]);
    prismaMock.newsArticle.findMany.mockResolvedValue([]);
    prismaMock.career.findMany.mockResolvedValue([]);

    const items = await detectStaleContent(NOW);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      contentType: "COURSE",
      contentId: "c1",
      slug: "wind-basics",
      alertType: "EXPIRED_DATE",
    });
  });

  it("flags events with past endDate as EXPIRED_DATE", async () => {
    prismaMock.course.findMany.mockResolvedValue([]);
    // First call: events with endDate < now
    prismaMock.event.findMany
      .mockResolvedValueOnce([
        { id: "e1", slug: "conf-2025", title: "OWE Conference 2025" } as never,
      ])
      // Second call: events with no endDate
      .mockResolvedValueOnce([]);
    prismaMock.research.findMany.mockResolvedValue([]);
    prismaMock.newsArticle.findMany.mockResolvedValue([]);
    prismaMock.career.findMany.mockResolvedValue([]);

    const items = await detectStaleContent(NOW);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      contentType: "EVENT",
      contentId: "e1",
      alertType: "EXPIRED_DATE",
    });
  });

  it("flags events with no endDate but past startDate", async () => {
    prismaMock.course.findMany.mockResolvedValue([]);
    prismaMock.event.findMany
      .mockResolvedValueOnce([]) // no events with endDate
      .mockResolvedValueOnce([{ id: "e2", slug: "webinar-old", title: "Old Webinar" } as never]); // events with no endDate, past startDate
    prismaMock.research.findMany.mockResolvedValue([]);
    prismaMock.newsArticle.findMany.mockResolvedValue([]);
    prismaMock.career.findMany.mockResolvedValue([]);

    const items = await detectStaleContent(NOW);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      contentType: "EVENT",
      contentId: "e2",
      alertType: "EXPIRED_DATE",
    });
  });

  it("deduplicates events that match both queries", async () => {
    const event = { id: "e3", slug: "dup-event", title: "Duplicate Event" } as never;
    prismaMock.course.findMany.mockResolvedValue([]);
    prismaMock.event.findMany
      .mockResolvedValueOnce([event]) // matched by endDate
      .mockResolvedValueOnce([event]); // also matched by startDate
    prismaMock.research.findMany.mockResolvedValue([]);
    prismaMock.newsArticle.findMany.mockResolvedValue([]);
    prismaMock.career.findMany.mockResolvedValue([]);

    const items = await detectStaleContent(NOW);

    // Should only appear once thanks to deduplication
    expect(items.filter((i) => i.contentType === "EVENT")).toHaveLength(1);
  });

  it("flags research older than 24 months as OUTDATED", async () => {
    prismaMock.course.findMany.mockResolvedValue([]);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.research.findMany.mockResolvedValue([
      { id: "r1", slug: "owe-study-2023", title: "OWE Study 2023" } as never,
    ]);
    prismaMock.newsArticle.findMany.mockResolvedValue([]);
    prismaMock.career.findMany.mockResolvedValue([]);

    const items = await detectStaleContent(NOW);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      contentType: "RESEARCH",
      alertType: "OUTDATED",
    });
  });

  it("flags news older than 12 months as STALE", async () => {
    prismaMock.course.findMany.mockResolvedValue([]);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.research.findMany.mockResolvedValue([]);
    prismaMock.newsArticle.findMany.mockResolvedValue([
      { id: "n1", slug: "old-news", title: "Old News Article" } as never,
    ]);
    prismaMock.career.findMany.mockResolvedValue([]);

    const items = await detectStaleContent(NOW);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      contentType: "NEWS",
      alertType: "STALE",
    });
  });

  it("flags careers not updated in 6+ months as STALE", async () => {
    prismaMock.course.findMany.mockResolvedValue([]);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.research.findMany.mockResolvedValue([]);
    prismaMock.newsArticle.findMany.mockResolvedValue([]);
    prismaMock.career.findMany.mockResolvedValue([
      { id: "ca1", slug: "wind-tech", title: "Wind Technician" } as never,
    ]);

    const items = await detectStaleContent(NOW);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      contentType: "CAREER",
      alertType: "STALE",
    });
  });

  it("returns empty array when no stale content exists", async () => {
    prismaMock.course.findMany.mockResolvedValue([]);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.research.findMany.mockResolvedValue([]);
    prismaMock.newsArticle.findMany.mockResolvedValue([]);
    prismaMock.career.findMany.mockResolvedValue([]);

    const items = await detectStaleContent(NOW);

    expect(items).toHaveLength(0);
  });

  it("uses injectable now parameter for deterministic date thresholds", async () => {
    prismaMock.course.findMany.mockResolvedValue([]);
    prismaMock.event.findMany.mockResolvedValue([]);
    prismaMock.research.findMany.mockResolvedValue([]);
    prismaMock.newsArticle.findMany.mockResolvedValue([]);
    prismaMock.career.findMany.mockResolvedValue([]);

    await detectStaleContent(NOW);

    // Date constructor normalises to local midnight, so just verify the date portion
    const careerCall = prismaMock.career.findMany.mock.calls[0][0];
    const careerThreshold = (careerCall?.where?.updatedAt as { lt: Date }).lt;
    expect(careerThreshold.getFullYear()).toBe(2025);
    expect(careerThreshold.getMonth()).toBe(11); // December (0-indexed)
    expect(careerThreshold.getDate()).toBe(15);

    const newsCall = prismaMock.newsArticle.findMany.mock.calls[0][0];
    const newsThreshold = (newsCall?.where?.date as { lt: Date }).lt;
    expect(newsThreshold.getFullYear()).toBe(2025);
    expect(newsThreshold.getMonth()).toBe(5); // June
    expect(newsThreshold.getDate()).toBe(15);

    const researchCall = prismaMock.research.findMany.mock.calls[0][0];
    const researchThreshold = (researchCall?.where?.publicationDate as { lt: Date }).lt;
    expect(researchThreshold.getFullYear()).toBe(2024);
    expect(researchThreshold.getMonth()).toBe(5); // June
    expect(researchThreshold.getDate()).toBe(15);
  });

  it("combines results from all content types", async () => {
    prismaMock.course.findMany.mockResolvedValue([
      { id: "c1", slug: "c-slug", title: "Course" } as never,
    ]);
    prismaMock.event.findMany
      .mockResolvedValueOnce([{ id: "e1", slug: "e-slug", title: "Event" } as never])
      .mockResolvedValueOnce([]);
    prismaMock.research.findMany.mockResolvedValue([
      { id: "r1", slug: "r-slug", title: "Research" } as never,
    ]);
    prismaMock.newsArticle.findMany.mockResolvedValue([
      { id: "n1", slug: "n-slug", title: "News" } as never,
    ]);
    prismaMock.career.findMany.mockResolvedValue([
      { id: "ca1", slug: "ca-slug", title: "Career" } as never,
    ]);

    const items = await detectStaleContent(NOW);

    expect(items).toHaveLength(5);
    const types = items.map((i) => i.contentType).sort();
    expect(types).toEqual(["CAREER", "COURSE", "EVENT", "NEWS", "RESEARCH"]);
  });
});

describe("upsertAlerts", () => {
  const makeItem = (overrides = {}) => ({
    contentType: "COURSE" as const,
    contentId: "c1",
    slug: "wind-basics",
    title: "Wind Basics",
    alertType: "EXPIRED_DATE" as const,
    detectedAt: NOW,
    ...overrides,
  });

  it("creates new alerts for previously unseen content", async () => {
    prismaMock.freshnessAlert.findUnique.mockResolvedValue(null);
    prismaMock.freshnessAlert.create.mockResolvedValue({} as never);

    const result = await upsertAlerts([makeItem()]);

    expect(result.created).toBe(1);
    expect(result.existing).toBe(0);
    expect(result.reopened).toBe(0);
    expect(prismaMock.freshnessAlert.create).toHaveBeenCalledOnce();
  });

  it("skips existing unresolved alerts", async () => {
    prismaMock.freshnessAlert.findUnique.mockResolvedValue({
      id: "alert1",
      resolvedAt: null,
    } as never);

    const result = await upsertAlerts([makeItem()]);

    expect(result.created).toBe(0);
    expect(result.existing).toBe(1);
    expect(result.reopened).toBe(0);
    expect(prismaMock.freshnessAlert.create).not.toHaveBeenCalled();
    expect(prismaMock.freshnessAlert.update).not.toHaveBeenCalled();
  });

  it("re-opens previously resolved alerts when re-detected", async () => {
    prismaMock.freshnessAlert.findUnique.mockResolvedValue({
      id: "alert1",
      resolvedAt: new Date("2026-05-01"),
      resolvedById: "user1",
    } as never);
    prismaMock.freshnessAlert.update.mockResolvedValue({} as never);

    const result = await upsertAlerts([makeItem()]);

    expect(result.created).toBe(0);
    expect(result.existing).toBe(0);
    expect(result.reopened).toBe(1);
    expect(prismaMock.freshnessAlert.update).toHaveBeenCalledWith({
      where: { id: "alert1" },
      data: { detectedAt: NOW, resolvedAt: null, resolvedById: null },
    });
  });
});
