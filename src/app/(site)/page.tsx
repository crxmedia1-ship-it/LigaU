import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Play, Trophy } from "lucide-react";
import { IntroSplash } from "@/components/public/intro-splash";
import { kickoff } from "@/components/public/match-ui";
import { Marquee } from "@/components/magic/marquee";
import { sponsorLogo } from "@/components/public/sponsor-marquee";
import { TabTransition } from "@/components/public/tab-transition";
import { getHomeSponsorLogos } from "@/lib/public/home-sponsors";
import { getMvpHighlight, getPublicCatalog } from "@/lib/public/queries";
import type {
  MatchCard,
  MvpHighlight,
  NewsCard,
  PodcastCard,
  SponsorCard,
  UniversityCard,
} from "@/lib/public/types";
import { cn } from "@/lib/utils";

const SURFACE =
  "rounded-2xl border border-zinc-200/80 bg-white shadow-sm transition-colors duration-300 hover:border-[#C8102E]/50";

const CLUB_ORDER = ["UCV", "UCAB", "UNIMET", "UNE", "USB", "USM", "UAH", "UMA"] as const;

const MEDIA = {
  stadium:
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=75",
  news: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1600&q=75",
  podcast:
    "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=75",
} as const;

type ClubMark = {
  id: string;
  shortName: string;
  crestUrl: string | null;
  href: string;
};

function Badge({ children, tone = "red" }: { children: ReactNode; tone?: "red" | "gold" }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black tracking-tight uppercase",
        tone === "red" ? "bg-[#C8102E] text-white" : "border border-amber-300/80 bg-amber-50 text-[#C8102E]",
      )}
    >
      {children}
    </span>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <p className="text-[11px] font-black tracking-[0.18em] text-[#C8102E] uppercase">{children}</p>;
}

function crestFor(universities: UniversityCard[], universityId: string, fallback: string | null) {
  const university = universities.find((item) => item.id === universityId);
  return university?.crestUrl ?? university?.logoUrl ?? fallback;
}

function orderedClubs(universities: UniversityCard[]): ClubMark[] {
  const rank = new Map<string, number>(CLUB_ORDER.map((name, index) => [name, index]));
  const clubs = [...universities]
    .sort((a, b) => {
      const left = rank.get(a.shortName.toUpperCase()) ?? 99;
      const right = rank.get(b.shortName.toUpperCase()) ?? 99;
      return left - right || a.shortName.localeCompare(b.shortName, "es");
    })
    .map((university) => ({
      id: university.id,
      shortName: university.shortName,
      crestUrl: university.crestUrl ?? university.logoUrl,
      href: `/universidades/${university.id}`,
    }));

  if (clubs.length > 0) return clubs;

  return CLUB_ORDER.map((shortName) => ({
    id: shortName,
    shortName,
    crestUrl: `/marks/${shortName.toLowerCase()}/crest.svg`,
    href: "/universidades",
  }));
}

/** Live first, otherwise the next kickoff, otherwise the latest result. */
function featuredMatch(matches: MatchCard[]) {
  const byDate = (a: MatchCard, b: MatchCard) => +new Date(a.matchDate) - +new Date(b.matchDate);
  const upcoming = matches
    .filter((match) => match.status === "live" || match.status === "scheduled")
    .sort((a, b) => Number(b.status === "live") - Number(a.status === "live") || byDate(a, b));
  if (upcoming[0]) return upcoming[0];
  return matches.filter((match) => match.status === "finished").sort((a, b) => byDate(b, a))[0];
}

function Crest({ src, label, size = "size-14" }: { src: string | null; label: string; size?: string }) {
  return (
    <span className={cn("grid place-items-center rounded-full bg-[#F8FAFC]", size)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-[70%] object-contain" />
      ) : (
        <span className="text-[10px] font-black text-[#09090B]">{label.slice(0, 3)}</span>
      )}
    </span>
  );
}

