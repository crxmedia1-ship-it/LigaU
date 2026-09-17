import type { Database } from "@/types/database.types";

export type MatchStatus = Database["public"]["Enums"]["match_status"];

export type TeamOption = {
  id: string;
  sportId: string;
  gender: Database["public"]["Enums"]["team_gender"];
  label: string;
};

export type AthleteOption = {
  id: string;
  teamId: string;
  fullName: string;
  jerseyNumber: number | null;
  isActive: boolean;
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
