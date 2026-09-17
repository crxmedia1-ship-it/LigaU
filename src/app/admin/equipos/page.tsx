import { createClient } from "@/lib/supabase/server";
import {
  EquiposBoard,
  type AthleteRow,
  type TeamRow,
} from "@/app/admin/equipos/equipos-board";

export default async function AdminEquiposPage() {
  const supabase = await createClient();
  const [{ data: universities }, { data: sports }, { data: teams }, { data: athletes }] =
    await Promise.all([
      supabase
        .from("universities")
        .select("id, name, short_name, logo_url")
        .order("short_name"),
      supabase.from("sports").select("id, name, slug").order("name"),
      supabase
        .from("teams")
        .select("id, university_id, sport_id, gender, coach_name, universities(short_name), sports(name, slug)")
        .order("created_at"),
      supabase
        .from("athletes")
        .select("id, team_id, full_name, jersey_number, position, photo_url, is_active")
        .order("full_name"),
    ]);

  const teamRows: TeamRow[] = (teams ?? []).map((team) => {
    const university = Array.isArray(team.universities)
      ? team.universities[0]
      : team.universities;
    const sport = Array.isArray(team.sports) ? team.sports[0] : team.sports;
    return {
      id: team.id,
      universityId: team.university_id,
      sportId: team.sport_id,
      gender: team.gender,
      coachName: team.coach_name,
      universityShort: university?.short_name ?? "UNI",
      sportName: sport?.name ?? "Deporte",
      sportSlug: sport?.slug ?? "general",
    };
  });

  const athleteRows: AthleteRow[] = (athletes ?? []).map((athlete) => ({
    id: athlete.id,
    teamId: athlete.team_id,
    fullName: athlete.full_name,
    jerseyNumber: athlete.jersey_number,
    position: athlete.position,
    photoUrl: athlete.photo_url,
    isActive: athlete.is_active,
  }));

  return (
    <EquiposBoard
      universities={(universities ?? []).map((university) => ({
        id: university.id,
        name: university.name,
        shortName: university.short_name,
        logoUrl: university.logo_url,
      }))}
      sports={sports ?? []}
      teams={teamRows}
      athletes={athleteRows}
    />
  );
}
