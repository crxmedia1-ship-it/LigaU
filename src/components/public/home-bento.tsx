import Link from "next/link";
import { ArrowUpRight, Play, Sparkles, Users } from "lucide-react";
import { MatchCountdown } from "@/components/public/match-countdown";
import { Reveal } from "@/components/public/reveal";
import type { MatchCard, MvpHighlight, NewsCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

const MEDIA = {
  news: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?auto=format&fit=crop&w=800&q=80",
  basket:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
  football:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  futsal:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
  volley:
    "https://images.unsplash.com/photo-1612872088519-3e939b0ba5b3?auto=format&fit=crop&w=1200&q=80",
  rugby:
    "https://images.unsplash.com/photo-1566577739112-5180d4bf3900?auto=format&fit=crop&w=1200&q=80",
  chess:
    "https://images.unsplash.com/photo-1529699211552-35d0cfa2c0b3?auto=format&fit=crop&w=1200&q=80",
  broadcast:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
  mvp: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=900&q=80",
};

function duelPhoto(sportName: string | undefined) {
  const sport = sportName?.toLowerCase() ?? "";
  if (sport.includes("balonc") || sport.includes("basket")) return MEDIA.basket;
  if (sport.includes("voleib") || sport.includes("voley")) return MEDIA.volley;
  if (sport.includes("futsal")) return MEDIA.futsal;
  if (sport.includes("rugby")) return MEDIA.rugby;
  if (sport.includes("ajedrez") || sport.includes("chess")) return MEDIA.chess;
  if (sport.includes("fútbol") || sport.includes("futbol")) return MEDIA.football;
  return MEDIA.basket;
}

function formatKickoff(value: string) {
  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const card =
  "group relative isolate flex h-full overflow-hidden rounded-[1.25rem] outline-none transition-transform duration-500 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#ff4d6a] focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/10 after:ring-inset";

function Photo({ src, shade = "from-black/90 via-black/30 to-transparent" }: { src: string; shade?: string }) {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-zinc-900 bg-cover bg-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
        style={{ backgroundImage: `url('${src}')` }}
      />
      <div aria-hidden className={cn("absolute inset-0 -z-10 bg-gradient-to-t", shade)} />
    </>
  );
}

function Corner() {
  return (
    <span
      aria-hidden
      className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-md transition-all duration-300 group-hover:bg-white group-hover:text-zinc-950"
    >
      <ArrowUpRight className="size-4" strokeWidth={2.25} />
    </span>
  );
}

function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[10px] font-semibold tracking-[0.24em] text-white/55 uppercase", className)}>
      {children}
    </p>
  );
}

