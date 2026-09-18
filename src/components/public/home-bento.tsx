import Link from "next/link";
import { MatchCountdown } from "@/components/public/match-countdown";
import { cn } from "@/lib/utils";
import type { MatchCard, MvpHighlight, NewsCard } from "@/lib/public/types";

const MEDIA = {
  news: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?auto=format&fit=crop&w=800&q=80",
  basket:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
  football:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
  futsal:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80",
  volley:
    "https://images.unsplash.com/photo-1612872088519-3e939b0ba5b3?auto=format&fit=crop&w=800&q=80",
  rugby:
    "https://images.unsplash.com/photo-1566577739112-5180d4bf3900?auto=format&fit=crop&w=800&q=80",
  chess:
    "https://images.unsplash.com/photo-1529699211552-35d0cfa2c0b3?auto=format&fit=crop&w=800&q=80",
  broadcast:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
  squad:
    "https://images.unsplash.com/photo-1739694453275-a5326bbb37ea?auto=format&fit=crop&w=1200&q=80",
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
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function TileBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 w-fit bg-red-600 px-3 py-1 text-[10px] font-black tracking-wider text-white uppercase [clip-path:polygon(6px_0,100%_0,calc(100%-6px)_100%,0_100%)]">
      {children}
    </span>
  );
}

function Tile({
  href,
  className,
  gold,
  children,
}: {
  href: string;
  className?: string;
  gold?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative cursor-pointer overflow-hidden border transition-all duration-300",
        gold
          ? "border-amber-500/40 bg-zinc-950 hover:border-amber-400"
          : "border-zinc-800/90 hover:border-red-600/80",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function PhotoLayer({ src }: { src: string }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
      style={{ backgroundImage: `url('${src}')` }}
    />
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

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Tile
          href="/universidades"
          className="relative min-h-[260px] [clip-path:polygon(24px_0,100%_0,100%_100%,0_100%,0_24px)] md:min-h-[280px]"
        >
          <PhotoLayer src={MEDIA.squad} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[260px] flex-col justify-end p-6 md:min-h-[280px]">
            <TileBadge>Rosters oficiales</TileBadge>
            <h3 className="text-2xl font-black tracking-tight text-white uppercase transition-colors group-hover:text-red-400 md:text-3xl">
              Plantillas y atletas
            </h3>
            <p className="mt-1 text-sm text-zinc-300">
              Explora las alineaciones de las 8 universidades.
            </p>
          </div>
        </Tile>

        <Tile
          href={nextMatch ? `/partidos/${nextMatch.id}` : "/competicion"}
          className="relative min-h-[260px] md:min-h-[280px]"
        >
          <PhotoLayer src={duelPhoto(nextMatch?.sportName)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[260px] flex-col justify-end p-6 md:min-h-[280px]">
            <TileBadge>Próximo duelo</TileBadge>
            <h4 className="text-lg font-black text-white uppercase transition-colors group-hover:text-red-400 md:text-xl">
              {nextMatch ? (
                <>
                  {nextMatch.homeShort}{" "}
                  <span className="font-mono text-red-500">VS</span> {nextMatch.awayShort}
                </>
              ) : (
                "Match Center"
              )}
            </h4>
            {nextMatch ? (
              <>
                {venue || kickoff ? (
                  <p className="mt-1 font-mono text-xs text-zinc-400">
                    {[venue, kickoff].filter(Boolean).join(" • ")}
                  </p>
                ) : null}
                <div className="mt-1">
                  <MatchCountdown date={nextMatch.matchDate} />
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-zinc-400">Aún no hay un partido programado.</p>
            )}
          </div>
        </Tile>

        <Tile
          href={mvp ? `/atletas/${mvp.athlete.id}` : "/competicion"}
          gold
          className="relative min-h-[400px] [clip-path:polygon(0_0,calc(100%-24px)_0,100%_24px,100%_calc(100%-24px),calc(100%-24px)_100%,0_100%)] md:row-span-2 md:min-h-full"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950" />
          <div className="relative z-10 flex h-full min-h-[400px] flex-col items-center justify-center p-6 text-center md:min-h-full">
            {mvp ? (
              <>
                <div className="mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-amber-500/30 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-transform duration-500 group-hover:scale-110">
                  {mvp.athlete.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mvp.athlete.photoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-black text-amber-500">
                      {mvp.athlete.fullName.slice(0, 1)}
                    </span>
                  )}
                </div>
                <TileBadge>Destacado</TileBadge>
                <h4 className="text-2xl leading-tight font-black text-white uppercase">
                  {mvp.athlete.fullName}
                </h4>
                <p className="mt-4 max-w-[200px] text-xs text-zinc-500">
                  {mvp.team.label} · {mvp.sportName}
                </p>
              </>
            ) : (
              <>
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-transform duration-500 group-hover:scale-110">
                  <span className="text-5xl font-black text-amber-500 drop-shadow-md">?</span>
                </div>
                <TileBadge>Destacado</TileBadge>
                <h4 className="text-2xl leading-tight font-black text-white uppercase">
                  MVP de la
                  <br />
                  semana
                </h4>
                <p className="mt-4 max-w-[200px] text-xs text-zinc-500">
                  Identidad oculta. Se revela al cerrar la jornada con MVP oficial.
                </p>
              </>
            )}
          </div>
        </Tile>

        <Tile
          href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
          className="relative min-h-[260px] [clip-path:polygon(0_0,100%_0,100%_100%,24px_100%,0_calc(100%-24px))]"
        >
          <PhotoLayer src={MEDIA.news} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[260px] flex-col justify-end p-6">
            <TileBadge>Noticias</TileBadge>
            <h4 className="text-lg font-black text-white uppercase group-hover:text-red-400">
              {featured?.title ?? "La jornada en cancha"}
            </h4>
            {featured?.excerpt ? (
              <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{featured.excerpt}</p>
            ) : null}
          </div>
        </Tile>

        <Tile
          href="/multimedia"
          className="relative min-h-[260px] [clip-path:polygon(0_0,100%_0,100%_calc(100%-24px),calc(100%-24px)_100%,0_100%)]"
        >
          <PhotoLayer src={MEDIA.broadcast} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/85 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[260px] flex-col justify-end p-6">
            <TileBadge>Multimedia</TileBadge>
            <h4 className="text-lg font-black text-white uppercase group-hover:text-red-400">
              Multimedia Hub
            </h4>
            <p className="mt-1 text-sm text-zinc-300">Podcasts • Videos • Highlights</p>
          </div>
        </Tile>
      </div>
    </section>
  );
}
