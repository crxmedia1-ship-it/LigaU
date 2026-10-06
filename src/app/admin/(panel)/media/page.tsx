import Link from "next/link";
import { FilmIcon, MicIcon, NewspaperIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NoticiasBoard, type NewsRow } from "@/app/admin/(panel)/noticias/noticias-board";
import { MultimediaBoard, type PodcastRow } from "@/app/admin/(panel)/multimedia/multimedia-board";
import { HighlightsBoard, type VideoRow } from "@/app/admin/(panel)/media/highlights-board";
import type { VideoKind } from "@/app/admin/(panel)/media/actions";
import { cn } from "@/lib/utils";

type Tab = "noticias" | "podcast" | "highlights";

const TABS: { id: Tab; label: string; icon: typeof FilmIcon }[] = [
  { id: "noticias", label: "Noticias", icon: NewspaperIcon },
  { id: "podcast", label: "Podcast", icon: MicIcon },
  { id: "highlights", label: "Videos", icon: FilmIcon },
];

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function loadNews(supabase: Supabase, nueva?: string, editar?: string) {
  const [{ data: sports }, { data: universities }, { data: news }] = await Promise.all([
    supabase.from("sports").select("id, name, slug").order("name"),
    supabase.from("universities").select("id, name").order("name"),
    supabase
      .from("news")
      .select(
        "id, title, slug, excerpt, content, cover_image_url, sport_id, university_id, is_featured, published_at, sports(name), universities(name)",
      )
      .order("created_at", { ascending: false }),
  ]);

  const rows: NewsRow[] = (news ?? []).map((item) => {
    const sport = Array.isArray(item.sports) ? item.sports[0] : item.sports;
    const university = Array.isArray(item.universities) ? item.universities[0] : item.universities;
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      coverImageUrl: item.cover_image_url,
      sportId: item.sport_id,
      universityId: item.university_id,
      isFeatured: item.is_featured,
      publishedAt: item.published_at,
      sportName: sport?.name ?? null,
      universityName: university?.name ?? null,
    };
  });

  return (
    <NoticiasBoard
      sports={sports ?? []}
      universities={universities ?? []}
      news={rows}
      startOpen={nueva === "1"}
      editId={editar}
    />
  );
}

async function loadPodcast(supabase: Supabase) {
  const { data } = await supabase
    .from("podcast_episodes")
    .select("id, title, description, episode_number, cover_url, spotify_url, youtube_url, published_at")
    .order("episode_number", { ascending: false });

  const episodes: PodcastRow[] = (data ?? []).map((episode) => ({
    id: episode.id,
    title: episode.title,
    description: episode.description,
    episodeNumber: episode.episode_number,
    coverUrl: episode.cover_url,
    spotifyUrl: episode.spotify_url,
    youtubeUrl: episode.youtube_url,
    publishedAt: episode.published_at,
  }));

  return <MultimediaBoard episodes={episodes} />;
}

async function loadHighlights(supabase: Supabase) {
  const [{ data: sports }, { data }] = await Promise.all([
    supabase.from("sports").select("id, name, slug").order("name"),
    supabase
      .from("media_videos")
      .select("id, title, kind, video_url, thumbnail_url, sport_id, description, published_at, sports(name)")
      .order("published_at", { ascending: false }),
  ]);

  const videos: VideoRow[] = (data ?? []).map((video) => {
    const sport = Array.isArray(video.sports) ? video.sports[0] : video.sports;
    return {
      id: video.id,
      title: video.title,
      kind: video.kind as VideoKind,
      videoUrl: video.video_url,
      thumbnailUrl: video.thumbnail_url,
      sportId: video.sport_id,
      sportName: sport?.name ?? null,
      description: video.description,
      publishedAt: video.published_at,
    };
  });

  return <HighlightsBoard videos={videos} sports={sports ?? []} />;
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; nueva?: string; editar?: string }>;
}) {
  const { tab: rawTab, nueva, editar } = await searchParams;
  const tab: Tab = TABS.some((item) => item.id === rawTab) ? (rawTab as Tab) : "noticias";
  const supabase = await createClient();

  const [news, podcast, videos, board] = await Promise.all([
    supabase.from("news").select("id", { count: "exact", head: true }),
    supabase.from("podcast_episodes").select("id", { count: "exact", head: true }),
    supabase.from("media_videos").select("id", { count: "exact", head: true }),
    tab === "podcast"
      ? loadPodcast(supabase)
      : tab === "highlights"
        ? loadHighlights(supabase)
        : loadNews(supabase, nueva, editar),
  ]);
  const counts: Record<Tab, number> = {
    noticias: news.count ?? 0,
    podcast: podcast.count ?? 0,
    highlights: videos.count ?? 0,
  };

  return (
    <div className="space-y-6">
      <nav
        aria-label="Secciones de media"
        className="mx-auto grid w-full max-w-lg grid-cols-3 gap-1 rounded-2xl border border-rose-100 bg-white/80 p-1 shadow-[0_10px_30px_-20px_rgba(200,16,46,0.35)] backdrop-blur"
      >
        {TABS.map((item) => {
          const active = item.id === tab;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={`/admin/media?tab=${item.id}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition-all",
                active
                  ? "bg-linear-to-br from-[#e0233f] to-[#9e1b28] text-white shadow-[0_8px_20px_-10px_rgba(200,16,46,0.8)]"
                  : "text-zinc-600 hover:bg-rose-50 hover:text-[#9e1b28]",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px] tabular-nums",
                  active ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500",
                )}
              >
                {counts[item.id]}
              </span>
            </Link>
          );
        })}
      </nav>
      {board}
    </div>
  );
}
