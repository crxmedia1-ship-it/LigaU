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
  isActive: boolean;
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!input.fullName.trim()) {
    return { ok: false as const, error: "El nombre del atleta es obligatorio." };
  }
  const supabase = await createClient();
  const payload = {
    team_id: input.teamId,
    full_name: input.fullName.trim(),
    jersey_number: input.jerseyNumber,
    position: input.position || null,
    photo_url: input.photoUrl,
    is_active: input.isActive,
  };
  const query = input.id
    ? supabase.from("athletes").update(payload).eq("id", input.id)
    : supabase.from("athletes").insert(payload);
  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/equipos");
  revalidatePath("/admin/partidos");
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
