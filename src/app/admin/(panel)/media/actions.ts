"use server";

import { requireStaff } from "@/lib/admin/session";
import { refreshPublicSite } from "@/lib/public/revalidate";
import { createClient } from "@/lib/supabase/server";

export type VideoKind = "highlight" | "resumen" | "entrevista" | "video";

export async function upsertVideo(input: {
  id?: string;
  title: string;
  kind: VideoKind;
  videoUrl: string;
  thumbnailUrl: string | null;
  sportId: string | null;
  description: string;
  publishedAt: string;
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!input.title.trim()) return { ok: false as const, error: "El título es obligatorio." };
  if (!/^https?:\/\//i.test(input.videoUrl.trim())) {
    return { ok: false as const, error: "Pega el enlace completo del video (https://…)." };
  }

  const supabase = await createClient();
  const payload = {
    title: input.title.trim(),
    kind: input.kind,
    video_url: input.videoUrl.trim(),
    thumbnail_url: input.thumbnailUrl,
    sport_id: input.sportId || null,
    description: input.description.trim() || null,
    published_at: input.publishedAt ? new Date(input.publishedAt).toISOString() : new Date().toISOString(),
  };
  const { error } = input.id
    ? await supabase.from("media_videos").update(payload).eq("id", input.id)
    : await supabase.from("media_videos").insert(payload);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function fetchVideoTitle(url: string) {
  const staff = await requireStaff();
  if (!staff.ok) return null;
  if (!/^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(url.trim())) return null;
  try {
    const response = await fetch(
      `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url.trim())}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { title?: string };
    return data.title?.trim() || null;
  } catch {
    return null;
  }
}

export async function deleteVideo(id: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("media_videos").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}
