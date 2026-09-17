/**
 * Organiza el Media Library de Cloudinary:
 * - clasifica logos de equipos / universidades / patrocinadores
 * - crea jugadores/{universidad}/{deporte}
 * - actualiza universities.logo_url con mascotas listas para la WebApp
 *
 *   npx tsx --env-file=.env.local scripts/organize_cloudinary.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

type Move = {
  from: string;
  to: string;
  assetFolder: string;
  displayName: string;
};

const MOVES: Move[] = [
  {
    from: "Photoroom_20260406_185846",
    to: "ligau/logo equipos/ucv/mascota",
    assetFolder: "ligau/logo equipos/ucv",
    displayName: "UCV escudo",
  },
  {
    from: "ligau/marca/escudo",
    to: "ligau/logo equipos/ucv/mascota",
    assetFolder: "ligau/logo equipos/ucv",
    displayName: "UCV escudo",
  },
  {
    from: "Photoroom_20260408_140455",
    to: "ligau/logo equipos/uah/mascota",
    assetFolder: "ligau/logo equipos/uah",
    displayName: "UAH Águilas",
  },
  {
    from: "Photoroom_20260408_140514",
    to: "ligau/logo equipos/_por-clasificar/buho",
    assetFolder: "ligau/logo equipos/_por-clasificar",
    displayName: "Búho por clasificar",
  },
  {
    from: "UCAB_Mascota",
    to: "ligau/logo equipos/ucab/mascota",
    assetFolder: "ligau/logo equipos/ucab",
    displayName: "UCAB Lobos",
  },
  {
    from: "Unimet_Mascota",
    to: "ligau/logo equipos/unimet/mascota",
    assetFolder: "ligau/logo equipos/unimet",
    displayName: "UNIMET Cunaguaros",
  },
  {
    from: "USM_Mascota",
    to: "ligau/logo equipos/usm/mascota",
    assetFolder: "ligau/logo equipos/usm",
    displayName: "USM León",
  },
  {
    from: "UAH-2",
    to: "ligau/logo universidad/uah",
    assetFolder: "ligau/logo universidad/uah",
    displayName: "UAH institucional",
  },
  {
    from: "drilldown",
    to: "ligau/logo universidad/unimet",
    assetFolder: "ligau/logo universidad/unimet",
    displayName: "UNIMET institucional",
  },
  {
    from: "PEPSI",
    to: "ligau/logo patrocinadores/pepsi",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "Pepsi",
  },
  {
    from: "MOVISTAR",
    to: "ligau/logo patrocinadores/movistar",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "Movistar",
  },
  {
    from: "GATORADE",
    to: "ligau/logo patrocinadores/gatorade",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "Gatorade",
  },
  {
    from: "CINEX",
    to: "ligau/logo patrocinadores/cinex",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "Cinex",
  },
  {
    from: "CALEDONIA",
    to: "ligau/logo patrocinadores/caledonia",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "Caledonia",
  },
  {
    from: "MARY",
    to: "ligau/logo patrocinadores/mary",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "Mary",
  },
  {
    from: "IMG_2496",
    to: "ligau/logo patrocinadores/new-balance",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "New Balance",
  },
  {
    from: "IMG_2495",
    to: "ligau/logo patrocinadores/mizuno",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "Mizuno",
  },
  {
    from: "Photoroom_20260408_140527",
    to: "ligau/logo patrocinadores/salty",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "Salty",
  },
  {
    from: "Photoroom_20260506_000214",
    to: "ligau/logo patrocinadores/wilson",
    assetFolder: "ligau/logo patrocinadores",
    displayName: "Wilson",
  },
];

const LOGO_URL_UPDATES: Array<{ shortName: string; publicId: string }> = [
  { shortName: "UCAB", publicId: "ligau/logo equipos/ucab/mascota" },
  { shortName: "UNIMET", publicId: "ligau/logo equipos/unimet/mascota" },
  { shortName: "USM", publicId: "ligau/logo equipos/usm/mascota" },
  { shortName: "UAH", publicId: "ligau/logo equipos/uah/mascota" },
  { shortName: "UCV", publicId: "ligau/logo equipos/ucv/mascota" },
  { shortName: "USB", publicId: "ligau/logo equipos/usb/mascota" },
  { shortName: "UNE", publicId: "ligau/logo universidad/une" },
];

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
  if (!value) throw new Error(`Falta ${name} en .env.local`);
  return value;
}

async function moveAsset(move: Move) {
  const renamed = await cloudinary.uploader.rename(move.from, move.to, {
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });
  await cloudinary.api.update(move.to, {
    asset_folder: move.assetFolder,
    display_name: move.displayName,
  });
  console.log(`  ${move.from} → ${renamed.public_id}`);
  return renamed.secure_url as string;
}

async function main() {
  loadEnvLocal();
  cloudinary.config({
    cloud_name: requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
    secure: true,
  });

  const supabase = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  console.log("Clasificando assets existentes...");
  const urls = new Map<string, string>();
  for (const move of MOVES) {
    try {
      const url = await moveAsset(move);
      urls.set(move.to, url);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  SKIP ${move.from}: ${message}`);
    }
  }

  console.log("\nActualizando universities.logo_url...");
  for (const item of LOGO_URL_UPDATES) {
    let url = urls.get(item.publicId);
    if (!url) {
      const resource = await cloudinary.api.resource(item.publicId).catch(() => null);
      url = resource?.secure_url;
    }
    if (!url) {
      console.warn(`  SKIP ${item.shortName}: no hay URL para ${item.publicId}`);
      continue;
    }
    const { error } = await supabase
      .from("universities")
      .update({ logo_url: url })
      .eq("short_name", item.shortName);
    if (error) {
      throw new Error(`${item.shortName}: ${error.message}`);
    }
    console.log(`  ${item.shortName} → ${url}`);
  }

  console.log("\nListo.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
