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
  goals: number;
  points: number;
  mvpAwards: number;
  bio: string;
};

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
  const role = athlete.position || "atleta";
  const dorsal = athlete.jerseyNumber ? ` con el dorsal ${athlete.jerseyNumber}` : "";

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
    goals,
    points,
    mvpAwards,
    bio: `${athlete.fullName} representa a ${team.university.shortName} en ${sportName} (${GENDER[team.gender] ?? team.gender}) como ${role}${dorsal}.`,
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
