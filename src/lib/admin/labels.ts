export const GENDER_LABELS = {
  male: "Masculino",
  female: "Femenino",
  mixed: "Mixto",
} as const;

export const MATCH_STATUS_LABELS = {
  scheduled: "Programado",
  live: "En vivo",
  finished: "Finalizado",
  postponed: "Aplazado",
  cancelled: "Suspendido",
} as const;

export function teamLabel(
  shortName: string,
  gender: keyof typeof GENDER_LABELS,
) {
  return `${shortName} · ${GENDER_LABELS[gender]}`;
}
