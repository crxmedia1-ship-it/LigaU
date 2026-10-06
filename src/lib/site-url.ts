/** Public origin for metadata, sitemap and robots; the env var lets local and preview builds override it. */
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://ligauve.com").replace(/\/$/, "");
