import type { MetadataRoute } from "next";
import { getPublicCatalog } from "@/lib/public/queries";
import { SITE_URL } from "@/lib/site-url";

export const revalidate = 3600;

const SECTIONS: { path: string; changeFrequency: "hourly" | "daily" | "weekly"; priority: number }[] = [
  { path: "", changeFrequency: "hourly", priority: 1 },
  { path: "/calendario", changeFrequency: "hourly", priority: 0.9 },
  { path: "/clasificacion", changeFrequency: "hourly", priority: 0.9 },
  { path: "/noticias", changeFrequency: "daily", priority: 0.8 },
  { path: "/multimedia", changeFrequency: "daily", priority: 0.7 },
  { path: "/universidades", changeFrequency: "weekly", priority: 0.7 },
  { path: "/liga-u-pass", changeFrequency: "weekly", priority: 0.8 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { universities, athletes, matches, news } = await getPublicCatalog();
  const entry = (path: string, extra: Omit<MetadataRoute.Sitemap[number], "url"> = {}) => ({
    url: `${SITE_URL}${path}`,
    ...extra,
  });

  return [
    ...SECTIONS.map(({ path, ...extra }) => entry(path, extra)),
    ...news
      .filter((item) => item.publishedAt)
      .map((item) => entry(`/noticias/${item.slug}`, { lastModified: item.publishedAt ?? undefined, priority: 0.6 })),
    ...universities.map((university) => entry(`/universidades/${university.id}`, { priority: 0.5 })),
    ...matches.map((match) => entry(`/partidos/${match.id}`, { lastModified: match.matchDate, priority: 0.5 })),
    ...athletes.map((athlete) => entry(`/atletas/${athlete.id}`, { priority: 0.4 })),
  ];
}
