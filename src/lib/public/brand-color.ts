const BRAND_PALETTE = [
  "#6D28D9",
  "#EA580C",
  "#0891B2",
  "#059669",
  "#DB2777",
  "#CA8A04",
  "#4F46E5",
  "#0F766E",
  "#9333EA",
  "#B45309",
  "#2563EB",
  "#BE123C",
];

function toHsl(hex: string) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map((char) => char + char).join("") : value;
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(full.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 2;
  const delta = max - min;
  if (!delta) return { hue: 0, sat: 0, light };
  const sat = delta / (1 - Math.abs(2 * light - 1));
  const hue =
    max === r ? 60 * (((g - b) / delta) % 6) : max === g ? 60 * ((b - r) / delta + 2) : 60 * ((r - g) / delta + 4);
  return { hue: (hue + 360) % 360, sat, light };
}

export function normalizeHex(hex: string) {
  const value = hex.replace("#", "").toUpperCase();
  return `#${value.length === 3 ? [...value].map((char) => char + char).join("") : value}`;
}

/** Black, white and greys can't carry a brand tint. */
function isNeutral(hex: string) {
  const { sat, light } = toHsl(hex);
  return sat < 0.25 || light < 0.1 || light > 0.92;
}

function tooClose(a: string, b: string) {
  const x = toHsl(a);
  const y = toHsl(b);
  if (isNeutral(a) || isNeutral(b)) return isNeutral(a) && isNeutral(b);
  const hue = Math.min(Math.abs(x.hue - y.hue), 360 - Math.abs(x.hue - y.hue));
  return hue < 24 && Math.abs(x.light - y.light) < 0.18;
}

/** Most used non-neutral fill in an SVG, or null if the logo is monochrome. */
export function dominantSvgColor(svg: string) {
  const counts = new Map<string, number>();
  for (const match of svg.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
    const hex = normalizeHex(match[0]);
    if (!isNeutral(hex)) counts.set(hex, (counts.get(hex) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export function pickUnusedColor(used: string[]) {
  return (
    BRAND_PALETTE.find((color) => !used.some((taken) => tooClose(color, taken))) ??
    BRAND_PALETTE[used.length % BRAND_PALETTE.length]
  );
}
