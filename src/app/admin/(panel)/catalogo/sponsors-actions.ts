"use server";

import { requireSuperadmin } from "@/lib/admin/session";
import { slugify } from "@/lib/admin/sport";
import { buildCloudinaryFolder } from "@/lib/cloudinary-paths";
import { dominantSvgColor, isNeutral, normalizeHex, pickUnusedColor } from "@/lib/public/brand-color";
import { isSponsorSlot } from "@/lib/public/sponsor-placements";
import { refreshPublicSite } from "@/lib/public/revalidate";
import { getCloudinary, logoFolder } from "@/lib/public/sponsor-logos";
import { createAdminClient } from "@/lib/supabase/admin";

const LOGO_FOLDER = logoFolder("sponsors");
const FLYER_FOLDER = buildCloudinaryFolder("banners", "patrocinadores")!;
const MAX_BYTES = 8 * 1024 * 1024;
const LOGO_TYPES = new Set(["image/svg+xml", "image/png", "image/webp", "image/jpeg"]);
const FLYER_TYPES = new Set(["image/png", "image/webp", "image/jpeg"]);
const HEX = /^#[0-9a-f]{6}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

type Result = { ok: true } | { ok: false; error: string };

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "Cloudinary rechazó la operación.";
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function upload(formData: FormData, key: string) {
  const file = formData.get(key);
  return file instanceof File && file.size > 0 ? file : null;
}

function cleanUrl(value: string) {
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return undefined;
  }
}

