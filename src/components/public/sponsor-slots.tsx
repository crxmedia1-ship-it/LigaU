import { cloudinaryLogo } from "@/lib/public/media";
import type { SponsorCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

/** Rotates the partner list so each page gets different brands in its slots. */
export function sponsorAt(sponsors: SponsorCard[], index: number): SponsorCard | undefined {
  return sponsors.length ? sponsors[index % sponsors.length] : undefined;
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
 * Official-sponsor flyer. It is not a link: a brand can pay for a league
 * sponsorship, a U Pass benefit, or both, and this slot is only the first.
 */
export function SponsorFlyer({
  sponsor,
  context,
}: {
  sponsor: SponsorCard;
  /** Where the flyer sits, e.g. "Calendario". */
  context: string;
}) {
  return (
    <figure className="relative isolate flex min-h-[15.5rem] flex-col overflow-hidden rounded-[1.75rem] bg-[#07080c] text-white shadow-[0_28px_50px_-28px_rgba(0,0,0,0.7)]">
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-[78%] -translate-x-1/2 -translate-y-[58%] bg-[radial-gradient(ellipse_at_center,rgba(255,214,120,0.34),rgba(255,255,255,0.08)_36%,transparent_68%)]"
      />
      <div className="relative flex items-center justify-between px-5 pt-4">
        <span className="font-jersey text-xl leading-none">Liga U</span>
        <span className="text-[10px] font-semibold tracking-[0.22em] text-white/45 uppercase">Temporada 2026</span>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-6 py-5">
        <SponsorMark
          sponsor={sponsor}
          height={360}
          className="h-32 w-auto max-w-[min(100%,300px)] drop-shadow-[0_16px_28px_rgba(0,0,0,0.55)] sm:h-36"
        />
      </div>
      <figcaption className="relative flex items-center justify-between gap-3 px-5 pb-4">
        <span className="text-[10px] font-bold tracking-[0.22em] text-white/70 uppercase">Patrocinador oficial</span>
        <span className="text-[10px] font-semibold tracking-[0.16em] text-white/40 uppercase">{context}</span>
      </figcaption>
    </figure>
  );
}
