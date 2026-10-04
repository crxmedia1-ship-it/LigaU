import type { Metadata } from "next";
import { sponsorAt } from "@/components/public/sponsor-slots";
import { StandingsView } from "@/components/public/standings-view";
import { TabTransition } from "@/components/public/tab-transition";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Clasificación",
};

export default async function ClasificacionPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string | string[]; ano?: string | string[]; valida?: string | string[] }>;
}) {
  const [catalog, sponsors, params] = await Promise.all([getPublicCatalog(), getHomeSponsorLogos(), searchParams]);
  const vista = Array.isArray(params.vista) ? params.vista[0] : params.vista;
  const ano = Number(Array.isArray(params.ano) ? params.ano[0] : params.ano);
  const valida = Array.isArray(params.valida) ? params.valida[0] : params.valida;

  return (
    <TabTransition>
      <main className="relative mx-auto max-w-6xl px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-10 md:pt-10">
        <StandingsView
          sports={catalog.sports}
          matches={catalog.matches}
          teams={catalog.teams}
          athletes={catalog.athletes}
          universities={catalog.universities}
          initialView={vista === "titulos" || vista === "medallero" ? "titulos" : "tablas"}
          initialYear={Number.isFinite(ano) ? ano : null}
          initialRound={valida ?? null}
          presenter={sponsorAt(sponsors, 2)}
          leaderSponsor={sponsorAt(sponsors, 3)}
          feedSponsor={sponsorAt(sponsors, 1)}
        />
      </main>
    </TabTransition>
  );
}
