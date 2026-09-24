import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/public/brand";
import { SafeLogo } from "@/components/public/safe-logo";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Universidades",
};

export default async function UniversidadesPage() {
  const { universities } = await getPublicCatalog();

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-6 md:py-10">
      <PageHero
        kicker="Rosters oficiales"
        title="Plantillas y atletas"
        mark="08"
        description="Elige un club para ver disciplinas, convocados y fichas individuales."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {universities.map((university) => (
          <article
            key={university.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80"
          >
            <div
              className="h-1.5"
              style={{
                background: `linear-gradient(90deg, ${university.colors.primary}, ${university.colors.secondary})`,
              }}
            />
            <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
              <div className="flex items-center justify-center gap-3">
                <SafeLogo
                  url={university.crestUrl}
                  label={university.shortName}
                  className="h-12 w-12"
                  fallback={false}
                />
                <SafeLogo
                  url={university.mascotUrl}
                  label={university.shortName}
                  className="h-14 w-14"
                  fallback={!university.crestUrl}
                />
              </div>
              <div className="min-w-0 text-center">
                <p className="font-mono text-[11px] tracking-[0.22em] text-zinc-500 uppercase">
                  {university.shortName}
                </p>
                <h2 className="mt-1 text-sm font-semibold text-white">
                  {university.name}
                </h2>
              </div>
              <Link
                href={`/universidades/${university.id}`}
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-xs font-black tracking-[0.16em] text-white uppercase transition-colors hover:border-red-600/70 hover:bg-[#BA0C2F]"
              >
                Ver plantillas
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
