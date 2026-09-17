import type { Metadata } from "next";
import Link from "next/link";
import { GlassCard, PageHero } from "@/components/public/brand";
import { UniversityCrest } from "@/components/public/university-crest";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Universidades",
};

export default async function UniversidadesPage() {
  const { universities } = await getPublicCatalog();

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10">
      <PageHero kicker="Instituciones" title="Universidades" mark="08" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {universities.map((university) => (
          <Link key={university.id} href={`/universidades/${university.id}`}>
            <GlassCard className="overflow-hidden rounded-2xl">
              <div
                className="h-1.5"
                style={{ backgroundColor: university.colors.primary }}
              />
              <div className="flex items-center gap-3 overflow-hidden p-4 md:p-5">
                <UniversityCrest
                  url={university.logoUrl}
                  label={university.shortName}
                  size="md"
                />
                <div className="min-w-0">
                  <p className="text-sm text-zinc-500 dark:text-[#94a3b8]">
                    {university.shortName}
                  </p>
                  <h2 className="mt-1 font-semibold">{university.name}</h2>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </main>
  );
}
