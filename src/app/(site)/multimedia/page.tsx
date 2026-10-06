import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clapperboard, Mic, Newspaper, PlayIcon, Sparkles, Video } from "lucide-react";
import { GlassCard, PageHero } from "@/components/public/brand";
import { SpotifyLogo, YoutubeLogo } from "@/components/brand-icons";
import { cloudinaryImage } from "@/lib/public/media";
import { getPublicCatalog } from "@/lib/public/queries";
import { youtubeThumb } from "@/lib/public/format";
import type { VideoCard } from "@/lib/public/types";

export const metadata: Metadata = {
  title: "Multimedia",
};

export const revalidate = 30;

const VIDEO_SECTIONS = [
  { id: "highlights", title: "Highlights", kinds: ["highlight", "video"], icon: Sparkles, empty: "las mejores jugadas" },
  { id: "resumenes", title: "Resúmenes", kinds: ["resumen"], icon: Clapperboard, empty: "los resúmenes de cada partido" },
  { id: "entrevistas", title: "Entrevistas", kinds: ["entrevista"], icon: Video, empty: "las entrevistas" },
] as const;

const NEWS_PREVIEW = 4;

function SectionHeader({
  id,
  title,
  count,
  icon: Icon,
  action,
}: {
  id: string;
  title: string;
  count: number;
  icon: typeof Video;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl bg-rose-50 text-brand-red ring-1 ring-rose-100">
        <Icon className="size-[18px]" />
      </span>
      <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight text-zinc-950">
        {title}
      </h2>
      {count ? (
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-500 tabular-nums">
          {count}
        </span>
      ) : null}
      <span aria-hidden className="h-px flex-1 bg-zinc-200" />
      {action}
    </div>
  );
}

function EmptySection({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white/70 px-5 py-8 text-center text-sm text-zinc-500">
      {children}
    </p>
  );
}

function VideoTile({ video }: { video: VideoCard }) {
  const thumb = video.thumbnailUrl ?? youtubeThumb(video.videoUrl);
  return (
    <a href={video.videoUrl} target="_blank" rel="noreferrer" className="group">
      <GlassCard className="h-full overflow-hidden">
        <div className="relative aspect-video bg-zinc-200">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cloudinaryImage(thumb, 640) ?? thumb}
              alt=""
              loading="lazy"
              className="size-full object-cover object-[50%_20%]"
            />
          ) : null}
          <span className="absolute top-1/2 left-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-brand-red shadow-lg transition-transform group-hover:scale-110">
            <PlayIcon className="ml-0.5 size-5 fill-current" />
          </span>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold text-brand-red">{video.sportName || "Liga U"}</p>
          <h3 className="mt-1 line-clamp-2 font-semibold text-zinc-950">{video.title}</h3>
        </div>
      </GlassCard>
    </a>
  );
}

