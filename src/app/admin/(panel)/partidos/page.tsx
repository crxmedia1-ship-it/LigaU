import { redirect } from "next/navigation";
import { PartidosBoard } from "@/app/admin/(panel)/partidos/partidos-board";
import { loadMatchBoard } from "@/app/admin/(panel)/partidos/data";

export default async function AdminPartidosPage({
  searchParams,
}: {
  searchParams: Promise<{ resultado?: string; nuevo?: string }>;
}) {
  const { resultado, nuevo } = await searchParams;
  if (nuevo === "1") redirect("/admin/calendario?nuevo=1");
  const { sports, teams, athletes, matches, universities } = await loadMatchBoard();

  return (
    <PartidosBoard
      view="resultados"
      sports={sports}
      teams={teams}
      athletes={athletes}
      matches={matches}
      universities={universities}
      initialResultId={resultado}
    />
  );
}
