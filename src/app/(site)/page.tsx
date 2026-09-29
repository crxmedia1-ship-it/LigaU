import { TacticalPlane } from "@/components/public/tactical-plane";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";

export default async function HomePage() {
  const [catalog, homeSponsors] = await Promise.all([
    getPublicCatalog(),
    getHomeSponsorLogos(),
  ]);
  const mvp = getMvpHighlight(
    catalog.matches,
    catalog.athletes,
    catalog.teams,
    catalog.events,
  );
  const nextMatch =
    [...catalog.matches]
      .filter((match) => match.status === "scheduled")
      .sort((a, b) => +new Date(a.matchDate) - +new Date(b.matchDate))[0] ?? null;

  return (
    <main>
      <TacticalPlane
        news={catalog.news}
        nextMatch={nextMatch}
        mvp={mvp}
        sponsors={homeSponsors}
      />
    </main>
  );
}
