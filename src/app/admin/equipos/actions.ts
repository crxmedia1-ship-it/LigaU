"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

type TeamGender = Database["public"]["Enums"]["team_gender"];

export async function upsertTeam(input: {
  id?: string;
  universityId: string;
  sportId: string;
  gender: TeamGender;
  coachName: string;
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const payload = {
    university_id: input.universityId,
    sport_id: input.sportId,
    gender: input.gender,
    coach_name: input.coachName || null,
  };
  const query = input.id
    ? supabase.from("teams").update(payload).eq("id", input.id)
    : supabase.from("teams").insert(payload);
  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/equipos");
  revalidatePath("/admin/partidos");
  return { ok: true as const };
}

export async function deleteTeam(teamId: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/equipos");
  revalidatePath("/admin/partidos");
  return { ok: true as const };
}

export async function upsertAthlete(input: {
  id?: string;
  teamId: string;
  fullName: string;
  jerseyNumber: number | null;
  position: string;
  photoUrl: string | null;
  birthDate: string | null;
  heightCm: number | null;
  isActive: boolean;
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!input.fullName.trim()) {
    return { ok: false as const, error: "El nombre del atleta es obligatorio." };
  }
  if (input.heightCm != null && (input.heightCm < 140 || input.heightCm > 230)) {
    return { ok: false as const, error: "La altura debe estar entre 140 y 230 cm." };
  }
  if (input.birthDate && input.birthDate > new Date().toISOString().slice(0, 10)) {
    return { ok: false as const, error: "La fecha de nacimiento no puede ser futura." };
  }
  const supabase = await createClient();
  const payload = {
    team_id: input.teamId,
    full_name: input.fullName.trim(),
    jersey_number: input.jerseyNumber,
    position: input.position || null,
    photo_url: input.photoUrl,
    birth_date: input.birthDate || null,
    height_cm: input.heightCm,
    is_active: input.isActive,
  };
  const query = input.id
    ? supabase.from("athletes").update(payload).eq("id", input.id)
    : supabase.from("athletes").insert(payload);
  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/equipos");
  revalidatePath("/admin/partidos");
  revalidatePath("/universidades", "layout");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteAthlete(athleteId: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("athletes").delete().eq("id", athleteId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/equipos");
  revalidatePath("/admin/partidos");
  return { ok: true as const };
}