async function dataUri(file: File) {
  return `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
}

/** First saturated color Cloudinary found in a raster logo. */
function firstBrandColor(colors: unknown): string | null {
  if (!Array.isArray(colors)) return null;
  for (const entry of colors) {
    const hex = Array.isArray(entry) ? String(entry[0]) : "";
    if (HEX.test(hex) && !isNeutral(hex)) return normalizeHex(hex);
  }
  return null;
}

/**
 * Creates or updates an official sponsor: logo, optional artwork, auto brand color, contract dates
 * and the site slots it holds. Taking a slot removes it from whichever sponsor had it.
 */
export async function saveOfficialSponsor(formData: FormData): Promise<Result> {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;

  const id = text(formData, "id") || null;
  const name = text(formData, "name");
  const slug = slugify(name);
  if (!slug) return { ok: false, error: "Escribe el nombre de la marca." };

  const tagline = text(formData, "tagline");
  if (tagline.length > 40) return { ok: false, error: "La frase no puede pasar de 40 caracteres." };

  const linkUrl = cleanUrl(text(formData, "linkUrl"));
  if (linkUrl === undefined) return { ok: false, error: "El link no es válido." };

  const startsOn = text(formData, "startsOn") || null;
  const endsOn = text(formData, "endsOn") || null;
  if ((startsOn && !DATE.test(startsOn)) || (endsOn && !DATE.test(endsOn))) {
    return { ok: false, error: "Revisa las fechas del contrato." };
  }
  if (startsOn && endsOn && endsOn < startsOn) {
    return { ok: false, error: "La fecha de fin es anterior a la de inicio." };
  }

  let slots: string[];
  try {
    const parsed = JSON.parse(text(formData, "slots") || "[]");
    slots = Array.isArray(parsed) ? parsed.map(String).filter(isSponsorSlot) : [];
  } catch {
    return { ok: false, error: "Los espacios no son válidos." };
  }

  const logo = upload(formData, "file");
  if (!logo && !id) return { ok: false, error: "Sube el logo de la marca." };
  if (logo && logo.size > MAX_BYTES) return { ok: false, error: "El logo no puede superar 8 MB." };
  if (logo && !LOGO_TYPES.has(logo.type)) return { ok: false, error: "El logo debe ser SVG, PNG, WEBP o JPG." };

  const flyer = upload(formData, "flyer");
  if (flyer && flyer.size > MAX_BYTES) return { ok: false, error: "El arte no puede superar 8 MB." };
  if (flyer && !FLYER_TYPES.has(flyer.type)) return { ok: false, error: "El arte debe ser PNG, WEBP o JPG." };
  const removeFlyer = formData.get("removeFlyer") === "1";

  const admin = createAdminClient();
  const { data: existing } = id
    ? await admin.from("official_sponsors").select("id, logo_url, logo_public_id, flyer_url").eq("id", id).maybeSingle()
    : { data: null };
  if (id && !existing) return { ok: false, error: "El patrocinante ya no existe." };

  const sdk = logo || flyer ? getCloudinary() : null;
  if ((logo || flyer) && !sdk) return { ok: false, error: "Cloudinary no está configurado." };

  let logoUrl = existing?.logo_url ?? "";
  let logoPublicId = existing?.logo_public_id ?? null;
  let flyerUrl = removeFlyer ? null : (existing?.flyer_url ?? null);
  let detectedColor: string | null = null;

  try {
    if (logo && sdk) {
      const { data: taken } = await admin
        .from("official_sponsors")
        .select("id")
        .eq("logo_public_id", `${LOGO_FOLDER}/${slug}`)
        .maybeSingle();
      const target = taken && taken.id !== id ? `${LOGO_FOLDER}/${slug}-${Date.now().toString(36)}` : `${LOGO_FOLDER}/${slug}`;
      const result = await sdk.uploader.upload(await dataUri(logo), {
        public_id: target,
        overwrite: true,
        invalidate: true,
        colors: logo.type !== "image/svg+xml",
      });
      if (logoPublicId && logoPublicId !== target) await sdk.uploader.destroy(logoPublicId, { invalidate: true });
      logoUrl = result.secure_url;
      logoPublicId = target;
      detectedColor =
        logo.type === "image/svg+xml" ? dominantSvgColor(await logo.text()) : firstBrandColor(result.colors);
    }
    if (flyer && sdk) {
      const result = await sdk.uploader.upload(await dataUri(flyer), {
        public_id: `${FLYER_FOLDER}/${slug}`,
        overwrite: true,
        invalidate: true,
      });
      flyerUrl = result.secure_url;
    }
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }

  const requested = text(formData, "brandColor");
  let brandColor = HEX.test(requested) ? normalizeHex(requested) : detectedColor;
  if (!brandColor && !id) {
    const { data: used } = await admin.from("official_sponsors").select("brand_color").not("brand_color", "is", null);
    brandColor = pickUnusedColor((used ?? []).map((row) => row.brand_color as string));
  }

  const payload = {
    name,
    tagline: tagline || null,
    link_url: linkUrl,
    logo_url: logoUrl,
    logo_public_id: logoPublicId,
    flyer_url: flyerUrl,
    starts_on: startsOn,
    ends_on: endsOn,
    ...(brandColor ? { brand_color: brandColor } : {}),
  };

  const saved = id
    ? await admin.from("official_sponsors").update(payload).eq("id", id).select("id").single()
    : await admin.from("official_sponsors").insert(payload).select("id").single();
  if (saved.error || !saved.data) return { ok: false, error: saved.error?.message ?? "No se pudo guardar." };
  const sponsorId = saved.data.id;

  const released = admin.from("sponsor_placements").delete().eq("sponsor_id", sponsorId);
  const { error: releaseError } = slots.length
    ? await released.not("slot", "in", `(${slots.join(",")})`)
    : await released;
  if (releaseError) return { ok: false, error: releaseError.message };

  if (slots.length) {
    const { error: placeError } = await admin
      .from("sponsor_placements")
      .upsert(
        slots.map((slot) => ({ slot, sponsor_id: sponsorId })),
        { onConflict: "slot" },
      );
    if (placeError) return { ok: false, error: placeError.message };
  }

  refreshPublicSite();
  return { ok: true };
}

export async function deleteOfficialSponsor(id: string): Promise<Result> {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;

  const admin = createAdminClient();
  const { data: sponsor } = await admin
    .from("official_sponsors")
    .select("name, logo_public_id, flyer_url")
    .eq("id", id)
    .maybeSingle();
  if (!sponsor) return { ok: false, error: "El patrocinante ya no existe." };

  const { error } = await admin.from("official_sponsors").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  const sdk = getCloudinary();
  if (sdk) {
    const assets = [sponsor.logo_public_id, sponsor.flyer_url ? `${FLYER_FOLDER}/${slugify(sponsor.name)}` : null];
    await Promise.allSettled(
      assets.filter((asset): asset is string => Boolean(asset)).map((asset) => sdk.uploader.destroy(asset, { invalidate: true })),
    );
  }

  refreshPublicSite();
  return { ok: true };
}