export function HomeBento({
  news = [],
  nextMatch,
  mvp,
}: {
  news?: NewsCard[];
  nextMatch: MatchCard | null;
  mvp: MvpHighlight | null;
}) {
  const featured = news.find((item) => item.isFeatured) ?? news[0];
  const kickoff = nextMatch ? formatKickoff(nextMatch.matchDate) : null;
  const venue = nextMatch?.location?.trim() || null;
  const homeName = nextMatch?.homeShort ?? "Liga";
  const awayName = nextMatch?.awayShort ?? "U";

  return (
    <section
      id="home-grids"
      className="relative w-full scroll-mt-[calc(3.25rem+env(safe-area-inset-top,0px))] px-2 pb-10 sm:px-4 sm:pt-8 sm:pb-24 lg:px-8"
    >
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#0a0a0c] px-3 pt-6 pb-3 shadow-[0_40px_80px_-40px_rgba(10,10,12,0.6)] sm:px-5 sm:pt-8 sm:pb-5 lg:rounded-[2.5rem] lg:px-10 lg:pt-12 lg:pb-10 xl:px-14 2xl:px-20">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(90%_55%_at_50%_-8%,rgba(200,16,46,0.38),transparent_70%),radial-gradient(60%_40%_at_100%_100%,rgba(200,16,46,0.12),transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />
        <div aria-hidden className="absolute inset-x-10 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <Reveal className="mb-5 flex items-end justify-between gap-4 px-1 lg:mb-8">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] text-white/50 uppercase">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#ff4d6a] opacity-75" />
                <span className="relative size-1.5 rounded-full bg-[#ff4d6a]" />
              </span>
              Temporada 2026
            </p>
            <h2 className="font-jersey mt-1.5 text-[2.5rem] leading-none text-white uppercase lg:text-6xl">La jornada</h2>
          </div>
          <Link
            href="/competicion"
            className="mb-1 inline-flex items-center gap-1 text-xs font-semibold text-white/70 transition-colors hover:text-white"
          >
            Calendario
            <ArrowUpRight className="size-3.5" strokeWidth={2.25} />
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:grid-rows-[repeat(2,15rem)] lg:gap-4">
          <Reveal className="col-span-2 md:row-span-2">
            <Link href="/competicion" className={cn(card, "h-64 flex-col justify-between p-4 sm:h-80 sm:p-6 md:h-full")}>
              <Photo src={duelPhoto(nextMatch?.sportName)} shade="from-black/95 via-black/50 to-black/25" />
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-white uppercase ring-1 ring-white/15 backdrop-blur-md">
                  {nextMatch?.sportName ?? "Próximo partido"}
                </span>
                {nextMatch ? (
                  <MatchCountdown
                    date={nextMatch.matchDate}
                    className="shrink-0 rounded-full bg-[#C8102E] px-3 py-1.5 text-[10px] font-semibold text-white shadow-[0_0_24px_rgba(200,16,46,0.6)]"
                  />
                ) : null}
              </div>
              <div>
                <p className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <span className="font-jersey min-w-0 truncate text-[clamp(3rem,15vw,4.5rem)] leading-[0.85] text-white sm:text-7xl lg:text-8xl">
                    {homeName}
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-white/10 text-[11px] font-bold tracking-wider text-white ring-1 ring-white/20 backdrop-blur-md sm:size-11">
                    VS
                  </span>
                  <span className="font-jersey min-w-0 truncate text-right text-[clamp(3rem,15vw,4.5rem)] leading-[0.85] text-white sm:text-7xl lg:text-8xl">
                    {awayName}
                  </span>
                </p>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                  <p className="min-w-0 truncate text-[13px] text-white/70">
                    {nextMatch ? [venue, kickoff].filter(Boolean).join(" · ") : "Aún no hay un partido programado"}
                  </p>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-zinc-950 transition-transform duration-300 group-hover:translate-x-0.5">
                    Ver
                    <ArrowUpRight className="size-3.5" strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>

          <Reveal className="row-span-2 md:row-span-2" delay={0.08}>
            <Link href="/competicion?tab=tabla" className={cn(card, "flex-col justify-end p-4")}>
              <Photo src={mvp?.athlete.photoUrl || MEDIA.mvp} />
              <Corner />
              <Kicker>MVP · Semana</Kicker>
              <h3 className="font-jersey mt-1 line-clamp-3 text-[2rem] leading-[0.92] text-white sm:text-4xl">
                {mvp?.athlete.fullName ?? "Por anunciar"}
              </h3>
            </Link>
          </Reveal>

          <Reveal delay={0.14}>
            <Link
              href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
              className={cn(card, "h-40 flex-col justify-end p-3.5 md:h-full")}
            >
              <Photo src={featured?.coverImageUrl || MEDIA.news} shade="from-black/95 via-black/65 to-black/15" />
              <Corner />
              <Kicker>Noticias</Kicker>
              <h3 className="mt-1 line-clamp-3 text-[13px] leading-snug font-medium text-white sm:text-sm">
                {featured?.title ?? "La jornada en cancha"}
              </h3>
            </Link>
          </Reveal>

          <Reveal delay={0.2}>
            <Link href="/multimedia" className={cn(card, "h-40 flex-col justify-end p-3.5 md:h-full")}>
              <Photo src={MEDIA.broadcast} shade="from-black/90 via-black/40 to-black/20" />
              <span
                aria-hidden
                className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-[75%] place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-zinc-950"
              >
                <Play className="size-4 translate-x-px fill-current" />
              </span>
              <Kicker>Multimedia</Kicker>
              <h3 className="font-jersey mt-0.5 text-[1.75rem] leading-none text-white">Clips</h3>
            </Link>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.26}>
            <Link
              href="/universidades"
              className={cn(card, "h-32 flex-col justify-between bg-white/[0.04] p-3.5 backdrop-blur-md md:h-36 md:p-5")}
            >
              <Corner />
              <Users className="size-5 text-[#ff4d6a]" strokeWidth={1.75} />
              <div>
                <Kicker>Rosters</Kicker>
                <h3 className="font-jersey text-[1.75rem] leading-none text-white md:text-4xl">Plantillas</h3>
              </div>
            </Link>
          </Reveal>

          <Reveal className="md:col-span-2" delay={0.32}>
            <Link
              href="/liga-u-pass"
              className={cn(
                card,
                "h-32 flex-col justify-between bg-[linear-gradient(135deg,#E8193C_0%,#B00E2A_55%,#6E0719_100%)] p-3.5 shadow-[0_18px_40px_-16px_rgba(200,16,46,0.9)] md:h-36 md:p-5",
              )}
            >
              <div
                aria-hidden
                className="absolute -top-10 -right-10 -z-10 size-32 rounded-full bg-white/20 blur-2xl"
              />
              <Corner />
              <Sparkles className="size-5 text-white" strokeWidth={1.75} />
              <div>
                <Kicker className="text-white/70">Beneficios</Kicker>
                <h3 className="font-jersey text-[1.75rem] leading-none text-white md:text-4xl">U Pass</h3>
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
