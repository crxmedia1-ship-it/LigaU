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
        "relative z-10 flex h-full min-h-0 flex-col justify-end pt-5 pr-5 pb-5 pl-6 sm:pt-6 sm:pr-6 sm:pb-6 sm:pl-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Three pairs of horizontal L's. Each pair locks: one piece is the wide bar
 * on top with a foot down the left, the other is the wide bar on the bottom
 * with a foot up the right. They share a grid and only the mating edges are
 * inset, so the crack between them stays even.
 */
const CRACK = "4px";

/** Long horizontal bar, short foot — the L is stretched on its side. */
const CLIP = {
  /** Wide top (10 cols), short foot bottom-left. */
  gamma: `polygon(0 0, calc(100% - ${CRACK}) 0, calc(100% - ${CRACK}) calc(50% - ${CRACK}), calc(40% + ${CRACK}) calc(50% - ${CRACK}), calc(40% + ${CRACK}) 100%, 0 100%)`,
  /** Wide bottom, short foot top-right. */
  ell: `polygon(calc(75% + ${CRACK}) 0, 100% 0, 100% 100%, ${CRACK} 100%, ${CRACK} calc(50% + ${CRACK}), calc(75% + ${CRACK}) calc(50% + ${CRACK}))`,
  /** Wide bottom, short foot top-left. */
  ellLeft: `polygon(0 0, calc(25% - ${CRACK}) 0, calc(25% - ${CRACK}) calc(50% + ${CRACK}), calc(100% - ${CRACK}) calc(50% + ${CRACK}), calc(100% - ${CRACK}) 100%, 0 100%)`,
  /** Wide top, short foot bottom-right. */
  gammaRight: `polygon(${CRACK} 0, 100% 0, 100% 100%, calc(60% + ${CRACK}) 100%, calc(60% + ${CRACK}) calc(50% - ${CRACK}), ${CRACK} calc(50% - ${CRACK}))`,
} as const;

const COURT: Record<keyof typeof CLIP, string> = {
  gamma: "1.2,1.2 98.6,1.2 98.6,47 41.2,47 41.2,98.8 1.2,98.8",
  ell: "76.4,1.2 98.8,1.2 98.8,98.8 1.2,98.8 1.2,53 76.4,53",
  ellLeft: "1.2,1.2 23.6,1.2 23.6,53 98.6,53 98.6,98.8 1.2,98.8",
  gammaRight: "1.2,1.2 98.8,1.2 98.8,98.8 61.4,98.8 61.4,47 1.2,47",
};

/** Text sits in the long bar, the part of the L with room. */
const BAR =
  "overflow-hidden px-4 pt-2 pb-4 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-black/32";
const TOP_BAR = `h-1/2 justify-end ${BAR}`;
const BOTTOM_BAR = `mt-auto h-1/2 justify-end ${BAR}`;

