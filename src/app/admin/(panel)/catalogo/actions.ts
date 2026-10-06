"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { requireStaff, requireSuperadmin } from "@/lib/admin/session";
import { slugify } from "@/lib/admin/sport";
import { dominantSvgColor, normalizeHex, pickUnusedColor } from "@/lib/public/brand-color";
import { parseContact, type SponsorContact } from "@/lib/public/pass-contact";
import { refreshPublicSite } from "@/lib/public/revalidate";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type SportCategory = Database["public"]["Enums"]["sport_category"];
type PassStatus = Database["public"]["Enums"]["pass_status"];
type RedemptionType = Database["public"]["Enums"]["redemption_type"];

export async function upsertUniversity(input: {
  id?: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const name = input.name.trim();
  const shortName = input.shortName.trim().toUpperCase();
  if (!name || !shortName) return { ok: false as const, error: "Nombre y siglas son obligatorios." };
  const admin = createAdminClient();
  const payload = { name, short_name: shortName, logo_url: input.logoUrl };
  const { error } = input.id
    ? await admin.from("universities").update(payload).eq("id", input.id)
    : await admin.from("universities").insert(payload);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function deleteUniversity(id: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const admin = createAdminClient();
  const { count } = await admin.from("teams").select("id", { count: "exact", head: true }).eq("university_id", id);
  if (count) {
    return {
      ok: false as const,
      error: `Tiene ${count} ${count === 1 ? "equipo" : "equipos"}. Quítalos primero en Equipos.`,
    };
  }
  const { error } = await admin.from("universities").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function upsertSport(input: { id?: string; name: string; category: SportCategory }) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "El nombre del deporte es obligatorio." };
  const admin = createAdminClient();
  const { error } = input.id
    ? await admin.from("sports").update({ name, category_type: input.category }).eq("id", input.id)
    : await admin.from("sports").insert({ name, slug: slugify(name), category_type: input.category });
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function deleteSport(id: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const admin = createAdminClient();
  const [{ count: teamCount }, { count: matchCount }] = await Promise.all([
    admin.from("teams").select("id", { count: "exact", head: true }).eq("sport_id", id),
    admin.from("matches").select("id", { count: "exact", head: true }).eq("sport_id", id),
  ]);
  if (teamCount || matchCount) {
    return {
      ok: false as const,
      error: `Tiene ${teamCount ?? 0} equipos y ${matchCount ?? 0} partidos. Quítalos primero.`,
    };
  }
  const { error } = await admin.from("sports").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

async function readSvg(url: string) {
  if (!/\.svg(\?|$)/i.test(url)) return null;
  try {
    if (url.startsWith("/")) return await readFile(path.join(process.cwd(), "public", path.normalize(url)), "utf8");
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return response.ok ? await response.text() : null;
  } catch {
    return null;
  }
}

async function autoBrandColor(admin: ReturnType<typeof createAdminClient>, logoUrl: string | null, sponsorId?: string) {
  const svg = logoUrl ? await readSvg(logoUrl) : null;
  const fromLogo = svg ? dominantSvgColor(svg) : null;
  if (fromLogo) return fromLogo;
  const { data } = await admin.from("pass_sponsors").select("id, brand_color").not("brand_color", "is", null);
  const used = (data ?? []).filter((row) => row.id !== sponsorId).map((row) => row.brand_color as string);
  return pickUnusedColor(used);
}

export async function upsertSponsor(input: {
  id?: string;
  name: string;
  category: string;
  locationTag: string;
  logoUrl: string | null;
  isActive: boolean;
  contact: SponsorContact;
  brandColor: string | null;
}) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "El nombre de la marca es obligatorio." };
  const admin = createAdminClient();
  const payload = {
    name,
    category: input.category.trim() || "Marcas",
    location_tag: input.locationTag.trim() || null,
    logo_url: input.logoUrl,
    is_active: input.isActive,
    contact: parseContact(input.contact),
    brand_color:
      input.brandColor && /^#[0-9a-f]{6}$/i.test(input.brandColor)
        ? normalizeHex(input.brandColor)
        : await autoBrandColor(admin, input.logoUrl, input.id),
  };
  const { error } = input.id
    ? await admin.from("pass_sponsors").update(payload).eq("id", input.id)
    : await admin.from("pass_sponsors").insert(payload);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function deleteSponsor(id: string) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  const admin = createAdminClient();
  const { error: benefitsError } = await admin.from("pass_benefits").delete().eq("sponsor_id", id);
  if (benefitsError) return { ok: false as const, error: benefitsError.message };
  const { error } = await admin.from("pass_sponsors").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function upsertBenefit(input: {
  id?: string;
  sponsorId: string;
  discountTitle: string;
  status: PassStatus;
  redemptionType: RedemptionType;
  promoCode: string;
  instructions: string;
  externalUrl: string;
}) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  const discountTitle = input.discountTitle.trim();
  if (!discountTitle) return { ok: false as const, error: "El descuento es obligatorio." };
  const admin = createAdminClient();
  const payload = {
    sponsor_id: input.sponsorId,
    discount_title: discountTitle,
    status: input.status,
    redemption_type: input.redemptionType,
    promo_code: input.promoCode.trim() || null,
    instructions: input.instructions.trim() || null,
    external_url: input.externalUrl.trim() || null,
  };
  const { error } = input.id
    ? await admin.from("pass_benefits").update(payload).eq("id", input.id)
    : await admin.from("pass_benefits").insert(payload);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function deleteBenefit(id: string) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  const admin = createAdminClient();
  const { error } = await admin.from("pass_benefits").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}
