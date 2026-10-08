"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireSuperadmin } from "@/lib/admin/session";
import { parseProposalAmount } from "@/lib/proposals/format";
import { isProposalPackageId, isProposalStatus } from "@/lib/proposals/master";
import { createClient } from "@/lib/supabase/server";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type ProposalDraft = {
  companyName: string;
  logoUrl: string;
  contactName: string;
  note: string;
  packageId: string;
  priceAmount: string;
  priceCaption: string;
  includeUpass: boolean;
  upassPriceAmount: string;
  validUntil: string;
  status: string;
};

function cleanText(value: string, max: number) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > max) return undefined;
  return trimmed;
}

export async function saveProposal(input: ProposalDraft & { id?: string }) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;

  const companyName = input.companyName.trim();
  if (companyName.length < 1 || companyName.length > 80) {
    return { ok: false as const, error: "El nombre de la empresa tiene que tener entre 1 y 80 caracteres." };
  }
  if (!isProposalPackageId(input.packageId)) {
    return { ok: false as const, error: "Elige un paquete." };
  }
  const priceAmount = parseProposalAmount(input.priceAmount);
  if (priceAmount === null) {
    return { ok: false as const, error: "Escribe el precio en dólares enteros, sin puntos ni comas." };
  }
  const priceCaption = input.priceCaption.trim() || "Temporada 2026";
  if (priceCaption.length > 60) {
    return { ok: false as const, error: "La leyenda del precio no puede pasar de 60 caracteres." };
  }
  const contactName = cleanText(input.contactName, 80);
  if (contactName === undefined) {
    return { ok: false as const, error: "El contacto no puede pasar de 80 caracteres." };
  }
  const note = cleanText(input.note, 400);
  if (note === undefined) return { ok: false as const, error: "La nota no puede pasar de 400 caracteres." };
  const logoUrl = input.logoUrl.trim();
  if (logoUrl && !/^https:\/\//i.test(logoUrl)) {
    return { ok: false as const, error: "El logo tiene que venir de una URL segura." };
  }
  const validUntil = input.validUntil.trim();
  if (validUntil && !DATE.test(validUntil)) {
    return { ok: false as const, error: "Revisa la fecha de vigencia." };
  }
  if (!isProposalStatus(input.status)) {
    return { ok: false as const, error: "El estado no es válido." };
  }

  let upassPrice: number | null = null;
  if (input.includeUpass && input.upassPriceAmount.trim()) {
    upassPrice = parseProposalAmount(input.upassPriceAmount);
    if (upassPrice === null) {
      return { ok: false as const, error: "El precio de U Pass tiene que ser un número entero en dólares." };
    }
  }

  const supabase = await createClient();
  const payload = {
    company_name: companyName,
    logo_url: logoUrl || null,
    contact_name: contactName,
    note,
    package_id: input.packageId,
    price_amount: priceAmount,
    price_caption: priceCaption,
    include_upass: input.includeUpass,
    upass_price_amount: input.includeUpass ? upassPrice : null,
    valid_until: validUntil || null,
    status: input.status,
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("sponsor_proposals")
      .update(payload)
      .eq("id", input.id)
      .select("id, token")
      .single();
    if (error || !data) return { ok: false as const, error: error?.message ?? "No se pudo guardar." };
    revalidatePath("/admin/propuestas");
    revalidatePath(`/propuesta/${data.token}`);
    return { ok: true as const, id: data.id, token: data.token };
  }

  const token = randomBytes(18).toString("base64url");
  const { data, error } = await supabase
    .from("sponsor_proposals")
    .insert({ ...payload, token, created_by: staff.userId })
    .select("id, token")
    .single();
  if (error || !data) return { ok: false as const, error: error?.message ?? "No se pudo crear la propuesta." };
  revalidatePath("/admin/propuestas");
  return { ok: true as const, id: data.id, token: data.token };
}

export async function deleteProposal(id: string) {
  const staff = await requireSuperadmin();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { data, error } = await supabase.from("sponsor_proposals").delete().eq("id", id).select("token").maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/propuestas");
  if (data?.token) revalidatePath(`/propuesta/${data.token}`);
  return { ok: true as const };
}
