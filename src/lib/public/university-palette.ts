import type { UniversityCard } from "@/lib/public/types";

/** `outline` traces mascots that share the card's hue so they don't sink into it. */
export type UniversityPalette = { base: string; glow: string; accent: string; outline?: boolean };

/** Sampled from each mascot/crest so team surfaces match the artwork rather than the admin colors. */
const PALETTES: Record<string, UniversityPalette> = {
  uah: { base: "#2a120b", glow: "#b2401c", accent: "#ed1c1c" },
  ucab: { base: "#011824", glow: "#0a3d56", accent: "#fab620" },
  ucv: { base: "#3a0509", glow: "#b0101a", accent: "#fecc05" },
  uma: { base: "#0a1a07", glow: "#2f4a24", accent: "#8ee05a", outline: true },
  une: { base: "#012a32", glow: "#e6f2ef", accent: "#c3bc71", outline: true },
  unimet: { base: "#0e1a2d", glow: "#2b4a78", accent: "#fe8007" },
  usb: { base: "#121212", glow: "#5a4a12", accent: "#f2b711" },
  usm: { base: "#06265c", glow: "#0c65e4", accent: "#ffffff" },
};

export function universityPalette(university: Pick<UniversityCard, "shortName" | "colors">): UniversityPalette {
  const { primary, secondary } = university.colors;
  return (
    PALETTES[university.shortName.trim().toLowerCase()] ?? {
      base: `color-mix(in srgb, ${primary} 30%, #000)`,
      glow: primary,
      accent: secondary,
    }
  );
}

export function paletteBackground(palette: UniversityPalette, at = "50% 40%") {
  return `radial-gradient(75% 60% at ${at}, ${palette.glow} 0%, color-mix(in srgb, ${palette.glow} 45%, ${palette.base}) 45%, ${palette.base} 100%)`;
}

export const MASCOT_OUTLINE =
  "[filter:drop-shadow(0_0_1.5px_#fff)_drop-shadow(0_0_1.5px_#fff)_drop-shadow(0_24px_30px_rgba(0,0,0,0.5))]";
