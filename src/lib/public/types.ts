import type { Database, Json } from "@/types/database.types";

export type MatchStatus = Database["public"]["Enums"]["match_status"];
export type TeamGender = Database["public"]["Enums"]["team_gender"];
export type PassStatus = Database["public"]["Enums"]["pass_status"];
export type RedemptionType = Database["public"]["Enums"]["redemption_type"];

export type UniversityColors = {
  primary: string;
  secondary: string;
};

export type UniversityCard = {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
  colors: UniversityColors;
};

export type SportCard = {
  id: string;
  name: string;
  slug: string;
  categoryType: Database["public"]["Enums"]["sport_category"];
};

export type TeamCard = {
  id: string;
  sportId: string;
  universityId: string;
  gender: TeamGender;
  coachName: string | null;
  label: string;
  university: UniversityCard;
};

export type AthleteCard = {
  id: string;
  teamId: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string | null;
  photoUrl: string | null;
  isActive: boolean;
};

export type MatchCard = {
  id: string;
  sportId: string;
  sportName: string;
  sportSlug: string;
  homeTeamId: string;
  awayTeamId: string;
  homeLabel: string;
  awayLabel: string;
  homeUniversityId: string;
  awayUniversityId: string;
  homeShort: string;
  awayShort: string;
  homeLogoUrl: string | null;
  awayLogoUrl: string | null;
  matchDate: string;
  location: string | null;
  roundName: string | null;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  mvpAthleteId: string | null;
  matchDetails: unknown;
};

export type MatchEventCard = {
  id: string;
  matchId: string;
  teamId: string;
  athleteId: string;
  athleteName: string;
  assistAthleteId: string | null;
  assistName: string | null;
  eventType: string;
  value: number;
  detail: string | null;
};

export type NewsCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  coverImageUrl: string | null;
  sportId: string | null;
  universityId: string | null;
  sportName: string | null;
  universityName: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
};

export type PodcastCard = {
  id: string;
  title: string;
  description: string | null;
  episodeNumber: number;
  coverUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  publishedAt: string | null;
};

export type SponsorCard = {
  id: string;
  name: string;
  category: string;
  locationTag: string | null;
  logoUrl: string | null;
};

export type BenefitCard = {
  id: string;
  sponsorId: string;
  sponsorName: string;
  sponsorLogo: string | null;
  sponsorCategory: string;
  locationTag: string | null;
  discountTitle: string;
  status: PassStatus;
  redemptionType: RedemptionType;
  promoCode: string | null;
  instructions: string | null;
  externalUrl: string | null;
  clickCount: number;
};

export type MedalTally = {
  universityId: string;
  universityShort: string;
  universityName: string;
  logoUrl: string | null;
  colors: UniversityColors;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
  points?: number;
};

export type StandingRow = {
  teamId: string;
  universityId: string;
  universityShort: string;
  universityName: string;
  logoUrl: string | null;
  gender: TeamGender;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

export type MvpHighlight = {
  athlete: AthleteCard;
  team: TeamCard;
  sportName: string;
  matchId: string;
  matchLabel: string;
  goals: number;
  points: number;
  cards: number;
  mvpAwards: number;
};

export function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function parseUniversityColors(colors: Json): UniversityColors {
  if (typeof colors === "object" && colors !== null && !Array.isArray(colors)) {
    const primary =
      typeof colors.primary === "string" ? colors.primary : "#D4AF37";
    const secondary =
      typeof colors.secondary === "string" ? colors.secondary : "#BA0C2F";
    return { primary, secondary };
  }
  return { primary: "#D4AF37", secondary: "#BA0C2F" };
}
