import Link from "next/link";
import { NewspaperIcon, RadioIcon, TicketIcon, TrophyIcon } from "lucide-react";
import { GlassCard } from "@/components/public/brand";
import { cn } from "@/lib/utils";
import type { NewsCard, SportCard } from "@/lib/public/types";

const MEDIA = {
  chronicle:
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1400&q=60",
  match:
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=60",
  pass: "https://images.unsplash.com/photo-1522778119026-d647f0596c23?auto=format&fit=crop&w=900&q=60",
  radio:
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=60",
};

function ImageRevealCard({
  href,
  image,
  className,
  children,
}: {
  href: string;
  image: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn("block overflow-hidden", className)}>
      <GlassCard className="group relative min-h-52 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 md:min-h-64 md:p-6">
        <div className="absolute inset-0 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
        <div className="image-reveal-veil pointer-events-none absolute inset-0" />
        <div className="relative z-10">{children}</div>
      </GlassCard>
    </Link>
  );
}

export function HomeBento({
  news,
  sports,
}: {
  news: NewsCard[];
  sports: SportCard[];
}) {
  const featured = news.find((item) => item.isFeatured) ?? news[0];
  const rest = news.filter((item) => item.id !== featured?.id).slice(0, 2);

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {featured ? (
        <ImageRevealCard
          href={`/noticias/${featured.slug}`}
          image={featured.coverImageUrl || MEDIA.chronicle}
          className="md:col-span-2"
        >
          <p className="inline-flex items-center gap-1 text-xs tracking-[0.2em] text-[#BA0C2F] uppercase">
            <NewspaperIcon className="size-3.5" /> Crónica
          </p>
          <h3 className="mt-3 max-w-md text-2xl font-semibold text-white">{featured.title}</h3>
          <p className="mt-2 max-w-md text-sm text-zinc-400">{featured.excerpt}</p>
        </ImageRevealCard>
      ) : (
        <ImageRevealCard href="/multimedia" image={MEDIA.chronicle} className="md:col-span-2">
          <p className="inline-flex items-center gap-1 text-xs tracking-[0.2em] text-[#BA0C2F] uppercase">
            <NewspaperIcon className="size-3.5" /> Crónica
          </p>
          <h3 className="mt-3 text-xl font-semibold text-white">Las crónicas aparecen aquí</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Publica una noticia destacada desde el CMS para llenar este bento.
          </p>
        </ImageRevealCard>
      )}

      <ImageRevealCard href="/competicion" image={MEDIA.match}>
        <TrophyIcon className="size-5 text-[#BA0C2F]" />
        <h3 className="mt-4 text-lg font-semibold text-white">Match Center</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Fixture, filtros por las {sports.length} disciplinas y tablas automáticas.
        </p>
      </ImageRevealCard>

      <ImageRevealCard href="/liga-u-pass" image={MEDIA.pass}>
        <TicketIcon className="size-5 text-[#BA0C2F]" />
        <h3 className="mt-4 text-lg font-semibold text-white">Liga U Pass</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Beneficios con canje CarnetX y códigos promocionales.
        </p>
      </ImageRevealCard>

      {rest.map((item) => (
        <ImageRevealCard
          key={item.id}
          href={`/noticias/${item.slug}`}
          image={item.coverImageUrl || MEDIA.chronicle}
          className="md:col-span-2"
        >
          <p className="text-xs text-zinc-400">{item.sportName || "Liga U"}</p>
          <h3 className="mt-2 font-semibold text-white">{item.title}</h3>
        </ImageRevealCard>
      ))}

      <ImageRevealCard href="/multimedia" image={MEDIA.radio} className="md:col-span-2">
        <RadioIcon className="size-5 text-[#BA0C2F]" />
        <h3 className="mt-4 text-lg font-semibold text-white">Podcasts y videos</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Hub oficial con Spotify, YouTube y las crónicas de la jornada.
        </p>
      </ImageRevealCard>
    </section>
  );
}
