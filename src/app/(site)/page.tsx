import { HomeBento } from "@/components/public/home-bento";
import { IntroSplash } from "@/components/public/intro-splash";
import { TabTransition } from "@/components/public/tab-transition";
import { SponsorMarquee } from "@/components/public/sponsor-marquee";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";

const PLAYER_PHOTO =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=70";

const CONTAINER = "mx-auto w-full max-w-[1440px] px-3 sm:px-6 lg:px-10";

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
  const byDate = (a: { matchDate: string }, b: { matchDate: string }) =>
    +new Date(a.matchDate) - +new Date(b.matchDate);
  const upcoming = catalog.matches
    .filter((match) => match.status === "live" || match.status === "scheduled")
    .sort((a, b) => Number(b.status === "live") - Number(a.status === "live") || byDate(a, b));
  const recent = catalog.matches
    .filter((match) => match.status === "finished")
    .sort((a, b) => byDate(b, a));
  const jornada = [...upcoming, ...recent].slice(0, 6);

  const stats = [
    { label: "Universidades", value: catalog.universities.length },
    { label: "Disciplinas", value: catalog.sports.length },
    { label: "Temporada", value: 2026 },
  ];

  return (
    <>
      <IntroSplash />
      <TabTransition>
        <main className="relative overflow-x-clip">
          {/* The public shell is transparent so other pages show the pitch grid. */}
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[#f8fafc]" />

          <section className="relative z-10 mx-auto w-full max-w-[1600px] sm:px-3 sm:pt-2 lg:px-4">
            <div className="relative isolate flex h-[calc(100svh-7.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] max-h-[760px] min-h-[460px] flex-col justify-end overflow-hidden rounded-b-[2rem] bg-zinc-900 px-4 pt-4 pb-5 sm:rounded-[2rem] sm:p-8 md:h-[min(72vh,680px)] lg:rounded-[2.25rem] lg:px-14 lg:pb-12">
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
                className="absolute inset-0 -z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-zinc-950/20 md:bg-gradient-to-r md:from-zinc-950/90 md:via-zinc-950/40 md:to-transparent"
              />

              <h1 className="font-jersey max-w-5xl text-[3.4rem] leading-[0.84] text-white uppercase sm:text-8xl lg:text-[8rem] xl:text-[9rem]">
                El <span className="text-[#ff3b5c]">epicentro</span> del
                talento universitario
              </h1>
              <div className="mt-5 flex flex-col gap-4 md:mt-7 md:flex-row md:items-center md:justify-between">
                <p className="hidden max-w-md text-base text-white/75 md:block">
                  Calendario, resultados, rosters y beneficios de la liga universitaria de Caracas en un solo lugar.
                </p>
                <dl className="grid w-full grid-cols-3 rounded-full bg-white/10 py-2.5 ring-1 ring-white/20 backdrop-blur-xl sm:flex sm:w-auto sm:self-start sm:px-3 md:self-auto">
                  {stats.map(({ label, value }, index) => (
                    <div
                      key={label}
                      className={`flex flex-col items-center gap-1 px-2 sm:flex-row sm:items-baseline sm:gap-2 sm:px-5 ${index ? "border-l border-white/15" : ""}`}
                    >
                      <dd className="font-jersey text-2xl leading-none text-white tabular-nums sm:text-3xl">
                        {value}
                      </dd>
                      <dt className="text-[9px] font-semibold tracking-[0.18em] text-white/65 uppercase sm:text-[10px]">
                        {label}
                      </dt>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          <div className={`relative z-10 mt-8 pb-10 lg:mt-12 ${CONTAINER}`}>
            <HomeBento
              news={catalog.news}
              matches={jornada}
              mvp={mvp}
              podcasts={catalog.podcasts}
              universities={catalog.universities}
              sponsors={homeSponsors}
            />
          </div>

          <div className={`relative z-10 pb-8 ${CONTAINER}`}>
            <SponsorMarquee sponsors={homeSponsors} />
          </div>
        </main>
      </TabTransition>
    </>
  );
}
