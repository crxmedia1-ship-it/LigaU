import { createClient } from "@/lib/supabase/server";
import { PopupBoard } from "@/app/admin/(panel)/popup/popup-board";

export default async function AdminPopupPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_popup")
    .select("id, image_url, title, link_url, is_active, starts_on, ends_on")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <PopupBoard
      popup={
        data
          ? {
              id: data.id,
              imageUrl: data.image_url,
              title: data.title ?? "",
              linkUrl: data.link_url ?? "",
              isActive: data.is_active,
              startsOn: data.starts_on ?? "",
              endsOn: data.ends_on ?? "",
            }
          : null
      }
    />
  );
}
