"use server";

import { getStaffSession } from "@/lib/admin/session";
import { GENDER_LABELS } from "@/lib/admin/labels";
import { one } from "@/lib/public/types";
import { createClient } from "@/lib/supabase/server";

export type SearchItem = {
  id: string;
  kind: "match" | "athlete" | "team" | "news";
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
};

export async function getAdminSearchIndex(): Promise<SearchItem[]> {
  if (!(await getStaffSession())) return [];
  const supabase = await createClient();
  const [{ data: teams }, { data: athletes }, { data: matches }, { data: news }] = await Promise.all([
    supabase.from("teams").select("id, gender, universities(short_name, name), sports(name)"),
    supabase.from("athletes").select("id, full_name, jersey_number, team_id"),
    supabase
      .from("matches")
      .select("id, match_date, status, home_team_id, away_team_id, sports(name)")
      .order("match_date", { ascending: false }),
    supabase.from("news").select("id, title, published_at").order("created_at", { ascending: false }),
  ]);

  const teamInfo = new Map(
    (teams ?? []).map((team) => {
      const university = one(team.universities);
      const sport = one(team.sports);
      return [
        team.id,
        {
          short: university?.short_name ?? "Equipo",
          name: university?.name ?? "",
          sport: sport?.name ?? "",
          gender: GENDER_LABELS[team.gender],
        },
      ];
    }),
  );

  const items: SearchItem[] = [];

  for (const match of matches ?? []) {
    const home = teamInfo.get(match.home_team_id);
    const away = teamInfo.get(match.away_team_id);
    const sport = one(match.sports)?.name ?? "";
    const date = new Date(match.match_date).toLocaleDateString("es-VE", {
      day: "numeric",
      month: "short",
      timeZone: "America/Caracas",
    });
    items.push({
      id: match.id,
      kind: "match",
      title: `${home?.short ?? "Local"} vs ${away?.short ?? "Visitante"}`,
      subtitle: `${sport} · ${date}`,
      href: `/admin/partidos?resultado=${match.id}`,
      keywords: `${home?.name} ${away?.name} ${sport} partido`,
    });
  }

  for (const athlete of athletes ?? []) {
    const team = teamInfo.get(athlete.team_id);
    items.push({
      id: athlete.id,
      kind: "athlete",
      title: athlete.full_name,
      subtitle: `${team?.short ?? ""} · ${team?.sport ?? ""}${athlete.jersey_number ? ` · #${athlete.jersey_number}` : ""}`,
      href: `/admin/equipos?equipo=${athlete.team_id}`,
      keywords: `${team?.name} atleta jugador`,
    });
  }

  for (const [id, team] of teamInfo) {
    items.push({
      id,
      kind: "team",
      title: `${team.short} · ${team.sport}`,
      subtitle: `${team.gender} · ${team.name}`,
      href: `/admin/equipos?equipo=${id}`,
      keywords: "equipo plantilla",
    });
  }

  for (const item of news ?? []) {
    items.push({
      id: item.id,
      kind: "news",
      title: item.title,
      subtitle: item.published_at ? "Noticia publicada" : "Borrador",
      href: `/admin/media?tab=noticias&editar=${item.id}`,
      keywords: "noticia crónica",
    });
  }

  return items;
}
