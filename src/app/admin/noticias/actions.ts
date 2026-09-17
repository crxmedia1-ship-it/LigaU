"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/session";
import { slugify } from "@/lib/admin/sport";
import { createClient } from "@/lib/supabase/server";

export async function upsertNews(input: {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  sportId: string | null;
  universityId: string | null;
  isFeatured: boolean;
  publishedAt: string | null;
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!input.title.trim()) {
    return { ok: false as const, error: "El título es obligatorio." };
  }
  const supabase = await createClient();
  const payload = {
    title: input.title.trim(),
    slug: slugify(input.slug || input.title) || `cronica-${Date.now()}`,
    excerpt: input.excerpt || null,
    content: input.content || null,
    cover_image_url: input.coverImageUrl,
    sport_id: input.sportId,
    university_id: input.universityId,
    is_featured: input.isFeatured,
    published_at: input.publishedAt ? new Date(input.publishedAt).toISOString() : null,
  };
  const query = input.id
    ? supabase.from("news").update(payload).eq("id", input.id)
    : supabase.from("news").insert(payload);
  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/noticias");
  return { ok: true as const };
}

export async function deleteNews(id: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/noticias");
  return { ok: true as const };
}