function MatchBoard({
  match,
  homeCrest,
  awayCrest,
}: {
  match: MatchCard | undefined;
  homeCrest: string | null;
  awayCrest: string | null;
}) {
  const kick = match ? kickoff(match.matchDate) : null;
  const context = match ? [match.roundName, match.sportName].filter(Boolean).join(" • ") : "";
  const live = match?.status === "live";
  const scored = match?.status === "finished" && match.homeScore !== null && match.awayScore !== null;
  const side = (short: string, crest: string | null) => (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
      <Crest src={crest} label={short} size="size-16 md:size-20" />
      <span className="font-jersey text-3xl leading-none text-[#09090B] md:text-4xl">{short}</span>
    </div>
  );

  return (
    <section aria-labelledby="match-title">
      <Eyebrow>Calendario</Eyebrow>
      <h2 id="match-title" className="font-jersey mt-1 text-4xl leading-none text-[#09090B] uppercase md:text-5xl">
        El partido
      </h2>
      <Link href="/competicion" className={cn(SURFACE, "mt-4 block p-4 md:p-6")}>
        <div className="flex flex-wrap items-center gap-2">
          {live ? <Badge>Live</Badge> : null}
          <Badge>{context || "Próximo duelo"}</Badge>
        </div>
        {match ? (
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-6">
            {side(match.homeShort, homeCrest)}
            <div className="text-center">
              {scored ? (
                <p className="font-jersey text-4xl leading-none text-[#09090B] tabular-nums">
                  {match.homeScore}
                  <span className="mx-1 text-[#71717A]">–</span>
                  {match.awayScore}
                </p>
              ) : (
                <p className="font-jersey text-4xl leading-none text-[#09090B] tabular-nums md:text-5xl">
                  {kick ? kick.clock : "—"}
                  {kick ? <span className="ml-1 text-2xl text-[#C8102E]">{kick.period}</span> : null}
                </p>
              )}
              <p className="mt-1 text-[10px] font-black tracking-[0.16em] text-[#71717A] uppercase">
                {scored ? "Final" : "Hora"}
              </p>
            </div>
            {side(match.awayShort, awayCrest)}
          </div>
        ) : (
          <p className="mt-6 font-jersey text-3xl text-[#09090B] uppercase">Próximo duelo por confirmar</p>
        )}
        <span className="mt-5 inline-flex min-h-11 items-center gap-1 text-sm font-black tracking-tight text-[#C8102E] uppercase">
          Ver partido
          <ArrowUpRight className="size-4" strokeWidth={2.5} />
        </span>
      </Link>
    </section>
  );
}

