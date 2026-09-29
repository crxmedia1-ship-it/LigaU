import { HomeBento } from "@/components/public/home-bento";
import { HeroPlayerHero } from "@/components/public/hero-media";
import { SponsorMarquee } from "@/components/public/sponsor-marquee";
import Link from "next/link";
import { HomeFieldBackdrop, HomePitchLines } from "@/components/public/sport-courts";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";
import { LaserBadge } from "@/components/public/brand";

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
    <main className="relative overflow-x-clip">
      <HomeFieldBackdrop />
      <HomePitchLines />

      <section className="relative z-10">
        <div className="relative z-10 flex w-full flex-col px-4 pt-2 pb-2 max-md:min-h-[calc(100svh-3rem-env(safe-area-inset-top,0px))] max-md:justify-center max-md:gap-2 max-md:pb-[calc(5rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-10 md:block md:pb-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:px-12 lg:pt-16 lg:pb-8 xl:px-20 2xl:px-28">
          <div className="relative mx-auto h-[340px] w-full max-w-sm sm:h-[320px] sm:max-w-lg lg:order-2 lg:h-[600px] lg:max-w-none xl:h-[660px]">
            <div
              aria-hidden
              className="absolute inset-x-4 top-[12%] bottom-[4%] -z-10 bg-[radial-gradient(closest-side,rgba(200,16,46,0.22),transparent)] blur-2xl"
            />
            <HeroPlayerHero />
          </div>
          <div className="relative z-10 flex flex-col gap-4 pt-1 sm:gap-8 sm:pt-0 lg:order-1">
            <LaserBadge>Caracas · 8 universidades · 9 deportes</LaserBadge>
            <h1 className="font-jersey max-w-3xl text-[2.65rem] leading-[0.9] font-black tracking-tight text-zinc-950 wrap-break-word uppercase sm:text-7xl lg:text-8xl">
              El <span className="text-[#C8102E]">epicentro</span> del talento universitario.
            </h1>
            <p className="max-w-xl text-base text-zinc-600 sm:text-lg">
              Resultados en vivo, fichas de atletas, noticias y el club de beneficios Liga U Pass.
            </p>
            <div className="flex gap-2.5 sm:gap-3">
              <Link
                href="/competicion"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#C8102E] px-6 text-sm font-semibold text-white shadow-[0_12px_28px_-12px_rgba(200,16,46,0.9)] transition-transform active:scale-[0.97] sm:flex-none"
              >
                Ver calendario
              </Link>
              <Link
                href="/competicion?tab=tabla"
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200 transition-transform active:scale-[0.97] sm:flex-none"
              >
                Clasificación
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 sm:mt-8 md:-mt-12 lg:-mt-16">
        <HomeBento news={catalog.news} nextMatch={nextMatch} mvp={mvp} />
      </div>

      <div className="relative z-10 w-full px-4 pb-8 sm:px-6 lg:px-12 xl:px-20 2xl:px-28">
        <SponsorMarquee sponsors={homeSponsors} />
      </div>
    </main>
  );
}
