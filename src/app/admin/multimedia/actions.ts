"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";

export async function upsertPodcast(input: {
  id?: string;
  title: string;
  description: string;
  episodeNumber: number;
  coverUrl: string | null;
  spotifyUrl: string;
  youtubeUrl: string;
  publishedAt: string | null;
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!input.title.trim()) {
    return { ok: false as const, error: "El título del episodio es obligatorio." };
  }
  if (!Number.isFinite(input.episodeNumber) || input.episodeNumber < 1) {
    return { ok: false as const, error: "El número de episodio debe ser mayor a 0." };
  }
  const supabase = await createClient();
  const payload = {
    title: input.title.trim(),
    description: input.description || null,
    episode_number: input.episodeNumber,
    cover_url: input.coverUrl,
    spotify_url: input.spotifyUrl || null,
    youtube_url: input.youtubeUrl || null,
    published_at: input.publishedAt ? new Date(input.publishedAt).toISOString() : null,
  };
  const query = input.id
    ? supabase.from("podcast_episodes").update(payload).eq("id", input.id)
    : supabase.from("podcast_episodes").insert(payload);
  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/multimedia");
  return { ok: true as const };
}

export async function deletePodcast(id: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_episodes").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/multimedia");
  return { ok: true as const };
}
