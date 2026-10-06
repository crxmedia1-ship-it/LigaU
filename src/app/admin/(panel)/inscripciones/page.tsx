import { universityLogoUrl } from "@/lib/public/university-marks";
import { createClient } from "@/lib/supabase/server";
import { InscripcionesBoard } from "@/app/admin/(panel)/inscripciones/inscripciones-board";

export default async function AdminInscripcionesPage() {
  const supabase = await createClient();
  const [{ data: universities }, { data: sports }, { data: teams }, { data: athletes }] = await Promise.all([
    supabase.from("universities").select("id, name, short_name").order("short_name"),
    supabase.from("sports").select("id, name, slug").order("name"),
    supabase.from("teams").select("id, university_id, sport_id, gender"),
    supabase.from("athletes").select("team_id"),
  ]);

  const athleteCounts: Record<string, number> = {};
  for (const athlete of athletes ?? []) {
    athleteCounts[athlete.team_id] = (athleteCounts[athlete.team_id] ?? 0) + 1;
  }

  return (
    <InscripcionesBoard
      universities={(universities ?? []).map((university) => ({
        id: university.id,
        name: university.name,
        shortName: university.short_name,
        logoUrl: universityLogoUrl(university.short_name),
      }))}
      sports={sports ?? []}
      teams={(teams ?? []).map((team) => ({
        id: team.id,
        universityId: team.university_id,
        sportId: team.sport_id,
        gender: team.gender,
        athletes: athleteCounts[team.id] ?? 0,
      }))}
    />
  );
}
