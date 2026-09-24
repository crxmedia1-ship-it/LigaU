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

/** Giant titanium-grey watermark glyph, sunk subtly into the tile's material. */
function TileWatermark({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "font-jersey pointer-events-none absolute leading-none text-zinc-400/10 select-none",
        className,
      )}
    >
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
        "relative z-10 flex h-full min-h-[220px] flex-col justify-end pt-6 pr-6 pb-6 pl-8 md:min-h-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * "Shattered Pitch Mosaic" (`md:` and up): every tile is an independent
 * glass-shard clipped to a unique polygon, but the tiles all sit on the SAME
 * 12-column / 3-row grid so every shared border between two neighbours is a
 * straight line of fixed length. Each pair of touching edges uses "swapped"
 * inset endpoints (a,b) / (b,a) — that guarantees the perpendicular crack
 * width stays constant along the whole seam once the CSS grid gap pulls the
 * pieces slightly apart, exactly like a plate that shattered but was pushed
 * back together with hairline gaps.
 *
 * Below `md:`, the polygons are dropped (they're pixel-tuned for the
 * desktop row heights). Cards stack in a single column, square to the
 * viewport, with a fixed gap so neighbours never touch.
 *
 * The `Tile` shard itself (float animation + click-to-shatter navigation,
 * exposed via `data-breaking`) lives in `bento-tile.tsx` as a small client
 * boundary; the actual optical-warp refraction it triggers is rendered here
 * by `PhotoLayer`, so the date-formatting logic below stays server-rendered.
 */

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
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110 group-data-[breaking=true]:scale-110"
        style={{ backgroundImage: `url('${src}')` }}
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
    <section className="relative isolate w-full px-4 pt-4 pb-8 sm:px-6 sm:pt-10 sm:pb-24 lg:px-12 xl:px-20 2xl:px-28">
      {/* Soft crimson ambient blush — barely there, depth without dirt */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/6 via-transparent to-transparent md:h-80"
      />
      <GlassWarpDefs />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-[280px_280px_240px] md:gap-[6px]">
        {/* PLANTILLAS Y EQUIPOS — col 1-8, spans both top rows
            Shape: both right corners chamfered 64px → "monitor" / widescreen panel */}
        <Tile
          href="/universidades"
          className="md:col-span-8 md:row-span-2 md:[clip-path:polygon(0_0,calc(100%-64px)_0,100%_64px,100%_504px,calc(100%-64px)_568px,0_568px)]"
        >
          <PhotoLayer src={MEDIA.squad} />
          {/* Light fade — bottom is white for text, top is fully transparent so photo shows */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-white/75 to-transparent" />
          <TileWatermark className="-right-6 -bottom-12 text-[13rem] md:text-[16rem]">U</TileWatermark>
          <TileContent>
            <TileBadge>Rosters oficiales</TileBadge>
            <h3 className="text-2xl font-black tracking-tight text-zinc-950 uppercase transition-colors group-hover:text-[#C8102E] md:text-3xl">
              Plantillas y equipos
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              Explora las alineaciones de las 8 universidades.
            </p>
          </TileContent>
        </Tile>

        {/* PRÓXIMO DUELO — col 9-12, row 1
            Shape: chamfer bottom-right → angled handoff to MVP tile below */}
        <Tile
          href="/competicion"
          className="md:col-span-4 md:[clip-path:polygon(0_0,100%_0,100%_216px,calc(100%-64px)_280px,0_280px)]"
        >
          <PhotoLayer src={duelPhoto(nextMatch?.sportName)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-white/75 to-transparent" />
          <TileWatermark className="-right-3 -bottom-10 text-[9rem]">VS</TileWatermark>
          <TileContent>
            <TileBadge>Próximo duelo</TileBadge>
            <h4 className="text-lg font-black text-zinc-950 uppercase transition-colors group-hover:text-[#C8102E] md:text-xl">
              {nextMatch ? (
                <>
                  {nextMatch.homeShort}{" "}
                  <span className="font-mono text-[#C8102E]">VS</span> {nextMatch.awayShort}
                </>
              ) : (
                "Match Center"
              )}
            </h4>
            {nextMatch ? (
              <>
                {venue || kickoff ? (
                  <p className="mt-1 font-mono text-xs text-zinc-500">
                    {[venue, kickoff].filter(Boolean).join(" • ")}
                  </p>
                ) : null}
                <div className="mt-1">
                  <MatchCountdown date={nextMatch.matchDate} />
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-zinc-500">Aún no hay un partido programado.</p>
            )}
          </TileContent>
        </Tile>

        {/* MVP DE LA SEMANA — col 9-12, row 2 */}
        {/*
          MVP tile stays dark by design — it's a dramatic contrast anchor
          in the light grid, the same way a pitch monitor glows against daylight.
          The crimson radials are slightly stronger so they pop on the carbon.
        */}
        {/* MVP — col 9-12, row 2
            Shape: chamfer bottom-left → mirrors Match tile above for visual rhythm */}
        <Tile
          href="/competicion?tab=tabla"
          className="md:col-span-4 md:[clip-path:polygon(0_0,100%_0,100%_280px,64px_280px,0_216px)]"
        >
          <div className="carbon-fiber absolute inset-0 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(200,16,46,0.32),transparent_45%),radial-gradient(circle_at_80%_88%,rgba(200,16,46,0.20),transparent_46%)]" />
            <TileWatermark className="-right-1 -bottom-8 text-[7.5rem]">MVP</TileWatermark>
            {mvp?.athlete.photoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mvp.athlete.photoUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-70 transition-transform duration-700 group-hover:scale-110"
                />
                {/* Warped duplicate — optical warp only on click (breaking), not hover */}
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
              <span className="font-jersey pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-zinc-100 to-[#C8102E] bg-clip-text text-8xl leading-none text-transparent drop-shadow-[0_0_28px_rgba(200,16,46,0.50)] transition-transform duration-500 group-hover:scale-110">
                {mvp ? mvp.athlete.fullName.slice(0, 1) : "?"}
              </span>
            )}
          </div>
          {/* Dark-bottom gradient — keeps white text readable on carbon fiber */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/55 to-transparent" />
          <TileContent>
            <TileBadge>Destacado</TileBadge>
            {mvp ? (
              <>
                <h4 className="text-xl font-black text-white uppercase transition-colors group-hover:text-red-300">
                  {mvp.athlete.fullName}
                </h4>
                <p className="mt-1 text-sm text-zinc-300">
                  {mvp.team.label} · {mvp.sportName}
                </p>
              </>
            ) : (
              <>
                <h4 className="text-xl font-black text-white uppercase transition-colors group-hover:text-red-300">
                  MVP de la semana
                </h4>
                <p className="mt-1 text-sm text-zinc-300">
                  Identidad oculta. Se revela al cerrar la jornada.
                </p>
              </>
            )}
          </TileContent>
        </Tile>

        {/* NOTICIAS — col 1-4, row 3
            Shape: chamfer top-right */}
        <Tile
          href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
          className="md:col-span-4 md:[clip-path:polygon(0_0,calc(100%-64px)_0,100%_64px,100%_240px,0_240px)]"
        >
          <PhotoLayer src={MEDIA.news} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-white/75 to-transparent" />
          <TileWatermark className="-right-4 -bottom-10 text-[9rem]">N</TileWatermark>
          <TileContent>
            <TileBadge>Noticias</TileBadge>
            <h4 className="text-lg font-black text-zinc-950 uppercase group-hover:text-[#C8102E]">
              {featured?.title ?? "La jornada en cancha"}
            </h4>
            {featured?.excerpt ? (
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{featured.excerpt}</p>
            ) : null}
          </TileContent>
        </Tile>

        {/* CENTRO DE MEDIOS — col 5-8, row 3
            Shape: chamfer top-left (mirrors Noticias for rhythm) */}
        <Tile
          href="/multimedia"
          className="md:col-span-4 md:[clip-path:polygon(64px_0,100%_0,100%_240px,0_240px,0_64px)]"
        >
          <PhotoLayer src={MEDIA.broadcast} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-white/75 to-transparent" />
          <TileWatermark className="-right-4 -bottom-10 text-[9rem]">▶</TileWatermark>
          <TileContent>
            <TileBadge>Multimedia</TileBadge>
            <h4 className="text-lg font-black text-zinc-950 uppercase group-hover:text-[#C8102E]">
              Centro de medios
            </h4>
            <p className="mt-1 text-sm text-zinc-600">Podcasts • Videos • Highlights</p>
          </TileContent>
        </Tile>

        {/* U PASS — col 9-12, row 3
            Shape: chamfer bottom-left → rising diagonal creates upward energy */}
        <Tile
          href="/liga-u-pass"
          className="md:col-span-4 md:[clip-path:polygon(0_0,100%_0,100%_240px,64px_240px,0_176px)]"
        >
          <PhotoLayer src={MEDIA.pass} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-white/75 to-transparent" />
          <TileWatermark className="-right-4 -bottom-10 text-[9rem]">U+</TileWatermark>
          <TileContent>
            <TileBadge>Beneficios</TileBadge>
            <h4 className="text-lg font-black text-zinc-950 uppercase transition-colors group-hover:text-[#C8102E]">
              U Pass
            </h4>
            <p className="mt-1 text-sm text-zinc-600">
              Conoce y accede a los beneficios de Liga U.
            </p>
          </TileContent>
        </Tile>
      </div>
    </section>
  );
}
