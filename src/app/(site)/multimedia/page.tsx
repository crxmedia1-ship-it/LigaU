import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { GlassCard, PageHero } from "@/components/public/brand";
import { cloudinaryImage } from "@/lib/public/media";
import { getPublicCatalog } from "@/lib/public/queries";
import { youtubeEmbed, youtubeThumb } from "@/lib/public/format";
import { PlayIcon } from "lucide-react";
import { SpotifyLogo, YoutubeLogo } from "@/components/brand-icons";

export const metadata: Metadata = {
  title: "Multimedia",
};

export const revalidate = 30;

export default async function MultimediaPage() {
  const { podcasts, news, videos } = await getPublicCatalog();

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-6 md:py-10">
      <PageHero
        kicker="Centro de medios"
        title="Multimedia"
        mark="TV"
        description="Podcasts, videos y highlights de la jornada universitaria."
      />

      {videos.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold">Highlights</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => {
              const thumb = video.thumbnailUrl ?? youtubeThumb(video.videoUrl);
              return (
                <a key={video.id} href={video.videoUrl} target="_blank" rel="noreferrer" className="group">
                  <GlassCard className="overflow-hidden">
                    <div className="relative aspect-video bg-brand-crimson/30">
                      {thumb ? (
                        <img
                          src={cloudinaryImage(thumb, 640) ?? thumb}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : null}
                      <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#C8102E] shadow-lg transition-transform group-hover:scale-110">
                        <PlayIcon className="ml-0.5 size-5 fill-current" />
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-brand-gold">{video.sportName || "Liga U"}</p>
                      <h3 className="mt-1 line-clamp-2 font-semibold">{video.title}</h3>
                    </div>
                  </GlassCard>
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Podcasts</h2>
        {podcasts.length === 0 ? (
          <p className="text-sm text-brand-silver-dim">
            Los episodios y videos oficiales de Liga U aparecerán aquí.
          </p>
        ) : (
          podcasts.map((episode) => {
            const youtube = youtubeEmbed(episode.youtubeUrl);
            const cover = episode.coverUrl ?? youtubeThumb(episode.youtubeUrl);
            return (
              <GlassCard key={episode.id}>
                <div className="grid gap-0 md:grid-cols-[16rem_1fr]">
                  {cover ? (
                    <img
                      src={cloudinaryImage(cover, 640) ?? cover}
                      alt=""
                      loading="lazy"
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
                    <div className="flex flex-wrap gap-2">
                      {episode.youtubeUrl ? (
                        <a
                          href={episode.youtubeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-zinc-900"
                        >
                          <YoutubeLogo className="h-4" />
                          YouTube
                        </a>
                      ) : null}
                      {episode.spotifyUrl ? (
                        <a
                          href={episode.spotifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-zinc-900"
                        >
                          <SpotifyLogo className="size-4" />
                          Spotify
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
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Noticias</h2>
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
