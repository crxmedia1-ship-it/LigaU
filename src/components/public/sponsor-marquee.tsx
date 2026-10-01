import { Marquee } from "@/components/magic/marquee";
import type { SponsorCard } from "@/lib/public/types";

/** Cloudinary delivery URL trimmed to the mark and capped at 160px tall. */
export function sponsorLogo(url: string | null | undefined) {
  if (!url) return null;
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;
  return `${url.slice(0, index + marker.length)}e_trim,f_auto,q_auto,c_fit,h_160/${url.slice(index + marker.length)}`;
}

export function SponsorMarquee({ sponsors }: { sponsors: SponsorCard[] }) {
  const items =
    sponsors.length > 0
      ? sponsors
      : [
          {
            id: "empty",
            name: "Próximamente",
            category: "Patrocinador",
            locationTag: null,
            logoUrl: null,
          },
        ];

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-jersey text-[1.75rem] leading-none text-zinc-950 uppercase sm:text-4xl">Patrocinantes oficiales</h2>
        <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] text-zinc-400 uppercase">Temporada 2026</p>
      </div>
      <div className="py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <Marquee duration="28s">
          {items.map((sponsor) => {
            const logo = sponsorLogo(sponsor.logoUrl);
            return (
              <div
                key={sponsor.id}
                className="flex h-16 min-w-32 items-center justify-center px-5 sm:h-20 sm:min-w-40 sm:px-6"
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={sponsor.name}
                    className="h-9 max-w-28 object-contain sm:h-12 sm:max-w-36"
                  />
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {sponsor.name}
                  </span>
                )}
              </div>
            );
          })}
        </Marquee>
      </div>
    </section>
  );
}
