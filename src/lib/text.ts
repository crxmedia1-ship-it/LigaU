/** Lowercase, trimmed and without accents, for accent-insensitive matching. */
export function normalizeText(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}
