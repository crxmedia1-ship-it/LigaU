import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { GlassCard, JerseyMark, PageKicker } from "@/components/public/brand";
import { UniversityCrest } from "@/components/public/university-crest";
import { getSportFormKind } from "@/lib/admin/sport";
import { formatAthleteAge, formatAthleteHeight } from "@/lib/public/athlete-sheet";
import { formatMatchDate, formatScore } from "@/lib/public/format";
import { cloudinaryImage } from "@/lib/public/media";
import { getPublicCatalog } from "@/lib/public/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Atleta",
};

export const revalidate = 30;

export function generateStaticParams() {
  return [];
}

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
  const mvpAwards = catalog.matches.filter((match) => match.mvpAthleteId === athlete.id).length;
  const total = (type: string) =>
    events.filter((event) => event.eventType === type).reduce((sum, event) => sum + event.value, 0);
  const wins = played.filter((match) => {
    const home = match.homeTeamId === athlete.teamId;
    const own = home ? match.homeScore : match.awayScore;
    const rival = home ? match.awayScore : match.homeScore;
    return own != null && rival != null && own > rival;
  }).length;

  const kind = getSportFormKind(sport?.slug ?? "");
  const stats: { label: string; value: number | string }[] =
    kind === "football"
      ? [
          { label: "Partidos", value: played.length },
          { label: "Goles", value: total("goal") },
          { label: "Asistencias", value: catalog.events.filter((event) => event.assistAthleteId === athlete.id).length },
          { label: "MVP", value: mvpAwards },
        ]
      : kind === "basketball"
        ? [
            { label: "Partidos", value: played.length },
            { label: "Puntos", value: total("points") },
            {
              label: "Prom. puntos",
              value: played.length ? (total("points") / played.length).toFixed(1).replace(".", ",") : 0,
            },
            { label: "MVP", value: mvpAwards },
          ]
        : [
            { label: "Partidos", value: played.length },
            { label: "Victorias", value: wins },
            { label: "MVP", value: mvpAwards },
          ];

  return (
    <main className="relative mx-auto max-w-4xl px-4 py-6 md:py-10">
      <GlassCard className="p-6 sm:flex sm:items-center sm:gap-6">
        <JerseyMark number={athlete.jerseyNumber?.toString() ?? "U"} />
        {athlete.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryImage(athlete.photoUrl, 320) ?? athlete.photoUrl}
            alt=""
            className="size-28 object-cover object-top ring-2 ring-brand-gold/50"
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
            {[
              athlete.jerseyNumber ? `#${athlete.jerseyNumber}` : null,
              athlete.position || "Atleta Liga U",
              athlete.birthDate ? `${formatAthleteAge(athlete.birthDate)} años` : null,
              athlete.heightCm != null ? formatAthleteHeight(athlete.heightCm) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {team ? (
            <Link
              href={`/universidades/${team.universityId}`}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-brand-red"
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

      <section className={cn("mt-8 grid gap-3", stats.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
        {stats.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </section>

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

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <GlassCard className="p-4 text-center">
      <p className="chrome-text text-2xl font-black">{value}</p>
      <p className="text-xs uppercase tracking-wide text-brand-silver-dim">{label}</p>
    </GlassCard>
  );
}
