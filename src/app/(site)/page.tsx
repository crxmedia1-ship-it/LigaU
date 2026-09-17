import { HeroParticles } from "@/components/magic/hero-particles";
import { HomeBento } from "@/components/public/home-bento";
import { HeroPlayerHero } from "@/components/public/hero-media";
import { MvpCard } from "@/components/public/mvp-card";
import { ScoreTicker } from "@/components/public/score-ticker";
import { SponsorMarquee } from "@/components/public/sponsor-marquee";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";
import { computePodiumBoards } from "@/lib/public/medals";
import { LivePodium } from "@/components/public/medal-podium";
import { LaserBadge, TitleGlow } from "@/components/public/brand";

export default async function HomePage() {
  const catalog = await getPublicCatalog();
  const mvp = getMvpHighlight(
    catalog.matches,
    catalog.athletes,
    catalog.teams,
    catalog.events,
  );
  const boards = computePodiumBoards(
    catalog.matches,
    catalog.teams,
    catalog.universities,
    catalog.sports,
  );
  const nextMatch =
    catalog.matches.find((match) => match.status === "live") ??
    [...catalog.matches]
      .filter((match) => match.status === "scheduled")
      .sort((a, b) => +new Date(a.matchDate) - +new Date(b.matchDate))[0] ??
    null;
  const weeklyBenefit = catalog.benefits[0] ?? null;

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
                El{" "}
              </span>
              <span className="text-[#C8102E] drop-shadow-[0_0_28px_rgba(200,16,46,0.65)]">
                epicentro
              </span>
              <span className="bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                {" "}
                del talento universitario.
              </span>
            </h1>
            <p className="max-w-xl text-base text-zinc-400 sm:text-lg">
              Resultados en vivo, fichas de atletas, noticias y el club de beneficios
              Liga U Pass.
            </p>
          </div>
        </div>
      </section>

      <ScoreTicker matches={catalog.matches} />

      <div className="mx-auto grid max-w-6xl items-stretch gap-6 px-4 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <LivePodium boards={boards} universities={catalog.universities} />
        <MvpCard mvp={mvp} />
      </div>

      <div className="py-2 sm:py-4">
        <HomeBento
          news={catalog.news}
          nextMatch={nextMatch}
          weeklyBenefit={weeklyBenefit}
          featuredSponsor={catalog.sponsors[0] ?? null}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8">
        <SponsorMarquee sponsors={catalog.sponsors} />
      </div>
    </main>
  );
}
