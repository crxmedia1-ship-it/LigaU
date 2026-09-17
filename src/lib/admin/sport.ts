export type SportFormKind = "football" | "basketball" | "sets" | "chess";

const FOOTBALL_SLUGS = new Set(["futbol-campo", "futsal", "rugby"]);
const BASKETBALL_SLUGS = new Set(["baloncesto"]);
const SET_SLUGS = new Set([
  "voleibol-cancha",
  "voley-playa",
  "tenis-de-mesa",
  "tenis-campo",
]);

export function getSportFormKind(slug: string): SportFormKind {
  if (FOOTBALL_SLUGS.has(slug)) return "football";
  if (BASKETBALL_SLUGS.has(slug)) return "basketball";
  if (SET_SLUGS.has(slug)) return "sets";
  return "chess";
}

export type MatchEventDraft = {
  teamId: string;
  athleteId: string;
  assistAthleteId: string | null;
  eventType: "goal" | "yellow_card" | "red_card" | "points";
  value: number;
  detail: string | null;
};

export type BasketballDetails = {
  kind: "basketball";
  quarters: {
    q1: { home: number; away: number };
    q2: { home: number; away: number };
    q3: { home: number; away: number };
    q4: { home: number; away: number };
  };
};

export type SetsDetails = {
  kind: "sets";
  sets: Array<{ home: number; away: number }>;
};

export type ChessDetails = {
  kind: "chess";
  note?: string;
};

export type MatchDetailsPayload =
  | BasketballDetails
  | SetsDetails
  | ChessDetails
  | { kind: "football" };

export function emptyBasketballDetails(): BasketballDetails {
  return {
    kind: "basketball",
    quarters: {
      q1: { home: 0, away: 0 },
      q2: { home: 0, away: 0 },
      q3: { home: 0, away: 0 },
      q4: { home: 0, away: 0 },
    },
  };
}

export function emptySetsDetails(count = 3): SetsDetails {
  return {
    kind: "sets",
    sets: Array.from({ length: count }, () => ({ home: 0, away: 0 })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scorePair(value: unknown): { home: number; away: number } {
  if (!isRecord(value)) return { home: 0, away: 0 };
  return {
    home: Number(value.home) || 0,
    away: Number(value.away) || 0,
  };
}

export function parseMatchDetails(
  kind: SportFormKind,
  raw: unknown,
): MatchDetailsPayload {
  if (kind === "basketball") {
    const quarters = isRecord(raw) && isRecord(raw.quarters) ? raw.quarters : {};
    return {
      kind: "basketball",
      quarters: {
        q1: scorePair(quarters.q1),
        q2: scorePair(quarters.q2),
        q3: scorePair(quarters.q3),
        q4: scorePair(quarters.q4),
      },
    };
  }
  if (kind === "sets") {
    const sets = isRecord(raw) && Array.isArray(raw.sets) ? raw.sets.map(scorePair) : [];
    return {
      kind: "sets",
      sets: sets.length > 0 ? sets : emptySetsDetails().sets,
    };
  }
  if (kind === "chess") {
    return {
      kind: "chess",
      note: isRecord(raw) && typeof raw.note === "string" ? raw.note : undefined,
    };
  }
  return { kind: "football" };
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toDatetimeLocal(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
