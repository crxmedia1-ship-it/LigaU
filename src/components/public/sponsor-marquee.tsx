import { Marquee } from "@/components/magic/marquee";
import type { SponsorCard } from "@/lib/public/types";

function sponsorLogo(url: string | null | undefined) {
  if (!url) return null;
  const marker = "/upload/";
  const index = url.indexOf(marker);
  if (index === -1) return url;
  return `${url.slice(0, index + marker.length)}e_trim,f_auto,q_auto,c_fit,h_80/${url.slice(index + marker.length)}`;
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
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Patrocinadores Liga U</h2>
      <div className="py-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <Marquee duration="28s">
          {items.map((sponsor) => {
            const logo = sponsorLogo(sponsor.logoUrl);
            return (
              <div
                key={sponsor.id}
                className="flex h-12 min-w-28 items-center justify-center px-4"
              >
                {logo ? (
                  <img
                    src={logo}
                    alt={sponsor.name}
                    className="h-8 max-w-28 object-contain brightness-0 invert opacity-80"
                  />
                ) : (
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-silver">
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
