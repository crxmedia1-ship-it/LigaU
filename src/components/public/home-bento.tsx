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

/**
 * "Shattered Pitch Mosaic": every tile is an independent glass-shard clipped
 * to a unique polygon, but the tiles all sit on the SAME 12-column / 3-row
 * grid so every shared border between two neighbours is a straight line of
 * fixed length. Each pair of touching edges uses "swapped" inset endpoints
 * (a,b) / (b,a) — that guarantees the perpendicular crack width stays
 * constant along the whole seam once the CSS grid gap pulls the pieces
 * slightly apart, exactly like a plate that shattered but was pushed back
 * together with hairline gaps.
 */
function Tile({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block min-h-[220px] overflow-hidden border border-zinc-800/70 bg-zinc-950 transition-[filter,border-color] duration-500 ease-out md:min-h-0",
        "[filter:drop-shadow(0_16px_28px_rgba(0,0,0,0.6))_drop-shadow(0_4px_10px_rgba(0,0,0,0.45))]",
        "hover:border-[#ff2d4d] hover:[filter:drop-shadow(0_18px_32px_rgba(0,0,0,0.65))_drop-shadow(0_0_20px_rgba(255,45,77,0.55))]",
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
    <section className="w-full px-4 pb-24 sm:px-6 lg:px-12 xl:px-20 2xl:px-28">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:grid-rows-[280px_280px_240px]">
        {/* PLANTILLAS Y EQUIPOS — col 1-8, spans both top rows */}
        <Tile
          href="/universidades"
          className="md:col-span-8 md:row-span-2 [clip-path:polygon(28px_0,100%_0,calc(100%-40px)_280px,calc(100%-15px)_568px,0_568px,0_28px)]"
        >
          <PhotoLayer src={MEDIA.squad} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end pt-6 pr-6 pb-6 pl-8 md:min-h-0">
            <TileBadge>Rosters oficiales</TileBadge>
            <h3 className="text-2xl font-black tracking-tight text-white uppercase transition-colors group-hover:text-red-400 md:text-3xl">
              Plantillas y equipos
            </h3>
            <p className="mt-1 text-sm text-zinc-300">
              Explora las alineaciones de las 8 universidades.
            </p>
          </div>
        </Tile>

        {/* PRÓXIMO DUELO — col 9-12, row 1 */}
        <Tile
          href="/competicion"
          className="md:col-span-4 [clip-path:polygon(40px_0,calc(100%-28px)_0,100%_28px,100%_210px,0_280px)]"
        >
          <PhotoLayer src={duelPhoto(nextMatch?.sportName)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end pt-6 pr-6 pb-6 pl-8 md:min-h-0">
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

        {/* MVP DE LA SEMANA — col 9-12, row 2 */}
        <Tile
          href="/competicion?tab=tabla"
          className="md:col-span-4 [clip-path:polygon(8px_0,0_20px,100%_10px,100%_260px,0_220px,18px_280px)]"
        >
          <div className="carbon-fiber absolute inset-0 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(186,12,47,0.28),transparent_42%),radial-gradient(circle_at_80%_90%,rgba(186,12,47,0.22),transparent_46%)]" />
            <span
              aria-hidden
              className="font-jersey pointer-events-none absolute -right-1 -bottom-8 text-[7.5rem] leading-none text-white/10 select-none"
            >
              MVP
            </span>
            {mvp?.athlete.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mvp.athlete.photoUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-top opacity-70 transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <span className="font-jersey pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 bg-gradient-to-b from-zinc-100 to-[#BA0C2F] bg-clip-text text-8xl leading-none text-transparent drop-shadow-[0_0_28px_rgba(186,12,47,0.45)] transition-transform duration-500 group-hover:scale-110">
                {mvp ? mvp.athlete.fullName.slice(0, 1) : "?"}
              </span>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/55 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end pt-6 pr-6 pb-6 pl-8 md:min-h-0">
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
          </div>
        </Tile>

        {/* NOTICIAS — col 1-4, row 3 */}
        <Tile
          href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
          className="md:col-span-4 [clip-path:polygon(0_0,100%_12px,calc(100%-38px)_240px,28px_240px,0_212px)]"
        >
          <PhotoLayer src={MEDIA.news} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end pt-6 pr-6 pb-6 pl-8 md:min-h-0">
            <TileBadge>Noticias</TileBadge>
            <h4 className="text-lg font-black text-white uppercase group-hover:text-red-400">
              {featured?.title ?? "La jornada en cancha"}
            </h4>
            {featured?.excerpt ? (
              <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{featured.excerpt}</p>
            ) : null}
          </div>
        </Tile>

        {/* CENTRO DE MEDIOS — col 5-8, row 3 */}
        <Tile
          href="/multimedia"
          className="md:col-span-4 [clip-path:polygon(38px_0,calc(100%-14px)_0,calc(100%-38px)_240px,0_240px,12px_38px)]"
        >
          <PhotoLayer src={MEDIA.broadcast} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/85 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end pt-6 pr-6 pb-6 pl-8 md:min-h-0">
            <TileBadge>Multimedia</TileBadge>
            <h4 className="text-lg font-black text-white uppercase group-hover:text-red-400">
              Centro de medios
            </h4>
            <p className="mt-1 text-sm text-zinc-300">Podcasts • Videos • Highlights</p>
          </div>
        </Tile>

        {/* U PASS — col 9-12, row 3 */}
        <Tile
          href="/liga-u-pass"
          className="md:col-span-4 [clip-path:polygon(38px_0,100%_14px,calc(100%-28px)_240px,20px_240px,14px_212px)]"
        >
          <PhotoLayer src={MEDIA.pass} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-end pt-6 pr-6 pb-6 pl-8 md:min-h-0">
            <TileBadge>Beneficios</TileBadge>
            <h4 className="text-lg font-black text-white uppercase transition-colors group-hover:text-red-400">
              U Pass
            </h4>
            <p className="mt-1 text-sm text-zinc-300">
              Conoce y accede a los beneficios de Liga U.
            </p>
          </div>
        </Tile>
      </div>
    </section>
  );
}
