import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play, Trophy } from "lucide-react";
import { IntroSplash } from "@/components/public/intro-splash";
import { kickoff } from "@/components/public/match-ui";
import { SponsorMarquee } from "@/components/public/sponsor-marquee";
import { TabTransition } from "@/components/public/tab-transition";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";
import type { MatchCard, MvpHighlight, NewsCard, PodcastCard, UniversityCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

const CARD =
  "bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden relative group hover:border-[#C8102E]/60 transition-all duration-300";

const CLUB_ORDER = ["UCV", "UCAB", "UNIMET", "UNE", "USB", "USM", "UAH", "UMA"] as const;

const HERO_PHOTO = "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=70";

const MEDIA = {
  training:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=75",
  press: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1600&q=75",
  booth: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=75",
} as const;

/** Fades a photo into the white card so the copy sits on white, not on the picture. */
const FADE_TO_WHITE = "absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/0";

type Club = { id: string; shortName: string; crestUrl: string | null };

function Badge({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "gold" }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black tracking-wide uppercase",
        tone === "red" ? "bg-[#C8102E] text-white" : "bg-gradient-to-r from-amber-200 to-amber-400 text-[#09090B]",
      )}
    >
      {children}
    </span>
  );
}

function Photo({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

function CardLink({ children }: { children: string }) {
  return (
    <span className="inline-flex min-h-11 items-center gap-1 text-xs font-black tracking-wide text-[#C8102E] uppercase">
      {children}
      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
    </span>
  );
}

function orderedClubs(universities: UniversityCard[]): Club[] {
  const rank = new Map<string, number>(CLUB_ORDER.map((name, index) => [name, index]));
  const clubs = [...universities]
    .sort((a, b) => (rank.get(a.shortName.toUpperCase()) ?? 99) - (rank.get(b.shortName.toUpperCase()) ?? 99))
    .map((university) => ({
      id: university.id,
      shortName: university.shortName,
      crestUrl: university.crestUrl ?? university.logoUrl,
    }));
  if (clubs.length) return clubs;
  return CLUB_ORDER.map((shortName) => ({
    id: shortName,
    shortName,
    crestUrl: `/marks/${shortName.toLowerCase()}/crest.svg`,
  }));
}

/** Live first, otherwise the next kickoff, otherwise the latest result. */
function featuredMatch(matches: MatchCard[]) {
  const byDate = (a: MatchCard, b: MatchCard) => +new Date(a.matchDate) - +new Date(b.matchDate);
  const upcoming = matches
    .filter((match) => match.status === "live" || match.status === "scheduled")
    .sort((a, b) => Number(b.status === "live") - Number(a.status === "live") || byDate(a, b));
  return upcoming[0] ?? matches.filter((match) => match.status === "finished").sort((a, b) => byDate(b, a))[0];
}

function crestOf(universities: UniversityCard[], universityId: string, fallback: string | null) {
  const university = universities.find((item) => item.id === universityId);
  return university?.crestUrl ?? university?.logoUrl ?? fallback;
}

function CrestBubble({ src, label, className }: { src: string | null; label: string; className?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full bg-white ring-1 ring-zinc-200", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-[72%] object-contain" />
      ) : (
        <span className="text-[9px] font-black text-[#09090B]">{label.slice(0, 3)}</span>
      )}
    </span>
  );
}

function RostersTile({ clubs }: { clubs: Club[] }) {
  return (
    <Link href="/universidades" className={cn(CARD, "[grid-area:rosters] flex min-h-[260px] flex-col justify-end md:min-h-[300px]")}>
      <Photo src={MEDIA.training} />
      <div aria-hidden className={FADE_TO_WHITE} />
      <div className="relative p-4 md:p-6">
        <Badge>Rosters oficiales</Badge>
        <h2 className="font-jersey mt-2 text-4xl leading-[0.9] text-[#09090B] uppercase md:text-6xl">
          Plantillas y equipos
        </h2>
        <ul className="mt-3 flex flex-wrap gap-1.5 md:gap-2">
          {clubs.map((club) => (
            <li key={club.id} title={club.shortName}>
              <CrestBubble src={club.crestUrl} label={club.shortName} className="size-9 md:size-11" />
            </li>
          ))}
        </ul>
        <CardLink>Ver los 8 clubes</CardLink>
      </div>
    </Link>
  );
}

