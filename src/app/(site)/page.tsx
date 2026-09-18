import { HeroParticles } from "@/components/magic/hero-particles";
import { HomeBento } from "@/components/public/home-bento";
import { HeroPlayerHero } from "@/components/public/hero-media";
import { SponsorMarquee } from "@/components/public/sponsor-marquee";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";
import { LaserBadge, TitleGlow } from "@/components/public/brand";

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
    <main className="overflow-x-hidden">
      <section className="relative overflow-hidden">
        <HeroParticles />
        <TitleGlow />
        <div className="relative w-full px-4 pt-4 pb-6 sm:px-6 sm:pt-10 sm:pb-8 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:px-12 lg:pt-16 lg:pb-8 xl:px-20 2xl:px-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 mx-auto h-[320px] max-w-lg lg:pointer-events-auto lg:relative lg:inset-auto lg:top-auto lg:order-2 lg:h-[600px] lg:max-w-none xl:h-[660px]">
            <HeroPlayerHero />
          </div>
          <div className="relative z-10 flex flex-col gap-6 pt-[210px] sm:gap-8 lg:order-1 lg:pt-0">
            <LaserBadge>Caracas · 8 universidades · 9 deportes</LaserBadge>
            <h1 className="font-jersey max-w-3xl text-5xl leading-[0.88] font-black tracking-tight wrap-break-word uppercase sm:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-b from-zinc-950 via-zinc-700 to-zinc-600 bg-clip-text text-transparent">
                El{" "}
              </span>
              <span className="text-[#C8102E] drop-shadow-[0_0_24px_rgba(200,16,46,0.35)]">
                epicentro
              </span>
              <span className="bg-gradient-to-b from-zinc-950 via-zinc-700 to-zinc-600 bg-clip-text text-transparent">
                {" "}
                del talento universitario.
              </span>
            </h1>
            <p className="max-w-xl text-base text-zinc-600 sm:text-lg">
              Resultados en vivo, fichas de atletas, noticias y el club de beneficios
              Liga U Pass.
            </p>
          </div>
        </div>
      </section>

      <div className="relative z-10 mt-6 sm:mt-8 md:-mt-12 lg:-mt-16">
        <HomeBento news={catalog.news} nextMatch={nextMatch} mvp={mvp} />
      </div>

      <div className="w-full px-4 pb-8 sm:px-6 lg:px-12 xl:px-20 2xl:px-28">
        <SponsorMarquee sponsors={homeSponsors} />
      </div>
    </main>
  );
}
