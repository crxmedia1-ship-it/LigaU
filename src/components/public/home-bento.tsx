import { Tile } from "@/components/public/bento-tile";
import { MatchCountdown } from "@/components/public/match-countdown";
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

  const mvpPhoto = mvp?.athlete.photoUrl || MEDIA.mvp;
  const homeName = nextMatch?.homeShort ?? "Liga";
  const awayName = nextMatch?.awayShort ?? "U";

  return (
    <section
      id="home-grids"
      className="relative isolate w-full scroll-mt-[calc(3.25rem+env(safe-area-inset-top,0px))] px-3 pt-2 pb-6 sm:px-6 sm:pt-8 sm:pb-24 lg:px-12 xl:px-20 2xl:px-28"
    >
      <GlassWarpDefs />
      <Tile href="/competicion" className="-mx-3 bg-zinc-950 sm:mx-0">
        <div className="relative h-[68vw] min-h-[230px] max-h-[300px] sm:h-[380px] sm:max-h-none md:h-[460px]">
          <PhotoLayer src={duelPhoto(nextMatch?.sportName)} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/10 to-black/75" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          <h2 className="relative z-10 grid h-full grid-cols-[1fr_auto_1fr] items-end gap-2 px-4 pb-4 sm:px-8 sm:pb-6">
            <span className="font-jersey text-[4rem] leading-none text-white sm:text-8xl">{homeName}</span>
            <span className="mb-2 self-center bg-[#C8102E] px-2 py-3 font-jersey text-lg leading-none text-white sm:mb-4 sm:px-3 sm:py-4 sm:text-2xl">
              VS
            </span>
            <span className="text-right font-jersey text-[4rem] leading-none text-white sm:text-8xl">{awayName}</span>
          </h2>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="min-w-0 truncate text-[11px] font-semibold tracking-wide text-white/75 uppercase">
            {nextMatch
              ? [nextMatch.sportName, venue, kickoff].filter(Boolean).join(" · ")
              : "Aún no hay un partido programado"}
          </p>
          {nextMatch ? <MatchCountdown date={nextMatch.matchDate} className="shrink-0 text-[11px]" /> : null}
        </div>
      </Tile>

      <div className="mt-4 sm:mt-5">
        <p className="mb-2 text-[10px] font-black tracking-[0.22em] text-zinc-500 uppercase">La jornada</p>
        <div className="-mx-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          <RailCard href="/competicion?tab=tabla" src={mvpPhoto} kicker="MVP" title={mvp?.athlete.fullName ?? "De la semana"} />
          <RailCard
            href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
            src={featured?.coverImageUrl || MEDIA.news}
            kicker="Noticias"
            title={featured?.title ?? "La jornada en cancha"}
            story
          />
          <RailCard href="/universidades" src={MEDIA.squad} kicker="Rosters" title="Plantillas" />
          <RailCard href="/multimedia" src={MEDIA.broadcast} kicker="Multimedia" title="Clips" />
          <RailCard href="/liga-u-pass" src={MEDIA.pass} kicker="Beneficios" title="U Pass" crimson />
        </div>
      </div>
    </section>
  );
}

function RailCard({
  href,
  src,
  kicker,
  title,
  story,
  crimson,
}: {
  href: string;
  src: string;
  kicker: string;
  title: string;
  story?: boolean;
  crimson?: boolean;
}) {
  return (
    <Tile
      href={href}
      className="h-[78vw] max-h-[390px] w-[74vw] shrink-0 snap-start sm:h-[340px] sm:w-[220px] md:h-[320px] md:w-auto"
    >
      <PhotoLayer src={src} />
      <div
        className={
          crimson
            ? "absolute inset-0 bg-gradient-to-t from-[#C8102E] via-[#C8102E]/55 to-black/25"
            : "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/15"
        }
      />
      <div className="relative z-10 flex h-full flex-col justify-between p-3.5">
        <p className="text-[10px] font-black tracking-[0.2em] text-white/80 uppercase">{kicker}</p>
        <h3
          className={
            story
              ? "line-clamp-4 text-lg leading-tight font-black text-white uppercase"
              : "font-jersey line-clamp-2 text-4xl leading-[0.88] text-white uppercase"
          }
        >
          {title}
        </h3>
      </div>
    </Tile>
  );
}
