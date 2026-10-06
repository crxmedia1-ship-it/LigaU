import { createClient } from "@/lib/supabase/server";
import { teamLabel } from "@/lib/admin/labels";
import { PartidosBoard } from "@/app/admin/partidos/partidos-board";
import type {
  AthleteOption,
  MatchRow,
  SportOption,
  TeamOption,
} from "@/app/admin/partidos/types";

function genderFrom(value: string): "male" | "female" | "mixed" {
  if (value === "female" || value === "mixed") return value;
  return "male";
}

export default async function AdminPartidosPage() {
  const supabase = await createClient();
  const [
    { data: sports },
    { data: teams },
    { data: athletes },
    { data: matches },
    { data: events },
  ] = await Promise.all([
    supabase.from("sports").select("id, name, slug").order("name"),
    supabase
      .from("teams")
      .select("id, sport_id, gender, universities(short_name)")
      .order("created_at"),
    supabase
      .from("athletes")
      .select("id, team_id, full_name, jersey_number, is_active")
      .order("full_name"),
    supabase
      .from("matches")
      .select(
        "id, sport_id, home_team_id, away_team_id, match_date, location, round_name, status, home_score, away_score, mvp_athlete_id, match_details, sports(name, slug)",
      )
      .order("match_date", { ascending: false }),
    supabase
      .from("match_events")
      .select("match_id, team_id, athlete_id, assist_athlete_id, event_type, value, detail"),
  ]);

  const teamOptions: TeamOption[] = (teams ?? []).map((team) => {
    const university = Array.isArray(team.universities)
      ? team.universities[0]
      : team.universities;
    const gender = genderFrom(team.gender);
    return {
      id: team.id,
      sportId: team.sport_id,
      gender,
      label: teamLabel(university?.short_name ?? "Equipo", gender),
    };
  });

  const teamById = new Map(teamOptions.map((team) => [team.id, team]));

  const athleteOptions: AthleteOption[] = (athletes ?? []).map((athlete) => ({
    id: athlete.id,
    teamId: athlete.team_id,
    fullName: athlete.full_name,
    jerseyNumber: athlete.jersey_number,
    isActive: athlete.is_active,
  }));

  const eventsByMatch = new Map<string, MatchRow["events"]>();
  for (const event of events ?? []) {
    const list = eventsByMatch.get(event.match_id) ?? [];
    list.push({
      teamId: event.team_id,
      athleteId: event.athlete_id,
      assistAthleteId: event.assist_athlete_id,
      eventType: event.event_type,
      value: event.value,
      detail: event.detail,
    });
    eventsByMatch.set(event.match_id, list);
  }

  const sportOptions: SportOption[] = sports ?? [];

  const matchRows: MatchRow[] = (matches ?? []).map((match) => {
    const sport = Array.isArray(match.sports) ? match.sports[0] : match.sports;
    return {
      id: match.id,
      sportId: match.sport_id,
      sportName: sport?.name ?? "Deporte",
      sportSlug: sport?.slug ?? "",
      homeTeamId: match.home_team_id,
      awayTeamId: match.away_team_id,
      homeLabel: teamById.get(match.home_team_id)?.label ?? "Local",
      awayLabel: teamById.get(match.away_team_id)?.label ?? "Visitante",
      matchDate: match.match_date,
      location: match.location,
      roundName: match.round_name,
      status: match.status,
      homeScore: match.home_score,
      awayScore: match.away_score,
      mvpAthleteId: match.mvp_athlete_id,
      matchDetails: match.match_details,
      events: eventsByMatch.get(match.id) ?? [],
    };
  });

  return (
    <PartidosBoard
      sports={sportOptions}
      teams={teamOptions}
      athletes={athleteOptions}
      matches={matchRows}
    />
  );
}
