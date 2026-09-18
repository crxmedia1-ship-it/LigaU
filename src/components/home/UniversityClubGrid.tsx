import Link from "next/link";
import { SafeLogo } from "@/components/public/safe-logo";
import type { UniversityCard } from "@/lib/public/types";

export function UniversityClubGrid({ universities }: { universities: UniversityCard[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <p className="text-[11px] font-semibold tracking-[0.32em] text-[#BA0C2F] uppercase">
        Instituciones
      </p>
      <h2 className="mt-2 font-jersey text-3xl tracking-wide text-white uppercase sm:text-4xl">
        Clubes participantes
      </h2>
      <div className="-mx-4 mt-5 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0">
        {universities.map((university) => (
          <Link
            key={university.id}
            href={`/universidades/${university.id}`}
            className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 hover:border-red-600/60 transition-all min-w-[11.5rem] snap-start md:min-w-0"
          >
            <span
              className="mb-3 block h-1 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${university.colors.primary}, ${university.colors.secondary})`,
              }}
            />
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
            <p className="mt-3 text-center font-mono text-sm tracking-[0.22em] text-zinc-200 uppercase">
              {university.shortName}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
