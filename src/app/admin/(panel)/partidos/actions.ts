"use server";

import type { Json } from "@/types/database.types";
import { requireStaff } from "@/lib/admin/session";
import { refreshPublicSite } from "@/lib/public/revalidate";
import { createClient } from "@/lib/supabase/server";
import type { MatchEventDraft, MatchDetailsPayload } from "@/lib/admin/sport";

export type UpsertMatchInput = {
  id?: string;
  sportId: string;
  gender: "male" | "female" | "mixed";
  homeUniversityId: string;
  awayUniversityId: string;
  matchDate: string;
  location: string;
  roundName: string;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
};

export type BulkMatchInput = Omit<UpsertMatchInput, "id" | "status">;

type TeamKey = { universityId: string; sportId: string; gender: UpsertMatchInput["gender"] };

const teamKey = (universityId: string, sportId: string, gender: string) => `${universityId}|${sportId}|${gender}`;

function cleanLocation(value: string) {
  return value.trim().replace(/\s+/g, " ") || null;
}

async function ensureTeams(supabase: Awaited<ReturnType<typeof createClient>>, keys: TeamKey[]) {
  const unique = new Map(keys.map((key) => [teamKey(key.universityId, key.sportId, key.gender), key]));
  const { data, error } = await supabase
    .from("teams")
    .upsert(
      [...unique.values()].map((key) => ({
        university_id: key.universityId,
        sport_id: key.sportId,
        gender: key.gender,
      })),
      { onConflict: "university_id,sport_id,gender" },
    )
    .select("id, university_id, sport_id, gender");
  if (error) return { ok: false as const, error: error.message };
  const ids = new Map((data ?? []).map((team) => [teamKey(team.university_id, team.sport_id, team.gender), team.id]));
  return {
    ok: true as const,
    idFor: (universityId: string, sportId: string, gender: string) => ids.get(teamKey(universityId, sportId, gender)),
  };
}

export async function createMatchesBulk(rows: BulkMatchInput[]) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (rows.length === 0) return { ok: false as const, error: "No hay partidos para cargar." };
  if (rows.length > 300) return { ok: false as const, error: "Máximo 300 partidos por carga." };

  for (const [index, row] of rows.entries()) {
    if (!row.sportId || !row.homeUniversityId || !row.awayUniversityId || Number.isNaN(Date.parse(row.matchDate))) {
      return { ok: false as const, error: `Fila ${index + 1}: faltan datos.` };
    }
    if (row.homeUniversityId === row.awayUniversityId) {
      return { ok: false as const, error: `Fila ${index + 1}: local y visitante son el mismo equipo.` };
    }
  }

  const supabase = await createClient();
  const teams = await ensureTeams(
    supabase,
    rows.flatMap((row) => [
      { universityId: row.homeUniversityId, sportId: row.sportId, gender: row.gender },
      { universityId: row.awayUniversityId, sportId: row.sportId, gender: row.gender },
    ]),
  );
  if (!teams.ok) return teams;

  const payload = [];
  for (const row of rows) {
    const homeTeamId = teams.idFor(row.homeUniversityId, row.sportId, row.gender);
    const awayTeamId = teams.idFor(row.awayUniversityId, row.sportId, row.gender);
    if (!homeTeamId || !awayTeamId) return { ok: false as const, error: "No se pudieron preparar los equipos." };
    payload.push({
      sport_id: row.sportId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      match_date: new Date(row.matchDate).toISOString(),
      location: cleanLocation(row.location),
      round_name: row.roundName.trim() || null,
      status: "scheduled" as const,
    });
  }

  const { error } = await supabase.from("matches").insert(payload);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const, count: payload.length };
}

type FinishMatchInput = {
  matchId: string;
  homeScore: number;
  awayScore: number;
  mvpAthleteId: string | null;
  matchDetails: MatchDetailsPayload;
  events: MatchEventDraft[];
};

