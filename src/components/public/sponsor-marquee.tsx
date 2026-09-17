import { Marquee } from "@/components/magic/marquee";
import { PageKicker } from "@/components/public/brand";
import type { SponsorCard } from "@/lib/public/types";

export function SponsorMarquee({ sponsors }: { sponsors: SponsorCard[] }) {
  const items =
    sponsors.length > 0
      ? sponsors
      : [
          {
            id: "empty",
            name: "Liga U Pass",
            category: "Próximamente",
            locationTag: null,
            logoUrl: null,
          },
        ];

  return (
    <section className="space-y-4">
      <PageKicker>Club de beneficios</PageKicker>
      <h2 className="text-2xl font-semibold">Patrocinadores Liga U Pass</h2>
      <div className="metallic-tape py-2">
        <Marquee duration="28s">
          {items.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex h-16 min-w-40 items-center justify-center border border-brand-silver/20 bg-black/40 px-6"
            >
              {sponsor.logoUrl ? (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="h-8 object-contain"
                />
              ) : (
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-silver">
                  {sponsor.name}
                </span>
              )}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
