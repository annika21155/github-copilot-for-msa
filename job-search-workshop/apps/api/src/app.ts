import express from "express";

import {
  CollectionAlreadyRunningError,
  CollectionService,
} from "./collection-service.js";
import { JobFinderRepository } from "./database.js";

function optionalQuery(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isTrueQuery(value: unknown): boolean {
  return value === "true";
}

export function createApp(repository: JobFinderRepository) {
  const app = express();
  const collectionService = new CollectionService(repository);

  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/sources", (_request, response) => {
    response.json({ sources: repository.listSources() });
  });

  app.get("/api/listings", (request, response) => {
    const listings = repository.listListings({
      search: optionalQuery(request.query.search),
      company: optionalQuery(request.query.company),
      location: optionalQuery(request.query.location),
      sourceId: optionalQuery(request.query.source),
      watchlisted: isTrueQuery(request.query.watchlisted),
    });
    response.json({ listings });
  });

  app.get("/api/collection-runs/latest", (_request, response) => {
    response.json({ run: repository.getLatestCollectionRun() });
  });

  app.post("/api/collection-runs", (_request, response) => {
    try {
      const run = collectionService.start();
      response.status(202).json({ run });
    } catch (error) {
      if (error instanceof CollectionAlreadyRunningError) {
        response.status(409).json({ error: error.message });
        return;
      }
      throw error;
    }
  });

  app.post("/api/watchlist/:listingId", (request, response) => {
    const { listingId } = request.params;
    if (!repository.listingExists(listingId)) {
      response.status(404).json({ error: "Listing not found." });
      return;
    }
    repository.addToWatchlist(listingId);
    response.status(200).json({ watchlisted: true });
  });

  app.delete("/api/watchlist/:listingId", (request, response) => {
    repository.removeFromWatchlist(request.params.listingId);
    response.status(204).send();
  });

  return app;
}
