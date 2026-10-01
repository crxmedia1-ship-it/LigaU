import Link from "next/link";
import { ArrowRight, ArrowUpRight, Gift, MapPin, Percent, Play, Ticket, Trophy } from "lucide-react";
import { Crest, StatusPill, hasScore, kickoff, matchDay } from "@/components/public/match-ui";
import { SponsorMark } from "@/components/public/sponsor-slots";
import type {
  MatchCard,
  MvpHighlight,
  NewsCard,
  PodcastCard,
  SponsorCard,
  UniversityCard,
} from "@/lib/public/types";
import { cn } from "@/lib/utils";

const MEDIA = {
  news: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?auto=format&fit=crop&w=1400&q=75",
  broadcast:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=75",
  mvp: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1000&q=75",
};

const SURFACE = "rounded-3xl border border-zinc-200 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.45)]";

/** Bleeds to the screen edge so cards slide under the gutter instead of clipping at it. */
const RAIL =
  "no-scrollbar -mx-3 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-3 px-3 py-2 sm:-mx-6 sm:scroll-px-6 sm:px-6";

const TICKER_CARD = "h-[320px] w-[280px] shrink-0 snap-start md:h-[340px] md:w-[340px]";

const FALLBACK_COLOR = "#C8102E";

function SectionHead({ kicker, title, href, action }: { kicker: string; title: string; href?: string; action?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] text-[#C8102E] uppercase sm:text-[11px]">
          <span aria-hidden className="h-0.5 w-6 rounded-full bg-[#C8102E]" />
          {kicker}
        </p>
        <h2 className="font-jersey mt-1.5 text-4xl leading-[0.9] text-zinc-950 uppercase sm:text-5xl">{title}</h2>
      </div>
      {href && action ? (
        <Link
          href={href}
          className="group mb-1 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-zinc-600 transition-colors hover:text-[#C8102E] sm:text-sm"
        >
          {action}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
        </Link>
      ) : null}
    </div>
  );
}

