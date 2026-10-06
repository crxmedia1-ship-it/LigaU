import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronRight, Crown, Mic, Play, Trophy, Wifi } from "lucide-react";
import { kickoff } from "@/components/public/match-ui";
import { MvpCarousel, type MvpSlide } from "@/components/public/mvp-carousel";
import { SponsorMarquee } from "@/components/public/sponsor-marquee";
import { CourtMark } from "@/components/public/sport-courts";
import { SponsorMark } from "@/components/public/sponsor-slots";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { getHomeSponsorLogos } from "@/lib/public/sponsor-logos";
import { cloudinaryImage } from "@/lib/public/media";
import { getNewsContent, getPublicCatalog } from "@/lib/public/queries";
import { computeStandings } from "@/lib/public/standings";
import type { MatchCard, NewsCard, SponsorCard, SportCard, StandingRow, TeamCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

const CARD =
  "bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden relative group hover:border-[#C8102E]/60 transition-all duration-300";

const RAIL = "h-[360px] w-[78vw] max-w-[320px] shrink-0 snap-start md:h-[400px] md:w-[320px]";

/** Same footer box on every rail card so their links sit on one line. */
const RAIL_FOOTER = "flex h-14 shrink-0 items-end justify-between gap-2 border-t border-white/15";

const CLUB_ORDER = ["UCV", "UCAB", "UNIMET", "UNE", "USB", "USM", "UAH", "UMA"] as const;

const MATCH_DAY = new Intl.DateTimeFormat("es-VE", {
  timeZone: "America/Caracas",
  weekday: "short",
  day: "numeric",
  month: "short",
});

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-amber-200 to-amber-400 px-2.5 py-1 text-[10px] font-black tracking-wide text-[#09090B] uppercase">
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

/** An open match drops off the card this long after kickoff, even if nobody closed it in the admin. */
const MATCH_WINDOW_MS = 4 * 60 * 60 * 1000;

/** Live first, otherwise the next kickoff, otherwise the latest result. */
function featuredMatch(matches: MatchCard[]) {
  const now = Date.now();
  const byDate = (a: MatchCard, b: MatchCard) => +new Date(a.matchDate) - +new Date(b.matchDate);
  const upcoming = matches
    .filter(
      (match) =>
        (match.status === "live" || match.status === "scheduled") && +new Date(match.matchDate) + MATCH_WINDOW_MS > now,
    )
    .sort((a, b) => Number(b.status === "live") - Number(a.status === "live") || byDate(a, b));
  return upcoming[0] ?? matches.filter((match) => match.status === "finished").sort((a, b) => byDate(b, a))[0];
}

function TeamMark({ src, label }: { src: string | null; label: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="size-20 shrink-0 object-contain [filter:drop-shadow(0_0_10px_rgba(255,255,255,0.45))_drop-shadow(0_8px_14px_rgba(0,0,0,0.5))] transition-transform duration-300 group-hover:scale-105 md:size-24"
    />
  ) : (
    <span className="font-jersey grid size-20 shrink-0 place-items-center text-3xl md:size-24 text-white/80">
      {label.slice(0, 3)}
    </span>
  );
}

function RostersTile({ clubs }: { clubs: number }) {
  return (
    <Link
      href="/universidades"
      className={cn(
        CARD,
        "flex min-h-[280px] flex-col justify-end bg-zinc-950 shadow-[0_30px_60px_-24px_rgba(9,9,11,0.55),0_12px_24px_-12px_rgba(9,9,11,0.35)] md:min-h-[300px]",
      )}
    >
      <div className="absolute inset-0 [&>img]:object-[50%_15%]">
        <Photo src="/home/plantillas-dia.webp" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.03)_40%,rgba(255,255,255,0)_60%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/20 ring-inset"
      />
      <div
        aria-hidden
        className="absolute -top-1/2 left-[-30%] h-[200%] w-1/3 rotate-[25deg] bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 group-hover:translate-x-[320%]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-zinc-950/80 via-zinc-950/35 to-transparent"
      />
      <div className="relative max-w-xl p-5 text-white md:p-7">
        <h2 className="font-jersey text-4xl leading-[0.9] uppercase md:text-6xl">Plantillas y equipos</h2>
        <p className="mt-2 text-sm leading-snug text-white/75">
          Atletas, dorsales y cuerpos técnicos de las {clubs} universidades que compiten esta temporada.
        </p>
        <span className="mt-1 inline-flex min-h-11 items-center gap-1 text-xs font-black tracking-wide text-white uppercase">
          Explorar plantillas
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}

function MatchTile({ match }: { match: MatchCard | undefined }) {
  const kick = match ? kickoff(match.matchDate) : null;
  const finished = match?.status === "finished" && match.homeScore !== null && match.awayScore !== null;
  const stage = match
    ? [match.sportName, match.gender ? GENDER_LABELS[match.gender] : null].filter(Boolean).join(" • ")
    : "";

  const home = match && { short: match.homeShort, logo: match.homeLogoUrl };
  const away = match && { short: match.awayShort, logo: match.awayLogoUrl };
  const homeTone = (home && TEAM_TONES[home.short.toUpperCase()]?.mid) || "#27272a";
  const awayTone = (away && TEAM_TONES[away.short.toUpperCase()]?.mid) || "#09090b";

  return (
    <Link
      href="/calendario"
      className={cn(
        RAIL,
        "group relative isolate flex flex-col overflow-hidden rounded-2xl bg-zinc-950 text-white shadow-[0_24px_50px_-24px_rgba(9,9,11,0.6)] transition-transform duration-300 hover:-translate-y-0.5",
      )}
    >
      <div
        aria-hidden
        style={{ backgroundColor: homeTone }}
        className="absolute inset-0 opacity-80 [clip-path:polygon(0_0,100%_0,100%_40%,0_60%)]"
      />
      <div
        aria-hidden
        style={{ backgroundColor: awayTone }}
        className="absolute inset-0 opacity-85 [clip-path:polygon(0_60%,100%_40%,100%_100%,0_100%)]"
      />
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]"
      >
        <defs>
          <linearGradient id="vs-edge" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0.15" />
            <stop offset="0.5" stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1="60"
          x2="100"
          y2="40"
          stroke="url(#vs-edge)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-1/2 -rotate-[13deg] transition-transform duration-300 group-hover:scale-110">
        <span aria-hidden className="absolute inset-0 translate-x-1.5 translate-y-1.5 -skew-x-12 bg-zinc-950/80" />
        <span className="relative block -skew-x-12 bg-white px-4 py-1.5 shadow-[0_0_36px_rgba(255,255,255,0.45)]">
          <span className="font-jersey block skew-x-12 text-4xl leading-none tracking-wide text-zinc-950 italic">
            VS
          </span>
        </span>
      </div>

      <div className="relative flex flex-1 flex-col p-4">
        {match?.status === "live" ? (
          <div className="mb-2">
            <Badge>En vivo</Badge>
          </div>
        ) : null}
        {stage ? <p className="text-[10px] font-black tracking-[0.16em] text-white/85 uppercase">{stage}</p> : null}

        {home ? (
          <div className="mt-2 flex items-center gap-2">
            <TeamMark src={home.logo} label={home.short} />
            <span className="font-jersey min-w-0 truncate text-[2.75rem] leading-none tracking-wide md:text-5xl">
              {home.short}
            </span>
            {finished ? (
              <span className="font-jersey ml-auto text-4xl leading-none tabular-nums">{match.homeScore}</span>
            ) : null}
          </div>
        ) : null}

        <div className="flex-1" />

        {away ? (
          <div className="mb-2 flex flex-row-reverse items-center gap-2">
            <TeamMark src={away.logo} label={away.short} />
            <span className="font-jersey min-w-0 truncate text-[2.75rem] leading-none tracking-wide md:text-5xl">
              {away.short}
            </span>
            {finished ? (
              <span className="font-jersey mr-auto text-4xl leading-none tabular-nums">{match.awayScore}</span>
            ) : null}
          </div>
        ) : (
          <p className="font-jersey mb-3 text-3xl uppercase">Por confirmar</p>
        )}

        <div className={RAIL_FOOTER}>
          {match && kick ? (
            <p className="leading-none">
              <span className="block text-[10px] font-black tracking-wide text-white/60 uppercase">
                {MATCH_DAY.format(new Date(match.matchDate))}
              </span>
              <span className="font-jersey text-3xl tabular-nums">
                {kick.clock}
                <span className="ml-1 text-base text-white/60">{kick.period}</span>
              </span>
            </p>
          ) : (
            <span />
          )}
          <span className="inline-flex min-h-11 items-center gap-1 text-xs font-black tracking-wide uppercase">
            Ver calendario
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Turn off once real MVPs are loaded so an empty week shows the "Por anunciar" card instead. */
const SHOW_DEMO_MVPS = true;

/** Invented players so the carousel can be reviewed before real MVPs are loaded. */
const DEMO_MVPS: MvpSlide[] = [
  {
    id: "demo-baloncesto",
    href: "/universidades",
    name: "Andrés Mejía",
    sportName: "Baloncesto",
    teamShort: "UCV",
    teamLogo: "/marks/ucv/mascot.svg",
    jersey: 23,
    position: "Escolta",
    photoUrl: "/mvp-demo/baloncesto.webp",
    stat: "28 pts · 9 reb · 5 ast",
  },
  {
    id: "demo-futbol",
    href: "/universidades",
    name: "Samuel Rondón",
    sportName: "Fútbol Campo",
    teamShort: "UCAB",
    teamLogo: "/marks/ucab/mascot.svg",
    jersey: 10,
    position: "Mediapunta",
    photoUrl: "/mvp-demo/futbol.webp",
    stat: "2 goles · 1 asistencia",
  },
  {
    id: "demo-voleibol",
    href: "/universidades",
    name: "Valentina Ortiz",
    sportName: "Voleibol Cancha",
    teamShort: "USB",
    teamLogo: "/marks/usb/mascot.svg",
    jersey: 7,
    position: "Opuesta",
    photoUrl: "/mvp-demo/voleibol.webp",
    stat: "19 puntos · 4 bloqueos",
  },
];

/** Latest MVP per sport from games finished in the last seven days. */
function weeklyMvps(catalog: Awaited<ReturnType<typeof getPublicCatalog>>): MvpSlide[] {
  const since = Date.now() - WEEK_MS;
  const latestBySport = new Map<string, MatchCard>();
  for (const match of catalog.matches) {
    if (match.status !== "finished" || !match.mvpAthleteId || +new Date(match.matchDate) < since) continue;
    const current = latestBySport.get(match.sportId);
    if (!current || +new Date(match.matchDate) > +new Date(current.matchDate)) latestBySport.set(match.sportId, match);
  }

  const slides = [...latestBySport.values()].flatMap((match): MvpSlide[] => {
    const athlete = catalog.athletes.find((item) => item.id === match.mvpAthleteId);
    const team = athlete && catalog.teams.find((item) => item.id === athlete.teamId);
    if (!athlete || !team) return [];
    const events = catalog.events.filter((event) => event.matchId === match.id && event.athleteId === athlete.id);
    const total = (type: string) =>
      events.filter((event) => event.eventType === type).reduce((sum, event) => sum + event.value, 0);
    const goals = total("goal");
    const points = total("points");
    return [
      {
        id: match.id,
        href: `/atletas/${athlete.id}`,
        name: athlete.fullName,
        sportName: match.sportName,
        teamShort: team.university.shortName,
        teamLogo: team.university.logoUrl,
        jersey: athlete.jerseyNumber,
        position: athlete.position,
        photoUrl: cloudinaryImage(athlete.photoUrl, 640),
        stat: goals
          ? `${goals} ${goals === 1 ? "gol" : "goles"} · ${match.homeShort} vs ${match.awayShort}`
          : points
            ? `${points} pts · ${match.homeShort} vs ${match.awayShort}`
            : `${match.homeShort} vs ${match.awayShort}`,
      },
    ];
  });

  if (slides.length) return slides;
  return SHOW_DEMO_MVPS ? DEMO_MVPS : [];
}

function MvpPending() {
  return (
    <article
      className={cn(
        CARD,
        RAIL,
        "flex flex-col border-amber-300/50 bg-[linear-gradient(155deg,#52525b_0%,#27272a_42%,#09090b_100%)] p-4 text-white",
      )}
    >
      <div aria-hidden className="absolute inset-1.5 rounded-xl border border-amber-300/30" />
      <Badge>
        <Trophy className="size-3" strokeWidth={2.5} />
        MVP de la semana
      </Badge>
      <div className="relative flex flex-1 items-center justify-center">
        <Image
          src="/intro/futbol.webp"
          alt=""
          width={632}
          height={636}
          className="h-auto max-h-40 w-auto opacity-25 brightness-0 invert"
        />
      </div>
      <h2 className="font-jersey relative text-4xl leading-[0.9] uppercase">Por anunciar</h2>
      <p className="relative mt-1.5 mb-4 text-xs text-white/70">Al cierre de la fecha.</p>
    </article>
  );
}

const EDITION_DAY = new Intl.DateTimeFormat("es-VE", {
  timeZone: "America/Caracas",
  day: "numeric",
  month: "short",
});

function editionLabel() {
  return EDITION_DAY.format(Date.now());
}

const NEWS_FILLER =
  "Toda la cobertura de la jornada universitaria: resultados, crónicas, previas y la voz de los protagonistas de las ocho universidades que compiten esta temporada.";

/** Press photos for stories published without a cover. */
const NEWS_PHOTO: Record<string, string> = {
  "futbol-campo": "/news/futbol-campo.webp",
};

function newsPhoto(item: NewsCard | undefined, sports: SportCard[]) {
  if (item?.coverImageUrl) return cloudinaryImage(item.coverImageUrl, 480) ?? item.coverImageUrl;
  const slug = sports.find((sport) => sport.id === item?.sportId)?.slug;
  return (slug && NEWS_PHOTO[slug]) || "/news/futbol-campo.webp";
}

function storyText(item: NewsCard | undefined, content: string | null) {
  const body = [item?.excerpt, content?.replace(/<[^>]+>|[#*_>`]/g, " ")]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return body.length > 220 ? body : `${body} ${NEWS_FILLER}`.trim();
}

/** Front page of the league's paper; the full stories live on /noticias. */
function NewsTile({
  item,
  content,
  count,
  photo,
}: {
  item?: NewsCard;
  content: string | null;
  count: number;
  photo: string;
}) {
  return (
    <Link
      href="/noticias"
      aria-label="Ir a noticias"
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-[#f4f1ea] p-4 text-zinc-950 shadow-sm ring-1 ring-zinc-200/80 transition-all duration-300 ring-inset hover:ring-[#C8102E]/60",
        RAIL,
      )}
    >
      <div className="flex items-center justify-center gap-2 border-b border-zinc-950/80 pb-1.5">
        <Image src="/brand/liga-u-logo.svg" alt="" width={28} height={31} className="h-7 w-auto" />
        <span className="font-serif text-[1.6rem] leading-none font-black tracking-tight">
          Diario <span className="text-[#C8102E] italic">Liga U</span>
        </span>
      </div>
      <div className="flex items-center justify-between border-b-[3px] border-double border-zinc-950/80 py-1 font-serif text-[9px] tracking-[0.18em] text-zinc-600 uppercase">
        <span>Caracas</span>
        <span>Edición {editionLabel()}</span>
        <span>Temporada 2026</span>
      </div>

      <p className="mt-2 text-[9px] font-black tracking-[0.2em] text-[#C8102E] uppercase">
        {item?.sportName ?? "Portada"}
      </p>
      <h2 className="mt-0.5 line-clamp-2 font-serif text-[1.15rem] leading-[1.08] font-black">
        {item?.title ?? "La crónica de la jornada universitaria"}
      </h2>

      <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 gap-2.5">
        <figure className="relative overflow-hidden bg-zinc-300">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt=""
            className="absolute inset-0 size-full object-cover contrast-125 grayscale transition-transform duration-700 group-hover:scale-105"
          />
        </figure>
        <p className="max-h-[7.5rem] min-w-0 self-start overflow-hidden border-l border-zinc-950/15 pl-2.5 font-serif text-xs leading-[1.25rem] break-words text-zinc-700 hyphens-auto [mask-image:linear-gradient(to_bottom,black_75%,transparent)] md:max-h-[10rem] first-letter:float-left first-letter:mr-1 first-letter:text-[2.6rem] first-letter:leading-[0.8] first-letter:font-black first-letter:text-[#C8102E]">
          {storyText(item, content)}
        </p>
      </div>

      <div className={cn(RAIL_FOOTER, "mt-3 border-zinc-950/15")}>
        <span className="flex min-h-11 flex-col justify-center text-[10px] leading-tight font-black tracking-[0.18em] text-zinc-500 uppercase">
          {count > 0 ? `${count} ${count === 1 ? "historia" : "historias"}` : "Sala de prensa"}
          <span className="font-bold tracking-[0.14em] text-zinc-400">Crónicas · Previas</span>
        </span>
        <CardLink>Ver noticias</CardLink>
      </div>
    </Link>
  );
}

type Reel = { label: string; meta: string; photo: string; audio?: boolean };

const REELS: Reel[] = [
  { label: "Entrevista", meta: "15K", photo: "/reels/entrevista.webp" },
  { label: "Clavada", meta: "28K", photo: "/mvp-demo/baloncesto.webp" },
  {
    label: "Podcast",
    meta: "Nuevo ep.",
    photo: "/reels/podcast.webp",
    audio: true,
  },
];

const REEL_POSE = [
  "left-[6%] top-5 h-[82%] -rotate-[9deg]",
  "left-1/2 top-0 z-10 h-full -translate-x-1/2 shadow-[0_22px_40px_-14px_rgba(9,9,11,0.55)]",
  "right-[6%] top-5 h-[82%] rotate-[9deg]",
];

/** Preview of /multimedia: a fan of highlight reels and the podcast. */
function MediaTile() {
  return (
    <Link
      href="/multimedia"
      aria-label="Ir a multimedia: videos y podcasts de Liga U"
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_30%,rgba(200,16,46,0.07),transparent_60%),linear-gradient(160deg,#fafafa_0%,#e4e4e7_100%)] p-4 text-zinc-950 shadow-sm ring-1 ring-zinc-200/80 transition-all duration-300 ring-inset hover:ring-[#C8102E]/60",
        RAIL,
      )}
    >
      <div className="relative min-h-0 flex-1">
        {REELS.map((reel, index) => (
          <span
            key={reel.label}
            className={cn(
              "absolute aspect-[9/16] overflow-hidden rounded-xl bg-zinc-300 ring-2 ring-white transition-transform duration-500",
              REEL_POSE[index],
              index === 0 && "group-hover:-rotate-[13deg]",
              index === 2 && "group-hover:rotate-[13deg]",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={reel.photo} alt="" className="absolute inset-0 size-full object-cover" />
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(9,9,11,0.75),transparent_55%)]"
            />
            <span className={cn("absolute inset-x-2 bottom-2 text-white", index === 2 && "text-right")}>
              <span className="font-jersey block text-base leading-none uppercase">{reel.label}</span>
              <span
                className={cn(
                  "mt-0.5 flex items-center gap-1 text-[9px] font-bold text-white/80",
                  index === 2 && "justify-end",
                )}
              >
                {reel.audio ? <Mic className="size-2.5" strokeWidth={3} /> : <Play className="size-2.5 fill-current" />}
                {reel.meta}
              </span>
            </span>
          </span>
        ))}
      </div>

      <p className="mt-3 text-[10px] font-black tracking-[0.2em] text-[#C8102E] uppercase">Multimedia</p>
      <h2 className="font-jersey mt-0.5 text-3xl leading-[0.9] uppercase">Lo mejor de la jornada</h2>
      <p className="mt-1 text-xs font-semibold text-zinc-500">Entrevistas · Highlights · Podcasts</p>

      <div className={cn(RAIL_FOOTER, "mt-3 border-zinc-950/10")}>
        <span className="ml-auto">
          <CardLink>Ver todo</CardLink>
        </span>
      </div>
    </Link>
  );
}

type StandingsPreview = {
  sportName: string;
  genderLabel: string;
  rows: StandingRow[];
};

/** Table for the sport and branch of the featured match; without a match, the busiest table. */
function standingsPreview(
  catalog: Awaited<ReturnType<typeof getPublicCatalog>>,
  match: MatchCard | undefined,
): StandingsPreview | null {
  const byGroup = new Map<string, TeamCard[]>();
  for (const team of catalog.teams) {
    const key = `${team.sportId}:${team.gender}`;
    byGroup.set(key, [...(byGroup.get(key) ?? []), team]);
  }
  const groups = [...byGroup.entries()].map(([key, teams]) => {
    const ids = new Set(teams.map((team) => team.id));
    const matches = catalog.matches.filter((m) => ids.has(m.homeTeamId) && ids.has(m.awayTeamId));
    const sport = catalog.sports.find((item) => item.id === teams[0].sportId);
    return {
      key,
      sportName: sport?.name ?? "Deporte",
      genderLabel: GENDER_LABELS[teams[0].gender],
      played: matches.filter((m) => m.status === "finished" && m.homeScore !== null && m.awayScore !== null).length,
      rows: computeStandings(matches, teams),
    };
  });
  const featured = match && groups.find((group) => group.key === `${match.sportId}:${match.gender}`);
  if (featured) return featured;
  groups.sort((a, b) => b.played - a.played || a.sportName.localeCompare(b.sportName));
  return groups[0] ?? null;
}

/** Background tones sampled from each team's mascot so the card matches the logo. */
const TEAM_TONES: Record<string, { glow: string; mid: string; base: string }> = {
  UAH: { glow: "#9a6233", mid: "#472812", base: "#0d0805" },
  UCAB: { glow: "#0e5a85", mid: "#00293f", base: "#020a12" },
  UCV: { glow: "#d11a1a", mid: "#5c0606", base: "#0f0303" },
  UMA: { glow: "#2c920b", mid: "#114a04", base: "#040c02" },
  UNE: { glow: "#0a8396", mid: "#014450", base: "#021013" },
  UNIMET: { glow: "#c47a12", mid: "#3d2406", base: "#0b0a0a" },
  USB: { glow: "#d99a0b", mid: "#4a3307", base: "#0d0b08" },
  USM: { glow: "#2b3f9e", mid: "#0a1145", base: "#03040f" },
};
const DEFAULT_TONE = { glow: "#9f1239", mid: "#4c0519", base: "#0b0b0f" };

function StandingsTile({ table }: { table: StandingsPreview | null }) {
  const leader = table?.rows[0];
  const tone = (leader && TEAM_TONES[leader.universityShort.toUpperCase()]) || DEFAULT_TONE;
  return (
    <Link
      href="/clasificacion"
      style={{
        backgroundImage: `radial-gradient(ellipse at 50% 0%, ${tone.glow} 0%, ${tone.mid} 42%, ${tone.base} 100%)`,
        boxShadow: `0 24px 50px -24px ${tone.mid}`,
      }}
      className={cn(
        RAIL,
        "group relative isolate flex flex-col overflow-hidden rounded-2xl p-4 text-white transition-transform duration-300 hover:-translate-y-0.5",
      )}
    >
      <div aria-hidden className="absolute inset-x-[-20%] top-[22%] bottom-[-18%] -z-10 [perspective:380px]">
        <CourtMark
          sport={table?.sportName ?? "futbol"}
          className="size-full text-white/45 [mask-image:linear-gradient(to_top,black_55%,transparent)] [transform:rotateX(52deg)]"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 mx-auto h-3/4 w-full bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent_75%)] [clip-path:polygon(38%_0,62%_0,92%_100%,8%_100%)]"
      />
      <div
        aria-hidden
        style={{ backgroundColor: tone.glow }}
        className="absolute top-[40%] left-1/2 -z-10 size-44 -translate-1/2 rounded-full opacity-35 blur-3xl"
      />
      <div aria-hidden className="absolute inset-1.5 -z-10 rounded-xl border border-white/10" />

      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex shrink-0 items-center gap-1.5 text-amber-200">
          <Crown className="size-3.5" strokeWidth={1.75} />
          <span className="text-[10px] leading-tight font-semibold tracking-[0.32em] uppercase">Líder</span>
        </span>
        {table ? (
          <span className="text-right text-[10px] leading-tight font-black tracking-wide text-white/75 uppercase">
            {table.sportName}
            <br />
            {table.genderLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {leader ? (
          <>
            {leader.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={leader.logoUrl}
                alt=""
                className="size-24 object-contain [filter:drop-shadow(0_0_16px_rgba(255,255,255,0.35))_drop-shadow(0_12px_18px_rgba(0,0,0,0.6))] transition-transform duration-500 group-hover:scale-110 md:size-28"
              />
            ) : null}
            <p className="font-jersey mt-2 text-5xl leading-none tracking-wide">{leader.universityShort}</p>
            <p className="mt-1 line-clamp-1 text-[11px] text-white/60">{leader.universityName}</p>
          </>
        ) : (
          <>
            <Trophy className="size-14 text-white/60" strokeWidth={1.25} />
            <p className="font-jersey mt-3 text-4xl leading-none uppercase">Por definir</p>
          </>
        )}
      </div>

      {leader ? (
        <dl className="grid grid-cols-3 divide-x divide-white/10 rounded-xl bg-white/[0.07] py-2 ring-1 ring-white/10 backdrop-blur">
          {[
            { label: "Pts", value: leader.points },
            { label: "PJ", value: leader.played },
            { label: "G", value: leader.won },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col-reverse items-center">
              <dt className="text-[9px] font-black tracking-[0.18em] text-white/55 uppercase">{label}</dt>
              <dd className="font-jersey text-2xl leading-none tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className={cn(RAIL_FOOTER, "mt-2")}>
        <span />
        <span className="inline-flex min-h-11 items-center gap-1 text-xs font-black tracking-wide uppercase">
          Ver clasificación
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}

/** Headline partner on the home rail; the flyer opens the brand's own site. */
const TOP_SPONSOR = {
  match: "champion",
  name: "Champion",
  url: "https://www.champion.com",
  flyer: "/flyers/champion.webp",
} as const;

function topSponsor(sponsors: SponsorCard[]) {
  return sponsors.find((sponsor) => sponsor.name.toLowerCase().includes(TOP_SPONSOR.match));
}

function SponsorFlyer({ sponsor }: { sponsor?: SponsorCard }) {
  return (
    <a
      href={TOP_SPONSOR.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={`${TOP_SPONSOR.name}, indumentaria oficial de Liga U`}
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-2xl bg-[#0b1636] p-4 text-white shadow-[0_24px_50px_-24px_rgba(11,22,54,0.8)]",
        RAIL,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={TOP_SPONSOR.flyer}
        alt=""
        className="absolute top-0 right-0 -z-10 h-full w-auto max-w-none transition-transform duration-700 group-hover:scale-105"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(11,22,54,0.92)_0%,rgba(11,22,54,0.55)_48%,transparent_78%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(11,22,54,0.95)_0%,transparent_45%)]"
      />
      <span className="w-fit rounded-md bg-white px-3 py-2 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)]">
        {sponsor ? (
          <SponsorMark sponsor={sponsor} className="h-6 w-auto max-w-32" />
        ) : (
          <span className="text-sm font-black tracking-wide text-[#0b1636] italic">{TOP_SPONSOR.name}</span>
        )}
      </span>

      <div className="mt-auto">
        <p className="text-[9px] font-black tracking-[0.24em] text-white/70 uppercase">Temporada 2026</p>
        <h2 className="font-jersey mt-1 text-[2.85rem] leading-[0.84] uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]">
          Indumentaria
          <br />
          oficial
        </h2>
        <span className="font-jersey mt-1.5 inline-block -skew-x-12 bg-[#d71920] px-2.5 py-0.5 text-2xl leading-none uppercase">
          <span className="inline-block skew-x-12">de la Liga U</span>
        </span>
      </div>

      <div className={cn(RAIL_FOOTER, "mt-3")}>
        <span className="flex min-h-11 items-center truncate text-[9px] font-black tracking-[0.16em] text-white/60 uppercase">
          Patrocinador oficial
        </span>
        <span className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs font-black tracking-wide whitespace-nowrap uppercase">
          Ir a la tienda
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
        </span>
      </div>
    </a>
  );
}

/** Brushed-platinum member card in the spirit of Apple Card; the whole block opens /liga-u-pass. */
function PassTile() {
  return (
    <div className="mx-auto grid w-full max-w-md items-center gap-4 md:max-w-none md:grid-cols-[minmax(0,26rem)_1fr] md:gap-10">
      <Link
        href="/liga-u-pass"
        aria-label="U Pass: ver los beneficios de las marcas aliadas"
        className="group relative block"
      >
        <div
          aria-hidden
          className="absolute inset-x-[8%] -bottom-5 h-10 rounded-[50%] bg-zinc-950/35 blur-2xl transition-all duration-500 group-hover:-bottom-7 group-hover:bg-zinc-950/25"
        />
        <div className="relative isolate aspect-[1.586/1] w-full overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#f4f4f5_0%,#d4d4d8_32%,#fafafa_52%,#c4c4c9_74%,#a1a1aa_100%)] text-zinc-900 shadow-[0_40px_70px_-30px_rgba(9,9,11,0.6),0_18px_36px_-18px_rgba(9,9,11,0.35),0_2px_6px_rgba(9,9,11,0.08)] ring-1 ring-white/70 transition-transform duration-500 ring-inset group-hover:-translate-y-2 group-hover:-rotate-1">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-60 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,0.35)_0_1px,transparent_1px_3px)]"
          />
          <div
            aria-hidden
            className="absolute -right-16 -bottom-20 -z-10 size-64 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.14),transparent_68%)]"
          />
          <div
            aria-hidden
            className="absolute inset-y-0 -left-1/2 -z-10 w-1/3 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)] transition-transform duration-1000 ease-out group-hover:translate-x-[420%]"
          />
          <span aria-hidden className="absolute inset-y-0 right-[6.5rem] -z-10 w-[3px] md:right-[6.75rem] bg-[#C8102E]/85" />

          <div className="flex h-full flex-col justify-between p-5 md:p-6">
            <div className="flex items-start justify-between">
              <span className="flex items-center gap-2">
                <Image
                  src="/brand/liga-u-logo.svg"
                  alt=""
                  width={44}
                  height={48}
                  className="h-11 w-auto drop-shadow-sm"
                />
                <span className="font-jersey text-2xl leading-none tracking-wide uppercase">
                  U <span className="text-[#C8102E]">Pass</span>
                </span>
              </span>
              <Wifi aria-hidden className="size-5 rotate-90 text-zinc-500" strokeWidth={2.25} />
            </div>

            <div className="flex items-end justify-between gap-3">
              <span>
                <span className="block text-[9px] font-bold tracking-[0.22em] text-zinc-500 uppercase">Miembro</span>
                <span className="mt-0.5 block font-mono text-sm font-semibold tracking-[0.18em] uppercase">
                  Andrea Salazar
                </span>
              </span>
              <span className="text-right">
                <span className="block text-[9px] font-bold tracking-[0.22em] text-zinc-500 uppercase">Temporada</span>
                <span className="font-jersey block text-xl leading-none text-[#C8102E]">2026</span>
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="pt-4 text-center md:pt-0 md:text-left">
        <h2 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.022em] text-zinc-950 md:text-5xl">
          Tu U Pass.
          <br />
          <span className="text-zinc-400">Beneficios que se sienten.</span>
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-[17px] leading-[1.47] tracking-[-0.022em] text-zinc-500 md:mx-0 md:max-w-md">
          Accede a descuentos y beneficios exclusivos que te ofrecen las marcas aliadas de la liga.
        </p>
        <div className="mt-5 flex items-center justify-center gap-5 md:justify-start">
          <Link
            href="/liga-u-pass/obtener"
            className="inline-flex min-h-11 items-center rounded-full bg-[#C8102E] px-5 text-[15px] font-medium tracking-[-0.01em] text-white transition-colors hover:bg-[#a50f25]"
          >
            Obtener U Pass
          </Link>
          <Link
            href="/liga-u-pass"
            className="inline-flex min-h-11 items-center gap-0.5 text-[15px] font-medium tracking-[-0.01em] text-[#C8102E] hover:underline"
          >
            Ver beneficios
            <ChevronRight className="size-4" strokeWidth={2.25} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 30;

export default async function HomePage() {
  const [catalog, sponsors] = await Promise.all([getPublicCatalog(), getHomeSponsorLogos()]);
  const mvps = weeklyMvps(catalog);
  const match = featuredMatch(catalog.matches);
  const lead = catalog.news.find((item) => item.isFeatured) ?? catalog.news[0];
  const leadContent = lead ? await getNewsContent(lead.id) : null;
  const universities = catalog.universities.length || CLUB_ORDER.length;
  const disciplines = catalog.sports.length || 9;
  return (
    <>
      <style>{`.ligau-canvas{visibility:hidden}`}</style>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-white" />
      <main className="overflow-x-hidden bg-white">
        <section
          aria-labelledby="hero-title"
          className="relative isolate flex h-[calc(100svh-5rem-env(safe-area-inset-bottom,0px))] max-h-[900px] min-h-[560px] w-full flex-col justify-end overflow-hidden bg-zinc-100 md:h-[min(100svh,880px)]"
        >
          <picture className="absolute inset-0 -z-20">
            <source media="(min-width: 768px)" srcSet="/home/hero-platino-desktop.webp" />
            <img
              src="/home/hero-platino-mobile.webp"
              alt="Jugador de Liga U ejecutando una chilena"
              fetchPriority="high"
              className="animate-ligau-hero h-full w-full object-cover object-[50%_30%] md:object-[70%_40%]"
            />
          </picture>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,#fff_0%,rgba(255,255,255,0.9)_22%,rgba(255,255,255,0)_55%)] md:bg-[linear-gradient(to_top,#fff_0%,rgba(255,255,255,0)_45%),linear-gradient(to_right,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0)_50%)]"
          />

          <div className="mx-auto w-full max-w-7xl px-5 pb-10 md:px-8 md:pb-16">
            <h1
              id="hero-title"
              className="font-jersey max-w-4xl text-[3.75rem] leading-[0.84] text-zinc-950 uppercase sm:text-8xl lg:text-[8.5rem]"
            >
              El <span className="text-[#C8102E]">epicentro</span> del talento universitario
            </h1>
            <p className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-white/80 py-1.5 pr-3.5 pl-2.5 text-[11px] font-bold tracking-[0.24em] text-zinc-900 uppercase shadow-[0_8px_24px_-12px_rgba(9,9,11,0.35)] ring-1 ring-zinc-900/10 backdrop-blur-md">
              <span aria-hidden className="size-2 rounded-full bg-[#C8102E] shadow-[0_0_0_3px_rgba(200,16,46,0.18)]" />
              Temporada 2026 · Liga U
            </p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-zinc-600 md:text-lg">
              {universities} universidades. {disciplines} deportes. Una sola pasión. Vive los partidos, las jugadas y los campeones de la temporada.
            </p>
          </div>
        </section>

        <section aria-label="Lo destacado de la liga" className="mx-auto mt-6 max-w-7xl md:mt-10">
          <div className="grid px-3 md:px-4">
            <RostersTile clubs={universities} />
          </div>
          <div className="flex snap-x snap-mandatory scroll-px-3 gap-3 overflow-x-auto px-3 pt-4 pb-6 [scrollbar-width:none] md:scroll-px-4 md:gap-5 md:px-4 md:pt-6 md:[scrollbar-width:thin]">
            <MatchTile match={match} />
            <StandingsTile table={standingsPreview(catalog, match)} />
            {mvps.length ? <MvpCarousel slides={mvps} className={RAIL} /> : <MvpPending />}
            <NewsTile
              item={lead}
              content={leadContent}
              count={catalog.news.length}
              photo={newsPhoto(lead, catalog.sports)}
            />
            <SponsorFlyer sponsor={topSponsor(sponsors)} />
            <MediaTile />
          </div>
          <div className="mt-20 grid px-3 md:mt-8 md:px-4">
            <PassTile />
          </div>
        </section>

        <div className="mx-auto mt-28 max-w-7xl px-4 pb-8 md:mt-12">
          <SponsorMarquee sponsors={sponsors} />
        </div>
      </main>
    </>
  );
}