function MatchTile({ match, universities }: { match: MatchCard | undefined; universities: UniversityCard[] }) {
  const kick = match ? kickoff(match.matchDate) : null;
  const finished = match?.status === "finished" && match.homeScore !== null && match.awayScore !== null;
  const stage = match ? [match.roundName, match.sportName].filter(Boolean).join(" • ") : "";

  return (
    <Link href="/competicion" className={cn(CARD, "[grid-area:match] flex min-h-[260px] flex-col p-3.5 md:p-5")}>
      <div className="flex flex-wrap gap-1.5">
        {match?.status === "live" ? <Badge>Live</Badge> : null}
        <Badge>{finished ? "Último resultado" : "Próximo duelo"}</Badge>
      </div>
      {stage ? <p className="mt-2 text-[10px] font-black tracking-wide text-[#71717A] uppercase">{stage}</p> : null}

      {match ? (
        <div className="flex flex-1 flex-col justify-center py-3">
          <div className="flex items-center justify-between gap-1">
            {[
              { short: match.homeShort, crest: crestOf(universities, match.homeUniversityId, match.homeLogoUrl) },
              { short: match.awayShort, crest: crestOf(universities, match.awayUniversityId, match.awayLogoUrl) },
            ].map((side, index) => (
              <div key={side.short + index} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                <CrestBubble src={side.crest} label={side.short} className="size-12 md:size-16" />
                <span className="font-jersey w-full truncate text-xl leading-none text-[#09090B] md:text-2xl">
                  {side.short}
                </span>
              </div>
            ))}
          </div>
          <p className="font-jersey mt-3 text-center text-3xl leading-none text-[#09090B] tabular-nums md:text-4xl">
            {finished ? (
              <>
                {match.homeScore}
                <span className="mx-1.5 text-zinc-300">–</span>
                {match.awayScore}
              </>
            ) : kick ? (
              <>
                {kick.clock}
                <span className="ml-1 text-lg text-[#C8102E]">{kick.period}</span>
              </>
            ) : null}
          </p>
        </div>
      ) : (
        <p className="font-jersey flex flex-1 items-center text-2xl text-[#09090B] uppercase">Por confirmar</p>
      )}

      <div className="border-t border-zinc-100">
        <CardLink>Ver partido</CardLink>
      </div>
    </Link>
  );
}

function MvpTile({ mvp }: { mvp: MvpHighlight | null }) {
  const className = cn(
    CARD,
    "[grid-area:mvp] flex min-h-[260px] flex-col border-amber-300/50 bg-[linear-gradient(155deg,#52525b_0%,#27272a_42%,#09090b_100%)] p-3.5 text-white md:p-5",
  );
  const body = (
    <>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.12)_50%,transparent_65%)]" />
      <div aria-hidden className="absolute inset-1.5 rounded-xl border border-amber-300/30" />
      <div className="relative">
        <Badge tone="gold">
          <Trophy className="size-3" strokeWidth={2.5} />
          MVP de la semana
        </Badge>
      </div>
      <div className="relative flex flex-1 items-end justify-center py-2">
        {mvp?.athlete.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mvp.athlete.photoUrl} alt={mvp.athlete.fullName} className="max-h-48 w-auto object-contain md:max-h-72" />
        ) : (
          <Image
            src="/intro/futbol.webp"
            alt=""
            width={632}
            height={636}
            className="h-auto max-h-36 w-auto opacity-25 brightness-0 invert md:max-h-64"
          />
        )}
      </div>
      <div className="relative">
        <p className="text-[10px] font-black tracking-wide text-amber-300 uppercase">
          {mvp ? `${mvp.sportName} · ${mvp.team.university.shortName}` : "Liga U · Temporada 2026"}
        </p>
        <h2 className="font-jersey mt-1 text-3xl leading-[0.9] uppercase md:text-5xl">
          {mvp ? mvp.athlete.fullName : "Por anunciar"}
        </h2>
        <p className="mt-1.5 text-xs leading-snug text-white/70">
          {mvp ? mvp.matchLabel : "Al cierre de la fecha."}
        </p>
      </div>
    </>
  );

  return mvp ? (
    <Link href={`/atletas/${mvp.athlete.id}`} className={className}>
      {body}
    </Link>
  ) : (
    <article className={className}>{body}</article>
  );
}

