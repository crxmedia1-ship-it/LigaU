"use server";

import { requireStaff } from "@/lib/admin/session";
import { refreshPublicSite } from "@/lib/public/revalidate";
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
  refreshPublicSite();
  return { ok: true as const };
}

export async function deleteTeam(teamId: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

async function athletesWithHistory(
  supabase: Awaited<ReturnType<typeof createClient>>,
  athleteIds: string[],
) {
  if (!athleteIds.length) return new Set<string>();
  const list = athleteIds.join(",");
  const [{ data: events }, { data: mvps }] = await Promise.all([
    supabase
      .from("match_events")
      .select("athlete_id, assist_athlete_id")
      .or(`athlete_id.in.(${list}),assist_athlete_id.in.(${list})`),
    supabase.from("matches").select("mvp_athlete_id").in("mvp_athlete_id", athleteIds),
  ]);
  const ids = new Set(athleteIds);
  const used = new Set<string>();
  for (const event of events ?? []) {
    if (ids.has(event.athlete_id)) used.add(event.athlete_id);
    if (event.assist_athlete_id && ids.has(event.assist_athlete_id)) used.add(event.assist_athlete_id);
  }
  for (const match of mvps ?? []) if (match.mvp_athlete_id) used.add(match.mvp_athlete_id);
  return used;
}

export async function deleteAthlete(athleteId: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const used = await athletesWithHistory(supabase, [athleteId]);
  if (used.size) {
    return {
      ok: false as const,
      hasHistory: true as const,
      error: "Tiene goles, tarjetas o MVP registrados. Márcalo como inactivo para conservar su historial.",
    };
  }
  const { error } = await supabase.from("athletes").delete().eq("id", athleteId);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function setAthleteActive(athleteId: string, isActive: boolean) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("athletes").update({ is_active: isActive }).eq("id", athleteId);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export type DominantSide = "right" | "left" | "both";

export async function saveAthleteProfile(input: {
  personId?: string;
  universityId: string;
  gender: "male" | "female";
  fullName: string;
  photoUrl: string | null;
  birthDate: string | null;
  heightCm: number | null;
  isActive: boolean;
  entries: { sportId: string; jerseyNumber: number | null; position: string; dominantSide: DominantSide | null }[];
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!input.fullName.trim()) {
    return { ok: false as const, error: "El nombre del atleta es obligatorio." };
  }
  if (!input.entries.length) {
    return { ok: false as const, error: "Elige al menos un deporte." };
  }
  if (input.heightCm != null && (input.heightCm < 140 || input.heightCm > 230)) {
    return { ok: false as const, error: "La altura debe estar entre 140 y 230 cm." };
  }
  if (input.birthDate && input.birthDate > new Date().toISOString().slice(0, 10)) {
    return { ok: false as const, error: "La fecha de nacimiento no puede ser futura." };
  }
  const supabase = await createClient();

  const sportIds = input.entries.map((entry) => entry.sportId);
  const { data: uniTeams, error: teamsError } = await supabase
    .from("teams")
    .select("id, sport_id, gender")
    .eq("university_id", input.universityId)
    .in("sport_id", sportIds);
  if (teamsError) return { ok: false as const, error: teamsError.message };

  const teamBySport = new Map<string, string>();
  for (const sportId of sportIds) {
    const team =
      uniTeams?.find((item) => item.sport_id === sportId && item.gender === input.gender) ??
      uniTeams?.find((item) => item.sport_id === sportId && item.gender === "mixed");
    if (team) {
      teamBySport.set(sportId, team.id);
      continue;
    }
    const { data: created, error } = await supabase
      .from("teams")
      .insert({ university_id: input.universityId, sport_id: sportId, gender: input.gender })
      .select("id")
      .single();
    if (error || !created) return { ok: false as const, error: error?.message ?? "No se pudo crear el equipo." };
    teamBySport.set(sportId, created.id);
  }

  const personId = input.personId ?? crypto.randomUUID();
  const shared = {
    person_id: personId,
    full_name: input.fullName.trim(),
    photo_url: input.photoUrl,
    birth_date: input.birthDate || null,
    height_cm: input.heightCm,
    is_active: input.isActive,
  };

  const { data: existing, error: readError } = input.personId
    ? await supabase.from("athletes").select("id, team_id").eq("person_id", personId)
    : { data: [], error: null };
  if (readError) return { ok: false as const, error: readError.message };

  const keepTeams = new Set(teamBySport.values());
  const removed = (existing ?? []).filter((row) => !keepTeams.has(row.team_id)).map((row) => row.id);
  if (removed.length) {
    const used = await athletesWithHistory(supabase, removed);
    const toDelete = removed.filter((id) => !used.has(id));
    const toRetire = removed.filter((id) => used.has(id));
    if (toDelete.length) {
      const { error } = await supabase.from("athletes").delete().in("id", toDelete);
      if (error) return { ok: false as const, error: error.message };
    }
    if (toRetire.length) {
      const { error } = await supabase.from("athletes").update({ is_active: false }).in("id", toRetire);
      if (error) return { ok: false as const, error: error.message };
    }
  }

  for (const entry of input.entries) {
    const teamId = teamBySport.get(entry.sportId)!;
    const payload = {
      ...shared,
      team_id: teamId,
      jersey_number: entry.jerseyNumber,
      position: entry.position || null,
      dominant_side: entry.dominantSide,
    };
    const current = (existing ?? []).find((row) => row.team_id === teamId);
    const { error } = current
      ? await supabase.from("athletes").update(payload).eq("id", current.id)
      : await supabase.from("athletes").insert(payload);
    if (error) return { ok: false as const, error: error.message };
  }

  refreshPublicSite();
  return { ok: true as const, personId };
}

export type BulkAthleteInput = {
  fullName: string;
  jerseyNumber: number | null;
  position: string;
  dominantSide: DominantSide | null;
  birthDate: string | null;
  heightCm: number | null;
};

export async function createAthletesBulk(input: {
  universityId: string;
  sportId: string;
  gender: "male" | "female";
  rows: BulkAthleteInput[];
}) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!input.rows.length) return { ok: false as const, error: "No hay atletas para agregar." };
  if (input.rows.length > 200) return { ok: false as const, error: "Máximo 200 atletas por carga." };
  const today = new Date().toISOString().slice(0, 10);
  for (const row of input.rows) {
    if (!row.fullName.trim()) return { ok: false as const, error: "Hay una fila sin nombre." };
    if (row.heightCm != null && (row.heightCm < 140 || row.heightCm > 230)) {
      return { ok: false as const, error: `${row.fullName}: la altura debe estar entre 140 y 230 cm.` };
    }
    if (row.birthDate && row.birthDate > today) {
      return { ok: false as const, error: `${row.fullName}: la fecha de nacimiento no puede ser futura.` };
    }
  }
  const supabase = await createClient();

  const { data: sportTeams, error: teamsError } = await supabase
    .from("teams")
    .select("id, gender")
    .eq("university_id", input.universityId)
    .eq("sport_id", input.sportId);
  if (teamsError) return { ok: false as const, error: teamsError.message };
  let teamId =
    sportTeams?.find((team) => team.gender === input.gender)?.id ??
    sportTeams?.find((team) => team.gender === "mixed")?.id;
  if (!teamId) {
    const { data: created, error } = await supabase
      .from("teams")
      .insert({ university_id: input.universityId, sport_id: input.sportId, gender: input.gender })
      .select("id")
      .single();
    if (error || !created) return { ok: false as const, error: error?.message ?? "No se pudo crear el equipo." };
    teamId = created.id;
  }

  const { error } = await supabase.from("athletes").insert(
    input.rows.map((row) => ({
      team_id: teamId,
      full_name: row.fullName.trim(),
      jersey_number: row.jerseyNumber,
      position: row.position.trim() || null,
      dominant_side: row.dominantSide,
      birth_date: row.birthDate,
      height_cm: row.heightCm,
      is_active: true,
    })),
  );
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const, count: input.rows.length };
}
