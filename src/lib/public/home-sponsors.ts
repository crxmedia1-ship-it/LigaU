import { v2 as cloudinary } from "cloudinary";
import { unstable_cache } from "next/cache";
import { CLOUDINARY_FOLDER_ALIASES, CLOUDINARY_ROOT } from "@/lib/cloudinary-paths";
import type { SponsorCard } from "@/lib/public/types";

async function fetchFolderLogos(alias: keyof typeof CLOUDINARY_FOLDER_ALIASES): Promise<SponsorCard[]> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return [];

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: `${CLOUDINARY_ROOT}/${CLOUDINARY_FOLDER_ALIASES[alias]}/`,
      max_results: 80,
    });
    return (res.resources ?? []).map(
      (resource: { public_id: string; secure_url: string }) => {
        const slug = resource.public_id.split("/").pop() ?? resource.public_id;
        return {
          id: resource.public_id,
          name: slug.replace(/-/g, " "),
          category: "Patrocinador",
          locationTag: null,
          logoUrl: resource.secure_url,
        };
      },
    );
  } catch {
    return [];
  }
}

/** Official sponsors shown on the home marquee. */
export const getHomeSponsorLogos = unstable_cache(
  () => fetchFolderLogos("sponsors"),
  ["home-sponsor-logos"],
  { revalidate: 3600 },
);

/** U Pass partner brands; some overlap with the sponsors but they are managed in their own folder. */
export const getPassBrandLogos = unstable_cache(
  () => fetchFolderLogos("passBrands"),
  ["pass-brand-logos"],
  { revalidate: 3600 },
);
