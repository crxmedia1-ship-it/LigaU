import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/session";
import { isSuperadmin } from "@/lib/auth/roles";
import { isSponsorSlot, type SponsorSlot } from "@/lib/public/sponsor-placements";
import { parseContact } from "@/lib/public/pass-contact";
import { universityLogoUrl } from "@/lib/public/university-marks";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CatalogoBoard,
  type CatalogoTab,
} from "@/app/admin/(panel)/catalogo/catalogo-board";

const STAFF_TABS: CatalogoTab[] = ["universidades", "deportes"];
const SUPERADMIN_TABS: CatalogoTab[] = [...STAFF_TABS, "patrocinantes", "upass"];

export default async function AdminCatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const staff = await requireStaff();
  if (!staff.ok) redirect("/admin/login");
  const commercial = isSuperadmin(staff.role);
  const tabs = commercial ? SUPERADMIN_TABS : STAFF_TABS;
  const { tab } = await searchParams;

  const admin = createAdminClient();
  const [
    { data: universities },
    { data: sports },
    { data: teams },
    { data: sponsors },
    { data: benefits },
    { data: officialSponsors },
    { data: placements },
  ] = await Promise.all([
    admin
      .from("universities")
      .select("id, name, short_name, logo_url")
      .order("short_name"),
    admin.from("sports").select("id, name, slug, category_type").order("name"),
    admin.from("teams").select("university_id, sport_id"),
    commercial
      ? admin
          .from("pass_sponsors")
          .select("id, name, category, location_tag, logo_url, is_active, contact, brand_color")
          .order("name")
      : { data: [] },
    commercial
      ? admin
          .from("pass_benefits")
          .select("id, sponsor_id, discount_title, status, redemption_type, promo_code, instructions, external_url")
          .order("created_at")
      : { data: [] },
    commercial
      ? admin
          .from("official_sponsors")
          .select("id, name, logo_url, brand_color, link_url, flyer_url, tagline, starts_on, ends_on")
          .order("sort_order")
          .order("name")
      : { data: [] },
    commercial ? admin.from("sponsor_placements").select("slot, sponsor_id") : { data: [] },
  ]);

  const slotsBySponsor = new Map<string, SponsorSlot[]>();
  for (const placement of placements ?? []) {
    if (!isSponsorSlot(placement.slot)) continue;
    slotsBySponsor.set(placement.sponsor_id, [...(slotsBySponsor.get(placement.sponsor_id) ?? []), placement.slot]);
  }

  const teamsByUniversity: Record<string, number> = {};
  const teamsBySport: Record<string, number> = {};
  for (const team of teams ?? []) {
    teamsByUniversity[team.university_id] =
      (teamsByUniversity[team.university_id] ?? 0) + 1;
    teamsBySport[team.sport_id] = (teamsBySport[team.sport_id] ?? 0) + 1;
  }

  return (
    <CatalogoBoard
      key={tab ?? "universidades"}
      tabs={tabs}
      initialTab={tabs.find((item) => item === tab) ?? "universidades"}
      officialSponsors={(officialSponsors ?? []).map((sponsor) => ({
        id: sponsor.id,
        name: sponsor.name,
        logoUrl: sponsor.logo_url,
        brandColor: sponsor.brand_color,
        linkUrl: sponsor.link_url,
        flyerUrl: sponsor.flyer_url,
        tagline: sponsor.tagline,
        startsOn: sponsor.starts_on,
        endsOn: sponsor.ends_on,
        slots: slotsBySponsor.get(sponsor.id) ?? [],
      }))}
      universities={(universities ?? []).map((university) => ({
        id: university.id,
        name: university.name,
        shortName: university.short_name,
        uploadedLogo: university.logo_url,
        logoUrl:
          universityLogoUrl(university.short_name) ?? university.logo_url,
        teams: teamsByUniversity[university.id] ?? 0,
      }))}
      sports={(sports ?? []).map((sport) => ({
        id: sport.id,
        name: sport.name,
        slug: sport.slug,
        category: sport.category_type,
        teams: teamsBySport[sport.id] ?? 0,
      }))}
      sponsors={(sponsors ?? []).map((sponsor) => ({
        id: sponsor.id,
        name: sponsor.name,
        category: sponsor.category,
        locationTag: sponsor.location_tag ?? "",
        logoUrl: sponsor.logo_url,
        isActive: sponsor.is_active,
        contact: parseContact(sponsor.contact),
        brandColor: sponsor.brand_color,
        benefits: (benefits ?? [])
          .filter((benefit) => benefit.sponsor_id === sponsor.id)
          .map((benefit) => ({
            id: benefit.id,
            sponsorId: benefit.sponsor_id,
            discountTitle: benefit.discount_title,
            status: benefit.status,
            redemptionType: benefit.redemption_type,
            promoCode: benefit.promo_code ?? "",
            instructions: benefit.instructions ?? "",
            externalUrl: benefit.external_url ?? "",
          })),
      }))}
    />
  );
}
