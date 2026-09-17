/**
 * Temporal: migra logos institucionales de Google Drive → Cloudinary
 * y actualiza `universities.logo_url` en Supabase.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/sync_logos.ts
 *
 * Los short names originales (Link 1–8) no coincidían con los archivos.
 * El mapeo de abajo quedó verificado contra el `<title>` / Content-Disposition
 * de Drive. Se omiten mascotas y universidades sin logo en el lote.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

type LogoToSync = {
  universityShortName: string;
  gDriveId: string;
};

const logosToSync: LogoToSync[] = [
  {
    universityShortName: "USM", // Link 1 — Drive: USM.png (no UCAB)
    gDriveId: "1etK_d75Fu6G0KGB7r0BBTxUc2DfEZy4d",
  },
  {
    universityShortName: "USB", // Link 3 — Drive: USB.png
    gDriveId: "1qIq4v-0qHu9x1ee9WvtN4mUU_j8vjMMI",
  },
  {
    universityShortName: "UMA", // Link 4 — Drive: UMA.png
    gDriveId: "1R6V8g4ZzeE4vtypvmuoDJNTVe4yU4DbE",
  },
  {
    universityShortName: "UCV", // Link 5 — Drive: UCV.png
    gDriveId: "14Di70WYoOqAve6tHKM7hpDaUwuNrFL2z",
  },
  {
    universityShortName: "UCAB", // Link 6 — Drive: UCAB.png
    gDriveId: "19QmN7xaa_Qefjkgm3jjuuzSSqiyYO0BH",
  },
  {
    universityShortName: "UNIMET", // Link 8 — Drive: Logo Unimet.jpeg
    gDriveId: "1KWa_wsks-yWWGagSuI4syCmNT-UFwA9Z",
  },
];

/** Archivos del lote que no son logos institucionales. */
const skippedDriveFiles = [
  {
    reason: "mascota, no logo institucional",
    filename: "USM Mascota.png",
    gDriveId: "1xkalm3BTpqITF_Jn16c5mblO66HrffTX",
  },
  {
    reason: "mascota, no logo institucional",
    filename: "UCAB Mascota.png",
    gDriveId: "1ODs_cOa9ZWUtC_CqA2194mG6udq5I7G7",
  },
  {
    reason: "sin archivo en el lote de 8 links",
    filename: null,
    universityShortName: "UAH",
  },
  {
    reason: "sin archivo en el lote de 8 links",
    filename: null,
    universityShortName: "UNE",
  },
];

const KNOWN_SHORT_NAMES = [
  "UCAB",
  "UNIMET",
  "USM",
  "UMA",
  "UAH",
  "USB",
  "UCV",
  "UNE",
] as const;

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const text = readFileSync(envPath, "utf8");

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name} en .env.local`);
  }
  return value;
}

function parseFilename(disposition: string | null): string | null {
  if (!disposition) return null;
  const utf = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf?.[1]) return decodeURIComponent(utf[1]).replace(/["']/g, "");
  const plain = disposition.match(/filename="?([^";]+)"?/i);
  return plain?.[1] ?? null;
}

function universityFromFilename(filename: string): string | null {
  if (/mascota/i.test(filename)) return null;
  const normalized = filename.replace(/\.[^.]+$/, "").toUpperCase();
  if (normalized.includes("UNIMET")) return "UNIMET";
  for (const code of KNOWN_SHORT_NAMES) {
    if (normalized === code || normalized.startsWith(`${code} `)) return code;
  }
  return null;
}

async function downloadDriveFile(gDriveId: string): Promise<{
  buffer: Buffer;
  contentType: string;
  filename: string | null;
}> {
  const url = `https://drive.usercontent.google.com/download?id=${gDriveId}&export=download&confirm=t`;
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Drive HTTP ${response.status} para ${gDriveId}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const filename = parseFilename(response.headers.get("content-disposition"));
  const buffer = Buffer.from(await response.arrayBuffer());

  if (contentType.includes("text/html") || buffer.length < 32) {
    throw new Error(
      `Drive no devolvió una imagen para ${gDriveId} (${contentType}, ${buffer.length} bytes)`,
    );
  }

  return { buffer, contentType, filename };
}

async function main() {
  loadEnvLocal();

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const cloudName = requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  const apiKey = requireEnv("CLOUDINARY_API_KEY");
  const apiSecret = requireEnv("CLOUDINARY_API_SECRET");

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Lote omitido:");
  for (const skipped of skippedDriveFiles) {
    console.log(
      `  - ${skipped.universityShortName ?? skipped.filename}: ${skipped.reason}`,
    );
  }

  const { data: universities, error: listError } = await supabase
    .from("universities")
    .select("id, short_name, logo_url");

  if (listError) {
    throw new Error(`No se pudieron leer universidades: ${listError.message}`);
  }

  const byShort = new Map(
    (universities ?? []).map((row) => [row.short_name, row]),
  );

  for (const item of logosToSync) {
    console.log(`\n→ ${item.universityShortName} (${item.gDriveId})`);

    const downloaded = await downloadDriveFile(item.gDriveId);
    const detected = downloaded.filename
      ? universityFromFilename(downloaded.filename)
      : item.universityShortName;

    if (downloaded.filename) {
      console.log(`  Drive filename: ${downloaded.filename}`);
    }

    if (!detected) {
      console.warn("  SKIP: el archivo parece mascota, no logo institucional.");
      continue;
    }

    if (detected !== item.universityShortName) {
      console.warn(
        `  AVISO: short name declarado=${item.universityShortName}, archivo=${detected}. Se usa ${detected}.`,
      );
    }

    const university = byShort.get(detected);
    if (!university) {
      throw new Error(`No existe universities.short_name="${detected}"`);
    }

    const publicId = detected.toLowerCase();
    const dataUri = `data:${downloaded.contentType};base64,${downloaded.buffer.toString("base64")}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: "ligau/universities",
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
    });

    if (!uploaded.secure_url) {
      throw new Error(`Cloudinary no devolvió secure_url para ${detected}`);
    }

    const { data: updated, error: updateError } = await supabase
      .from("universities")
      .update({ logo_url: uploaded.secure_url })
      .eq("id", university.id)
      .select("id, short_name, logo_url")
      .single();

    if (updateError || !updated) {
      throw new Error(
        `Supabase no actualizó ${detected}: ${updateError?.message ?? "sin fila"}`,
      );
    }

    console.log(`  Cloudinary: ${uploaded.public_id}`);
    console.log(`  logo_url: ${updated.logo_url}`);
  }

  console.log("\nListo.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
