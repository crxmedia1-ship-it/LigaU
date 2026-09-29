import type { Metadata } from "next";
import { CalendarView } from "@/components/public/calendar-view";
import { offerFor, sponsorAt } from "@/components/public/sponsor-slots";
import { TabTransition } from "@/components/public/tab-transition";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Calendario",
};

export default async function CalendarioPage() {
  const [catalog, sponsors] = await Promise.all([getPublicCatalog(), getHomeSponsorLogos()]);
  const matches = [...catalog.matches].sort((a, b) => +new Date(a.matchDate) - +new Date(b.matchDate));
  const feedSponsor = sponsorAt(sponsors, 3);

  return (
    <TabTransition>
      <main className="relative mx-auto max-w-6xl px-4 pt-5 pb-10 md:pt-10">
        <CalendarView
          matches={matches}
          sports={catalog.sports}
          presenter={sponsorAt(sponsors, 1)}
          daySponsor={sponsorAt(sponsors, 2)}
          feedSponsor={feedSponsor}
          feedOffer={feedSponsor ? offerFor(feedSponsor, catalog.benefits) : undefined}
        />
      </main>
    </TabTransition>
  );
}
