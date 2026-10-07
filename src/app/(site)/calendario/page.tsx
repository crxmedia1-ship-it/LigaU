import type { Metadata } from "next";
import { CalendarView } from "@/components/public/calendar-view";
import { getOfficialSponsors } from "@/lib/public/official-sponsors";
import { getPublicCatalog } from "@/lib/public/queries";

export const metadata: Metadata = {
  title: "Calendario",
};

export const revalidate = 30;

export default async function CalendarioPage() {
  const [catalog, { slots }] = await Promise.all([getPublicCatalog(), getOfficialSponsors()]);
  const matches = [...catalog.matches].sort((a, b) => +new Date(a.matchDate) - +new Date(b.matchDate));

  return (
    <main className="relative mx-auto max-w-6xl px-4 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-10 md:pt-10">
      <CalendarView
        matches={matches}
        sports={catalog.sports}
        presenter={slots.calendar_presenter}
        daySponsor={slots.calendar_matchday}
        feedSponsor={slots.calendar_flyer}
      />
    </main>
  );
}
