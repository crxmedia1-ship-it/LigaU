import type { Metadata } from "next";
import { CompetitionBoard } from "@/components/public/competition-board";
import { PageHero } from "@/components/public/brand";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Competición",
};

export default async function CompeticionPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const catalog = await getPublicCatalog();
  const params = await searchParams;
  const raw = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const initialTab = raw === "tabla" || raw === "medallero" ? raw : "fixture";

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-6 md:py-10">
      <PageHero
        kicker="Match Center"
        title="Competición"
        mark="09"
        description="Filtra el fixture por disciplina, universidad y fase. La clasificación y el medallero se recalculan con cada partido FINISHED."
      />
      <CompetitionBoard
        key={initialTab}
        initialTab={initialTab}
        sports={catalog.sports}
        universities={catalog.universities}
        teams={catalog.teams}
        matches={catalog.matches}
      />
    </main>
  );
}
