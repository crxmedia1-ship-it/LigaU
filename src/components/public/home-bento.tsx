import { Tile } from "@/components/public/bento-tile";
import { MatchCountdown } from "@/components/public/match-countdown";
import { RailPitch } from "@/components/public/sport-courts";
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
      <div
        className="absolute inset-0 bg-cover bg-center contrast-[1.08] saturate-[1.14] transition-transform duration-700 ease-out group-hover:scale-105 group-data-[breaking=true]:scale-110"
        style={{ backgroundImage: `url('${src}')` }}
      />
      {/* The whole pane is the crystal: sheen across the photo, not a plate behind the type. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.62)_0%,rgba(255,255,255,0.14)_12%,transparent_34%,transparent_62%,rgba(255,255,255,0.16)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(9,9,11,0.72)_0%,rgba(9,9,11,0.18)_42%,transparent_68%)]"
      />
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
      className="relative isolate w-full scroll-mt-[calc(3.25rem+env(safe-area-inset-top,0px))] px-4 pb-8 sm:px-6 sm:pt-8 sm:pb-24 lg:px-12 xl:px-20 2xl:px-28"
    >
      <GlassWarpDefs />
      <Tile
        href="/competicion"
        className="border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_18px_40px_rgba(15,23,42,0.12)]"
      >
        <div className="relative h-[64vw] min-h-[248px] max-h-[300px] sm:h-[400px] sm:max-h-none md:h-[460px]">
          <PhotoLayer src={duelPhoto(nextMatch?.sportName)} />
          <div className="relative z-10 flex h-full flex-col justify-end px-4 pb-4 sm:px-7 sm:pb-6">
            <div className="flex items-baseline justify-between gap-3">
              <p className="min-w-0 truncate text-[11px] font-semibold tracking-[0.22em] text-white/80 uppercase">
                {nextMatch?.sportName ?? "Próximo partido"}
              </p>
              {nextMatch ? <MatchCountdown date={nextMatch.matchDate} className="shrink-0 text-[11px] text-white" /> : null}
            </div>
            <h2 className="mt-2 grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:gap-3">
              <span className="font-jersey min-w-0 truncate text-[clamp(3rem,14vw,4.25rem)] leading-none text-white sm:text-8xl">{homeName}</span>
              <span className="mb-1 shrink-0 font-jersey text-lg leading-none text-[#ff4d6a] sm:mb-2 sm:text-3xl">VS</span>
              <span className="font-jersey min-w-0 truncate text-right text-[clamp(3rem,14vw,4.25rem)] leading-none text-white sm:text-8xl">{awayName}</span>
            </h2>
            <p className="mt-2 truncate text-sm font-medium text-white/85">
              {nextMatch ? [venue, kickoff].filter(Boolean).join(" · ") : "Aún no hay un partido programado"}
            </p>
          </div>
        </div>
      </Tile>

      <div className="relative mt-5 sm:mt-6">
        <p className="relative z-10 mb-3 text-xs font-semibold tracking-[0.16em] text-zinc-700 uppercase">La jornada</p>
        <div className="relative">
          <RailPitch />
          <div className="relative left-1/2 flex w-screen -translate-x-1/2 snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] [scrollbar-width:none] md:left-0 md:w-auto md:translate-x-0 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:px-0 md:[mask-image:none] [&::-webkit-scrollbar]:hidden">
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
          <RailCard href="/liga-u-pass" src={MEDIA.pass} kicker="Beneficios" title="U Pass" />
          </div>
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
}: {
  href: string;
  src: string;
  kicker: string;
  title: string;
  story?: boolean;
}) {
  return (
    <Tile
      href={href}
      className="h-[58vw] max-h-[280px] w-[calc(100vw-2.5rem)] shrink-0 snap-start border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_14px_32px_rgba(15,23,42,0.1)] md:h-[320px] md:max-h-none md:w-auto"
    >
      <PhotoLayer src={src} />
      <div className="relative z-10 flex h-full min-w-0 flex-col justify-end p-4">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-[#ffb3c0] uppercase">{kicker}</p>
        <h3
          className={
            story
              ? "mt-1.5 line-clamp-3 text-[0.95rem] leading-snug font-semibold text-white normal-case"
              : "font-jersey mt-1 line-clamp-2 text-[2rem] leading-[1.05] text-white"
          }
        >
          {title}
        </h3>
      </div>
    </Tile>
  );
}
