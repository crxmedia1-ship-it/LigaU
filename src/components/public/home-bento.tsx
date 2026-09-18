import Link from "next/link";
import { MatchCountdown } from "@/components/public/match-countdown";
import { cn } from "@/lib/utils";
import type { MatchCard, NewsCard } from "@/lib/public/types";

const MEDIA = {
  news: "https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?auto=format&fit=crop&w=1200&q=80",
  basket:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
  football:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
  pass: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  futsal:
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80",
  volley:
    "https://images.unsplash.com/photo-1612872088519-3e939b0ba5b3?auto=format&fit=crop&w=900&q=80",
  rugby:
    "https://images.unsplash.com/photo-1566577739112-5180d4bf3900?auto=format&fit=crop&w=900&q=80",
  chess:
    "https://images.unsplash.com/photo-1529699211552-35d0cfa2c0b3?auto=format&fit=crop&w=900&q=80",
  broadcast:
    "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
};

const CLIP = {
  news: "[clip-path:polygon(20px_0,100%_0,100%_100%,0_100%,0_20px)]",
  duel: "[clip-path:polygon(0_0,calc(100%-20px)_0,100%_20px,100%_100%,0_100%)]",
  pass: "[clip-path:polygon(0_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%)]",
  media: "[clip-path:polygon(0_0,100%_0,100%_100%,20px_100%,0_calc(100%-20px))]",
} as const;

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

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(+date)) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Caracas",
    day: "numeric",
    month: "numeric",
  }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const months = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic."];
  if (!day || !month) return null;
  return `${day} ${months[month - 1]}`;
}

function formatKickoff(value: string) {
  return new Intl.DateTimeFormat("es-VE", {
    timeZone: "America/Caracas",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function PhotoLayer({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
    />
  );
}

function Tile({
  href,
  clip,
  className,
  gold,
  children,
}: {
  href: string;
  clip: string;
  className?: string;
  gold?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden border transition-colors duration-300",
        gold
          ? "border-amber-500/40 bg-zinc-950 hover:border-amber-400"
          : "border-zinc-800/90 hover:border-red-600/80",
        clip,
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function HomeBento({
  news = [],
  nextMatch,
}: {
  news?: NewsCard[];
  nextMatch: MatchCard | null;
}) {
  const featured = news.find((item) => item.isFeatured) ?? news[0];
  const newsDate = formatDate(featured?.publishedAt);
  const kickoff = nextMatch ? formatKickoff(nextMatch.matchDate) : null;
  const venue = nextMatch?.location?.trim() || null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-[minmax(280px,1fr)_minmax(200px,auto)] md:gap-3">
        <Tile
          href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
          clip={CLIP.news}
          className="min-h-[240px] md:col-span-2 md:min-h-0"
        >
          <PhotoLayer src={MEDIA.news} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/55 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-end p-6 md:min-h-0">
            <span className="mb-2 w-fit bg-red-600 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white uppercase [clip-path:polygon(6px_0,100%_0,calc(100%-6px)_100%,0_100%)]">
              Noticia{newsDate ? ` • ${newsDate}` : ""}
            </span>
            <h3 className="text-xl font-black tracking-tight text-white uppercase transition-colors group-hover:text-red-400 md:text-2xl">
              {featured?.title ?? "La jornada en cancha"}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-zinc-400 md:text-sm">
              {featured?.excerpt ?? "El pulso de Liga U, partido a partido."}
            </p>
          </div>
        </Tile>

        <Tile
          href={nextMatch ? `/partidos/${nextMatch.id}` : "/competicion"}
          clip={CLIP.duel}
          className="min-h-[240px] md:min-h-0"
        >
          <PhotoLayer src={duelPhoto(nextMatch?.sportName)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-[#09090B]/40" />
          <div className="relative z-10 flex h-full min-h-[240px] flex-col justify-between p-6 md:min-h-0">
            <span className="w-fit rounded border border-red-800/50 bg-red-950/80 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase">
              {nextMatch ? nextMatch.sportName : "Fixture"}
            </span>
            <div>
              <span className="font-mono text-[11px] tracking-widest text-zinc-400 uppercase">
                Próximo duelo
              </span>
              {nextMatch ? (
                <>
                  <h4 className="mt-1 text-lg font-extrabold tracking-wide text-white uppercase md:text-xl">
                    {nextMatch.homeShort}{" "}
                    <span className="font-mono text-red-500">VS</span> {nextMatch.awayShort}
                  </h4>
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
          </div>
        </Tile>

        <Tile href="/liga-u-pass" clip={CLIP.pass} gold className="min-h-[200px] md:col-span-2 md:min-h-0">
          <PhotoLayer src={MEDIA.pass} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/55 to-amber-950/25" />
          <div className="relative z-10 flex h-full min-h-[200px] flex-col justify-between p-6 md:min-h-0">
            <span className="w-fit rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-300 uppercase">
              Liga U Pass
            </span>
            <div className="mt-4">
              <h4 className="text-2xl font-black tracking-tight text-white uppercase transition-colors group-hover:text-amber-300">
                U Pass
              </h4>
              <p className="mt-1 max-w-lg text-xs text-zinc-400">
                Conoce y accede a los beneficios de Liga U.
              </p>
            </div>
          </div>
        </Tile>

        <Tile href="/multimedia" clip={CLIP.media} className="min-h-[200px] md:min-h-0">
          <PhotoLayer src={MEDIA.broadcast} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent" />
          <div className="relative z-10 flex h-full min-h-[200px] flex-col justify-between p-6 md:min-h-0">
            <span className="w-fit rounded border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-300 uppercase">
              Centro de medios
            </span>
            <div>
              <h4 className="text-lg font-black tracking-wide text-white uppercase">Multimedia Hub</h4>
              <p className="mt-1 font-mono text-xs text-zinc-400">Podcasts • Videos • Highlights</p>
            </div>
          </div>
        </Tile>
      </div>
    </section>
  );
}
