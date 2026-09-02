import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "./App";

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

describe("App", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows source status and the empty listing state", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          sources: [
            {
              id: "xero",
              name: "Xero",
              careersUrl: "https://careers.xero.com/jobs/",
              endpointUrl: null,
              sourceType: "unverified",
              enabled: false,
              policyStatus: "pending",
            },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ listings: [] }))
      .mockResolvedValueOnce(jsonResponse({ run: null }));
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(await screen.findByText("No roles collected yet")).toBeVisible();
    expect(screen.getByText("Xero")).toBeVisible();
    expect(screen.getByRole("button", { name: "Collect roles" })).toBeEnabled();
  });

  it("visibly preserves an unavailable watchlisted role", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ sources: [] }))
      .mockResolvedValueOnce(
        jsonResponse({
          listings: [
            {
              id: "saved-role",
              sourceId: "xero",
              companyName: "Xero",
              title: "Software Engineer",
              location: "Wellington",
              summary: null,
              postedAt: null,
              sourceUrl: "https://example.com/saved-role",
              firstSeenAt: "2026-09-01T00:00:00.000Z",
              lastSeenAt: "2026-09-01T00:00:00.000Z",
              status: "unavailable",
              watchlisted: true,
            },
          ],
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ run: null }));
    vi.stubGlobal("fetch", fetchMock);

    render(<App />);

    expect(await screen.findByText("unavailable")).toBeVisible();
    expect(screen.getByText("Saved listing is unavailable.")).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "Remove Software Engineer from watchlist",
      }),
    ).toBeVisible();
  });
});
