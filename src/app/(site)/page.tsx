import { HomeBento } from "@/components/public/home-bento";
import { IntroSplash } from "@/components/public/intro-splash";
import { SponsorMark } from "@/components/public/sponsor-slots";
import { TabTransition } from "@/components/public/tab-transition";
import { SponsorMarquee } from "@/components/public/sponsor-marquee";
import { HomeFieldBackdrop } from "@/components/public/sport-courts";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";

const PLAYER_PHOTO =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=70";

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
  const agenda = catalog.matches
    .filter((match) => match.status === "live" || match.status === "scheduled")
    .sort((a, b) => +new Date(a.matchDate) - +new Date(b.matchDate));

  const titleSponsor = homeSponsors[0];
  const stats = [
    { label: "Universidades", value: catalog.universities.length },
    { label: "Deportes", value: catalog.sports.length },
    { label: "Temporada", value: 2026 },
  ];

  return (
    <>
      <IntroSplash />
      <TabTransition>
        <main className="relative overflow-x-clip">
          <HomeFieldBackdrop />

          <section className="relative z-10 px-2 pt-2 sm:px-4 lg:px-8 lg:pt-4">
            <div className="relative isolate flex h-[calc(100svh-8.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] max-h-[820px] min-h-[500px] flex-col justify-between overflow-hidden rounded-[2rem] bg-zinc-900 p-4 sm:p-6 md:h-[min(78vh,760px)] lg:rounded-[2.5rem] lg:p-10">
              <picture className="absolute inset-0 -z-20">
                <source
                  media="(min-width: 768px)"
                  srcSet={`${PLAYER_PHOTO}&w=1800&h=1100`}
                />
                <img
                  src={`${PLAYER_PHOTO}&w=900&h=1400`}
                  alt="Jugador de Liga U rematando un balón"
                  fetchPriority="high"
                  className="h-full w-full object-cover object-[50%_20%]"
                />
              </picture>
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(9,9,11,0.92)_0%,rgba(9,9,11,0.55)_32%,rgba(9,9,11,0)_58%),linear-gradient(to_bottom,rgba(9,9,11,0.45),rgba(9,9,11,0)_22%)]"
              />
              <div
                aria-hidden
                className="absolute -bottom-24 -left-24 -z-10 size-80 rounded-full bg-[#C8102E]/40 blur-3xl"
              />

              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full whitespace-nowrap bg-white/12 px-3 py-1.5 text-[10px] font-semibold tracking-[0.22em] text-white uppercase ring-1 ring-white/20 backdrop-blur-md">
                  <span className="size-1.5 rounded-full bg-[#ff3b5c]" />
                  Liga oficial
                </span>
                {titleSponsor ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-white py-1 pr-1.5 pl-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.5)]">
                    <span className="text-[9px] font-semibold tracking-[0.2em] text-zinc-400 uppercase">
                      Presenta
                    </span>
                    <SponsorMark
                      sponsor={titleSponsor}
                      className="h-6 max-w-16"
                    />
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold tracking-[0.22em] whitespace-nowrap text-white/75 uppercase">
                    Caracas
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
                <h1 className="font-jersey max-w-3xl text-[3.25rem] leading-[0.86] text-white uppercase sm:text-7xl lg:text-[7.5rem]">
                  El <span className="text-[#ff3b5c]">epicentro</span> del
                  talento universitario
                </h1>
                <dl className="grid shrink-0 grid-cols-3 divide-x divide-white/15 rounded-2xl bg-white/10 py-3 ring-1 ring-white/15 backdrop-blur-md md:w-[26rem]">
                  {stats.map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center gap-1 px-2"
                    >
                      <dd className="font-jersey text-3xl leading-none text-white tabular-nums lg:text-4xl">
                        {value}
                      </dd>
                      <dt className="text-[9px] font-semibold tracking-[0.2em] text-white/60 uppercase lg:text-[10px]">
                        {label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          <div className="relative z-10 mt-8 lg:mt-12">
            <HomeBento
              news={catalog.news}
              matches={agenda}
                mvp={mvp}
              sponsors={homeSponsors}
            />
          </div>

          <div className="relative z-10 w-full px-4 pb-8 sm:px-6 lg:px-12 xl:px-20 2xl:px-28">
            <SponsorMarquee sponsors={homeSponsors} />
          </div>
        </main>
      </TabTransition>
    </>
  );
}
