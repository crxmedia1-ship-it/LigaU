import type { Metadata } from "next";
import Link from "next/link";
import { SafeLogo } from "@/components/public/safe-logo";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Universidades",
};

export default async function UniversidadesPage() {
  const { universities } = await getPublicCatalog();

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-6 md:py-10">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {universities.map((university) => (
          <Link
            key={university.id}
            href={`/universidades/${university.id}`}
            aria-label={`Plantilla de ${university.name}`}
            className="group flex min-h-40 flex-col overflow-hidden rounded-[1.6rem] bg-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.4)] ring-1 ring-zinc-200/90 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(15,23,42,0.45)] md:min-h-52"
          >
            <span
              aria-hidden
              className="h-1.5"
              style={{
                background: `linear-gradient(90deg, ${university.colors.primary}, ${university.colors.secondary})`,
              }}
            />
            <span
              className="flex flex-1 flex-col items-center justify-center gap-3 px-3 py-5"
              style={{
                background: `linear-gradient(180deg, color-mix(in srgb, ${university.colors.primary} 14%, white), white 58%)`,
              }}
            >
              <span className="flex h-16 w-full items-center justify-center gap-2 sm:h-20">
                <SafeLogo
                  url={university.crestUrl}
                  label={university.shortName}
                  className="h-12 w-16 sm:h-14 sm:w-24"
                  fallback={false}
                />
                <SafeLogo
                  url={university.mascotUrl}
                  label={university.shortName}
                  className="h-14 w-14 sm:h-16 sm:w-16"
                  fallback={!university.crestUrl}
                />
              </span>
              <span className="text-center">
                <span className="font-jersey block text-2xl leading-none tracking-wide text-zinc-950 md:text-3xl">
                  {university.shortName}
                </span>
                <span className="mt-1.5 block text-[11px] leading-snug text-zinc-500 md:text-xs">
                  {university.name}
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
