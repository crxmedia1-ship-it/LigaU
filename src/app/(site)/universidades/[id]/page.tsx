import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UniversityClubBoard } from "@/components/universities/university-club-board";
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
  const teamIds = new Set(teams.map((team) => team.id));
  const athletes = catalog.athletes.filter((athlete) => teamIds.has(athlete.teamId));

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-6 md:py-10">
      <UniversityClubBoard
        university={university}
        sports={catalog.sports}
        teams={teams}
        athletes={athletes}
        matches={catalog.matches}
        events={catalog.events}
      />
    </main>
  );
}