function CourtLine({ shape }: { shape: keyof typeof CLIP }) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 h-full w-full text-white/80 transition-colors duration-300 group-hover:text-[#C8102E]"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polygon
        points={COURT[shape]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

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
      {/* Glass over the whole photo: a thin highlight, the image stays complete */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.42)_0%,rgba(255,255,255,0.1)_9%,transparent_24%,transparent_72%,rgba(255,255,255,0.14)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_0_0_1px_rgba(255,255,255,0.35)]"
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
      <div className="grid grid-cols-12 gap-0 grid-rows-[210px_210px_12px_210px_210px_12px_210px_210px] sm:grid-rows-[224px_224px_14px_224px_224px_14px_224px_224px] md:grid-rows-[210px_210px_14px_210px_210px_14px_210px_210px] lg:grid-rows-[248px_248px_16px_248px_248px_16px_248px_248px]">
        {/* Pair 1 — duelo is the top bar, plantillas locks in underneath */}
        <Tile
          href="/competicion"
          style={{ clipPath: CLIP.gamma }}
          className="col-start-1 col-end-11 row-start-1 row-end-3"
        >
          <PhotoLayer src={duelPhoto(nextMatch?.sportName)} />
          <CourtLine shape="gamma" />
          <TileWatermark className="top-0 right-1 text-[5.5rem] text-white/20">VS</TileWatermark>
          <TileContent className={TOP_BAR}>
            <TileBadge>Próximo duelo</TileBadge>
            <h4 className="text-lg font-black text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-colors group-hover:text-red-200 md:text-xl">
              {nextMatch ? (
                <>
                  {nextMatch.homeShort}{" "}
                  <span className="font-mono text-red-300">VS</span> {nextMatch.awayShort}
                </>
              ) : (
                "Match Center"
              )}
            </h4>
            {nextMatch ? (
              <>
                {venue || kickoff ? (
                  <p className="mt-1 line-clamp-1 font-mono text-xs text-white/75">
                    {[venue, kickoff].filter(Boolean).join(" • ")}
                  </p>
                ) : null}
                <div className="mt-1">
                  <MatchCountdown date={nextMatch.matchDate} />
                </div>
              </>
            ) : (
              <p className="mt-1 text-sm text-white/75">Aún no hay un partido programado.</p>
            )}
          </TileContent>
        </Tile>

        <Tile
          href="/universidades"
          style={{ clipPath: CLIP.ell }}
          className="col-start-5 col-end-13 row-start-1 row-end-3"
        >
          <PhotoLayer src={MEDIA.squad} />
          <CourtLine shape="ell" />
          <TileWatermark className="right-1 bottom-0 text-[6rem] text-white/20 md:text-[8rem]">U</TileWatermark>
          <TileContent className={BOTTOM_BAR}>
            <TileBadge>Rosters oficiales</TileBadge>
            <h3 className="text-lg font-black tracking-tight text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-colors group-hover:text-red-200 sm:text-2xl lg:text-3xl">
              Plantillas y equipos
            </h3>
            <p className="mt-1 text-sm text-white/80">
              Explora las alineaciones de las 8 universidades.
            </p>
          </TileContent>
        </Tile>

        {/* Pair 3 sits below; MVP is the wide bottom bar */}
        {/*
          MVP tile stays dark by design — it's a dramatic contrast anchor
          in the light grid, the same way a pitch monitor glows against daylight.
          The crimson radials are slightly stronger so they pop on the carbon.
        */}
        <Tile
          href="/competicion?tab=tabla"
          style={{ clipPath: CLIP.ell }}
          className="col-start-5 col-end-13 row-start-7 row-end-9"
        >
          <CourtLine shape="ell" />
          <div className="carbon-fiber absolute inset-0 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(200,16,46,0.32),transparent_45%),radial-gradient(circle_at_80%_88%,rgba(200,16,46,0.20),transparent_46%)]" />
            <TileWatermark className="-right-1 -bottom-8 text-[7.5rem]">MVP</TileWatermark>
            {mvp?.athlete.photoUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mvp.athlete.photoUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top contrast-[1.05] saturate-[1.08] opacity-95 transition-transform duration-700 group-hover:scale-110"
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
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.22)_0%,transparent_28%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,#09090b_0%,rgba(9,9,11,0.55)_20%,transparent_46%)]" />
          <TileContent className={BOTTOM_BAR}>
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

        {/* Pair 2 — mirrored so the seam zigzags into the pair above */}
        <Tile
          href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
          style={{ clipPath: CLIP.ellLeft }}
          className="col-start-1 col-end-9 row-start-4 row-end-6"
        >
          <PhotoLayer src={MEDIA.news} />
          <CourtLine shape="ellLeft" />
          <TileWatermark className="top-0 -right-2 text-[5.5rem] text-white/20">N</TileWatermark>
          <TileContent className={BOTTOM_BAR}>
            <TileBadge>Noticias</TileBadge>
            <h4 className="line-clamp-2 text-lg font-black text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] group-hover:text-red-200">
              {featured?.title ?? "La jornada en cancha"}
            </h4>
            {featured?.excerpt ? (
              <p className="mt-1 line-clamp-1 text-sm text-white/80">{featured.excerpt}</p>
            ) : null}
          </TileContent>
        </Tile>

        <Tile
          href="/multimedia"
          style={{ clipPath: CLIP.gammaRight }}
          className="col-start-3 col-end-13 row-start-4 row-end-6"
        >
          <PhotoLayer src={MEDIA.broadcast} />
          <CourtLine shape="gammaRight" />
          <TileWatermark className="top-0 -right-2 text-[5.5rem] text-white/25">▶</TileWatermark>
          <TileContent className={TOP_BAR}>
            <TileBadge>Multimedia</TileBadge>
            <h4 className="text-lg font-black text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] group-hover:text-red-200">
              Centro de medios
            </h4>
            <p className="mt-1 text-sm text-white/80">Podcasts • Videos • Highlights</p>
          </TileContent>
        </Tile>

        <Tile
          href="/liga-u-pass"
          style={{ clipPath: CLIP.gamma }}
          className="col-start-1 col-end-11 row-start-7 row-end-9"
        >
          <PhotoLayer src={MEDIA.pass} />
          <CourtLine shape="gamma" />
          <TileWatermark className="top-0 -right-1 text-[5rem] text-white/20">U+</TileWatermark>
          <TileContent className={TOP_BAR}>
            <TileBadge>Beneficios</TileBadge>
            <h4 className="text-lg font-black text-white uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-colors group-hover:text-red-200">
              U Pass
            </h4>
            <p className="mt-1 text-sm text-white/80">
              Conoce y accede a los beneficios de Liga U.
            </p>
          </TileContent>
        </Tile>
      </div>
    </section>
  );
}
