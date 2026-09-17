import { createClient } from "@/lib/supabase/server";
import { NoticiasBoard, type NewsRow } from "@/app/admin/noticias/noticias-board";

export default async function AdminNoticiasPage() {
  const supabase = await createClient();
  const [{ data: sports }, { data: universities }, { data: news }] = await Promise.all([
    supabase.from("sports").select("id, name").order("name"),
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
    const university = Array.isArray(item.universities)
      ? item.universities[0]
      : item.universities;
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
    />
  );
}
