export type UniversityKit = {
  name: string;
  front: string;
  back: string;
  /** Dialog backdrop; falls back to the university palette base. */
  stage?: string;
};

const KITS: Record<string, UniversityKit> = {
  ucab: { name: "Retro 2026", front: "/kits/ucab/front.webp?v=3", back: "/kits/ucab/back.webp?v=3" },
  ucv: {
    name: "Antorcha",
    front: "/kits/ucv/front.webp?v=7",
    back: "/kits/ucv/back.webp?v=3",
    stage: "#5a0910",
  },
};

export function universityKit(shortName: string): UniversityKit | null {
  return KITS[shortName.trim().toLowerCase()] ?? null;
}
