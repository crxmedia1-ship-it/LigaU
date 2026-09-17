import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MatchDetailView } from "@/components/public/match-detail-view";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Partido",
};

export default async function PartidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catalog = await getPublicCatalog();
  const match = catalog.matches.find((item) => item.id === id);
  if (!match) notFound();

  const events = catalog.events.filter((event) => event.matchId === match.id);
  const mvp = catalog.athletes.find((athlete) => athlete.id === match.mvpAthleteId) ?? null;
  const homeTeam = catalog.teams.find((team) => team.id === match.homeTeamId);
  const awayTeam = catalog.teams.find((team) => team.id === match.awayTeamId);
  const winnerColors =
    match.homeScore !== null &&
    match.awayScore !== null &&
    match.homeScore !== match.awayScore
      ? match.homeScore > match.awayScore
        ? [
            homeTeam?.university.colors.primary ?? "#BA0C2F",
            homeTeam?.university.colors.secondary ?? "#D4AF37",
          ]
        : [
            awayTeam?.university.colors.primary ?? "#BA0C2F",
            awayTeam?.university.colors.secondary ?? "#D4AF37",
          ]
      : [
          homeTeam?.university.colors.primary ?? "#BA0C2F",
          awayTeam?.university.colors.primary ?? "#D4AF37",
        ];

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-10">
      <MatchDetailView
        match={match}
        events={events}
        mvp={mvp}
        winnerColors={winnerColors}
      />
    </main>
  );
}