function NewsTile({ item }: { item?: NewsCard }) {
  return (
    <Link href="/noticias" className={cn(CARD, "[grid-area:news] flex min-h-[280px] flex-col justify-end md:min-h-[320px]")}>
      <Photo src={item?.coverImageUrl || MEDIA.press} />
      <div aria-hidden className={FADE_TO_WHITE} />
      <div className="relative p-4 md:p-6">
        <div className="flex flex-wrap gap-1.5">
          <Badge>Crónica</Badge>
          {item?.sportName ? <Badge>{item.sportName}</Badge> : null}
        </div>
        <h2 className="font-jersey mt-2 line-clamp-3 text-3xl leading-[0.9] text-[#09090B] uppercase md:text-5xl">
          {item?.title ?? "La crónica de la jornada"}
        </h2>
        {item?.excerpt ? <p className="mt-1.5 line-clamp-2 max-w-xl text-sm text-[#71717A]">{item.excerpt}</p> : null}
        <CardLink>Leer noticias</CardLink>
      </div>
    </Link>
  );
}

function MediaTile({ episode }: { episode?: PodcastCard }) {
  return (
    <Link href="/multimedia" className={cn(CARD, "[grid-area:media] flex min-h-[260px] flex-col justify-end")}>
      <Photo src={episode?.coverUrl || MEDIA.booth} />
      <div aria-hidden className="absolute inset-0 bg-white/45" />
      <div aria-hidden className={FADE_TO_WHITE} />
      <span className="absolute top-6 left-1/2 grid size-16 -translate-x-1/2 place-items-center rounded-full bg-[#C8102E] text-white shadow-[0_14px_30px_-10px_rgba(200,16,46,0.7)] transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
        <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-[#C8102E]/30 motion-reduce:hidden" />
        <Play className="relative size-7 translate-x-0.5 fill-current" />
      </span>
      <div className="relative p-4 md:p-5">
        <Badge>Multimedia • Podcast</Badge>
        <h2 className="font-jersey mt-2 line-clamp-2 text-3xl leading-[0.9] text-[#09090B] uppercase">
          {episode?.title ?? "Previas del clásico universitario"}
        </h2>
        <CardLink>Escuchar</CardLink>
      </div>
    </Link>
  );
}

function PassTile() {
  const notch = "absolute left-[68%] size-5 -translate-x-1/2 rounded-full bg-white";
  return (
    <Link
      href="/liga-u-pass"
      className="group relative [grid-area:pass] flex min-h-[260px] overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#E11D3A_0%,#C8102E_50%,#8E0C22_100%)] text-white shadow-[0_24px_50px_-28px_rgba(200,16,46,0.9)] transition-transform duration-300 hover:-translate-y-0.5"
    >
      <span aria-hidden className={cn(notch, "-top-2.5")} />
      <span aria-hidden className={cn(notch, "-bottom-2.5")} />
      <span aria-hidden className="absolute inset-y-4 left-[68%] border-l-2 border-dashed border-white/35" />
      <div className="flex w-[68%] flex-col p-4 md:p-5">
        <p className="text-[10px] font-black tracking-[0.18em] text-white/80 uppercase">Club de beneficios</p>
        <h2 className="font-jersey mt-2 text-3xl leading-[0.9] uppercase md:text-4xl">Tu carnet de hincha</h2>
        <p className="mt-2 text-xs leading-snug text-white/80">Descuentos, preventas y sorteos con marcas aliadas.</p>
        <span className="mt-auto inline-flex min-h-11 w-fit items-center rounded-full bg-white px-4 text-xs font-black tracking-wide text-[#C8102E] uppercase">
          Obtener mi Pass gratis
        </span>
      </div>
      <div className="flex w-[32%] flex-col items-center justify-between py-5">
        <span className="font-jersey text-sm tracking-widest text-white/80 [writing-mode:vertical-rl]">LIGA U PASS · 2026</span>
        <span
          aria-hidden
          className="h-24 w-9 opacity-90 [background-image:repeating-linear-gradient(0deg,#fff_0_2px,transparent_2px_4px,#fff_4px_5px,transparent_5px_8px)]"
        />
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [catalog, sponsors] = await Promise.all([getPublicCatalog(), getHomeSponsorLogos()]);
  const mvp = getMvpHighlight(catalog.matches, catalog.athletes, catalog.teams, catalog.events);
  const match = featuredMatch(catalog.matches);
  const lead = catalog.news.find((item) => item.isFeatured) ?? catalog.news[0];
  const universities = catalog.universities.length || CLUB_ORDER.length;
  const disciplines = catalog.sports.length || 9;

  return (
    <>
      <IntroSplash />
      <TabTransition>
        <style>{`.ligau-canvas{visibility:hidden}`}</style>
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-white" />
        <main className="overflow-x-hidden bg-white">
          <section
            aria-labelledby="hero-title"
            className="relative isolate flex h-[calc(100svh-8.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))] max-h-[820px] min-h-[500px] w-full flex-col justify-end overflow-hidden bg-zinc-900 md:h-[min(78vh,760px)]"
          >
            <picture className="absolute inset-0 -z-20">
              <source media="(min-width: 768px)" srcSet={`${HERO_PHOTO}&w=2400&h=1300`} />
              <img
                src={`${HERO_PHOTO}&w=900&h=1400`}
                alt="Jugador de Liga U rematando un balón"
                fetchPriority="high"
                className="h-full w-full object-cover object-[50%_20%]"
              />
            </picture>
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(9,9,11,0.92)_0%,rgba(9,9,11,0.55)_32%,rgba(9,9,11,0)_58%)]"
            />
            <div aria-hidden className="absolute -bottom-24 -left-24 -z-10 size-80 rounded-full bg-[#C8102E]/40 blur-3xl" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-6 md:flex-row md:items-end md:justify-between md:gap-10 md:pb-10">
              <h1
                id="hero-title"
                className="font-jersey max-w-3xl text-[3.25rem] leading-[0.86] text-white uppercase sm:text-7xl lg:text-[7.5rem]"
              >
                El <span className="text-[#ff3b5c]">epicentro</span> del talento universitario
              </h1>
              <dl className="grid shrink-0 grid-cols-3 divide-x divide-white/15 rounded-2xl bg-white/10 py-3 ring-1 ring-white/15 backdrop-blur-md md:w-[26rem]">
                {[
                  { label: "Universidades", value: universities },
                  { label: "Deportes", value: disciplines },
                  { label: "Temporada", value: 2026 },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col-reverse items-center gap-1 px-2">
                    <dt className="text-[9px] font-semibold tracking-[0.2em] text-white/60 uppercase lg:text-[10px]">
                      {label}
                    </dt>
                    <dd className="font-jersey text-3xl leading-none text-white tabular-nums lg:text-4xl">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section
            aria-label="Lo destacado de la liga"
            className="mx-auto mt-6 grid md:mt-10 max-w-7xl grid-cols-2 gap-3 px-3 [grid-template-areas:'rosters_rosters'_'match_mvp'_'news_news'_'media_media'_'pass_pass'] md:grid-cols-3 md:gap-5 md:px-4 md:[grid-template-areas:'rosters_rosters_match'_'news_news_mvp'_'media_pass_mvp']"
          >
            <RostersTile clubs={orderedClubs(catalog.universities)} />
            <MatchTile match={match} universities={catalog.universities} />
            <MvpTile mvp={mvp} />
            <NewsTile item={lead} />
            <MediaTile episode={catalog.podcasts[0]} />
            <PassTile />
          </section>

          <div className="mx-auto max-w-7xl px-4 pt-10 pb-8 md:pt-14">
            <SponsorMarquee sponsors={sponsors} />
          </div>
        </main>
      </TabTransition>
    </>
  );
}
