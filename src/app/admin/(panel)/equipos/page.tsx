import { universityLogoUrl } from "@/lib/public/university-marks";
import { createClient } from "@/lib/supabase/server";
import {
  EquiposBoard,
  type AthleteRow,
  type TeamRow,
} from "@/app/admin/(panel)/equipos/equipos-board";

export default async function AdminEquiposPage({
  searchParams,
}: {
  searchParams: Promise<{ equipo?: string }>;
}) {
  const { equipo } = await searchParams;
  const supabase = await createClient();
  const [{ data: universities }, { data: sports }, { data: teams }, { data: athletes }] =
    await Promise.all([
      supabase
        .from("universities")
        .select("id, name, short_name")
        .order("short_name"),
      supabase.from("sports").select("id, name, slug").order("name"),
      supabase
        .from("teams")
        .select("id, university_id, sport_id, gender, coach_name, universities(short_name), sports(name, slug)")
        .order("created_at"),
      supabase
        .from("athletes")
        .select("id, person_id, team_id, full_name, jersey_number, position, photo_url, birth_date, height_cm, dominant_side, is_active")
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
    personId: athlete.person_id,
    teamId: athlete.team_id,
    fullName: athlete.full_name,
    jerseyNumber: athlete.jersey_number,
    position: athlete.position,
    photoUrl: athlete.photo_url,
    birthDate: athlete.birth_date,
    heightCm: athlete.height_cm,
    dominantSide: athlete.dominant_side,
    isActive: athlete.is_active,
  }));

  return (
    <EquiposBoard
      universities={(universities ?? []).map((university) => ({
        id: university.id,
        name: university.name,
        shortName: university.short_name,
        logoUrl: universityLogoUrl(university.short_name),
      }))}
      sports={sports ?? []}
      teams={teamRows}
      athletes={athleteRows}
      initialTeamId={equipo}
    />
  );
}
