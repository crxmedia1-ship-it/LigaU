import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { teamLabel } from "@/lib/admin/labels";
import { createClient } from "@/lib/supabase/server";
import { cloudinaryLogo } from "@/lib/public/media";
import { parseContact } from "@/lib/public/pass-contact";
import { PUBLIC_CATALOG_TAG } from "@/lib/public/revalidate";
import { applyUniversityMarks, getUniversityMarks } from "@/lib/public/university-marks";
import type { Database, Json } from "@/types/database.types";
import {
  one,
  parseUniversityColors,
  type AthleteCard,
  type BenefitCard,
  type MatchCard,
  type MatchEventCard,
  type NewsCard,
  type PodcastCard,
  type VideoCard,
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

function mapUniversity(
  row: UniversityRow,
  marks: Record<string, { crestUrl: string | null; mascotUrl: string | null }> = {},
): UniversityCard {
  const brand = applyUniversityMarks(row.short_name, row.logo_url, marks);
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    logoUrl: brand.mascotUrl ?? brand.crestUrl,
    crestUrl: brand.crestUrl,
    mascotUrl: brand.mascotUrl,
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
  marks: Record<string, { crestUrl: string | null; mascotUrl: string | null }>,
): TeamCard | null {
  const university = one(row.universities);
  if (!university) return null;
  const mapped = mapUniversity(university, marks);
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
    gender: home?.gender ?? away?.gender ?? null,
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
  };
}

function mapNews(item: {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
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
    coverImageUrl: item.cover_image_url,
    sportId: item.sport_id,
    universityId: item.university_id,
    sportName: one(item.sports)?.name ?? null,
    universityName: one(item.universities)?.name ?? null,
    isFeatured: item.is_featured,
    publishedAt: item.published_at,
  };
}

function createPublicClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function loadCatalog(supabase: SupabaseClient<Database>, staff: boolean) {
  const marks = getUniversityMarks();
  const benefitsSelect =
    "id, sponsor_id, discount_title, status, redemption_type, promo_code, instructions, external_url, click_count, pass_sponsors(name, logo_url, category, location_tag)";
  const benefitsQuery = staff
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
    videosRes,
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
      .select("id, team_id, full_name, jersey_number, position, photo_url, birth_date, height_cm, is_active")
      .order("full_name"),
    supabase
      .from("matches")
      .select(
        "id, sport_id, home_team_id, away_team_id, match_date, location, home_score, away_score, status, mvp_athlete_id, round_name, sports(id, name, slug)",
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
        "id, title, slug, excerpt, cover_image_url, sport_id, university_id, is_featured, published_at, sports(name), universities(name)",
      )
      .not("published_at", "is", null)
      .order("published_at", { ascending: false }),
    supabase
      .from("podcast_episodes")
      .select("id, title, description, episode_number, cover_url, spotify_url, youtube_url, published_at")
      .order("episode_number", { ascending: false }),
    supabase
      .from("media_videos")
      .select("id, title, kind, video_url, thumbnail_url, description, published_at, sports(name)")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(60),
    staff
      ? supabase.from("pass_sponsors").select("id, name, category, location_tag, logo_url").order("name")
      : supabase
          .from("pass_sponsors")
          .select("id, name, category, location_tag, logo_url")
          .eq("is_active", true)
          .order("name"),
    benefitsQuery,
  ]);

  const universities = (universitiesRes.data ?? []).map((row) => mapUniversity(row, marks));
  const sports: SportCard[] = (sportsRes.data ?? []).map((sport) => ({
    id: sport.id,
    name: sport.name,
    slug: sport.slug,
    categoryType: sport.category_type,
  }));
  const teams = (teamsRes.data ?? [])
    .map((row) => mapTeam(row, marks))
    .filter((team): team is TeamCard => Boolean(team));
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const athletes: AthleteCard[] = (athletesRes.data ?? []).map((athlete) => ({
    id: athlete.id,
    teamId: athlete.team_id,
    fullName: athlete.full_name,
    jerseyNumber: athlete.jersey_number,
    position: athlete.position,
    photoUrl: athlete.photo_url,
    birthDate: athlete.birth_date,
    heightCm: athlete.height_cm,
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
  const videos: VideoCard[] = (videosRes.data ?? []).map((video) => ({
    id: video.id,
    title: video.title,
    kind: video.kind,
    videoUrl: video.video_url,
    thumbnailUrl: video.thumbnail_url,
    sportName: one(video.sports)?.name ?? null,
    description: video.description,
    publishedAt: video.published_at,
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
      sponsorLogo: cloudinaryLogo(sponsor?.logo_url, 240),
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
    videos,
    sponsors,
    benefits,
  };
}

const CACHE_OPTIONS = { revalidate: 30, tags: [PUBLIC_CATALOG_TAG] };

const getCachedPublicCatalog = unstable_cache(
  () => loadCatalog(createPublicClient(), false),
  ["public-catalog"],
  CACHE_OPTIONS,
);

export async function getPublicCatalog(options?: { staff?: boolean }) {
  if (options?.staff) return loadCatalog(await createClient(), true);
  return getCachedPublicCatalog();
}

/** Set scores and other per-sport detail; only the match page reads them. */
export const getMatchDetails = unstable_cache(
  async (matchId: string) => {
    const { data } = await createPublicClient()
      .from("matches")
      .select("match_details")
      .eq("id", matchId)
      .maybeSingle();
    return data?.match_details ?? null;
  },
  ["match-details"],
  CACHE_OPTIONS,
);

/** Full article body, kept out of the catalog so list pages don't carry every story. */
export const getNewsContent = unstable_cache(
  async (newsId: string) => {
    const { data } = await createPublicClient().from("news").select("content").eq("id", newsId).maybeSingle();
    return data?.content ?? null;
  },
  ["news-content"],
  CACHE_OPTIONS,
);

/** Member-facing benefit list for /upass: everything a pass holder can use or is about to get. */
export const getMemberBenefits = unstable_cache(
  async (): Promise<BenefitCard[]> => {
    const { data } = await createPublicClient()
      .from("pass_benefits")
      .select(
        "id, sponsor_id, discount_title, status, redemption_type, promo_code, instructions, external_url, click_count, pass_sponsors!inner(name, logo_url, category, location_tag, is_active, contact, brand_color)",
      )
      .in("status", ["active", "coming_soon", "raffle"])
      .eq("pass_sponsors.is_active", true)
      .order("created_at", { ascending: false });
    return (data ?? []).map((benefit) => {
      const sponsor = one(benefit.pass_sponsors);
      return {
        id: benefit.id,
        sponsorId: benefit.sponsor_id,
        sponsorName: sponsor?.name ?? "Sponsor",
        sponsorLogo: cloudinaryLogo(sponsor?.logo_url, 240),
        sponsorCategory: sponsor?.category ?? "General",
        sponsorContact: parseContact(sponsor?.contact),
        sponsorColor: sponsor?.brand_color ?? null,
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
  },
  ["member-benefits"],
  CACHE_OPTIONS,
);
