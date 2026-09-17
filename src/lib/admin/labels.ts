export const GENDER_LABELS = {
  male: "Masculino",
  female: "Femenino",
  mixed: "Mixto",
} as const;

export const MATCH_STATUS_LABELS = {
  scheduled: "SCHEDULED",
  live: "LIVE",
  finished: "FINISHED",
  postponed: "POSTPONED",
  cancelled: "CANCELLED",
} as const;

export const PASS_STATUS_LABELS = {
  active: "ACTIVE",
  inactive: "INACTIVE",
  expired: "EXPIRED",
  coming_soon: "COMING_SOON",
  raffle: "RAFFLE",
} as const;

export const REDEMPTION_LABELS = {
  web: "Web",
  physical: "Físico",
  carnetx_scan: "CARNETX_SCAN",
  promo_code: "PROMO_CODE",
  external_link: "EXTERNAL_LINK",
} as const;

export function teamLabel(
  shortName: string,
  gender: keyof typeof GENDER_LABELS,
) {
  return `${shortName} · ${GENDER_LABELS[gender]}`;
}
