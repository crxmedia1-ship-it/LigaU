import type { Metadata } from "next";
import { offerFor, sponsorAt } from "@/components/public/sponsor-slots";
import { StandingsView, type StandingGroup } from "@/components/public/standings-view";
import { TabTransition } from "@/components/public/tab-transition";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { computeMedalTally } from "@/lib/public/medals";
import { getPublicCatalog } from "@/lib/public/queries";
import { computeStandings } from "@/lib/public/standings";
import type { TeamCard } from "@/lib/public/types";

export const metadata: Metadata = {
  title: "Clasificación",
};

export default async function ClasificacionPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string | string[] }>;
}) {
  const [catalog, sponsors, params] = await Promise.all([getPublicCatalog(), getHomeSponsorLogos(), searchParams]);
  const vista = Array.isArray(params.vista) ? params.vista[0] : params.vista;

  const colorsById = new Map(catalog.universities.map((u) => [u.id, u.colors]));
  const byGroup = new Map<string, TeamCard[]>();
  for (const team of catalog.teams) {
    const key = `${team.sportId}:${team.gender}`;
    byGroup.set(key, [...(byGroup.get(key) ?? []), team]);
  }

  const groups: StandingGroup[] = [...byGroup.entries()]
    .map(([id, teams]) => {
      const ids = new Set(teams.map((team) => team.id));
      const matches = catalog.matches.filter((m) => ids.has(m.homeTeamId) && ids.has(m.awayTeamId));
      const sport = catalog.sports.find((item) => item.id === teams[0].sportId);
      return {
        id,
        sportId: teams[0].sportId,
        gender: teams[0].gender,
        sportName: sport?.name ?? "Deporte",
        genderLabel: GENDER_LABELS[teams[0].gender],
        finished: matches.filter((m) => m.status === "finished" && m.homeScore !== null && m.awayScore !== null).length,
        rows: computeStandings(matches, teams).map((row) => ({
          ...row,
          colors: colorsById.get(row.universityId) ?? { primary: "#C8102E", secondary: "#D4AF37" },
        })),
      };
    })
    .sort((a, b) => b.finished - a.finished || a.sportName.localeCompare(b.sportName));

  const feedSponsor = sponsorAt(sponsors, 1);

  return (
    <TabTransition>
      <main className="relative mx-auto max-w-6xl px-4 pt-5 pb-10 md:pt-10">
        <StandingsView
          sports={catalog.sports}
          groups={groups}
          medals={computeMedalTally(catalog.matches, catalog.teams, catalog.universities)}
          initialView={vista === "medallero" ? "medallero" : "tablas"}
          presenter={sponsorAt(sponsors, 2)}
          leaderSponsor={sponsorAt(sponsors, 3)}
          feedSponsor={feedSponsor}
          feedOffer={feedSponsor ? offerFor(feedSponsor, catalog.benefits) : undefined}
        />
      </main>
    </TabTransition>
  );
}
