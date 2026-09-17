import Link from "next/link";
import { MatchCountdown } from "@/components/public/match-countdown";
import { cn } from "@/lib/utils";
import type { BenefitCard, MatchCard, NewsCard, SponsorCard } from "@/lib/public/types";

const MEDIA = {
  chronicle:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=60",
  match:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=60",
  radio:
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=60",
};

const CLIP = {
  news: "[clip-path:polygon(16px_0,100%_0,100%_100%,0_100%,0_16px)]",
  duel: "[clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,0_100%)]",
  pass: "[clip-path:polygon(0_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%)]",
  radio: "[clip-path:polygon(0_0,100%_0,100%_100%,16px_100%,0_calc(100%-16px))]",
} as const;

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

function Tile({
  href,
  image,
  clip,
  className,
  gold,
  carbon,
  children,
}: {
  href: string;
  image?: string;
  clip: string;
  className?: string;
  gold?: boolean;
  carbon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative min-h-48 overflow-hidden border bg-zinc-950 p-5 transition-colors duration-300",
        "active:scale-[0.98] md:min-h-56",
        clip,
        gold
          ? "border-amber-500/40 shadow-[0_0_28px_rgba(212,175,55,0.14)] hover:border-amber-400/70"
          : "border-zinc-800/80 hover:border-red-600/60",
        carbon && "carbon-fiber",
        className,
      )}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : null}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-[9] bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent",
          gold && "from-zinc-950 via-amber-950/45 to-transparent",
        )}
      />
      {gold ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(212,175,55,0.28),inset_0_0_40px_rgba(212,175,55,0.12)]"
        />
      ) : null}
      <div className="relative z-10 flex h-full min-h-36 flex-col justify-end">{children}</div>
    </Link>
  );
}

export function HomeBento({
  news = [],
  nextMatch,
  weeklyBenefit,
  featuredSponsor,
}: {
  news?: NewsCard[];
  nextMatch: MatchCard | null;
  weeklyBenefit: BenefitCard | null;
  featuredSponsor?: SponsorCard | null;
}) {
  const featured = news.find((item) => item.isFeatured) ?? news[0];
  const chronicleDate = formatDate(featured?.publishedAt);
  const passLogo = weeklyBenefit?.sponsorLogo || featuredSponsor?.logoUrl || null;
  const passTitle = weeklyBenefit?.discountTitle ?? featuredSponsor?.name ?? "Club de beneficios";
  const passSponsor = weeklyBenefit?.sponsorName ?? featuredSponsor?.name ?? "Liga U Pass VIP";

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 gap-3 px-4 md:grid-cols-3">
      <Tile
        href={featured ? `/noticias/${featured.slug}` : "/multimedia"}
        image={featured?.coverImageUrl || MEDIA.chronicle}
        clip={CLIP.news}
        className="md:col-span-2"
      >
        <span className="mb-3 inline-flex w-fit rounded-full bg-[#C8102E] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.22em] text-white uppercase">
          Crónica{chronicleDate ? ` · ${chronicleDate}` : ""}
        </span>
        <h3 className="font-jersey text-3xl leading-[0.9] font-black tracking-tight text-white uppercase">
          {featured?.title ?? "La jornada en cancha"}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-zinc-300">
          {featured?.excerpt ?? "El pulso de Liga U, partido a partido."}
        </p>
      </Tile>

      <Tile href={nextMatch ? `/partidos/${nextMatch.id}` : "/competicion"} image={MEDIA.match} clip={CLIP.duel}>
        <span className="mb-3 inline-flex w-fit rounded-full bg-[#C8102E] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.22em] text-white uppercase">
          {nextMatch?.status === "live" ? "En vivo" : "Fixture"}
        </span>
        <h3 className="font-jersey text-3xl leading-[0.9] font-black tracking-tight text-white uppercase">
          Próximo duelo
        </h3>
        {nextMatch ? (
          <div className="mt-2 space-y-1">
            <p className="text-sm font-semibold tracking-wide text-white">
              {nextMatch.homeShort} vs {nextMatch.awayShort}
            </p>
            <p className="text-xs text-zinc-300">{nextMatch.sportName}</p>
            <MatchCountdown date={nextMatch.matchDate} live={nextMatch.status === "live"} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-300">Fixture por confirmar.</p>
        )}
      </Tile>

      <Tile href="/multimedia" image={MEDIA.radio} clip={CLIP.radio}>
        <span className="mb-3 inline-flex w-fit rounded-full bg-[#C8102E] px-2.5 py-0.5 text-[10px] font-bold tracking-[0.22em] text-white uppercase">
          Podcast
        </span>
        <h3 className="font-jersey text-3xl leading-[0.9] font-black tracking-tight text-white uppercase">
          Multimedia Hub
        </h3>
        <p className="mt-2 text-sm text-zinc-300">Cabina, Spotify y YouTube.</p>
      </Tile>

      <Tile href="/liga-u-pass" carbon gold clip={CLIP.pass} className="md:col-span-2">
        <span className="mb-3 inline-flex w-fit rounded-full border border-amber-400/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold tracking-[0.22em] text-amber-300 uppercase">
          Descuento de la semana
        </span>
        <div className="flex items-end gap-3">
          {passLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={passLogo} alt={passSponsor} className="h-10 w-10 object-contain" />
          ) : null}
          <div>
            <h3 className="font-jersey text-3xl leading-[0.9] font-black tracking-tight text-white uppercase">
              {passTitle}
            </h3>
            <p className="mt-1 text-sm text-zinc-300">{passSponsor}</p>
          </div>
        </div>
      </Tile>
    </section>
  );
}
