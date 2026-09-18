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

/** Giant titanium-grey watermark glyph, sunk 5% into the tile's material. */
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
        "font-jersey pointer-events-none absolute leading-none text-zinc-300/5 select-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Foreground text block that levitates 2px toward the viewer on hover. */
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
        "relative z-10 flex h-full min-h-[220px] flex-col justify-end pt-6 pr-6 pb-6 pl-8 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 md:min-h-0",
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
 * Below `md:`, the polygons are dropped entirely (they're pixel-tuned for
 * the desktop row heights) in favour of "Tactical Glass Panels": a single
 * flex column of plain rectangular glass cards, each nudged with a subtle
 * alternating tilt (`rotate-[±1.2deg]`, reset via `md:rotate-0`) so the
 * stack reads as a hand-placed zig-zag instead of a rigid list, without
 * ever clipping text or causing horizontal overflow.
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
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url('${src}')` }}
      />
      {/* Warped duplicate: the glass visibly bends/refracts the photo behind
          it as it stresses under hover, then snaps to full distortion the
          instant it's clicked — a real optical warp, not painted lines. */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-0 transition-[opacity,transform] duration-700 ease-out group-hover:scale-110 group-hover:opacity-70 group-data-[breaking=true]:scale-110 group-data-[breaking=true]:opacity-100 group-data-[breaking=true]:duration-150"
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
    <section className="relative isolate w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-[#09090b] to-[#09090b] px-4 pt-10 pb-24 sm:px-6 lg:px-12 xl:px-20 2xl:px-28">
      {/* Extra red wash hugging the section's own top edge: the hero's ambient
          bleed gets painted over once the grid overlaps upward (this section
          is opaque and later in the DOM), so the continuity has to live here
          too — same red-900/30 recipe, anchored to this side of the seam. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/35 via-transparent to-transparent md:h-80"
      />
      <GlassWarpDefs />
      <div className="flex flex-col gap-4 overflow-x-hidden md:grid md:grid-cols-12 md:grid-rows-[280px_280px_240px] md:gap-[6px] md:overflow-visible">
        {/* PLANTILLAS Y EQUIPOS — col 1-8, spans both top rows */}
        <Tile
          href="/universidades"
          className="[animation-delay:0s] rotate-[-1.2deg] md:col-span-8 md:row-span-2 md:rotate-0 md:[clip-path:polygon(28px_0,100%_0,calc(100%-40px)_280px,calc(100%-15px)_568px,0_568px,0_28px)]"
        >
          <PhotoLayer src={MEDIA.squad} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-transparent" />
          <TileWatermark className="-right-6 -bottom-12 text-[13rem] md:text-[16rem]">U</TileWatermark>
          <TileContent>
            <TileBadge>Rosters oficiales</TileBadge>
            <h3 className="text-2xl font-black tracking-tight text-white uppercase transition-colors group-hover:text-red-400 md:text-3xl">
              Plantillas y equipos
            </h3>
            <p className="mt-1 text-sm text-zinc-300">
              Explora las alineaciones de las 8 universidades.
            </p>
          </TileContent>
        </Tile>

        {/* PRÓXIMO DUELO — col 9-12, row 1 */}
        <Tile
          href="/competicion"
          className="[animation-delay:-2.3s] rotate-[1.2deg] md:col-span-4 md:rotate-0 md:[clip-path:polygon(40px_0,calc(100%-28px)_0,100%_28px,100%_210px,0_280px)]"
        >
          <PhotoLayer src={duelPhoto(nextMatch?.sportName)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />
          <TileWatermark className="-right-3 -bottom-10 text-[9rem]">VS</TileWatermark>
          <TileContent>
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
          </TileContent>
        </Tile>

        {/* MVP DE LA SEMANA — col 9-12, row 2 */}
        <Tile
          href="/competicion?tab=tabla"
          className="[animation-delay:-4.6s] rotate-[-1.2deg] md:col-span-4 md:rotate-0 md:[clip-path:polygon(8px_0,0_20px,100%_10px,100%_260px,0_220px,18px_280px)]"
        >
          <div className="carbon-fiber absolute inset-0 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(186,12,47,0.28),transparent_42%),radial-gradient(circle_at_80%_90%,rgba(186,12,47,0.22),transparent_46%)]" />
            <TileWatermark className="-right-1 -bottom-8 text-[7.5rem]">MVP</TileWatermark>
            {mvp?.athlete.photoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mvp.athlete.photoUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-70 transition-transform duration-700 group-hover:scale-110"
                />
                {/* Warped duplicate — same real optical refraction as PhotoLayer. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  aria-hidden
                  src={mvp.athlete.photoUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-[opacity,transform] duration-700 group-hover:scale-110 group-hover:opacity-60 group-data-[breaking=true]:scale-110 group-data-[breaking=true]:opacity-90 group-data-[breaking=true]:duration-150"
                  style={{ filter: "url(#ligau-glass-warp)" }}
                />
              </>
            ) : (
              <span className="font-jersey pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-zinc-100 to-[#BA0C2F] bg-clip-text text-8xl leading-none text-transparent drop-shadow-[0_0_28px_rgba(186,12,47,0.45)] transition-transform duration-500 group-hover:scale-110">
                {mvp ? mvp.athlete.fullName.slice(0, 1) : "?"}
              </span>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/55 to-transparent" />
          <TileContent>
            <TileBadge>Destacado</TileBadge>
            {mvp ? (
              <>
                <h4 className="text-xl font-black text-white uppercase transition-colors group-hover:text-red-400">
                  {mvp.athlete.fullName}
                </h4>
                <p className="mt-1 text-sm text-zinc-300">
                  {mvp.team.label} · {mvp.sportName}
                </p>
              </>
            ) : (
              <>
                <h4 className="text-xl font-black text-white uppercase transition-colors group-hover:text-red-400">
                  MVP de la semana
                </h4>
                <p className="mt-1 text-sm text-zinc-300">
                  Identidad oculta. Se revela al cerrar la jornada.
                </p>
              </>
            )}
          </TileContent>
        </Tile>

        {/* NOTICIAS — col 1-4, row 3 */}
        <Tile
          href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
          className="[animation-delay:-1.1s] rotate-[1.2deg] md:col-span-4 md:rotate-0 md:[clip-path:polygon(0_0,100%_12px,calc(100%-38px)_240px,28px_240px,0_212px)]"
        >
          <PhotoLayer src={MEDIA.news} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />
          <TileWatermark className="-right-4 -bottom-10 text-[9rem]">N</TileWatermark>
          <TileContent>
            <TileBadge>Noticias</TileBadge>
            <h4 className="text-lg font-black text-white uppercase group-hover:text-red-400">
              {featured?.title ?? "La jornada en cancha"}
            </h4>
            {featured?.excerpt ? (
              <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{featured.excerpt}</p>
            ) : null}
          </TileContent>
        </Tile>

        {/* CENTRO DE MEDIOS — col 5-8, row 3 */}
        <Tile
          href="/multimedia"
          className="[animation-delay:-3.4s] rotate-[-1.2deg] md:col-span-4 md:rotate-0 md:[clip-path:polygon(38px_0,calc(100%-14px)_0,calc(100%-38px)_240px,0_240px,12px_38px)]"
        >
          <PhotoLayer src={MEDIA.broadcast} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/85 to-transparent" />
          <TileWatermark className="-right-4 -bottom-10 text-[9rem]">▶</TileWatermark>
          <TileContent>
            <TileBadge>Multimedia</TileBadge>
            <h4 className="text-lg font-black text-white uppercase group-hover:text-red-400">
              Centro de medios
            </h4>
            <p className="mt-1 text-sm text-zinc-300">Podcasts • Videos • Highlights</p>
          </TileContent>
        </Tile>

        {/* U PASS — col 9-12, row 3 */}
        <Tile
          href="/liga-u-pass"
          className="[animation-delay:-5.8s] rotate-[1.2deg] md:col-span-4 md:rotate-0 md:[clip-path:polygon(38px_0,100%_14px,calc(100%-28px)_240px,20px_240px,14px_212px)]"
        >
          <PhotoLayer src={MEDIA.pass} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-transparent" />
          <TileWatermark className="-right-4 -bottom-10 text-[9rem]">U+</TileWatermark>
          <TileContent>
            <TileBadge>Beneficios</TileBadge>
            <h4 className="text-lg font-black text-white uppercase transition-colors group-hover:text-red-400">
              U Pass
            </h4>
            <p className="mt-1 text-sm text-zinc-300">
              Conoce y accede a los beneficios de Liga U.
            </p>
          </TileContent>
        </Tile>
      </div>
    </section>
  );
}
