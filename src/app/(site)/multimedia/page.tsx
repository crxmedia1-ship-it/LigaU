import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GlassCard, PageHero } from "@/components/public/brand";
import { getPublicCatalog } from "@/lib/public/queries";
import { youtubeEmbed } from "@/lib/public/format";

export const metadata: Metadata = {
  title: "Multimedia",
};

export default async function MultimediaPage() {
  const { podcasts, news } = await getPublicCatalog();

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10">
      <PageHero
        kicker="Centro de medios"
        title="Multimedia"
        mark="TV"
        description="Podcasts, videos y highlights de la jornada universitaria."
      />

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Podcasts y videos</h2>
        {podcasts.length === 0 ? (
          <p className="text-sm text-brand-silver-dim">
            Los episodios y videos oficiales de Liga U aparecerán aquí.
          </p>
        ) : (
          podcasts.map((episode) => {
            const youtube = youtubeEmbed(episode.youtubeUrl);
            return (
              <GlassCard key={episode.id}>
                <div className="grid gap-0 md:grid-cols-[16rem_1fr]">
                  {episode.coverUrl ? (
                    <img
                      src={episode.coverUrl}
                      alt=""
                      className="h-48 w-full object-cover md:h-full"
                    />
                  ) : (
                    <div className="grid h-48 place-items-center bg-brand-crimson/30 md:h-full">
                      <Badge variant="outline">E{episode.episodeNumber}</Badge>
                    </div>
                  )}
                  <div className="space-y-3 p-5">
                    <Badge variant="outline">Episodio {episode.episodeNumber}</Badge>
                    <h2 className="text-2xl font-semibold">{episode.title}</h2>
                    <p className="text-sm text-brand-silver-dim">{episode.description}</p>
                    {episode.youtubeUrl ? (
                      <a
                        href={episode.youtubeUrl}
                        className="text-brand-gold underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver video
                      </a>
                    ) : null}
                    {youtube ? (
                      <iframe
                        title={episode.title}
                        src={youtube}
                        className="aspect-video w-full rounded-md"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : null}
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Highlights y noticias</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {news.map((item) => (
            <Link key={item.id} href={`/noticias/${item.slug}`}>
              <GlassCard className="p-5">
                <p className="text-xs text-brand-gold">{item.sportName || "Liga U"}</p>
                <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-brand-silver-dim">{item.excerpt}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