function MatchTile({ match, colorOf }: { match: MatchCard; colorOf: (universityId: string) => string }) {
  const { clock, period } = kickoff(match.matchDate);
  const scored = hasScore(match);
  const side = (short: string, label: string, logo: string | null, score: number | null) => (
    <div className="flex items-center gap-3">
      <Crest label={short} logo={logo} size="lg" className="size-14 border border-zinc-100 ring-0" />
      <div className="min-w-0 flex-1">
        <p className="font-jersey truncate text-3xl leading-none text-zinc-950">{short}</p>
        <p className="mt-0.5 truncate text-[11px] text-zinc-500">{label}</p>
      </div>
      {scored ? (
        <span className="font-jersey text-4xl leading-none text-zinc-950 tabular-nums">{score ?? 0}</span>
      ) : null}
    </div>
  );
  return (
    <Link
      href={`/partidos/${match.id}`}
      className={cn(SURFACE, TICKER_CARD, "group relative flex flex-col overflow-hidden transition-transform active:scale-[0.98]")}
    >
      <span
        aria-hidden
        className="h-1.5 shrink-0"
        style={{
          background: `linear-gradient(90deg, ${colorOf(match.homeUniversityId)} 0 50%, ${colorOf(match.awayUniversityId)} 50% 100%)`,
        }}
      />
      <div className="flex items-center justify-between gap-2 px-5 pt-4">
        <p className="truncate text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
          {match.sportName}
          {match.roundName ? ` · ${match.roundName}` : ""}
        </p>
        <StatusPill match={match} />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-4 px-5">
        {side(match.homeShort, match.homeLabel, match.homeLogoUrl, match.homeScore)}
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-zinc-100" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-300">VS</span>
          <span className="h-px flex-1 bg-zinc-100" />
        </div>
        {side(match.awayShort, match.awayLabel, match.awayLogoUrl, match.awayScore)}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-zinc-100 bg-zinc-50/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-zinc-900">
            {matchDay(match.matchDate)} · {clock}
            <span className="text-[#C8102E]"> {period}</span>
          </p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-zinc-500">
            <MapPin className="size-3 shrink-0 text-[#C8102E]" strokeWidth={2.5} />
            <span className="truncate">{match.location?.trim() || "Sede por confirmar"}</span>
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-950 text-white transition-colors group-hover:bg-[#C8102E]">
          <ArrowUpRight className="size-4" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}

function MvpTile({ mvp }: { mvp: MvpHighlight | null }) {
  const stats = mvp
    ? [
        { label: "Goles", value: mvp.goals },
        { label: "Puntos", value: mvp.points },
        { label: "MVPs", value: mvp.mvpAwards },
      ]
    : null;
  return (
    <Link
      href={mvp ? `/atletas/${mvp.athlete.id}` : "/clasificacion"}
      className={cn(
        TICKER_CARD,
        "group relative isolate flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-300/60 bg-zinc-900 p-5 text-white transition-transform active:scale-[0.98]",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mvp?.athlete.photoUrl || MEDIA.mvp}
        alt=""
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-zinc-950 uppercase">
          <Trophy className="size-3.5" strokeWidth={2.5} />
          MVP de la semana
        </span>
        {mvp?.athlete.jerseyNumber != null ? (
          <span className="font-jersey text-5xl leading-none text-white/85">#{mvp.athlete.jerseyNumber}</span>
        ) : null}
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-[0.22em] text-amber-300 uppercase">
          {mvp ? `${mvp.sportName} · ${mvp.team.university.shortName}` : "Próxima jornada"}
        </p>
        <h3 className="font-jersey mt-1 text-4xl leading-[0.9] uppercase">{mvp?.athlete.fullName ?? "Por anunciar"}</h3>
        {stats ? (
          <dl className="mt-3 grid grid-cols-3 divide-x divide-white/15 rounded-2xl bg-white/10 py-2 ring-1 ring-white/15 backdrop-blur-md">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dd className="font-jersey text-2xl leading-none tabular-nums">{stat.value}</dd>
                <dt className="mt-0.5 text-[9px] font-semibold tracking-[0.18em] text-white/60 uppercase">{stat.label}</dt>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-2 text-sm text-white/75">El mejor jugador de la fecha aparece aquí al cerrar los partidos.</p>
        )}
      </div>
    </Link>
  );
}

function CalendarTile() {
  return (
    <Link
      href="/calendario"
      className={cn(
        TICKER_CARD,
        "group flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-zinc-300 bg-white/60 text-center transition-colors hover:border-[#C8102E] hover:bg-white",
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-[#C8102E] text-white transition-transform group-hover:scale-110">
        <ArrowRight className="size-6" strokeWidth={2.25} />
      </span>
      <span className="font-jersey text-3xl leading-none text-zinc-950 uppercase">Calendario completo</span>
      <span className="text-xs text-zinc-500">Todos los partidos de la temporada</span>
    </Link>
  );
}

function ClubStrip({ universities }: { universities: UniversityCard[] }) {
  return (
    <ul className={cn(RAIL, "lg:mx-0 lg:overflow-visible lg:px-0")}>
      {universities.map((university) => (
        <li key={university.id} className="w-[108px] shrink-0 snap-start sm:w-[124px] lg:w-auto lg:flex-1">
          <Link
            href={`/universidades/${university.id}`}
            className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white px-2 pt-4 pb-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-[0_14px_30px_-20px_rgba(15,23,42,0.5)] active:scale-95"
          >
            {university.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={university.logoUrl}
                alt=""
                className="size-14 object-contain transition-transform duration-200 group-hover:scale-110 sm:size-16"
              />
            ) : (
              <span className="font-jersey grid size-14 place-items-center text-xl text-zinc-400 sm:size-16">
                {university.shortName.slice(0, 3)}
              </span>
            )}
            <span className="font-jersey text-xl leading-none text-zinc-950">{university.shortName}</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1"
              style={{
                background: `linear-gradient(90deg, ${university.colors.primary}, ${university.colors.secondary})`,
              }}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Cover({ src, className, children }: { src: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden bg-zinc-200", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {children}
    </div>
  );
}

function NewsLead({ item }: { item?: NewsCard }) {
  const meta = [item?.sportName, item?.universityName].filter(Boolean).join(" · ");
  return (
    <Link
      href={item ? `/noticias/${item.slug}` : "/multimedia"}
      className={cn(SURFACE, "group flex h-full flex-col overflow-hidden")}
    >
      <Cover src={item?.coverImageUrl || MEDIA.news} className="aspect-[16/10]">
        <span className="absolute top-4 left-4 rounded-full bg-[#C8102E] px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] text-white uppercase">
          Noticia destacada
        </span>
      </Cover>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {meta ? <p className="text-[10px] font-bold tracking-[0.22em] text-[#C8102E] uppercase">{meta}</p> : null}
        <h3 className="font-jersey mt-2 line-clamp-3 text-[2rem] leading-[0.92] text-zinc-950 uppercase sm:text-[2.6rem]">
          {item?.title ?? "La jornada en cancha, contada por la liga"}
        </h3>
        {item?.excerpt ? <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{item.excerpt}</p> : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-zinc-950 transition-colors group-hover:text-[#C8102E]">
          Leer nota
          <ArrowUpRight className="size-4" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}

function MultimediaHub({ episode }: { episode?: PodcastCard }) {
  return (
    <Link href="/multimedia" className="group flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 text-white">
      <Cover src={episode?.coverUrl || MEDIA.broadcast} className="aspect-[16/10]">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        <span className="absolute top-4 left-4 rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase ring-1 ring-white/25 backdrop-blur-md">
          Multimedia
        </span>
        <span className="absolute inset-0 grid place-items-center">
          <span className="relative grid size-20 place-items-center rounded-full bg-[#C8102E] shadow-[0_14px_34px_-8px_rgba(200,16,46,0.9)] transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#C8102E]/40 motion-reduce:hidden" />
            <Play className="relative size-8 translate-x-0.5 fill-current" />
          </span>
        </span>
      </Cover>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[10px] font-bold tracking-[0.22em] text-[#ff3b5c] uppercase">
          {episode ? `Podcast · Episodio ${episode.episodeNumber}` : "Podcast y clips"}
        </p>
        <h3 className="font-jersey mt-2 line-clamp-3 text-[2rem] leading-[0.92] uppercase sm:text-[2.6rem]">
          {episode?.title ?? "Clips y podcast de la jornada"}
        </h3>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-white/80 transition-colors group-hover:text-white">
          Escuchar ahora
          <ArrowUpRight className="size-4" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}

const PERKS = [
  { label: "Descuentos", icon: Percent },
  { label: "Preventas", icon: Ticket },
  { label: "Sorteos", icon: Gift },
] as const;

/** Matchday ticket: red admission side, perforation, white sponsor stub. */
function PassTicket({ sponsors }: { sponsors: SponsorCard[] }) {
  const notch = "absolute size-8 rounded-full bg-[#f8fafc]";
  return (
    <Link
      href="/liga-u-pass"
      className="group grid overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-44px_rgba(200,16,46,0.8)] transition-transform duration-300 hover:-translate-y-0.5 lg:grid-cols-[1fr_24rem]"
    >
      <div className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#E8193C_0%,#B00E2A_60%,#6E0818_100%)] p-6 text-white sm:p-10 lg:p-12">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.08] [background-image:repeating-linear-gradient(115deg,#fff_0_2px,transparent_2px_24px)]"
        />
        <p className="text-[11px] font-bold tracking-[0.3em] text-white/80 uppercase">Liga U Pass · Temporada 2026</p>
        <h2 className="font-jersey mt-3 text-[2.8rem] leading-[0.88] uppercase sm:text-7xl">Tu carnet de hincha</h2>
        <p className="mt-4 max-w-md text-sm text-white/80 sm:text-base">
          Descuentos, preventas y sorteos con las marcas aliadas de la liga. Gratis y en tu teléfono.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {PERKS.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-xs font-semibold ring-1 ring-white/25"
            >
              <Icon className="size-4" strokeWidth={2.25} />
              {label}
            </li>
          ))}
        </ul>
        <span className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#C8102E] transition-transform duration-300 group-hover:translate-x-1">
          Obtener mi pass gratis
          <ArrowUpRight className="size-4" strokeWidth={2.5} />
        </span>
      </div>

      <div className="relative flex flex-col bg-white p-6 sm:p-8">
        <span aria-hidden className="absolute inset-x-6 top-0 border-t-2 border-dashed border-zinc-200 lg:inset-x-auto lg:inset-y-6 lg:left-0 lg:border-t-0 lg:border-l-2" />
        <span aria-hidden className={cn(notch, "-top-4 -left-4")} />
        <span aria-hidden className={cn(notch, "-top-4 -right-4 lg:top-auto lg:right-auto lg:-bottom-4 lg:-left-4")} />

        <p className="text-[10px] font-bold tracking-[0.24em] text-zinc-400 uppercase">Beneficios con</p>
        {sponsors.length ? (
          <ul className="mt-4 grid grid-cols-3 gap-2">
            {sponsors.slice(0, 6).map((sponsor) => (
              <li key={sponsor.id} className="grid h-14 place-items-center rounded-xl bg-zinc-50 px-2 ring-1 ring-zinc-100">
                <SponsorMark sponsor={sponsor} className="max-h-7 max-w-full" />
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="font-jersey text-3xl leading-none text-zinc-950">PASE OFICIAL</p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase">Hincha Liga U</p>
          </div>
          <span
            aria-hidden
            className="h-12 w-24 opacity-80 [background-image:repeating-linear-gradient(90deg,#09090b_0_2px,transparent_2px_4px,#09090b_4px_5px,transparent_5px_8px)]"
          />
        </div>
      </div>
    </Link>
  );
}

export function HomeBento({
  news = [],
  matches = [],
  mvp,
  podcasts = [],
  universities = [],
  sponsors = [],
}: {
  news?: NewsCard[];
  /** Live first, then upcoming, then the latest results. */
  matches?: MatchCard[];
  mvp: MvpHighlight | null;
  podcasts?: PodcastCard[];
  universities?: UniversityCard[];
  sponsors?: SponsorCard[];
}) {
  const lead = news.find((item) => item.isFeatured) ?? news[0];
  const colors = new Map(universities.map((university) => [university.id, university.colors.primary]));
  const colorOf = (universityId: string) => colors.get(universityId) ?? FALLBACK_COLOR;
  const [first, ...rest] = matches;

  return (
    <div id="home-grids" className="scroll-mt-[calc(3.25rem+env(safe-area-inset-top,0px))] space-y-10 lg:space-y-14">
      <section>
        <SectionHead kicker="Esta semana" title="La jornada" href="/calendario" action="Calendario" />
        <div className={cn(RAIL, "lg:-mx-10 lg:scroll-px-10 lg:px-10")}>
          {first ? <MatchTile match={first} colorOf={colorOf} /> : null}
          <MvpTile mvp={mvp} />
          {rest.map((match) => (
            <MatchTile key={match.id} match={match} colorOf={colorOf} />
          ))}
          <CalendarTile />
        </div>
      </section>

      <section>
        <SectionHead kicker="Universidades" title="Clubes" href="/universidades" action="Rosters" />
        <ClubStrip universities={universities} />
      </section>

      <section>
        <SectionHead kicker="Noticias y multimedia" title="Historias" href="/multimedia" action="Ver todo" />
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
          <NewsLead item={lead} />
          <MultimediaHub episode={podcasts[0]} />
        </div>
      </section>

      <PassTicket sponsors={sponsors} />
    </div>
  );
}
