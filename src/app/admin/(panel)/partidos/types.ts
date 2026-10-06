import type { Database } from "@/types/database.types";

export type MatchStatus = Database["public"]["Enums"]["match_status"];
export type TeamGender = Database["public"]["Enums"]["team_gender"];

export type UniversityOption = {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
};

export type TeamOption = {
  id: string;
  sportId: string;
  universityId: string;
  gender: TeamGender;
  label: string;
  universityShort: string;
  logoUrl: string | null;
};

export type AthleteOption = {
  id: string;
  teamId: string;
  fullName: string;
  jerseyNumber: number | null;
  isActive: boolean;
  photoUrl: string | null;
  position: string | null;
};

export type MatchRow = {
  id: string;
  sportId: string;
  sportName: string;
  sportSlug: string;
  homeTeamId: string;
  awayTeamId: string;
  homeLabel: string;
  awayLabel: string;
  matchDate: string;
  location: string | null;
  roundName: string | null;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  mvpAthleteId: string | null;
  matchDetails: unknown;
  events: Array<{
    teamId: string;
    athleteId: string;
    assistAthleteId: string | null;
    eventType: string;
    value: number;
    detail: string | null;
  }>;
};

export type SportOption = {
  id: string;
  name: string;
  slug: string;
};
