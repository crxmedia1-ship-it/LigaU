import Link from "next/link";
import { HeroParticles } from "@/components/magic/hero-particles";
import { HomeBento } from "@/components/public/home-bento";
import { HeroMediaComponent } from "@/components/public/hero-media";
import { MvpCard } from "@/components/public/mvp-card";
import { ScoreTicker } from "@/components/public/score-ticker";
import { SponsorMarquee } from "@/components/public/sponsor-marquee";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";
import { computeMedalTally } from "@/lib/public/medals";
import { LivePodium } from "@/components/public/medal-podium";
import { JerseyMark, LaserBadge, LaserCta, TitleGlow } from "@/components/public/brand";

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
        <JerseyMark number="U" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:gap-10 sm:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6 sm:gap-8">
            <LaserBadge>Caracas · 8 universidades · 9 deportes</LaserBadge>
            <h1 className="chrome-text max-w-3xl text-3xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              El torneo universitario más <span className="accent-red">intenso</span> de
              la ciudad.
            </h1>
            <p className="max-w-xl text-base text-zinc-400 sm:text-lg">
              Resultados en vivo, fichas de atletas, crónicas y el club de beneficios
              Liga U Pass con canje CarnetX.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <LaserCta href="/competicion">Ver competición</LaserCta>
              <Link
                href="/liga-u-pass"
                className="inline-flex h-11 min-h-11 w-full items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 text-sm font-semibold text-zinc-100 transition-colors duration-150 sm:w-auto"
              >
                Liga U Pass
              </Link>
            </div>
          </div>
          <HeroMediaComponent />
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
