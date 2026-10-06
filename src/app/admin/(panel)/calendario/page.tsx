import { PartidosBoard } from "@/app/admin/(panel)/partidos/partidos-board";
import { loadMatchBoard } from "@/app/admin/(panel)/partidos/data";

export default async function AdminCalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const [{ sports, teams, athletes, matches, universities }, { nuevo }] = await Promise.all([
    loadMatchBoard(),
    searchParams,
  ]);

  return (
    <PartidosBoard
      view="calendario"
      sports={sports}
      teams={teams}
      athletes={athletes}
      matches={matches}
      universities={universities}
      startNew={nuevo === "1"}
    />
  );
}
