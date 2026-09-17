"use server";

import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type PassStatus = Database["public"]["Enums"]["pass_status"];
type RedemptionType = Database["public"]["Enums"]["redemption_type"];

export async function upsertSponsor(input: {
  id?: string;
  name: string;
  category: string;
  locationTag: string;
  logoUrl: string | null;
  isActive: boolean;
}) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  if (!input.name.trim()) {
    return { ok: false as const, error: "El nombre del patrocinador es obligatorio." };
  }
  const supabase = await createClient();
  const payload = {
    name: input.name.trim(),
    category: input.category.trim() || "General",
    location_tag: input.locationTag || null,
    logo_url: input.logoUrl,
    is_active: input.isActive,
  };
  const query = input.id
    ? supabase.from("pass_sponsors").update(payload).eq("id", input.id)
    : supabase.from("pass_sponsors").insert(payload);
  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/comercial");
  return { ok: true as const };
}

export async function deleteSponsor(id: string) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("pass_sponsors").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/comercial");
  return { ok: true as const };
}

export async function upsertBenefit(input: {
  id?: string;
  sponsorId: string;
  discountTitle: string;
  status: PassStatus;
  redemptionType: RedemptionType;
  promoCode: string;
  instructions: string;
  externalUrl: string;
}) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  if (!input.discountTitle.trim()) {
    return { ok: false as const, error: "El título del descuento es obligatorio." };
  }
  const supabase = await createClient();
  const payload = {
    sponsor_id: input.sponsorId,
    discount_title: input.discountTitle.trim(),
    status: input.status,
    redemption_type: input.redemptionType,
    promo_code: input.promoCode || null,
    instructions: input.instructions || null,
    external_url: input.externalUrl || null,
  };
  const query = input.id
    ? supabase.from("pass_benefits").update(payload).eq("id", input.id)
    : supabase.from("pass_benefits").insert(payload);
  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/comercial");
  return { ok: true as const };
}

export async function deleteBenefit(id: string) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("pass_benefits").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/comercial");
  return { ok: true as const };
}
