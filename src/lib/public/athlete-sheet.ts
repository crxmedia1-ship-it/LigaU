import type { AthleteCard, MatchCard, MatchEventCard, TeamCard } from "@/lib/public/types";

export type AthleteSheet = {
  id: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string | null;
  photoUrl: string | null;
  universityName: string;
  universityShort: string;
  universityPrimary: string;
  sportName: string;
  genderLabel: string;
  ageLabel: string;
  heightLabel: string;
  matchesPlayed: number;
  scoringLabel: string;
  scoringValue: number;
  assists: number;
  mvpAwards: number;
};

/** Age in full years from a calendar date, or null when the birth date is missing. */
function athleteAge(birthDate: string | null, today = new Date()) {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  let age = today.getFullYear() - year;
  const beforeBirthday = today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day);
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

export function formatAthleteAge(birthDate: string | null) {
  const age = athleteAge(birthDate);
  return age == null ? "—" : String(age);
}

export function formatAthleteHeight(heightCm: number | null) {
  if (heightCm == null) return "—";
  return `${(heightCm / 100).toFixed(2).replace(".", ",")} m`;
}

function scoringOf(sportName: string, goals: number, points: number) {
  const name = sportName.toLowerCase();
  if (name.includes("balonc") || name.includes("volei") || name.includes("voley")) {
    return { label: "Puntos", value: points };
  }
  return { label: "Goles", value: goals };
}

const GENDER: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
  mixed: "Mixto",
};

export function buildAthleteSheet(input: {
  athlete: AthleteCard;
  team: TeamCard;
  sportName: string;
  matches: MatchCard[];
  events: MatchEventCard[];
}): AthleteSheet {
  const { athlete, team, sportName, matches, events } = input;
  const ownEvents = events.filter((event) => event.athleteId === athlete.id);
  const goals = ownEvents
    .filter((event) => event.eventType === "goal")
    .reduce((sum, event) => sum + event.value, 0);
  const points = ownEvents
    .filter((event) => event.eventType === "points")
    .reduce((sum, event) => sum + event.value, 0);
  const mvpAwards = matches.filter((match) => match.mvpAthleteId === athlete.id).length;
  const matchesPlayed = matches.filter(
    (match) =>
      match.status === "finished" &&
      (match.homeTeamId === athlete.teamId || match.awayTeamId === athlete.teamId),
  ).length;
  const assists = events.filter((event) => event.assistAthleteId === athlete.id).length;
  const scoring = scoringOf(sportName, goals, points);

  return {
    id: athlete.id,
    fullName: athlete.fullName,
    jerseyNumber: athlete.jerseyNumber,
    position: athlete.position,
    photoUrl: athlete.photoUrl,
    universityName: team.university.name,
    universityShort: team.university.shortName,
    universityPrimary: team.university.colors.primary,
    sportName,
    genderLabel: GENDER[team.gender] ?? team.gender,
    ageLabel: formatAthleteAge(athlete.birthDate),
    heightLabel: formatAthleteHeight(athlete.heightCm),
    matchesPlayed,
    scoringLabel: scoring.label,
    scoringValue: scoring.value,
    assists,
    mvpAwards,
  };
}

export const SPORT_TAB_ORDER = [
  "futbol-campo",
  "futsal",
  "baloncesto",
  "voleibol-cancha",
  "voley-playa",
  "rugby",
  "tenis-campo",
  "tenis-de-mesa",
  "ajedrez",
] as const;