export default async function MultimediaPage() {
  const { podcasts, news, videos } = await getPublicCatalog();
  const videoSections = VIDEO_SECTIONS.map((section) => ({
    ...section,
    items: videos.filter((video) => (section.kinds as readonly string[]).includes(video.kind)),
  }));
  const nav = [
    ...videoSections.map((section) => ({ id: section.id, title: section.title, count: section.items.length })),
    { id: "podcasts", title: "Podcasts", count: podcasts.length },
    { id: "noticias", title: "Noticias", count: news.length },
  ];

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-6 md:py-10">
      <PageHero
        kicker="Centro de medios"
        title="Multimedia"
        mark="TV"
        description="Podcasts, videos y highlights de la jornada universitaria."
      />

      <nav
        aria-label="Secciones de multimedia"
        className="sticky top-2 z-10 -mx-4 mb-10 overflow-x-auto px-4 [scrollbar-width:none]"
      >
        <ul className="flex w-max min-w-full gap-1 rounded-full bg-white/90 p-1.5 shadow-sm ring-1 ring-zinc-200 backdrop-blur-md">
          {nav.map((item) => (
            <li key={item.id} className="sm:flex-1">
              <a
                href={`#${item.id}`}
                className="flex h-10 items-center justify-center gap-1.5 rounded-full px-3.5 text-sm font-semibold whitespace-nowrap text-zinc-600 transition-colors hover:bg-rose-50 hover:text-brand-red"
              >
                {item.title}
                {item.count ? (
                  <span className="rounded-full bg-zinc-100 px-1.5 text-[11px] text-zinc-500 tabular-nums">
                    {item.count}
                  </span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-14">
        {videoSections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-20">
            <SectionHeader id={section.id} title={section.title} count={section.items.length} icon={section.icon} />
            {section.items.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((video) => (
                  <VideoTile key={video.id} video={video} />
                ))}
              </div>
            ) : (
              <EmptySection>Muy pronto verás aquí {section.empty}.</EmptySection>
            )}
          </section>
        ))}

        <section id="podcasts" aria-labelledby="podcasts-title" className="scroll-mt-20">
          <SectionHeader id="podcasts" title="Podcasts" count={podcasts.length} icon={Mic} />
          {podcasts.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {podcasts.map((episode) => {
                const cover = episode.coverUrl ?? youtubeThumb(episode.youtubeUrl);
                return (
                  <GlassCard key={episode.id} className="flex overflow-hidden">
                    <div className="relative w-32 shrink-0 bg-zinc-200 sm:w-40">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cloudinaryImage(cover, 320) ?? cover}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 size-full object-cover object-[50%_20%]"
                        />
                      ) : (
                        <Mic className="absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 text-zinc-400" />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                      <span className="text-xs font-semibold text-brand-red">Episodio {episode.episodeNumber}</span>
                      <h3 className="line-clamp-2 font-semibold text-zinc-950">{episode.title}</h3>
                      {episode.description ? (
                        <p className="line-clamp-2 text-sm text-zinc-500">{episode.description}</p>
                      ) : null}
                      <div className="mt-auto flex flex-wrap gap-2 pt-1">
                        {episode.youtubeUrl ? (
                          <a
                            href={episode.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-9 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200"
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
                            className="flex h-9 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200"
                          >
                            <SpotifyLogo className="size-4" />
                            Spotify
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          ) : (
            <EmptySection>Muy pronto verás aquí los episodios del podcast oficial.</EmptySection>
          )}
        </section>

        <section id="noticias" aria-labelledby="noticias-title" className="scroll-mt-20">
          <SectionHeader
            id="noticias"
            title="Noticias"
            count={news.length}
            icon={Newspaper}
            action={
              news.length > NEWS_PREVIEW ? (
                <Link
                  href="/noticias"
                  className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand-red hover:underline"
                >
                  Ver todas
                  <ArrowUpRight className="size-4" />
                </Link>
              ) : null
            }
          />
          {news.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {news.slice(0, NEWS_PREVIEW).map((item) => (
                <Link key={item.id} href={`/noticias/${item.slug}`} className="group">
                  <GlassCard className="flex h-full overflow-hidden">
                    {item.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={cloudinaryImage(item.coverImageUrl, 320) ?? item.coverImageUrl}
                        alt=""
                        loading="lazy"
                        className="w-28 shrink-0 object-cover object-[50%_20%] sm:w-36"
                      />
                    ) : null}
                    <div className="min-w-0 p-4">
                      <p className="text-xs font-semibold text-brand-red">{item.sportName || "Liga U"}</p>
                      <h3 className="mt-1 line-clamp-2 font-semibold text-zinc-950 group-hover:text-brand-red">
                        {item.title}
                      </h3>
                      {item.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{item.excerpt}</p> : null}
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          ) : (
            <EmptySection>Muy pronto verás aquí las crónicas y previas de la liga.</EmptySection>
          )}
        </section>
      </div>
    </main>
  );
}
