import type { TeamGender } from "@/lib/public/types";

export const CLOUDINARY_ROOT = "ligau";

export const CLOUDINARY_FOLDER_ALIASES = {
  universities: "logo universidad",
  athletes: "jugadores",
  sponsors: "logo patrocinadores",
  news: "noticias",
  podcasts: "podcasts",
  banners: "banners",
} as const;

export const CLOUDINARY_FOLDER_ROOTS = [
  "logo universidad",
  "logo equipos",
  "logo patrocinadores",
  "jugadores",
  "videos-publicidad",
  "noticias",
  "podcasts",
  "banners",
  "marca",
] as const;

export type CloudinaryFolder =
  | (typeof CLOUDINARY_FOLDER_ROOTS)[number]
  | keyof typeof CLOUDINARY_FOLDER_ALIASES;

export const SUPERADMIN_FOLDERS: CloudinaryFolder[] = [
  "sponsors",
  "logo patrocinadores",
];

const ROOT_SET = new Set<string>(CLOUDINARY_FOLDER_ROOTS);

export function resolveCloudinaryRoot(folder: string): string | null {
  const aliased =
    folder in CLOUDINARY_FOLDER_ALIASES
      ? CLOUDINARY_FOLDER_ALIASES[folder as keyof typeof CLOUDINARY_FOLDER_ALIASES]
      : folder;
  return ROOT_SET.has(aliased) ? aliased : null;
}

export function sanitizeCloudinarySubpath(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .split("/")
    .map((part) =>
      part
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    )
    .filter(Boolean)
    .join("/");
}

export function genderFolder(gender: TeamGender) {
  if (gender === "female") return "femenino";
  if (gender === "mixed") return "mixto";
  return "masculino";
}

export function athleteUploadPath(input: {
  universityShort: string;
  sportSlug: string;
  gender: TeamGender;
}) {
  return [
    input.universityShort.toLowerCase(),
    sanitizeCloudinarySubpath(input.sportSlug),
    genderFolder(input.gender),
  ]
    .filter(Boolean)
    .join("/");
}

export function buildCloudinaryFolder(folder: string, path?: string | null) {
  const root = resolveCloudinaryRoot(folder);
  if (!root) return null;
  const sub = sanitizeCloudinarySubpath(path);
  return sub ? `${CLOUDINARY_ROOT}/${root}/${sub}` : `${CLOUDINARY_ROOT}/${root}`;
}
