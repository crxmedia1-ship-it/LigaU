import { v2 as cloudinary } from "cloudinary";
import { unstable_cache } from "next/cache";
import { CLOUDINARY_FOLDER_ALIASES, CLOUDINARY_ROOT } from "@/lib/cloudinary-paths";
import { PUBLIC_CATALOG_TAG } from "@/lib/public/revalidate";
import type { SponsorCard } from "@/lib/public/types";

type LogoFolder = "sponsors" | "passBrands";

export function logoFolder(alias: LogoFolder) {
  return `${CLOUDINARY_ROOT}/${CLOUDINARY_FOLDER_ALIASES[alias]}`;
}

/** Server-side Cloudinary SDK with credentials applied, or null when they are missing. */
export function getCloudinary() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
  return cloudinary;
}

/** Uncached listing; public pages go through the cached getters below. */
export async function fetchFolderLogos(alias: LogoFolder): Promise<SponsorCard[]> {
  const sdk = getCloudinary();
  if (!sdk) return [];
  try {
    const res = await sdk.api.resources({ type: "upload", prefix: `${logoFolder(alias)}/`, max_results: 80 });
    return (res.resources ?? []).map((resource: { public_id: string; secure_url: string }) => {
      const slug = resource.public_id.split("/").pop() ?? resource.public_id;
      return {
        id: resource.public_id,
        name: slug.replace(/-/g, " "),
        category: "Patrocinador",
        locationTag: null,
        logoUrl: resource.secure_url,
      };
    });
  } catch {
    return [];
  }
}

const CACHE = { revalidate: 3600, tags: [PUBLIC_CATALOG_TAG] };

/** U Pass partner brands; some overlap with the sponsors but they are managed in their own folder. */
export const getPassBrandLogos = unstable_cache(() => fetchFolderLogos("passBrands"), ["pass-brand-logos"], CACHE);
