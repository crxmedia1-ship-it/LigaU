import Link from "next/link";
import { HeroParticles } from "@/components/magic/hero-particles";
import { HomeBento } from "@/components/public/home-bento";
import { HeroPlayerHero } from "@/components/public/hero-media";
import { MvpCard } from "@/components/public/mvp-card";
import { ScoreTicker } from "@/components/public/score-ticker";
import { SponsorMarquee } from "@/components/public/sponsor-marquee";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";
import { computeMedalTally } from "@/lib/public/medals";
import { LivePodium } from "@/components/public/medal-podium";
import { LaserBadge, LaserCta, TitleGlow } from "@/components/public/brand";

export default async function HomePage() {
  const catalog = await getPublicCatalog();
  const mvp = getMvpHighlight(
    catalog.matches,
    catalog.athletes,
    catalog.teams,
    catalog.events,
  );
  const tallies = computeMedalTally(
    catalog.matches,
    catalog.teams,
    catalog.universities,
  );

  return (
    <main>
      <section className="relative overflow-hidden">
        <HeroParticles />
        <TitleGlow />
        <div className="relative mx-auto max-w-6xl px-4 pt-4 pb-8 sm:pt-10 sm:pb-14 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8 lg:py-16">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 mx-auto h-[320px] max-w-lg lg:pointer-events-auto lg:relative lg:inset-auto lg:top-auto lg:order-2 lg:h-[540px] lg:max-w-none">
            <HeroPlayerHero />
          </div>
          <div className="relative z-10 flex flex-col gap-6 pt-[210px] sm:gap-8 lg:order-1 lg:pt-0">
            <LaserBadge>Caracas · 8 universidades · 9 deportes</LaserBadge>
            <h1 className="font-jersey max-w-3xl text-5xl leading-[0.88] font-black tracking-tight uppercase sm:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                El torneo universitario más{" "}
              </span>
              <span className="text-[#BA0C2F] drop-shadow-[0_0_28px_rgba(186,12,47,0.65)]">
                intenso
              </span>
              <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                {" "}
                de la ciudad.
              </span>
            </h1>
            <p className="max-w-xl text-base text-zinc-400 sm:text-lg">
              Resultados en vivo, fichas de atletas, crónicas y el club de beneficios
              Liga U Pass con canje CarnetX.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <LaserCta href="/competicion">Ver competición</LaserCta>
              <Link
                href="/liga-u-pass"
                className="inline-flex h-11 min-h-11 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/80 px-5 text-sm font-semibold text-zinc-100 transition-colors duration-150 sm:w-auto"
              >
                Liga U Pass
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ScoreTicker matches={catalog.matches} />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 sm:space-y-6">
          <LivePodium tallies={tallies} universities={catalog.universities} />
          <HomeBento news={catalog.news} sports={catalog.sports} />
        </div>
        <MvpCard mvp={mvp} />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8">
        <SponsorMarquee sponsors={catalog.sponsors} />
      </div>
    </main>
  );
}
