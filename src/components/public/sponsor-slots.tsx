import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { sponsorLogo } from "@/components/public/sponsor-marquee";
import type { BenefitCard, SponsorCard } from "@/lib/public/types";
import { cn } from "@/lib/utils";

/** Rotates the partner list so each page gets different brands in its slots. */
export function sponsorAt(sponsors: SponsorCard[], index: number): SponsorCard | undefined {
  return sponsors.length ? sponsors[index % sponsors.length] : undefined;
}

export function offerFor(sponsor: SponsorCard, benefits: BenefitCard[]) {
  const name = sponsor.name.toLowerCase();
  return benefits.find((benefit) => benefit.sponsorName.toLowerCase() === name)?.discountTitle;
}

export function SponsorMark({ sponsor, className }: { sponsor: SponsorCard; className?: string }) {
  const src = sponsorLogo(sponsor.logoUrl);
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
    <Link
      href="/liga-u-pass"
      className={cn(
        "inline-flex h-9 items-center gap-2.5 rounded-full bg-white pr-2 pl-3.5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.6)] ring-1 ring-zinc-200/80 transition-transform active:scale-[0.97]",
        className,
      )}
    >
      <span className="text-[9px] font-semibold tracking-[0.2em] whitespace-nowrap text-zinc-400 uppercase">{label}</span>
      <SponsorMark sponsor={sponsor} className="h-6 max-w-20" />
    </Link>
  );
}

/** In-feed paid placement with a single conversion action. */
export function SponsorOffer({
  sponsor,
  offer,
  context,
}: {
  sponsor: SponsorCard;
  offer?: string;
  /** Short line tying the brand to the section, e.g. "Aliado del calendario". */
  context: string;
}) {
  return (
    <Link
      href="/liga-u-pass"
      className="group relative isolate block overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.5)] ring-1 ring-zinc-200/80 transition-transform duration-300 active:scale-[0.99] sm:p-6"
    >
      <div
        aria-hidden
        className="absolute -top-16 -right-16 -z-10 size-48 rounded-full bg-[radial-gradient(circle,rgba(200,16,46,0.12),transparent_70%)]"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-semibold tracking-[0.18em] text-zinc-500 uppercase">
          Patrocinado
        </span>
        <span className="text-[10px] font-semibold tracking-[0.18em] text-[#C8102E] uppercase">{context}</span>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-zinc-50 ring-1 ring-zinc-100 transition-transform duration-500 group-hover:scale-105">
          <SponsorMark sponsor={sponsor} className="max-h-12 max-w-16" />
        </span>
        <div className="min-w-0">
          <p className="font-jersey text-[2rem] leading-[0.9] text-zinc-950 uppercase">
            {offer ?? `Beneficios ${sponsor.name}`}
          </p>
          <p className="mt-1.5 text-[13px] leading-snug text-zinc-500">
            Exclusivo para hinchas con Liga U Pass. Actívalo gratis en segundos.
          </p>
        </div>
      </div>
      <span className="relative mt-5 flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#C8102E] text-sm font-semibold text-white shadow-[0_14px_30px_-14px_rgba(200,16,46,0.9)]">
        <span
          aria-hidden
          className="animate-ligau-shine absolute inset-y-0 -left-1/2 w-1/3 skew-x-[-20deg] bg-white/25"
        />
        Activar beneficio
        <ArrowUpRight className="size-4" strokeWidth={2.5} />
      </span>
    </Link>
  );
}
