import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createElement } from "react";
import { ImageResponse } from "next/og";
import sharp from "sharp";

const LOGO = "public/brand/liga-u-logo.svg";
const LOGO_ASPECT = 868 / 950;
const FONT_URL =
  "https://github.com/google/fonts/raw/main/ofl/bebasneue/BebasNeue-Regular.ttf";

async function logo(height: number) {
  return sharp(await readFile(LOGO), { density: (72 * height) / 950 + 1 })
    .resize({ height })
    .png()
    .toBuffer();
}

function backdrop(width: number, height: number) {
  const stripes = Array.from({ length: Math.ceil((width + height) / 48) }, (_, i) => {
    const x = i * 48 - height;
    return `<line x1="${x}" y1="${height}" x2="${x + height * 0.47}" y2="0"/>`;
  }).join("");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="bg" cx="50%" cy="50%" r="75%">
        <stop offset="0" stop-color="#ffffff"/>
        <stop offset="0.55" stop-color="#f4f5f7"/>
        <stop offset="1" stop-color="#e3e7ec"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <g stroke="#94a3b8" stroke-opacity="0.12" stroke-width="1">${stripes}</g>
  </svg>`);
}

async function withShadow(input: Buffer, blur: number, offsetY: number, opacity: number) {
  const { width = 0, height = 0 } = await sharp(input).metadata();
  const pad = blur * 3;
  const alpha = await sharp(input).extractChannel("alpha").toBuffer();
  const shadow = await sharp({
    create: { width, height, channels: 3, background: { r: 15, g: 23, b: 42 } },
  })
    .joinChannel(alpha)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha(opacity)
    .blur(blur)
    .png()
    .toBuffer();
  const faded = await sharp(shadow)
    .composite([
      {
        input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();
  return sharp(faded)
    .composite([{ input, left: pad, top: pad - offsetY }])
    .png()
    .toBuffer();
}

async function iconOnBackdrop(size: number, logoRatio: number) {
  const h = Math.round(size * logoRatio);
  const w = Math.round(h * LOGO_ASPECT);
  const blur = Math.max(2, Math.round(size / 40));
  const shadowed = await withShadow(await logo(h), blur, Math.round(blur * 0.8), 0.28);
  return sharp(backdrop(size, size))
    .composite([
      {
        input: shadowed,
        left: Math.round((size - w) / 2) - blur * 3,
        top: Math.round((size - h) / 2) - blur * 3 + Math.round(blur * 0.8),
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function ico(images: { size: number; png: Buffer }[]) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(png.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map((i) => i.png)]);
}

async function font() {
  const file = path.join(tmpdir(), "ligau-bebas-neue.ttf");
  try {
    return await readFile(file);
  } catch {
    const res = await fetch(FONT_URL);
    if (!res.ok) throw new Error(`No se pudo descargar la fuente (${res.status})`);
    const data = Buffer.from(await res.arrayBuffer());
    await writeFile(file, data);
    return data;
  }
}

async function text(value: string, width: number, height: number, fontSize: number) {
  const res = new ImageResponse(
    createElement(
      "div",
      {
        style: {
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          color: "#52525b",
          fontFamily: "Bebas Neue",
          fontSize,
          whiteSpace: "nowrap",
          letterSpacing: fontSize * 0.16,
        },
      },
      value,
    ),
    { width, height, fonts: [{ name: "Bebas Neue", data: await font(), weight: 400, style: "normal" }] },
  );
  return Buffer.from(await res.arrayBuffer());
}

async function athlete(name: string, height: number) {
  return sharp(`public/intro/${name}.webp`).resize({ height }).png().toBuffer();
}

async function openGraph() {
  const W = 1200;
  const H = 630;
  const logoH = 380;
  const logoW = Math.round(logoH * LOGO_ASPECT);
  const TW = 720;
  const tagline = await text("TORNEO UNIVERSITARIO · CARACAS 2026", TW, 56, 36);

  const figures: [string, number, number, number][] = [
    ["tenis", 250, 95, 25],
    ["futbol", 200, -15, 225],
    ["rugby", 200, 55, 425],
    ["voleibol", 250, 905, 15],
    ["baloncesto", 270, 1065, 165],
    ["tenis-mesa", 180, 930, 445],
  ];

  const logoShadowed = await withShadow(await logo(logoH), 14, 12, 0.25);
  return sharp(backdrop(W, H))
    .composite([
      ...(await Promise.all(
        figures.map(async ([name, h, left, top]) => {
          const img = await athlete(name, h);
          const { width = 0 } = await sharp(img).metadata();
          const cut = left < 0 ? -left : 0;
          const input = cut
            ? await sharp(img).extract({ left: cut, top: 0, width: width - cut, height: h }).toBuffer()
            : img;
          return { input, left: Math.max(left, 0), top };
        }),
      )),
      { input: logoShadowed, left: Math.round((W - logoW) / 2) - 42, top: 70 - 42 + 12 },
      { input: tagline, left: Math.round((W - TW) / 2), top: 478 },
      {
        input: { create: { width: 72, height: 4, channels: 4, background: "#c8102e" } },
        left: (W - 72) / 2,
        top: 546,
      },
    ])
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();
}

async function main() {
  await mkdir("public/icons", { recursive: true });

  const favicon = await Promise.all(
    [16, 32, 48].map(async (size) => {
      const h = size;
      const w = Math.round(h * LOGO_ASPECT);
      const png = await sharp({
        create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input: await logo(h), left: Math.round((size - w) / 2), top: 0 }])
        .png()
        .toBuffer();
      return { size, png };
    }),
  );
  await writeFile("src/app/favicon.ico", ico(favicon));

  await writeFile("src/app/apple-icon.png", await iconOnBackdrop(180, 0.74));
  await writeFile("public/icons/icon-192.png", await iconOnBackdrop(192, 0.74));
  await writeFile("public/icons/icon-512.png", await iconOnBackdrop(512, 0.74));
  await writeFile("public/icons/icon-maskable-512.png", await iconOnBackdrop(512, 0.58));
  await writeFile("src/app/opengraph-image.jpg", await openGraph());

  console.log("Assets de marca generados");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
