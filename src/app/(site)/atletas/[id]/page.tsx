import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { GlassCard, JerseyMark, PageKicker } from "@/components/public/brand";
import { UniversityCrest } from "@/components/public/university-crest";
import { formatMatchDate, formatScore } from "@/lib/public/format";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Atleta",
};

export default async function AtletaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catalog = await getPublicCatalog();
  const athlete = catalog.athletes.find((item) => item.id === id);
  if (!athlete) notFound();

  const team = catalog.teams.find((item) => item.id === athlete.teamId);
  const sport = catalog.sports.find((item) => item.id === team?.sportId);
  const events = catalog.events.filter((event) => event.athleteId === athlete.id);
  const played = catalog.matches.filter(
    (match) =>
      (match.homeTeamId === athlete.teamId || match.awayTeamId === athlete.teamId) &&
      match.status === "finished",
  );
  const mvpAwards = catalog.matches.filter((match) => match.mvpAthleteId === athlete.id);
  const goals = events
    .filter((event) => event.eventType === "goal")
    .reduce((sum, event) => sum + event.value, 0);
  const points = events
    .filter((event) => event.eventType === "points")
    .reduce((sum, event) => sum + event.value, 0);
  const assists = catalog.events.filter((event) => event.assistAthleteId === athlete.id).length;

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-10">
      <JerseyMark number={athlete.jerseyNumber?.toString() ?? "U"} />
      <GlassCard className="p-6 sm:flex sm:items-center sm:gap-6">
        {athlete.photoUrl ? (
          <img
            src={athlete.photoUrl}
            alt=""
            className="size-28 object-cover ring-2 ring-brand-gold/50"
          />
        ) : (
          <div className="grid size-28 place-items-center bg-brand-crimson/40 font-jersey text-4xl">
            {athlete.fullName.slice(0, 1)}
          </div>
        )}
        <div className="relative mt-4 sm:mt-0">
          <PageKicker>
            {sport?.name} · {team?.university.shortName}
          </PageKicker>
          <h1 className="chrome-text mt-2 text-3xl font-black">{athlete.fullName}</h1>
          <p className="text-brand-silver-dim">
            {athlete.jerseyNumber ? `#${athlete.jerseyNumber} · ` : ""}
            {athlete.position || "Atleta Liga U"}
          </p>
          {team ? (
            <Link
              href={`/universidades/${team.universityId}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-200 hover:text-white"
            >
              <UniversityCrest
                url={team.university.logoUrl}
                label={team.university.shortName}
                size="sm"
              />
              {team.university.name}
            </Link>
          ) : null}
        </div>
      </GlassCard>

      <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Partidos" value={played.length} />
        <Stat label="Goles" value={goals} />
        <Stat label="Puntos" value={points} />
        <Stat label="MVP" value={mvpAwards.length} />
      </section>
      <p className="mt-3 text-xs text-brand-silver-dim">Asistencias registradas: {assists}</p>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Historial</h2>
        <div className="mt-4 space-y-3">
          {played.length === 0 ? (
            <p className="text-sm text-brand-silver-dim">
              Todavía no hay partidos finalizados para esta plantilla.
            </p>
          ) : (
            played.map((match) => (
              <Link
                key={match.id}
                href={`/partidos/${match.id}`}
                className="glass-card flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="font-medium">
                    {match.homeShort} {formatScore(match.homeScore, match.awayScore, match.status)}{" "}
                    {match.awayShort}
                  </p>
                  <p className="text-xs text-brand-silver-dim">
                    {formatMatchDate(match.matchDate)}
                  </p>
                </div>
                {match.mvpAthleteId === athlete.id ? (
                  <Badge className="bg-brand-gold text-brand-dark">MVP</Badge>
                ) : null}
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <GlassCard className="p-4 text-center">
      <p className="chrome-text text-2xl font-black">{value}</p>
      <p className="text-xs uppercase tracking-wide text-brand-silver-dim">{label}</p>
    </GlassCard>
  );
}
