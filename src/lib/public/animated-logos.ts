/** Sponsors with a custom animated logo in `components/public/animated-sponsor-logo.tsx`, by normalized name. */
const ANIMATED_LOGO_NAMES = {
  cinex: "cinex",
  gatorade: "gatorade",
  minalba: "minalba",
  pan: "pan",
  "p.a.n": "pan",
  "harina pan": "pan",
  pepsi: "pepsi",
  champion: "champion",
  "maltín polar": "maltin",
  "maltin polar": "maltin",
  "maltín": "maltin",
  movistar: "movistar",
} as const;

export type AnimatedLogoKey = (typeof ANIMATED_LOGO_NAMES)[keyof typeof ANIMATED_LOGO_NAMES];

export function animatedLogoKey(name: string): AnimatedLogoKey | null {
  const key = name.trim().toLowerCase();
  return key in ANIMATED_LOGO_NAMES ? ANIMATED_LOGO_NAMES[key as keyof typeof ANIMATED_LOGO_NAMES] : null;
}
