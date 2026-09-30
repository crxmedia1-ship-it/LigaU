import Link from "next/link";
import { ArrowUpRight, ChevronRight, MapPin, Play } from "lucide-react";
import { Crest, StatusPill, hasScore, kickoff, matchDay } from "@/components/public/match-ui";
import { Reveal } from "@/components/public/reveal";
import { CourtMark } from "@/components/public/sport-courts";
import { SponsorMark } from "@/components/public/sponsor-slots";
import type { MatchCard, MvpHighlight, NewsCard, SponsorCard } from "@/lib/public/types";

const MEDIA = {
  news: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?auto=format&fit=crop&w=800&q=80",
  broadcast:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
  squad:
    "https://images.unsplash.com/photo-1739694453275-a5326bbb37ea?auto=format&fit=crop&w=800&q=80",
  mvp: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80",
};

function SectionHead({ title, href, action }: { title: string; href: string; action: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="font-jersey text-[1.75rem] leading-none text-zinc-950 uppercase sm:text-4xl">{title}</h2>
      <Link href={href} className="mb-0.5 inline-flex items-center gap-0.5 text-xs font-semibold text-[#C8102E]">
        {action}
        <ChevronRight className="size-3.5" strokeWidth={2.5} />
      </Link>
    </div>
  );
}

