import { ArrowUpRight } from "lucide-react";
import { AnimatedSponsorLogo } from "@/components/public/animated-sponsor-logo";
import { animatedLogoKey } from "@/lib/public/animated-logos";
import { cloudinaryImage, cloudinaryLogo } from "@/lib/public/media";
import type { SponsorCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

const FALLBACK_TINT = "#d71920";

function channels(hex: string | null | undefined, fallback = FALLBACK_TINT) {
  const value = /^#[0-9a-f]{6}$/i.test(hex ?? "") ? hex! : fallback;
  return [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16));
}

/** `#RRGGBB` at the given opacity, for tinting the auto-designed panels. */
export function tint(hex: string | null | undefined, alpha: number) {
  const [r, g, b] = channels(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The brand color washed toward white: a light panel the logo keeps its own colors on. */
function wash(hex: string | null | undefined, amount: number, alpha = 1) {
  const [r, g, b] = channels(hex).map((value) => Math.round(255 - (255 - value) * amount));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The brand color pulled toward black, deep enough for white text on top. */
function shade(hex: string | null | undefined, alpha = 1) {
  const [r, g, b] = channels(hex, "#0b1636").map((value) => Math.round(value * 0.32 + 6));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The brand color pulled toward black, for headline text on the light panels. */
function ink(hex: string | null | undefined) {
  const [r, g, b] = channels(hex).map((value) => Math.round(value * 0.55));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Splits "Indumentaria oficial" into the two headline lines. */
function headlineLines(tagline: string | null | undefined) {
  const text = tagline?.trim() || "Aliado oficial";
  const cut = text.lastIndexOf(" ");
  return cut > 0 ? [text.slice(0, cut), text.slice(cut + 1)] : [text];
}

export function SponsorMark({
  sponsor,
  className,
  height = 160,
}: {
  sponsor: SponsorCard;
  className?: string;
  /** Source height in px. Larger flyers need a sharper mark. */
  height?: number;
}) {
  const src = cloudinaryLogo(sponsor.logoUrl, height);
  if (!src) {
    return <span className={cn("text-[11px] font-bold tracking-wider text-zinc-700 uppercase", className)}>{sponsor.name}</span>;
  }
  // Cloudinary already trims and sizes the logo; next/image would transform it a second time.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={sponsor.name} className={cn("object-contain", className)} />;
}

export function PresentedBy({
  sponsor,
  label = "Presentado por",
  className,
}: {
  sponsor: SponsorCard;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center gap-2.5 rounded-full bg-white pr-2 pl-3.5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.6)] ring-1 ring-zinc-200/80",
        className,
      )}
    >
      <span className="text-[9px] font-semibold tracking-[0.2em] whitespace-nowrap text-zinc-400 uppercase">{label}</span>
      <SponsorMark sponsor={sponsor} className="h-6 max-w-20" />
    </div>
  );
}

/**
 * Official-sponsor panel, designed from the logo and brand color, or the brand's own artwork when it sent one.
 * Opens the brand's site when it has a link.
 */
export function SponsorFlyer({
  sponsor,
  context,
}: {
  sponsor: SponsorCard;
  /** Where the flyer sits, e.g. "Calendario". */
  context: string;
}) {
  const artwork = cloudinaryImage(sponsor.flyerUrl, 900) ?? sponsor.flyerUrl;
  const animated = animatedLogoKey(sponsor.name);
  const body = (
    <>
      {artwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={artwork} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      ) : (
        <>
          <span
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background: `radial-gradient(120% 95% at 50% 40%, ${wash(sponsor.brandColor, 0.16)} 0%, ${wash(sponsor.brandColor, 0.07)} 55%, #fff 100%)`,
            }}
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <SponsorMark
              sponsor={sponsor}
              height={600}
              className="absolute top-1/2 -right-[18%] h-[135%] w-auto max-w-none -translate-y-1/2 -rotate-12 opacity-[0.09] transition-transform duration-700 group-hover:scale-105"
            />
            <SponsorMark
              sponsor={sponsor}
              height={300}
              className="absolute -bottom-[14%] -left-[8%] h-[55%] w-auto max-w-none rotate-[18deg] opacity-[0.06]"
            />
          </span>
        </>
      )}
      <div className="relative flex items-center justify-between px-5 pt-3.5">
        <span
          className={cn("font-jersey text-xl leading-none text-zinc-950", artwork && "rounded-md bg-white/90 px-2 py-1")}
        >
          Liga U
        </span>
        {artwork ? null : (
          <span className="text-[10px] font-semibold tracking-[0.22em] text-zinc-400 uppercase">Temporada 2026</span>
        )}
      </div>
      <div className="relative flex flex-1 items-center justify-center px-6 py-2">
        {artwork ? null : animated ? (
          <AnimatedSponsorLogo
            logo={animated}
            className="drop-shadow-[0_10px_16px_rgba(15,23,42,0.16)] [--logo-h:4rem] sm:[--logo-h:5rem]"
          />
        ) : (
          <SponsorMark
            sponsor={sponsor}
            height={240}
            className="h-16 w-auto max-w-[min(100%,240px)] drop-shadow-[0_10px_16px_rgba(15,23,42,0.16)] sm:h-20"
          />
        )}
      </div>
      <div
        className={cn(
          "relative flex items-center justify-between gap-3 px-5 pb-3.5",
          artwork && "border-t border-zinc-200/80 bg-white/95 pt-3",
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {artwork ? <SponsorMark sponsor={sponsor} className="h-5 w-auto max-w-20 shrink-0" /> : null}
          <span
            className="truncate text-[10px] font-bold tracking-[0.22em] uppercase"
            style={{ color: ink(sponsor.brandColor) }}
          >
            {sponsor.tagline || "Patrocinador oficial"}
          </span>
        </span>
        {sponsor.linkUrl ? (
          <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold tracking-[0.16em] text-zinc-700 uppercase">
            Visitar
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-semibold tracking-[0.16em] text-zinc-400 uppercase">{context}</span>
        )}
      </div>
    </>
  );

  const className =
    "group relative isolate flex min-h-[10rem] flex-col overflow-hidden rounded-[1.75rem] bg-white text-zinc-950 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.45)] ring-1 ring-zinc-200/80";

  if (sponsor.linkUrl) {
    return (
      <a
        href={sponsor.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={`${sponsor.name}, patrocinador oficial de Liga U`}
        className={cn(className, "transition-transform duration-200 active:scale-[0.985] md:hover:-translate-y-0.5")}
      >
        {body}
      </a>
    );
  }
  return <figure className={className}>{body}</figure>;
}

/** Home rail card: the brand's artwork or logo on its own color, with its tagline as the headline. */
export function HomeSponsorTile({ sponsor, className }: { sponsor: SponsorCard; className?: string }) {
  const artwork = cloudinaryImage(sponsor.flyerUrl, 700) ?? sponsor.flyerUrl;
  const animated = animatedLogoKey(sponsor.name);
  const base = shade(sponsor.brandColor);
  const lines = headlineLines(sponsor.tagline);
  const body = (
    <>
      {artwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={artwork}
          alt=""
          className="absolute top-0 right-0 -z-10 h-full w-auto max-w-none transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <>
          <span
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ background: `radial-gradient(90% 70% at 80% 20%, ${tint(sponsor.brandColor, 0.65)} 0%, transparent 70%)` }}
          />
          <SponsorMark
            sponsor={sponsor}
            height={480}
            className="absolute top-[18%] -right-6 -z-10 h-40 w-auto max-w-[85%] rotate-[-8deg] opacity-25 brightness-0 invert transition-transform duration-700 group-hover:scale-105"
          />
        </>
      )}
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(100deg, ${shade(sponsor.brandColor, 0.92)} 0%, ${shade(sponsor.brandColor, 0.55)} 48%, transparent 78%)` }} />
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: `linear-gradient(to top, ${shade(sponsor.brandColor, 0.95)} 0%, transparent 45%)` }} />
      <span className="w-fit rounded-md bg-white px-3 py-2 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)]">
        {animated ? (
          <AnimatedSponsorLogo logo={animated} className="max-w-32 [--logo-h:1.5rem]" />
        ) : (
          <SponsorMark sponsor={sponsor} className="h-6 w-auto max-w-32" />
        )}
      </span>

      <div className="mt-auto">
        <p className="text-[9px] font-black tracking-[0.24em] text-white/70 uppercase">Temporada 2026</p>
        <h2
          className={cn(
            "font-jersey mt-1 leading-[0.84] uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]",
            Math.max(...lines.map((line) => line.length)) > 12 ? "text-[2.1rem]" : "text-[2.85rem]",
          )}
        >
          {lines.map((line, index) => (
            <span key={index} className="block">
              {line}
            </span>
          ))}
        </h2>
        <span className="font-jersey mt-1.5 inline-block -skew-x-12 bg-[#d71920] px-2.5 py-0.5 text-2xl leading-none uppercase">
          <span className="inline-block skew-x-12">de la Liga U</span>
        </span>
      </div>

      <div className="mt-3 flex h-14 shrink-0 items-end justify-between gap-2 border-t border-white/15">
        <span className="flex min-h-11 items-center truncate text-[9px] font-black tracking-[0.16em] text-white/60 uppercase">
          Patrocinador oficial
        </span>
        {sponsor.linkUrl ? (
          <span className="inline-flex min-h-11 shrink-0 items-center gap-1 text-xs font-black tracking-wide whitespace-nowrap uppercase">
            Visitar
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </span>
        ) : null}
      </div>
    </>
  );

  const classes = cn(
    "group relative isolate flex flex-col overflow-hidden rounded-2xl p-4 text-white shadow-[0_24px_50px_-24px_rgba(11,22,54,0.8)]",
    className,
  );
  const style = { backgroundColor: base };

  if (sponsor.linkUrl) {
    return (
      <a
        href={sponsor.linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        aria-label={`${sponsor.name}, ${lines.join(" ").toLowerCase()} de Liga U`}
        className={classes}
        style={style}
      >
        {body}
      </a>
    );
  }
  return (
    <div className={classes} style={style}>
      {body}
    </div>
  );
}
