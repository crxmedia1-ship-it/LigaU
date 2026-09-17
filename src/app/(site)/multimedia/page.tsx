import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GlassCard, PageHero } from "@/components/public/brand";
import { getPublicCatalog } from "@/lib/public/queries";
import { spotifyEmbed, youtubeEmbed } from "@/lib/public/format";

export const metadata: Metadata = {
  title: "Multimedia",
};

export default async function MultimediaPage() {
  const { podcasts, news } = await getPublicCatalog();

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-10">
      <PageHero kicker="Audio y crónicas" title="Multimedia" mark="FM" />

      <section className="space-y-6">
        {podcasts.length === 0 ? (
          <p className="text-sm text-brand-silver-dim">
            Los episodios oficiales aparecerán aquí con Spotify y YouTube.
          </p>
        ) : (
          podcasts.map((episode) => {
            const youtube = youtubeEmbed(episode.youtubeUrl);
            const spotify = spotifyEmbed(episode.spotifyUrl);
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
                    <div className="flex flex-wrap gap-3 text-sm">
                      {episode.spotifyUrl ? (
                        <a href={episode.spotifyUrl} className="text-brand-gold underline" target="_blank" rel="noreferrer">
                          Spotify
                        </a>
                      ) : null}
                      {episode.youtubeUrl ? (
                        <a href={episode.youtubeUrl} className="text-brand-gold underline" target="_blank" rel="noreferrer">
                          YouTube
                        </a>
                      ) : null}
                    </div>
                    {youtube ? (
                      <iframe
                        title={episode.title}
                        src={youtube}
                        className="aspect-video w-full rounded-md"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : null}
                    {spotify && !youtube ? (
                      <iframe
                        title={episode.title}
                        src={spotify}
                        className="h-20 w-full rounded-md"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
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
        <h2 className="text-2xl font-semibold">Crónicas</h2>
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
