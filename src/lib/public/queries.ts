import { teamLabel } from "@/lib/admin/labels";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";
import {
  one,
  parseUniversityColors,
  type AthleteCard,
  type BenefitCard,
  type MatchCard,
  type MatchEventCard,
  type MvpHighlight,
  type NewsCard,
  type PodcastCard,
  type SportCard,
  type SponsorCard,
  type TeamCard,
  type UniversityCard,
} from "@/lib/public/types";

type UniversityRow = {
  id: string;
  name: string;
  short_name: string;
  logo_url: string | null;
  colors: unknown;
};

function mapUniversity(row: UniversityRow): UniversityCard {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    logoUrl: row.logo_url,
    colors: parseUniversityColors(row.colors as Json),
  };
}

function mapTeam(
  row: {
    id: string;
    sport_id: string;
    university_id: string;
    gender: TeamCard["gender"];
    coach_name: string | null;
    universities: UniversityRow | UniversityRow[] | null;
  },
): TeamCard | null {
  const university = one(row.universities);
  if (!university) return null;
  const mapped = mapUniversity(university);
  return {
    id: row.id,
    sportId: row.sport_id,
    universityId: row.university_id,
    gender: row.gender,
    coachName: row.coach_name,
    label: teamLabel(mapped.shortName, row.gender),
    university: mapped,
  };
}

function mapMatch(
  match: {
    id: string;
    sport_id: string;
    home_team_id: string;
    away_team_id: string;
    match_date: string;
    location: string | null;
    home_score: number | null;
    away_score: number | null;
    match_details: unknown;
    status: MatchCard["status"];
    mvp_athlete_id: string | null;
    round_name: string | null;
    sports: { id: string; name: string; slug: string } | { id: string; name: string; slug: string }[] | null;
  },
  teamById: Map<string, TeamCard>,
): MatchCard {
  const sport = one(match.sports);
  const home = teamById.get(match.home_team_id);
  const away = teamById.get(match.away_team_id);
  return {
    id: match.id,
    sportId: match.sport_id,
    sportName: sport?.name ?? "Deporte",
    sportSlug: sport?.slug ?? "",
    homeTeamId: match.home_team_id,
    awayTeamId: match.away_team_id,
    homeLabel: home?.label ?? "Local",
    awayLabel: away?.label ?? "Visitante",
    homeUniversityId: home?.universityId ?? "",
    awayUniversityId: away?.universityId ?? "",
    homeShort: home?.university.shortName ?? "LOC",
    awayShort: away?.university.shortName ?? "VIS",
    homeLogoUrl: home?.university.logoUrl ?? null,
    awayLogoUrl: away?.university.logoUrl ?? null,
    matchDate: match.match_date,
    location: match.location,
    roundName: match.round_name,
    status: match.status,
    homeScore: match.home_score,
    awayScore: match.away_score,
    mvpAthleteId: match.mvp_athlete_id,
    matchDetails: match.match_details,
  };
}

function mapNews(item: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  sport_id: string | null;
  university_id: string | null;
  is_featured: boolean;
  published_at: string | null;
  sports: { name: string } | { name: string }[] | null;
  universities: { name: string } | { name: string }[] | null;
}): NewsCard {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    coverImageUrl: item.cover_image_url,
    sportId: item.sport_id,
    universityId: item.university_id,
    sportName: one(item.sports)?.name ?? null,
    universityName: one(item.universities)?.name ?? null,
    isFeatured: item.is_featured,
    publishedAt: item.published_at,
  };
}

