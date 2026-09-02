import { join } from "node:path";

import envPaths from "env-paths";

import { JobFinderRepository } from "../apps/api/src/database.js";
import type { Listing } from "../apps/api/src/models.js";

const dataDirectory =
  process.env.JOB_FINDER_DATA_DIR ?? envPaths("job-finder").data;
const repository = new JobFinderRepository(
  join(dataDirectory, "job-finder.sqlite"),
);
const seededAt = new Date().toISOString();

const listings: Listing[] = [
  {
    id: "xero-software-engineer-wellington",
    sourceId: "xero",
    companyName: "Xero",
    title: "Software Engineer",
    location: "Wellington, New Zealand",
    summary:
      "Build resilient cloud accounting experiences with a cross-functional product engineering team.",
    postedAt: "2026-08-25T00:00:00.000Z",
    sourceUrl: "https://careers.xero.com/jobs/software-engineer-wellington",
    firstSeenAt: seededAt,
    lastSeenAt: seededAt,
    status: "active",
    watchlisted: false,
  },
  {
    id: "serko-senior-platform-engineer-auckland",
    sourceId: "serko",
    companyName: "Serko",
    title: "Senior Platform Engineer",
    location: "Auckland, New Zealand",
    summary:
      "Improve developer tooling, observability, and the reliability of travel technology services.",
    postedAt: "2026-08-20T00:00:00.000Z",
    sourceUrl: "https://www.serko.com/careers/senior-platform-engineer",
    firstSeenAt: seededAt,
    lastSeenAt: seededAt,
    status: "active",
    watchlisted: false,
  },
  {
    id: "datacom-full-stack-developer-christchurch",
    sourceId: "datacom",
    companyName: "Datacom",
    title: "Full Stack Developer",
    location: "Christchurch, New Zealand",
    summary:
      "Deliver customer-facing services across TypeScript, APIs, and cloud infrastructure.",
    postedAt: "2026-08-12T00:00:00.000Z",
    sourceUrl: "https://careers.datacom.com/full-stack-developer-christchurch",
    firstSeenAt: seededAt,
    lastSeenAt: seededAt,
    status: "active",
    watchlisted: false,
  },
  {
    id: "trade-me-frontend-engineer-wellington",
    sourceId: "trade-me-jobs",
    companyName: "Trade Me",
    title: "Frontend Engineer",
    location: "Wellington, New Zealand",
    summary:
      "Create fast, accessible marketplace experiences used by millions of members across Aotearoa.",
    postedAt: "2026-07-28T00:00:00.000Z",
    sourceUrl: "https://www.trademe.co.nz/a/jobs/frontend-engineer-wellington",
    firstSeenAt: seededAt,
    lastSeenAt: seededAt,
    status: "active",
    watchlisted: false,
  },
  {
    id: "pushpay-devops-engineer-auckland",
    sourceId: "pushpay",
    companyName: "Pushpay",
    title: "DevOps Engineer",
    location: "Auckland, New Zealand",
    summary:
      "Support secure delivery pipelines and scalable infrastructure for payment and giving products.",
    postedAt: "2026-07-02T00:00:00.000Z",
    sourceUrl: "https://pushpay.com/careers/devops-engineer-auckland",
    firstSeenAt: seededAt,
    lastSeenAt: seededAt,
    status: "stale",
    watchlisted: false,
  },
  {
    id: "microsoft-software-engineer-auckland",
    sourceId: "microsoft-careers",
    companyName: "Microsoft",
    title: "Software Engineer II",
    location: "Auckland, New Zealand",
    summary:
      "Design and ship reliable services with a collaborative engineering team serving global customers.",
    postedAt: "2026-06-16T00:00:00.000Z",
    sourceUrl: "https://jobs.careers.microsoft.com/software-engineer-auckland",
    firstSeenAt: seededAt,
    lastSeenAt: seededAt,
    status: "unavailable",
    watchlisted: false,
  },
];

try {
  repository.upsertListings(listings);
  console.log(
    `Seeded ${listings.length} development listings in ${join(dataDirectory, "job-finder.sqlite")}`,
  );
} finally {
  repository.close();
}
