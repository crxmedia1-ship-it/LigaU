import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/public/queries";
import { PUBLIC_CATALOG_TAG } from "@/lib/public/revalidate";
import { isSponsorSlot, type SponsorSlot } from "@/lib/public/sponsor-placements";
import type { SponsorCard } from "@/lib/public/types";

export type OfficialSponsorRow = {
  id: string;
  name: string;
  logo_url: string;
  brand_color: string | null;
  link_url: string | null;
  flyer_url: string | null;
  tagline: string | null;
};

export const OFFICIAL_SPONSOR_COLUMNS = "id, name, logo_url, brand_color, link_url, flyer_url, tagline";

export function officialSponsorCard(row: OfficialSponsorRow): SponsorCard {
  return {
    id: row.id,
    name: row.name,
    category: "Patrocinador",
    locationTag: null,
    logoUrl: row.logo_url,
    brandColor: row.brand_color,
    linkUrl: row.link_url,
    flyerUrl: row.flyer_url,
    tagline: row.tagline,
  };
}

export type OfficialSponsors = {
  /** Every sponsor within its contract dates, in marquee order. */
  sponsors: SponsorCard[];
  slots: Partial<Record<SponsorSlot, SponsorCard>>;
};

/** Contract dates are enforced by RLS, so expired sponsors and their slots drop out on their own. */
export const getOfficialSponsors = unstable_cache(
  async (): Promise<OfficialSponsors> => {
    const supabase = createPublicClient();
    const [{ data: rows }, { data: placements }] = await Promise.all([
      supabase.from("official_sponsors").select(OFFICIAL_SPONSOR_COLUMNS).order("sort_order").order("name"),
      supabase.from("sponsor_placements").select("slot, sponsor_id"),
    ]);
    const sponsors = (rows ?? []).map(officialSponsorCard);
    const byId = new Map(sponsors.map((sponsor) => [sponsor.id, sponsor]));
    const slots: OfficialSponsors["slots"] = {};
    for (const placement of placements ?? []) {
      const sponsor = byId.get(placement.sponsor_id);
      if (sponsor && isSponsorSlot(placement.slot)) slots[placement.slot] = sponsor;
    }
    return { sponsors, slots };
  },
  ["official-sponsors"],
  { revalidate: 3600, tags: [PUBLIC_CATALOG_TAG] },
);