export async function getPublicCatalog(options?: { staff?: boolean }) {
  const supabase = await createClient();
  const benefitsSelect =
    "id, sponsor_id, discount_title, status, redemption_type, promo_code, instructions, external_url, click_count, pass_sponsors(name, logo_url, category, location_tag)";
  const benefitsQuery = options?.staff
    ? supabase.from("pass_benefits").select(benefitsSelect).order("created_at", { ascending: false })
    : supabase
        .from("pass_benefits")
        .select(benefitsSelect)
        .eq("status", "active")
        .order("created_at", { ascending: false });
  const [
    universitiesRes,
    sportsRes,
    teamsRes,
    athletesRes,
    matchesRes,
    eventsRes,
    newsRes,
    podcastsRes,
    sponsorsRes,
    benefitsRes,
  ] = await Promise.all([
    supabase.from("universities").select("id, name, short_name, logo_url, colors").order("short_name"),
    supabase.from("sports").select("id, name, slug, category_type").order("name"),
    supabase
      .from("teams")
      .select("id, sport_id, university_id, gender, coach_name, universities(id, name, short_name, logo_url, colors)"),
    supabase
      .from("athletes")
      .select("id, team_id, full_name, jersey_number, position, photo_url, is_active")
      .order("full_name"),
    supabase
      .from("matches")
      .select(
        "id, sport_id, home_team_id, away_team_id, match_date, location, home_score, away_score, match_details, status, mvp_athlete_id, round_name, sports(id, name, slug)",
      )
      .order("match_date", { ascending: false }),
    supabase
      .from("match_events")
      .select(
        "id, match_id, team_id, athlete_id, assist_athlete_id, event_type, value, detail, athletes!match_events_athlete_id_fkey(full_name), assist:athletes!match_events_assist_athlete_id_fkey(full_name)",
      ),
    supabase
      .from("news")
      .select(
        "id, title, slug, excerpt, content, cover_image_url, sport_id, university_id, is_featured, published_at, sports(name), universities(name)",
      )
      .not("published_at", "is", null)
      .order("published_at", { ascending: false }),
    supabase
      .from("podcast_episodes")
      .select("id, title, description, episode_number, cover_url, spotify_url, youtube_url, published_at")
      .order("episode_number", { ascending: false }),
    options?.staff
      ? supabase.from("pass_sponsors").select("id, name, category, location_tag, logo_url").order("name")
      : supabase
          .from("pass_sponsors")
          .select("id, name, category, location_tag, logo_url")
          .eq("is_active", true)
          .order("name"),
    benefitsQuery,
  ]);

  const universities = (universitiesRes.data ?? []).map(mapUniversity);
  const sports: SportCard[] = (sportsRes.data ?? []).map((sport) => ({
    id: sport.id,
    name: sport.name,
    slug: sport.slug,
    categoryType: sport.category_type,
  }));
  const teams = (teamsRes.data ?? [])
    .map(mapTeam)
    .filter((team): team is TeamCard => Boolean(team));
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const athletes: AthleteCard[] = (athletesRes.data ?? []).map((athlete) => ({
    id: athlete.id,
    teamId: athlete.team_id,
    fullName: athlete.full_name,
    jerseyNumber: athlete.jersey_number,
    position: athlete.position,
    photoUrl: athlete.photo_url,
    isActive: athlete.is_active,
  }));
  const matches = (matchesRes.data ?? []).map((match) => mapMatch(match, teamById));
  const events: Array<MatchEventCard & { matchId: string }> = (eventsRes.data ?? []).map((event) => {
    const athlete = one(event.athletes);
    const assist = one(event.assist);
    return {
      id: event.id,
      matchId: event.match_id,
      teamId: event.team_id,
      athleteId: event.athlete_id,
      athleteName: athlete?.full_name ?? "Atleta",
      assistAthleteId: event.assist_athlete_id,
      assistName: assist?.full_name ?? null,
      eventType: event.event_type,
      value: event.value,
      detail: event.detail,
    };
  });
  const news = (newsRes.data ?? []).map(mapNews);
  const podcasts: PodcastCard[] = (podcastsRes.data ?? []).map((episode) => ({
    id: episode.id,
    title: episode.title,
    description: episode.description,
    episodeNumber: episode.episode_number,
    coverUrl: episode.cover_url,
    spotifyUrl: episode.spotify_url,
    youtubeUrl: episode.youtube_url,
    publishedAt: episode.published_at,
  }));
  const sponsors: SponsorCard[] = (sponsorsRes.data ?? []).map((sponsor) => ({
    id: sponsor.id,
    name: sponsor.name,
    category: sponsor.category,
    locationTag: sponsor.location_tag,
    logoUrl: sponsor.logo_url,
  }));
  const benefits: BenefitCard[] = (benefitsRes.data ?? []).map((benefit) => {
    const sponsor = one(benefit.pass_sponsors);
    return {
      id: benefit.id,
      sponsorId: benefit.sponsor_id,
      sponsorName: sponsor?.name ?? "Sponsor",
      sponsorLogo: sponsor?.logo_url ?? null,
      sponsorCategory: sponsor?.category ?? "General",
      locationTag: sponsor?.location_tag ?? null,
      discountTitle: benefit.discount_title,
      status: benefit.status,
      redemptionType: benefit.redemption_type,
      promoCode: benefit.promo_code,
      instructions: benefit.instructions,
      externalUrl: benefit.external_url,
      clickCount: benefit.click_count,
    };
  });

  return {
    universities,
    sports,
    teams,
    athletes,
    matches,
    events,
    news,
    podcasts,
    sponsors,
    benefits,
  };
}

export function getMvpHighlight(
  matches: MatchCard[],
  athletes: AthleteCard[],
  teams: TeamCard[],
  events: MatchEventCard[],
): MvpHighlight | null {
  const withMvp = matches.find(
    (match) => match.status === "finished" && match.mvpAthleteId,
  );
  if (!withMvp?.mvpAthleteId) return null;
  const athlete = athletes.find((item) => item.id === withMvp.mvpAthleteId);
  const team = athlete ? teams.find((item) => item.id === athlete.teamId) : null;
  if (!athlete || !team) return null;

  const athleteEvents = events.filter((event) => event.athleteId === athlete.id);
  return {
    athlete,
    team,
    sportName: withMvp.sportName,
    matchId: withMvp.id,
    matchLabel: `${withMvp.homeShort} vs ${withMvp.awayShort}`,
    goals: athleteEvents
      .filter((event) => event.eventType === "goal")
      .reduce((sum, event) => sum + event.value, 0),
    points: athleteEvents
      .filter((event) => event.eventType === "points")
      .reduce((sum, event) => sum + event.value, 0),
    cards: athleteEvents.filter(
      (event) => event.eventType === "yellow_card" || event.eventType === "red_card",
    ).length,
    mvpAwards: matches.filter((match) => match.mvpAthleteId === athlete.id).length,
  };
}
