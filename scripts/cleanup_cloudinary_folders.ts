/**
 * Mete los logos institucionales en su universidad, clasifica el búho USB
 * y borra carpetas vacías (no se vuelven a crear placeholders).
 *
 *   npx tsx scripts/cleanup_cloudinary_folders.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";

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

async function putInFolder(
  publicId: string,
  assetFolder: string,
  displayName: string,
  newPublicId?: string,
) {
  let id = publicId;
  if (newPublicId && newPublicId !== publicId) {
    const renamed = await cloudinary.uploader.rename(publicId, newPublicId, {
      overwrite: true,
      invalidate: true,
      resource_type: "image",
    });
    id = renamed.public_id as string;
  }
  await cloudinary.api.update(id, {
    asset_folder: assetFolder,
    display_name: displayName,
  });
  const resource = await cloudinary.api.resource(id);
  console.log(`  ${publicId} → ${assetFolder} (${id})`);
  return resource.secure_url as string;
}

async function destroyIfExists(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
    console.log(`  deleted duplicate ${publicId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`  skip delete ${publicId}: ${message}`);
  }
}

async function deleteFolderIfEmpty(path: string) {
  try {
    await cloudinary.api.delete_folder(path);
    console.log(`  removed empty ${path}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/not empty|not found|doesn't exist/i.test(message)) {
      console.warn(`  skip ${path}: ${message}`);
    }
  }
}

async function listSubfolders(path: string): Promise<string[]> {
  const result = await cloudinary.api.sub_folders(path).catch(() => ({ folders: [] }));
  return (result.folders ?? []).map((folder: { path: string }) => folder.path);
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

  console.log("Moviendo logos institucionales a su universidad...");
  const uneUrl = await putInFolder(
    "Photoroom_20260412_155758",
    "ligau/logo universidad/une",
    "UNE institucional",
    "ligau/logo universidad/une",
  );
  await putInFolder("ligau/universities/ucab", "ligau/logo universidad/ucab", "UCAB institucional");
  await putInFolder("ligau/universities/ucv", "ligau/logo universidad/ucv", "UCV institucional");
  await putInFolder("ligau/universities/uma", "ligau/logo universidad/uma", "UMA institucional");
  await putInFolder("ligau/universities/usb", "ligau/logo universidad/usb", "USB institucional");
  await putInFolder("ligau/universities/usm", "ligau/logo universidad/usm", "USM institucional");
  await destroyIfExists("UAH");
  await destroyIfExists("drilldown");

  console.log("\nBúho USB...");
  const usbOwl = await putInFolder(
    "ligau/logo equipos/_por-clasificar/buho",
    "ligau/logo equipos/usb",
    "USB Búhos",
    "ligau/logo equipos/usb/mascota",
  );

  console.log("\nActualizando logo_url...");
  for (const item of [
    { short: "UNE", url: uneUrl },
    { short: "USB", url: usbOwl },
  ]) {
    const { error } = await supabase
      .from("universities")
      .update({ logo_url: item.url })
      .eq("short_name", item.short);
    if (error) throw new Error(`${item.short}: ${error.message}`);
    console.log(`  ${item.short} → ${item.url}`);
  }

  console.log("\nBorrando carpetas vacías...");
  const jugadorUnis = await listSubfolders("ligau/jugadores");
  for (const uni of jugadorUnis) {
    const sports = await listSubfolders(uni);
    for (const sport of sports) {
      await deleteFolderIfEmpty(sport);
    }
    await deleteFolderIfEmpty(uni);
  }

  for (const path of [
    "ligau/logo equipos/_por-clasificar",
    "ligau/logo equipos/uma",
    "ligau/logo equipos/une",
    "ligau/marca",
  ]) {
    await deleteFolderIfEmpty(path);
  }

  console.log("\nListo.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