/** A native brand slot between sections, labelled as paid placement. */
function BrandSlot({ sponsor }: { sponsor: SponsorCard }) {
  return (
    <Link
      href="/liga-u-pass"
      className="group relative isolate flex items-center gap-4 overflow-hidden rounded-[1.5rem] bg-white p-3.5 pr-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)] ring-1 ring-zinc-200/80 transition-transform duration-300 active:scale-[0.99] sm:p-5"
    >
      <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-100 sm:size-20">
        <SponsorMark sponsor={sponsor} className="max-h-10 max-w-12 sm:max-h-12 sm:max-w-16" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-semibold tracking-[0.22em] whitespace-nowrap text-zinc-400 uppercase">Aliado oficial</p>
        <p className="font-jersey mt-0.5 truncate text-2xl leading-none text-zinc-950 capitalize sm:text-3xl">
          {sponsor.name}
        </p>
        <p className="mt-1 truncate text-xs text-zinc-500">Beneficios exclusivos con tu U Pass</p>
      </div>
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-950 text-white transition-colors group-hover:bg-[#C8102E]">
        <ArrowUpRight className="size-4" strokeWidth={2.25} />
      </span>
    </Link>
  );
}

function SponsoredStory({ sponsor }: { sponsor: SponsorCard }) {
  return (
    <Link
      href="/liga-u-pass"
      className="group relative isolate flex aspect-[3/4] w-[62vw] max-w-[15rem] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[1.5rem] bg-white p-4 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)] ring-1 ring-zinc-200/80 transition-transform duration-300 active:scale-[0.98] md:w-auto md:max-w-none"
    >
      <span className="self-start rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
        Patrocinado
      </span>
      <SponsorMark
        sponsor={sponsor}
        className="mx-auto max-h-20 max-w-[70%] transition-transform duration-500 group-hover:scale-105"
      />
      <div>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-[#C8102E] uppercase">Aliado de la liga</p>
        <h3 className="mt-1 text-base leading-snug font-semibold text-zinc-950 capitalize">{sponsor.name} × Liga U</h3>
      </div>
    </Link>
  );
}

function FeaturedMatch({ match, presenter }: { match: MatchCard | null; presenter?: SponsorCard }) {
  if (!match) {
    return (
      <div className="grid h-56 place-items-center rounded-[1.75rem] bg-white text-sm text-zinc-500 ring-1 ring-zinc-200/80">
        Aún no hay partidos programados
      </div>
    );
  }
  const { clock, period } = kickoff(match.matchDate);
  const team = (label: string, short: string, logo: string | null) => (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <Crest label={short} logo={logo} size="lg" />
      <p className="font-jersey w-full truncate text-2xl leading-none text-zinc-950">{short}</p>
      <p className="w-full truncate text-[11px] text-zinc-500">{label}</p>
    </div>
  );
  return (
    <Link
      href={`/partidos/${match.id}`}
      className="group relative isolate block overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] ring-1 ring-zinc-200/80 transition-transform duration-300 active:scale-[0.99] sm:p-7"
    >
      <CourtMark
        sport={match.sportName}
        className="pointer-events-none absolute inset-4 -z-10 h-[calc(100%-2rem)] w-[calc(100%-2rem)] text-zinc-900/[0.07]"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[11px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
          {match.sportName}
          {match.roundName ? ` · ${match.roundName}` : ""}
        </p>
        <StatusPill match={match} />
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:mt-8">
        {team(match.homeLabel, match.homeShort, match.homeLogoUrl)}
        <div className="text-center">
          {hasScore(match) ? (
            <p className="font-jersey text-6xl leading-none text-zinc-950 tabular-nums">
              {match.homeScore ?? 0}
              <span className="mx-1.5 text-zinc-300">-</span>
              {match.awayScore ?? 0}
            </p>
          ) : (
            <>
              <p className="font-jersey text-5xl leading-none text-zinc-950 tabular-nums">
                {clock}
                <span className="ml-1 text-base text-[#C8102E]">{period}</span>
              </p>
              <p className="mt-1.5 text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
                {matchDay(match.matchDate)}
              </p>
            </>
          )}
        </div>
        {team(match.awayLabel, match.awayShort, match.awayLogoUrl)}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 sm:mt-8">
        <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-zinc-600">
          <MapPin className="size-3.5 shrink-0 text-[#C8102E]" strokeWidth={2.25} />
          <span className="truncate">{match.location?.trim() || "Sede por confirmar"}</span>
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-zinc-950 px-3.5 py-2 text-xs font-semibold text-white transition-colors group-hover:bg-[#C8102E]">
          Detalles
          <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
        </span>
      </div>
      {presenter ? (
        <div className="-mx-5 mt-4 -mb-5 flex items-center justify-center gap-3 border-t border-zinc-100 bg-zinc-50/80 px-5 py-2.5 sm:-mx-7 sm:-mb-7">
          <span className="text-[9px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">Presentado por</span>
          <SponsorMark sponsor={presenter} className="h-6 max-w-20" />
        </div>
      ) : null}
    </Link>
  );
}

function UpcomingList({ matches }: { matches: MatchCard[] }) {
  if (!matches.length) {
    return (
      <p className="rounded-[1.5rem] bg-white px-5 py-6 text-center text-sm text-zinc-500 ring-1 ring-zinc-200/80">
        No hay más partidos en agenda por ahora.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-zinc-100 overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-zinc-200/80">
      {matches.map((m) => {
        const { clock, period } = kickoff(m.matchDate);
        const scored = hasScore(m);
        const side = (short: string, logo: string | null, score: number | null) => (
          <div className="flex items-center gap-2.5">
            <Crest label={short} logo={logo} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">{short}</span>
            {scored ? <span className="font-jersey text-lg leading-none text-zinc-950 tabular-nums">{score ?? 0}</span> : null}
          </div>
        );
        return (
          <li key={m.id}>
            <Link
              href={`/partidos/${m.id}`}
              className="grid grid-cols-[3.75rem_1fr_auto] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-zinc-50 active:bg-zinc-100"
            >
              <div className="text-center">
                <p className="font-jersey text-xl leading-none text-zinc-950 tabular-nums">
                  {clock}
                  <span className="ml-0.5 text-[10px] text-zinc-400">{period}</span>
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">{matchDay(m.matchDate)}</p>
              </div>
              <div className="min-w-0 space-y-2 border-l border-zinc-100 pl-3">
                {side(m.homeShort, m.homeLogoUrl, m.homeScore)}
                {side(m.awayShort, m.awayLogoUrl, m.awayScore)}
              </div>
              <span className="max-w-28 truncate rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-600">
                {m.sportName}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function StoryCard({
  href,
  src,
  kicker,
  title,
  play = false,
}: {
  href: string;
  src: string;
  kicker: string;
  title: string;
  play?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative isolate flex aspect-[3/4] w-[62vw] max-w-[15rem] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-[1.5rem] p-4 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.5)] transition-transform duration-300 active:scale-[0.98] md:w-auto md:max-w-none"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-zinc-800 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${src}')` }}
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
      {play ? (
        <span
          aria-hidden
          className="absolute top-4 left-4 grid size-10 place-items-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md"
        >
          <Play className="size-4 translate-x-px fill-current" />
        </span>
      ) : null}
      <p className="text-[10px] font-semibold tracking-[0.2em] text-[#ff8fa3] uppercase">{kicker}</p>
      <h3 className="mt-1 line-clamp-3 text-base leading-snug font-semibold text-white">{title}</h3>
    </Link>
  );
}

function PassCard() {
  return (
    <Link
      href="/liga-u-pass"
      className="group relative isolate block overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,#E8193C_0%,#B00E2A_55%,#5E0615_100%)] p-5 text-white shadow-[0_28px_60px_-30px_rgba(200,16,46,0.9)] transition-transform duration-300 active:scale-[0.99] sm:p-7"
    >
      <span
        aria-hidden
        className="font-jersey pointer-events-none absolute -right-4 -bottom-24 -z-10 text-[18rem] leading-none text-white/[0.06] select-none"
      >
        U
      </span>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.18)_45%,transparent_60%)] transition-transform duration-1000 group-hover:translate-x-1/3"
      />
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-bold tracking-[0.3em]">LIGA U PASS</p>
        <span aria-hidden className="relative h-8 w-11 rounded-md bg-gradient-to-br from-amber-100 to-amber-300/80 ring-1 ring-black/10">
          <span className="absolute inset-x-1.5 top-1/2 h-px bg-black/20" />
          <span className="absolute inset-y-1.5 left-1/2 w-px bg-black/20" />
        </span>
      </div>
      <h3 className="font-jersey mt-8 text-[2.5rem] leading-[0.9] uppercase sm:text-5xl">Tu carnet de hincha</h3>
      <p className="mt-2 max-w-xs text-sm text-white/80">Descuentos, preventas y sorteos con las marcas aliadas de la liga.</p>
      <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#C8102E] transition-transform duration-300 group-hover:translate-x-0.5">
        Obtener mi pass
        <ArrowUpRight className="size-4" strokeWidth={2.5} />
      </span>
    </Link>
  );
}

export function HomeBento({
  news = [],
  matches,
  mvp,
  sponsors = [],
}: {
  news?: NewsCard[];
  /** Live first, then upcoming by kickoff. */
  matches: MatchCard[];
  mvp: MvpHighlight | null;
  /** The first one presents the hero; the next three fill the slots here. */
  sponsors?: SponsorCard[];
}) {
  const [featuredMatch = null, ...rest] = matches;
  const [, presenter, native, storyBrand] = sponsors;
  const featuredNews = news.find((item) => item.isFeatured) ?? news[0];

  return (
    <section
      id="home-grids"
      className="relative w-full scroll-mt-[calc(3.25rem+env(safe-area-inset-top,0px))] space-y-10 px-4 pb-12 sm:px-6 sm:pt-8 sm:pb-24 lg:space-y-14 lg:px-12 xl:px-20 2xl:px-28"
    >
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
        <Reveal>
          <SectionHead title="Partido destacado" href="/calendario" action="Calendario" />
          <FeaturedMatch match={featuredMatch} presenter={presenter} />
        </Reveal>
        <Reveal delay={0.08}>
          <SectionHead title="Próximos" href="/calendario" action="Ver todos" />
          <UpcomingList matches={rest.slice(0, 4)} />
        </Reveal>
      </div>

      {native ? (
        <Reveal>
          <BrandSlot sponsor={native} />
        </Reveal>
      ) : null}

      <Reveal>
        <SectionHead title="Destacados" href="/multimedia" action="Más" />
        <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:grid md:auto-cols-fr md:grid-flow-col md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
          <StoryCard
            href="/clasificacion"
            src={mvp?.athlete.photoUrl || MEDIA.mvp}
            kicker="MVP de la semana"
            title={mvp?.athlete.fullName ?? "Por anunciar"}
          />
          <StoryCard
            href={featuredNews ? `/noticias/${featuredNews.slug}` : "/multimedia"}
            src={featuredNews?.coverImageUrl || MEDIA.news}
            kicker="Noticias"
            title={featuredNews?.title ?? "La jornada en cancha"}
          />
          {storyBrand ? <SponsoredStory sponsor={storyBrand} /> : null}
          <StoryCard href="/multimedia" src={MEDIA.broadcast} kicker="Multimedia" title="Clips de la jornada" play />
          <StoryCard href="/universidades" src={MEDIA.squad} kicker="Rosters" title="Plantillas de las universidades" />
        </div>
      </Reveal>

      <Reveal>
        <PassCard />
      </Reveal>
    </section>
  );
}
