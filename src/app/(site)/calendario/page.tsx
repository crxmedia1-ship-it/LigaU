import type { Metadata } from "next";
import { CalendarView } from "@/components/public/calendar-view";
import { sponsorAt } from "@/components/public/sponsor-slots";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Calendario",
};

export const revalidate = 30;

export default async function CalendarioPage() {
  const [catalog, sponsors] = await Promise.all([getPublicCatalog(), getHomeSponsorLogos()]);
  const matches = [...catalog.matches].sort((a, b) => +new Date(a.matchDate) - +new Date(b.matchDate));
  const feedSponsor = sponsorAt(sponsors, 3);

  return (
    <main className="relative mx-auto max-w-6xl px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-10 md:pt-10">
      <CalendarView
        matches={matches}
        sports={catalog.sports}
        presenter={sponsorAt(sponsors, 1)}
        daySponsor={sponsorAt(sponsors, 2)}
        feedSponsor={feedSponsor}
      />
    </main>
  );
}
