import { v2 as cloudinary } from "cloudinary";
import { unstable_cache } from "next/cache";
import { CLOUDINARY_ROOT } from "@/lib/cloudinary-paths";

export type UniversityMarks = {
  crestUrl: string | null;
  mascotUrl: string | null;
};

function cloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  return true;
}

async function listPrefix(prefix: string) {
  const res = await cloudinary.api.resources({
    type: "upload",
    prefix,
    max_results: 80,
  });
  return (res.resources ?? []) as Array<{ public_id: string; secure_url: string }>;
}

async function fetchUniversityMarks(): Promise<Record<string, UniversityMarks>> {
  if (!cloudinaryConfig()) return {};
  const map: Record<string, UniversityMarks> = {};
  const ensure = (slug: string) => {
    map[slug] ??= { crestUrl: null, mascotUrl: null };
    return map[slug];
  };

  try {
    const [crests, mascots] = await Promise.all([
      listPrefix(`${CLOUDINARY_ROOT}/logo universidad`),
      listPrefix(`${CLOUDINARY_ROOT}/logo equipos`),
    ]);
    for (const resource of crests) {
      const slug = resource.public_id.split("/").pop()?.toLowerCase();
      if (!slug) continue;
      ensure(slug).crestUrl = resource.secure_url;
    }
    for (const resource of mascots) {
      const parts = resource.public_id.split("/");
      const file = parts.at(-1);
      const slug = (file === "mascota" ? parts.at(-2) : file)?.toLowerCase();
      if (!slug) continue;
      ensure(slug).mascotUrl = resource.secure_url;
    }
  } catch {
    return {};
  }

  return map;
}

export const getUniversityMarks = unstable_cache(
  fetchUniversityMarks,
  ["university-marks"],
  { revalidate: 3600 },
);

export function applyUniversityMarks(
  shortName: string,
  logoUrl: string | null,
  marks: Record<string, UniversityMarks>,
): UniversityMarks {
  const slug = shortName.toLowerCase();
  const listed = marks[slug];
  const fromDbMascot =
    logoUrl && (logoUrl.includes("logo%20equipos") || logoUrl.includes("logo equipos"))
      ? logoUrl
      : null;
  const fromDbCrest =
    logoUrl &&
    (logoUrl.includes("logo%20universidad") || logoUrl.includes("logo universidad"))
      ? logoUrl
      : null;
  return {
    crestUrl: listed?.crestUrl ?? fromDbCrest,
    mascotUrl: listed?.mascotUrl ?? fromDbMascot ?? (!fromDbCrest ? logoUrl : null),
  };
}
