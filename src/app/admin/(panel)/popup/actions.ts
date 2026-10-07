"use server";

import { requireStaff } from "@/lib/admin/session";
import { refreshPublicSite } from "@/lib/public/revalidate";
import { createClient } from "@/lib/supabase/server";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function cleanUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/")) return trimmed;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return undefined;
  }
}

export async function savePopup(input: {
  id?: string;
  imageUrl: string;
  title: string;
  linkUrl: string;
  isActive: boolean;
  startsOn: string;
  endsOn: string;
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!input.imageUrl) return { ok: false as const, error: "Sube la imagen del pop-up." };
  if (input.title.trim().length > 80) return { ok: false as const, error: "El título no puede pasar de 80 caracteres." };
  const linkUrl = cleanUrl(input.linkUrl);
  if (linkUrl === undefined) return { ok: false as const, error: "El link no es válido." };
  const startsOn = input.startsOn || null;
  const endsOn = input.endsOn || null;
  if ((startsOn && !DATE.test(startsOn)) || (endsOn && !DATE.test(endsOn))) {
    return { ok: false as const, error: "Revisa las fechas." };
  }
  if (startsOn && endsOn && endsOn < startsOn) {
    return { ok: false as const, error: "La fecha de fin es anterior a la de inicio." };
  }

  const supabase = await createClient();
  const payload = {
    image_url: input.imageUrl,
    title: input.title.trim() || null,
    link_url: linkUrl,
    is_active: input.isActive,
    starts_on: startsOn,
    ends_on: endsOn,
  };
  const { error } = input.id
    ? await supabase.from("site_popup").update(payload).eq("id", input.id)
    : await supabase.from("site_popup").insert(payload);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function deletePopup(id: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("site_popup").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}
