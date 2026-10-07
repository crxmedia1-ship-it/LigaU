import type { Metadata } from "next";
import { UniversitySelector } from "@/components/universities/university-selector";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Universidades",
};

export const revalidate = 30;

export default async function UniversidadesPage() {
  const { universities, teams, athletes } = await getPublicCatalog();

  const picks = universities.map((university) => {
    const own = teams.filter((team) => team.universityId === university.id);
    const teamIds = new Set(own.map((team) => team.id));
    return {
      ...university,
      sports: new Set(own.map((team) => team.sportId)).size,
      teams: own.length,
      athletes: athletes.filter((athlete) => teamIds.has(athlete.teamId)).length,
    };
  });

  return (
    <main className="relative mx-auto max-w-6xl overflow-x-clip px-4 pt-4 pb-2 md:py-10">
      <UniversitySelector universities={picks} />
    </main>
  );
}
