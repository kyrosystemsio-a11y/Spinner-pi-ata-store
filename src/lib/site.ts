// Single source of truth for the deployed origin, used by metadata, JSON-LD,
// sitemap.xml, and robots.ts. Falls back to localhost so builds never break
// when the env var hasn't been set yet (e.g. in CI or before a domain is chosen).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
