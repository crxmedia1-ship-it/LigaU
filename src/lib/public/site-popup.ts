import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/public/queries";
import { PUBLIC_CATALOG_TAG } from "@/lib/public/revalidate";

export type SitePopup = {
  id: string;
  imageUrl: string;
  title: string | null;
  linkUrl: string | null;
  /** Changes on every edit, so visitors who closed an older version see the new one. */
  version: string;
};

const getLatestPopup = unstable_cache(
  async () => {
    const { data } = await createPublicClient()
      .from("site_popup")
      .select("id, image_url, title, link_url, is_active, starts_on, ends_on, updated_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  },
  ["site-popup"],
  { revalidate: 3600, tags: [PUBLIC_CATALOG_TAG] },
);

/** The pop-up to show today, if it is switched on and within its dates (Caracas time). */
export async function getSitePopup(): Promise<SitePopup | null> {
  const row = await getLatestPopup();
  if (!row?.is_active) return null;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Caracas" });
  if ((row.starts_on && today < row.starts_on) || (row.ends_on && today > row.ends_on)) return null;
  return { id: row.id, imageUrl: row.image_url, title: row.title, linkUrl: row.link_url, version: row.updated_at };
}
