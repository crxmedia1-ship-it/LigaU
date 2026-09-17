import { createClient } from "@/lib/supabase/server";
import { MultimediaBoard, type PodcastRow } from "@/app/admin/multimedia/multimedia-board";

export default async function AdminMultimediaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("podcast_episodes")
    .select(
      "id, title, description, episode_number, cover_url, spotify_url, youtube_url, published_at",
    )
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
