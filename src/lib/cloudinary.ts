"use server";

import { createHash } from "node:crypto";
import { isStaffRole, isSuperadmin, type UserRole } from "@/lib/auth/roles";
import {
  SUPERADMIN_FOLDERS,
  buildCloudinaryFolder,
  resolveCloudinaryRoot,
  type CloudinaryFolder,
} from "@/lib/cloudinary-paths";
import { createClient } from "@/lib/supabase/server";

export type { CloudinaryFolder };

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type SignedUploadParams = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
};

export type CloudinaryUploadSuccess = {
  ok: true;
  url: string;
  secureUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  folder: string;
};

export type CloudinaryUploadFailure = {
  ok: false;
  error: string;
};

export type CloudinaryUploadResult =
  | CloudinaryUploadSuccess
  | CloudinaryUploadFailure;

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY o CLOUDINARY_API_SECRET",
    );
  }

  return { cloudName, apiKey, apiSecret };
}

function signUploadParams(
  params: Record<string, string | number>,
  apiSecret: string,
) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

async function requireStaffRole(): Promise<
  { ok: true; role: UserRole } | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;

  if (!userId) {
    return { ok: false, error: "Debes iniciar sesión para subir archivos." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || !isStaffRole(profile.role)) {
    return { ok: false, error: "No tienes permisos para subir archivos." };
  }

  return { ok: true, role: profile.role };
}

export async function createSignedUploadParams(input: {
  folder: CloudinaryFolder;
  path?: string | null;
  publicId?: string;
}): Promise<SignedUploadParams> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const folder = buildCloudinaryFolder(input.folder, input.path);
  if (!folder) {
    throw new Error("Carpeta de Cloudinary no permitida.");
  }
  const paramsToSign: Record<string, string | number> = { folder, timestamp };

  if (input.publicId) {
    paramsToSign.public_id = input.publicId;
  }

  return {
    timestamp,
    signature: signUploadParams(paramsToSign, apiSecret),
    apiKey,
    cloudName,
    folder,
  };
}

export async function uploadImageAction(
  formData: FormData,
): Promise<CloudinaryUploadResult> {
  const staff = await requireStaffRole();
  if (!staff.ok) {
    return staff;
  }

  const folderValue = String(formData.get("folder") ?? "");
  const pathValue = String(formData.get("path") ?? "");
  if (!resolveCloudinaryRoot(folderValue)) {
    return { ok: false, error: "Carpeta de Cloudinary no permitida." };
  }

  if (
    SUPERADMIN_FOLDERS.includes(folderValue as CloudinaryFolder) &&
    !isSuperadmin(staff.role)
  ) {
    return {
      ok: false,
      error: "Solo Superadmin puede subir assets del Hub Comercial.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Selecciona una imagen válida." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "La imagen no puede superar 8 MB." };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      ok: false,
      error: "Formato no permitido. Usa JPG, PNG, WEBP o GIF.",
    };
  }

  const signed = await createSignedUploadParams({
    folder: folderValue as CloudinaryFolder,
    path: pathValue,
  });
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signed.apiKey);
  body.append("timestamp", String(signed.timestamp));
  body.append("folder", signed.folder);
  body.append("signature", signed.signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`,
    { method: "POST", body },
  );

  const payload = (await response.json()) as {
    error?: { message?: string };
    secure_url?: string;
    url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
  };

  if (!response.ok || !payload.secure_url || !payload.public_id) {
    return {
      ok: false,
      error: payload.error?.message ?? "Cloudinary rechazó la subida.",
    };
  }

  return {
    ok: true,
    url: payload.url ?? payload.secure_url,
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    width: payload.width ?? 0,
    height: payload.height ?? 0,
    format: payload.format ?? "jpg",
    folder: signed.folder,
  };
}