function NewsStory({ item }: { item?: NewsCard }) {
  const discipline = item?.sportName ?? "Fútbol campo";
  return (
    <article className="flex flex-col">
      <Eyebrow>Noticias</Eyebrow>
      <h2 className="font-jersey mt-1 text-4xl leading-none text-[#09090B] uppercase md:text-5xl">La nota</h2>
      <Link
        href={item ? `/noticias/${item.slug}` : "/multimedia"}
        className={cn(SURFACE, "group mt-4 flex h-full flex-col overflow-hidden")}
      >
        <div className="aspect-[16/9] overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item?.coverImageUrl || MEDIA.news}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col p-4 md:p-5">
          <div className="flex flex-wrap gap-1.5">
            <Badge>Noticia destacada</Badge>
            <Badge>{discipline}</Badge>
          </div>
          <h3 className="font-jersey mt-3 text-3xl leading-[0.92] text-[#09090B] uppercase md:text-4xl">
            {item?.title ?? "UCV y UCAB abren el grupo A en fútbol campo"}
          </h3>
          {item?.excerpt ? <p className="mt-2 text-sm leading-relaxed text-[#71717A]">{item.excerpt}</p> : null}
          <span className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-black tracking-tight text-[#C8102E] uppercase">
            Leer nota
            <ArrowUpRight className="size-4" strokeWidth={2.5} />
          </span>
        </div>
      </Link>
    </article>
  );
}

function PodcastStory({ episode }: { episode?: PodcastCard }) {
  return (
    <article className="flex flex-col">
      <Eyebrow>Multimedia</Eyebrow>
      <h2 className="font-jersey mt-1 text-4xl leading-none text-[#09090B] uppercase md:text-5xl">Podcast</h2>
      <Link href="/multimedia" className={cn(SURFACE, "group mt-4 flex h-full flex-col overflow-hidden")}>
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={episode?.coverUrl || MEDIA.podcast} alt="" className="h-full w-full object-cover" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-14 place-items-center rounded-full bg-[#C8102E] text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Play className="size-6 translate-x-0.5 fill-current" />
            </span>
          </span>
        </div>
        <div className="flex flex-1 flex-col p-4 md:p-5">
          <Badge>Multimedia • Podcast</Badge>
          <h3 className="font-jersey mt-3 text-3xl leading-[0.92] text-[#09090B] uppercase">
            {episode?.title ?? "Previas del clásico universitario"}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[#71717A]">
            {episode?.description ?? "La voz de la temporada: entrevistas, análisis y el cierre de cada fecha."}
          </p>
        </div>
      </Link>
    </article>
  );
}

function RosterRail({ clubs }: { clubs: ClubMark[] }) {
  return (
    <section aria-labelledby="rosters-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <Eyebrow>Rosters oficiales</Eyebrow>
          <h2 id="rosters-title" className="font-jersey mt-1 text-4xl leading-none text-[#09090B] uppercase md:text-5xl">
            Plantillas y equipos
          </h2>
        </div>
        <Link href="/universidades" className="mb-1 inline-flex min-h-11 items-center text-sm font-black tracking-tight text-[#C8102E] uppercase">
          Ver todas
        </Link>
      </div>
      <ul className="mt-4 flex gap-3 overflow-x-auto py-1 no-scrollbar">
        {clubs.map((club) => (
          <li key={club.id} className="shrink-0">
            <Link href={club.href} className="flex w-[4.75rem] min-h-11 flex-col items-center gap-2">
              <span className="grid size-16 place-items-center rounded-full border border-zinc-200/80 bg-white shadow-sm">
                {club.crestUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={club.crestUrl} alt="" className="size-11 object-contain" />
                ) : (
                  <span className="text-[10px] font-black text-[#09090B]">{club.shortName.slice(0, 3)}</span>
                )}
              </span>
              <span className="font-jersey text-lg leading-none text-[#09090B]">{club.shortName}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MvpFeature({ mvp }: { mvp: MvpHighlight | null }) {
  const photo = mvp?.athlete.photoUrl || MEDIA.stadium;
  const body = (
    <div className={cn(SURFACE, "grid overflow-hidden md:grid-cols-[220px_minmax(0,1fr)]")}>
      <div className="aspect-[16/10] overflow-hidden bg-zinc-100 md:aspect-auto md:min-h-[220px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo} alt={mvp ? mvp.athlete.fullName : ""} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col justify-center p-4 md:p-6">
        <Badge tone="gold">
          <Trophy className="size-3 text-amber-500" strokeWidth={2.5} />
          MVP de la semana
        </Badge>
        <h2 className="font-jersey mt-3 text-4xl leading-[0.9] text-[#09090B] uppercase md:text-5xl">
          {mvp ? mvp.athlete.fullName : "Por anunciar"}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#71717A]">
          {mvp
            ? `${mvp.sportName} · ${mvp.team.university.shortName} · ${mvp.matchLabel}`
            : "El mejor atleta de la fecha aparece aquí al finalizar la jornada."}
        </p>
      </div>
    </div>
  );

  return (
    <section aria-labelledby="mvp-title">
      <Eyebrow>Figura</Eyebrow>
      <h2 id="mvp-title" className="font-jersey mt-1 text-4xl leading-none text-[#09090B] uppercase md:text-5xl">
        MVP
      </h2>
      <div className="mt-4">
        {mvp ? (
          <Link href={`/atletas/${mvp.athlete.id}`} className="block">
            {body}
          </Link>
        ) : (
          body
        )}
      </div>
    </section>
  );
}

function PassBand() {
  return (
    <section aria-labelledby="pass-title">
      <Link
        href="/liga-u-pass"
        className="grid overflow-hidden rounded-2xl bg-[#C8102E] text-white shadow-sm md:grid-cols-[1.4fr_0.8fr]"
      >
        <div className="p-5 md:p-8">
          <p className="text-[11px] font-black tracking-[0.18em] text-white/80 uppercase">Club de beneficios</p>
          <h2 id="pass-title" className="font-jersey mt-2 text-4xl leading-[0.9] uppercase md:text-6xl">
            Tu carnet de hincha
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
            Descuentos, preventas y sorteos con las marcas aliadas de la liga.
          </p>
          <span className="mt-5 inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-black tracking-tight text-[#C8102E] uppercase">
            Obtener mi Pass gratis
          </span>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-white/20 p-5 md:flex-col md:items-start md:justify-end md:border-t-0 md:border-l md:p-8">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-white/70 uppercase">Pase oficial</p>
            <p className="font-jersey mt-1 text-3xl leading-none">Temporada 2026</p>
          </div>
          <span
            aria-hidden
            className="h-10 w-28 opacity-90 [background-image:repeating-linear-gradient(90deg,#fff_0_2px,transparent_2px_4px,#fff_4px_5px,transparent_5px_8px)]"
          />
        </div>
      </Link>
    </section>
  );
}

function SponsorRail({ sponsors }: { sponsors: SponsorCard[] }) {
  const items =
    sponsors.length > 0
      ? sponsors
      : [
          { id: "pepsi", name: "Pepsi", category: "Patrocinador", locationTag: null, logoUrl: null },
          { id: "cinex", name: "Cinex", category: "Patrocinador", locationTag: null, logoUrl: null },
          { id: "maltin", name: "Maltín Polar", category: "Patrocinador", locationTag: null, logoUrl: null },
          { id: "champion", name: "Champion", category: "Patrocinador", locationTag: null, logoUrl: null },
        ];

  return (
    <section aria-labelledby="sponsors-title">
      <h2 id="sponsors-title" className="font-jersey text-3xl leading-none text-[#09090B] uppercase md:text-4xl">
        Aliados oficiales
      </h2>
      <div className="mt-4 overflow-hidden border-y border-zinc-200/80 bg-white py-4">
        <Marquee duration="32s">
          {items.map((sponsor) => {
            const logo = sponsorLogo(sponsor.logoUrl);
            return (
              <div key={sponsor.id} className="flex h-12 w-36 items-center justify-center px-3">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt={sponsor.name} className="h-10 w-28 object-contain opacity-80" />
                ) : (
                  <span className="text-xs font-black tracking-tight text-[#71717A] uppercase">{sponsor.name}</span>
                )}
              </div>
            );
          })}
        </Marquee>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [catalog, sponsors] = await Promise.all([getPublicCatalog(), getHomeSponsorLogos()]);
  const mvp = getMvpHighlight(catalog.matches, catalog.athletes, catalog.teams, catalog.events);
  const match = featuredMatch(catalog.matches);
  const clubs = orderedClubs(catalog.universities);
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
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-6 md:gap-14 md:py-10">
            <section className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_240px]" aria-labelledby="hero-title">
              <div>
                <h1
                  id="hero-title"
                  className="font-jersey text-[2.7rem] leading-[0.84] text-[#09090B] uppercase sm:text-6xl lg:text-7xl"
                >
                  El <span className="text-[#C8102E]">epicentro</span> del talento universitario
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#71717A] md:text-base">
                  Resultados oficiales, noticias, plantillas y beneficios del deporte universitario de Caracas.
                </p>
                <p className="mt-5 inline-flex max-w-full flex-wrap items-center gap-x-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-[11px] font-black tracking-tight text-[#09090B] md:text-xs">
                  <span>{universities} Universidades</span>
                  <span aria-hidden className="text-zinc-300">
                    •
                  </span>
                  <span>{disciplines} Disciplinas</span>
                  <span aria-hidden className="text-zinc-300">
                    •
                  </span>
                  <span>Temporada 2026</span>
                </p>
              </div>
              <div className="flex justify-end">
                <Image
                  src="/intro/baloncesto.webp"
                  alt="Atleta de baloncesto de Liga U"
                  width={308}
                  height={636}
                  priority
                  className="h-36 w-auto md:h-72"
                />
              </div>
            </section>

            <MatchBoard
              match={match}
              homeCrest={match ? crestFor(catalog.universities, match.homeUniversityId, match.homeLogoUrl) : null}
              awayCrest={match ? crestFor(catalog.universities, match.awayUniversityId, match.awayLogoUrl) : null}
            />

            <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:gap-6">
              <NewsStory item={lead} />
              <PodcastStory episode={catalog.podcasts[0]} />
            </div>

            <RosterRail clubs={clubs} />
            <MvpFeature mvp={mvp} />
            <PassBand />
            <SponsorRail sponsors={sponsors} />
          </div>
        </main>
      </TabTransition>
    </>
  );
}
