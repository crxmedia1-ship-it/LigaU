import { Tile } from "@/components/public/bento-tile";
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
  pass: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
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

/** Foreground text block — anchored still, only the photo zooms on hover. */
function TileContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative z-10 flex h-full min-h-0 flex-col justify-end pt-5 pr-5 pb-5 pl-6 sm:pt-6 sm:pr-6 sm:pb-6 sm:pl-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Copy sits on the photo. A bottom scrim keeps it readable; the pane stays a rectangle. */
const PANEL =
  "justify-end overflow-hidden before:pointer-events-none before:absolute before:inset-x-0 before:bottom-0 before:h-3/5 before:-z-10 before:bg-gradient-to-t before:from-black/72 before:via-black/28 before:to-transparent";

/**
 * Invisible defs, rendered once: a real optical-warp filter (fractal-noise
 * displacement map) shared by every tile's "cracked" photo duplicate below.
 * This is what makes the glass genuinely refract the image instead of just
 * drawing lines on top of it.
 */
function GlassWarpDefs() {
  return (
    <svg aria-hidden focusable="false" className="absolute h-0 w-0 overflow-hidden">
      <filter id="ligau-glass-warp" x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="34" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}

function PhotoLayer({ src }: { src: string }) {
  return (
    <>
      {/* Primary photo — slow zoom on hover, that's the only hover animation */}
      <div
        className="absolute inset-0 bg-cover bg-center contrast-[1.06] saturate-[1.12] transition-transform duration-700 ease-out group-hover:scale-110 group-data-[breaking=true]:scale-110"
        style={{ backgroundImage: `url('${src}')` }}
      />
      {/* Crystal sheen across the photo. No inset stroke — that traced the L. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(128deg,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0.12)_8%,transparent_24%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(9,9,11,0.35)_0%,transparent_36%)]"
      />
      {/* Optical warp only on click (breaking state) — no hover distortion */}
      <div
        className="absolute inset-0 hidden bg-cover bg-center opacity-0 transition-[opacity,transform] duration-150 ease-out group-data-[breaking=true]:scale-110 group-data-[breaking=true]:opacity-100 md:block"
        style={{ backgroundImage: `url('${src}')`, filter: "url(#ligau-glass-warp)" }}
      />
    </>
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
    <section
      id="home-grids"
      className="relative isolate w-full scroll-mt-[calc(3.25rem+env(safe-area-inset-top,0px))] px-4 pt-4 pb-8 sm:px-6 sm:pt-10 sm:pb-24 lg:px-12 xl:px-20 2xl:px-28"
    >
      {/* Soft crimson ambient blush — barely there, depth without dirt */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/6 via-transparent to-transparent md:h-80"
      />
      <GlassWarpDefs />
      <div className="flex flex-col gap-3">
        <Tile href="/competicion" className="h-[300px] sm:h-[380px] md:h-[500px]">
          <PhotoLayer src={duelPhoto(nextMatch?.sportName)} />
          <span aria-hidden className="absolute top-0 bottom-0 left-0 z-10 w-1.5 bg-[#C8102E]" />
          <TileContent className={PANEL}>
            <TileBadge>Próximo duelo{nextMatch?.sportName ? ` · ${nextMatch.sportName}` : ""}</TileBadge>
            <h2 className="font-jersey flex flex-wrap items-baseline gap-x-3 text-[3.4rem] leading-[0.82] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-7xl lg:text-8xl">
              {nextMatch ? (
                <>
                  <span>{nextMatch.homeShort}</span>
                  <span className="text-[0.62em] text-[#ff4d6a]">VS</span>
                  <span>{nextMatch.awayShort}</span>
                </>
              ) : (
                "Match Center"
              )}
            </h2>
            {nextMatch ? (
              <>
                {venue || kickoff ? (
                  <p className="mt-2 line-clamp-1 font-mono text-xs text-white/80 sm:text-sm">
                    {[venue, kickoff].filter(Boolean).join(" • ")}
                  </p>
                ) : null}
                <div className="mt-2">
                  <MatchCountdown date={nextMatch.matchDate} />
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-white/80">Aún no hay un partido programado.</p>
            )}
          </TileContent>
        </Tile>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <Tile href="/competicion?tab=tabla" className="h-[340px] md:col-span-4 md:h-[520px]">
            <div className="absolute inset-0 overflow-hidden bg-zinc-950">
              {mvp?.athlete.photoUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mvp.athlete.photoUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-top contrast-[1.05] saturate-[1.08] transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    aria-hidden
                    src={mvp.athlete.photoUrl}
                    alt=""
                    className="absolute inset-0 hidden h-full w-full object-cover object-top opacity-0 transition-[opacity,transform] duration-150 ease-out group-data-[breaking=true]:scale-110 group-data-[breaking=true]:opacity-90 md:block"
                    style={{ filter: "url(#ligau-glass-warp)" }}
                  />
                </>
              ) : (
                <PhotoLayer src={MEDIA.mvp} />
              )}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(128deg,rgba(255,255,255,0.28)_0%,transparent_22%)]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,#09090b_0%,rgba(9,9,11,0.45)_28%,transparent_58%)]" />
            <TileContent className={PANEL}>
              <TileBadge>MVP</TileBadge>
              {mvp ? (
                <>
                  <h3 className="font-jersey text-4xl leading-none text-white uppercase md:text-5xl">
                    {mvp.athlete.fullName}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-200">
                    {mvp.team.label} · {mvp.sportName}
                  </p>
                </>
              ) : (
                <>
                  <h3 className="font-jersey text-4xl leading-[0.9] text-white uppercase md:text-5xl">
                    De la semana
                  </h3>
                  <p className="mt-1 text-sm text-zinc-200">Se revela al cerrar la jornada.</p>
                </>
              )}
            </TileContent>
          </Tile>

          <div className="flex flex-col gap-3 md:col-span-8">
            <Tile
              href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
              className="h-[230px] md:h-[250px]"
            >
              <PhotoLayer src={featured?.coverImageUrl || MEDIA.news} />
              <TileContent className={PANEL}>
                <TileBadge>Noticias</TileBadge>
                <h3 className="line-clamp-2 text-2xl font-black text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] sm:text-3xl">
                  {featured?.title ?? "La jornada en cancha"}
                </h3>
                {featured?.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-sm text-white/80">{featured.excerpt}</p>
                ) : null}
              </TileContent>
            </Tile>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Tile href="/universidades" className="h-[210px]">
                <PhotoLayer src={MEDIA.squad} />
                <TileContent className={PANEL}>
                  <TileBadge>Rosters</TileBadge>
                  <h3 className="text-xl font-black tracking-tight text-white uppercase sm:text-2xl">
                    Plantillas
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-white/80">Las 8 universidades.</p>
                </TileContent>
              </Tile>

              <Tile href="/multimedia" className="h-[210px]">
                <PhotoLayer src={MEDIA.broadcast} />
                <TileContent className={PANEL}>
                  <TileBadge>Multimedia</TileBadge>
                  <h3 className="text-xl font-black text-white uppercase sm:text-2xl">En vivo y clips</h3>
                  <p className="mt-1 text-sm text-white/80">Videos · Podcasts · Highlights</p>
                </TileContent>
              </Tile>
            </div>
          </div>
        </div>

        <Tile href="/liga-u-pass" className="h-[200px] sm:h-[220px]">
          <div className="absolute inset-y-0 right-0 w-[46%] overflow-hidden sm:w-[42%]">
            <PhotoLayer src={MEDIA.pass} />
          </div>
          <div className="relative z-10 flex h-full w-[54%] flex-col justify-end bg-zinc-950 px-5 py-5 sm:w-[58%] sm:px-8">
            <TileBadge>Beneficios</TileBadge>
            <h3 className="font-jersey text-4xl leading-none text-white sm:text-6xl">U Pass</h3>
            <p className="mt-2 max-w-sm text-sm text-zinc-300">
              El club de beneficios de Liga U. Descuentos, accesos y marcas.
            </p>
          </div>
        </Tile>
      </div>
    </section>
  );
}
