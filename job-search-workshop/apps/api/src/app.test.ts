import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createApp } from "./app.js";
import { JobFinderRepository } from "./database.js";

describe("job finder API", () => {
  let repository: JobFinderRepository;

  beforeEach(() => {
    repository = new JobFinderRepository(":memory:");
  });

  afterEach(() => {
    repository.close();
  });

  it("reports health and exposes disabled candidate sources", async () => {
    const app = createApp(repository);

    await request(app).get("/api/health").expect(200, { status: "ok" });
    const response = await request(app).get("/api/sources").expect(200);

    expect(response.body.sources).toHaveLength(8);
    expect(
      response.body.sources.every(
        (source: { enabled: boolean }) => !source.enabled,
      ),
    ).toBe(true);
  });

  it("starts a background collection run", async () => {
    const app = createApp(repository);

    const startResponse = await request(app)
      .post("/api/collection-runs")
      .expect(202);
    expect(startResponse.body.run.status).toBe("running");

    await new Promise((resolve) => setImmediate(resolve));
    const latestResponse = await request(app)
      .get("/api/collection-runs/latest")
      .expect(200);

    expect(latestResponse.body.run).toMatchObject({
      status: "completed",
      sourceCount: 8,
      skippedCount: 8,
    });
  });

  it("returns an empty listing collection before a source is enabled", async () => {
    const app = createApp(repository);

    await request(app).get("/api/listings?search=engineer").expect(200, {
      listings: [],
    });
  });

  it("keeps a watched listing after a successful source omits it", async () => {
    const listing = {
      id: "xero-123",
      sourceId: "xero",
      companyName: "Xero",
      title: "Software Engineer",
      location: "Wellington",
      summary: null,
      postedAt: null,
      sourceUrl: "https://example.com/jobs/xero-123",
      firstSeenAt: "2026-09-01T00:00:00.000Z",
      lastSeenAt: "2026-09-01T00:00:00.000Z",
      status: "active" as const,
      watchlisted: false,
    };
    repository.upsertListings([listing]);
    const app = createApp(repository);

    await request(app).post("/api/watchlist/xero-123").expect(200);
    await request(app).post("/api/watchlist/xero-123").expect(200);
    repository.markListingsUnavailable("xero", []);

    const response = await request(app)
      .get("/api/listings?watchlisted=true")
      .expect(200);

    expect(response.body.listings).toEqual([
      expect.objectContaining({
        id: "xero-123",
        status: "unavailable",
        watchlisted: true,
      }),
    ]);

    await request(app).delete("/api/watchlist/xero-123").expect(204);
    await request(app).delete("/api/watchlist/xero-123").expect(204);
    await request(app).get("/api/listings?watchlisted=true").expect(200, {
      listings: [],
    });
  });

  it("combines watchlist and search filters", async () => {
    repository.upsertListings([
      {
        id: "saved",
        sourceId: "xero",
        companyName: "Xero",
        title: "Software Engineer",
        location: null,
        summary: null,
        postedAt: null,
        sourceUrl: "https://example.com/saved",
        firstSeenAt: "2026-09-01T00:00:00.000Z",
        lastSeenAt: "2026-09-01T00:00:00.000Z",
        status: "active",
        watchlisted: false,
      },
      {
        id: "other",
        sourceId: "xero",
        companyName: "Xero",
        title: "Product Manager",
        location: null,
        summary: null,
        postedAt: null,
        sourceUrl: "https://example.com/other",
        firstSeenAt: "2026-09-01T00:00:00.000Z",
        lastSeenAt: "2026-09-01T00:00:00.000Z",
        status: "active",
        watchlisted: false,
      },
    ]);
    repository.addToWatchlist("saved");

    const response = await request(createApp(repository))
      .get("/api/listings?watchlisted=true&search=engineer")
      .expect(200);

    expect(
      response.body.listings.map((item: { id: string }) => item.id),
    ).toEqual(["saved"]);
  });
});
