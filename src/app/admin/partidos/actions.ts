"use server";

import { revalidatePath } from "next/cache";
import type { Json } from "@/types/database.types";
import { requireStaff } from "@/lib/admin/session";
import { createClient } from "@/lib/supabase/server";
import type { MatchEventDraft, MatchDetailsPayload } from "@/lib/admin/sport";

export type UpsertMatchInput = {
  id?: string;
  sportId: string;
  homeTeamId: string;
  awayTeamId: string;
  matchDate: string;
  location: string;
  roundName: string;
  status: "scheduled" | "live" | "finished" | "postponed" | "cancelled";
};

export type FinishMatchInput = {
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
  if (input.homeTeamId === input.awayTeamId) {
    return { ok: false as const, error: "Local y visitante deben ser distintos." };
  }

  const supabase = await createClient();
  const payload = {
    sport_id: input.sportId,
    home_team_id: input.homeTeamId,
    away_team_id: input.awayTeamId,
    match_date: new Date(input.matchDate).toISOString(),
    location: input.location || null,
    round_name: input.roundName || null,
    status: input.status,
  };

  const query = input.id
    ? supabase.from("matches").update(payload).eq("id", input.id)
    : supabase.from("matches").insert(payload);

  const { error } = await query;
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/partidos");
  return { ok: true as const };
}

export async function deleteMatch(matchId: string) {
  const staff = await requireStaff();
  if (!staff.ok) return staff;
  const supabase = await createClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/partidos");
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
  revalidatePath("/admin/partidos");
  return { ok: true as const };
}
