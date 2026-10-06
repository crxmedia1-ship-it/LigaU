"use server";

import { requireSuperadmin } from "@/lib/admin/session";
import { slugify } from "@/lib/admin/sport";
import { refreshPublicSite } from "@/lib/public/revalidate";
import { getCloudinary, logoFolder } from "@/lib/public/sponsor-logos";

const FOLDER = logoFolder("sponsors");
const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/svg+xml", "image/png", "image/webp", "image/jpeg"]);

type Result = { ok: true } | { ok: false; error: string };

function ownsPublicId(publicId: string) {
  return publicId.startsWith(`${FOLDER}/`) && !publicId.slice(FOLDER.length + 1).includes("/");
}

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) return String(error.message);
  return "Cloudinary rechazó la operación.";
}

/** Creates a sponsor, renames it, or swaps its logo; the public id is the brand slug. */
export async function saveOfficialSponsor(formData: FormData): Promise<Result> {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;

  const id = String(formData.get("id") ?? "") || null;
  if (id && !ownsPublicId(id)) return { ok: false, error: "Logo no válido." };
  const slug = slugify(String(formData.get("name") ?? ""));
  if (!slug) return { ok: false, error: "Escribe el nombre de la marca." };

  const file = formData.get("file");
  const hasFile = file instanceof File && file.size > 0;
  if (!hasFile && !id) return { ok: false, error: "Sube el logo de la marca." };
  if (hasFile && file.size > MAX_BYTES) return { ok: false, error: "El logo no puede superar 8 MB." };
  if (hasFile && !ALLOWED_TYPES.has(file.type)) return { ok: false, error: "Usa SVG, PNG, WEBP o JPG." };

  const sdk = getCloudinary();
  if (!sdk) return { ok: false, error: "Cloudinary no está configurado." };
  const target = `${FOLDER}/${slug}`;

  try {
    if (hasFile) {
      const dataUri = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString("base64")}`;
      await sdk.uploader.upload(dataUri, { public_id: target, overwrite: true, invalidate: true });
      if (id && id !== target) await sdk.uploader.destroy(id, { invalidate: true });
    } else if (id && id !== target) {
      await sdk.uploader.rename(id, target, { invalidate: true });
    }
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
  refreshPublicSite();
  return { ok: true };
}

export async function deleteOfficialSponsor(publicId: string): Promise<Result> {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  if (!ownsPublicId(publicId)) return { ok: false, error: "Logo no válido." };
  const sdk = getCloudinary();
  if (!sdk) return { ok: false, error: "Cloudinary no está configurado." };

  try {
    await sdk.uploader.destroy(publicId, { invalidate: true });
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
  refreshPublicSite();
  return { ok: true };
}
