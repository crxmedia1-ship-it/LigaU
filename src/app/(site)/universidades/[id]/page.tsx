import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { GlassCard, JerseyMark, PageKicker } from "@/components/public/brand";
import { UniversityCrest } from "@/components/public/university-crest";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Universidad",
};

export default async function UniversidadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const catalog = await getPublicCatalog();
  const university = catalog.universities.find((item) => item.id === id);
  if (!university) notFound();

  const teams = catalog.teams.filter((team) => team.universityId === id);

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10">
      <JerseyMark number={university.shortName.slice(0, 3)} />
      <div
        className="overflow-hidden border border-brand-silver/25"
        style={{
          background: `linear-gradient(135deg, ${university.colors.primary} 0%, #09090b 62%)`,
          clipPath:
            "polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px)",
        }}
      >
        <div className="flex items-center gap-4 px-6 py-12">
          <UniversityCrest
            url={university.logoUrl}
            label={university.shortName}
            size="lg"
            className="ring-white/30"
          />
          <div>
            <PageKicker>{university.shortName}</PageKicker>
            <h1 className="chrome-text mt-3 max-w-2xl text-4xl font-black">
              {university.name}
            </h1>
          </div>
        </div>
      </div>

      <section className="mt-10 space-y-8">
        {teams.length === 0 ? (
          <p className="text-sm text-brand-silver-dim">
            Esta casa de estudios todavía no tiene plantillas publicadas.
          </p>
        ) : (
          teams.map((team) => {
            const sport = catalog.sports.find((item) => item.id === team.sportId);
            const roster = catalog.athletes.filter((athlete) => athlete.teamId === team.id);
            return (
              <GlassCard key={team.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {sport?.name} · {GENDER_LABELS[team.gender]}
                    </h2>
                    <p className="text-sm text-brand-silver-dim">
                      Cuerpo técnico: {team.coachName || "Por confirmar"}
                    </p>
                  </div>
                  <Badge variant="outline">{roster.length} atletas</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {roster.map((athlete) => (
                    <Link
                      key={athlete.id}
                      href={`/atletas/${athlete.id}`}
                      className="flex items-center gap-3 border border-brand-silver/15 bg-black/30 p-3"
                    >
                      {athlete.photoUrl ? (
                        <img
                          src={athlete.photoUrl}
                          alt=""
                          className="size-10 object-cover"
                        />
                      ) : (
                        <div className="grid size-10 place-items-center bg-brand-crimson/40 text-xs font-semibold">
                          {athlete.fullName.slice(0, 1)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{athlete.fullName}</p>
                        <p className="text-xs text-brand-silver-dim">
                          {athlete.jerseyNumber ? `#${athlete.jerseyNumber} · ` : ""}
                          {athlete.position || "Roster"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </GlassCard>
            );
          })
        )}
      </section>
    </main>
  );
}