export async function upsertMatch(input: UpsertMatchInput) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  if (!input.homeUniversityId || !input.awayUniversityId) {
    return { ok: false as const, error: "Elige local y visitante." };
  }
  if (input.homeUniversityId === input.awayUniversityId) {
    return { ok: false as const, error: "Local y visitante deben ser distintos." };
  }

  const supabase = await createClient();
  const teams = await ensureTeams(supabase, [
    { universityId: input.homeUniversityId, sportId: input.sportId, gender: input.gender },
    { universityId: input.awayUniversityId, sportId: input.sportId, gender: input.gender },
  ]);
  if (!teams.ok) return teams;

  const homeTeamId = teams.idFor(input.homeUniversityId, input.sportId, input.gender);
  const awayTeamId = teams.idFor(input.awayUniversityId, input.sportId, input.gender);
  if (!homeTeamId || !awayTeamId) {
    return { ok: false as const, error: "No se pudieron preparar los equipos." };
  }

  const payload = {
    sport_id: input.sportId,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    match_date: new Date(input.matchDate).toISOString(),
    location: cleanLocation(input.location),
    round_name: input.roundName || null,
    status: input.status,
  };

  const query = input.id
    ? supabase.from("matches").update(payload).eq("id", input.id)
    : supabase.from("matches").insert(payload);

  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function deleteMatch(matchId: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function setAthletePhoto(athleteId: string, photoUrl: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase
    .from("athletes")
    .update({ photo_url: photoUrl })
    .eq("id", athleteId);
  if (error) return { ok: false as const, error: error.message };
  refreshPublicSite();
  return { ok: true as const };
}

export async function finishMatch(input: FinishMatchInput) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;

  const supabase = await createClient();
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, home_team_id, away_team_id")
    .eq("id", input.matchId)
    .single();

  if (matchError || !match) {
    return { ok: false as const, error: "No se encontró el partido." };
  }

  const allowedTeamIds = new Set([match.home_team_id, match.away_team_id]);
  const { data: roster, error: rosterError } = await supabase
    .from("athletes")
    .select("id, team_id, is_active")
    .in("team_id", [match.home_team_id, match.away_team_id]);

  if (rosterError) return { ok: false as const, error: rosterError.message };

  const allowedAthletes = new Map(
    (roster ?? [])
      .filter((athlete) => athlete.is_active)
      .map((athlete) => [athlete.id, athlete.team_id]),
  );

  const events = input.events.filter((event) => event.athleteId && event.teamId);

  if (input.mvpAthleteId && !allowedAthletes.has(input.mvpAthleteId)) {
    return {
      ok: false as const,
      error: "El MVP debe pertenecer a uno de los dos equipos.",
    };
  }

  for (const event of events) {
    if (!allowedTeamIds.has(event.teamId)) {
      return { ok: false as const, error: "Hay un evento de un equipo ajeno al partido." };
    }
    const athleteTeam = allowedAthletes.get(event.athleteId);
    if (!athleteTeam || athleteTeam !== event.teamId) {
      return {
        ok: false as const,
        error: "Los goleadores/anotadores deben ser atletas activos del partido.",
      };
    }
    if (event.assistAthleteId) {
      const assistTeam = allowedAthletes.get(event.assistAthleteId);
      if (!assistTeam || assistTeam !== event.teamId) {
        return {
          ok: false as const,
          error: "La asistencia debe ser de un compañero del mismo equipo.",
        };
      }
    }
  }

  const { error: deleteError } = await supabase
    .from("match_events")
    .delete()
    .eq("match_id", input.matchId);
  if (deleteError) return { ok: false as const, error: deleteError.message };

  if (events.length > 0) {
    const { error: insertError } = await supabase.from("match_events").insert(
      events.map((event) => ({
        match_id: input.matchId,
        team_id: event.teamId,
        athlete_id: event.athleteId,
        assist_athlete_id: event.assistAthleteId,
        event_type: event.eventType,
        value: event.value,
        detail: event.detail,
      })),
    );
    if (insertError) return { ok: false as const, error: insertError.message };
  }

  const { error: updateError } = await supabase
    .from("matches")
    .update({
      home_score: input.homeScore,
      away_score: input.awayScore,
      mvp_athlete_id: input.mvpAthleteId,
      match_details: input.matchDetails as Json,
      status: "finished",
    })
    .eq("id", input.matchId);

  if (updateError) return { ok: false as const, error: updateError.message };
  refreshPublicSite();
  return { ok: true as const };
}
