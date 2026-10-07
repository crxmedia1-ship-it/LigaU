import type { AthleteCard, MatchCard, MatchEventCard, TeamCard, TeamGender } from "@/lib/public/types";

export type PlayerStatKey = "goals" | "assists" | "points" | "mvps" | "yellow" | "red";

export type PlayerStat = {
  athlete: AthleteCard;
  team: TeamCard;
  games: number;
} & Record<PlayerStatKey, number>;

export const PLAYER_STAT_CATEGORIES: Array<{ key: PlayerStatKey; label: string; leader: string; unit: [string, string] }> = [
  { key: "goals", label: "Goles", leader: "Goleador", unit: ["gol", "goles"] },
  { key: "points", label: "Puntos", leader: "Máximo anotador", unit: ["punto", "puntos"] },
  { key: "assists", label: "Asistencias", leader: "Asistidor", unit: ["asistencia", "asistencias"] },
  { key: "mvps", label: "MVP", leader: "Más veces MVP", unit: ["MVP", "MVP"] },
  { key: "yellow", label: "Amarillas", leader: "Más amonestado", unit: ["amarilla", "amarillas"] },
  { key: "red", label: "Rojas", leader: "Más expulsado", unit: ["roja", "rojas"] },
];

/** Per-athlete totals from the finished matches of one sport and branch. */
export function computePlayerStats(
  matches: MatchCard[],
  events: Array<MatchEventCard & { matchId: string }>,
  athletes: AthleteCard[],
  teams: TeamCard[],
  sportId: string,
  gender: TeamGender,
): PlayerStat[] {
  const finished = new Set(
    matches.filter((match) => match.sportId === sportId && match.gender === gender && match.status === "finished").map((match) => match.id),
  );
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const athleteById = new Map(athletes.map((athlete) => [athlete.id, athlete]));
  const rows = new Map<string, PlayerStat>();
  const appearances = new Map<string, Set<string>>();

  const row = (athleteId: string, matchId: string) => {
    const athlete = athleteById.get(athleteId);
    const team = athlete ? teamById.get(athlete.teamId) : undefined;
    if (!athlete || !team) return null;
    const seen = appearances.get(athleteId) ?? new Set<string>();
    seen.add(matchId);
    appearances.set(athleteId, seen);
    const existing = rows.get(athleteId);
    if (existing) return existing;
    const created: PlayerStat = { athlete, team, games: 0, goals: 0, assists: 0, points: 0, mvps: 0, yellow: 0, red: 0 };
    rows.set(athleteId, created);
    return created;
  };

  for (const match of matches) {
    if (!finished.has(match.id) || !match.mvpAthleteId) continue;
    const mvp = row(match.mvpAthleteId, match.id);
    if (mvp) mvp.mvps += 1;
  }

  for (const event of events) {
    if (!finished.has(event.matchId)) continue;
    const stat = row(event.athleteId, event.matchId);
    if (stat) {
      if (event.eventType === "goal") stat.goals += event.value || 1;
      if (event.eventType === "points") stat.points += event.value;
      if (event.eventType === "yellow_card") stat.yellow += 1;
      if (event.eventType === "red_card") stat.red += 1;
    }
    if (event.eventType === "goal" && event.assistAthleteId) {
      const assist = row(event.assistAthleteId, event.matchId);
      if (assist) assist.assists += 1;
    }
  }

  for (const [athleteId, seen] of appearances) {
    const stat = rows.get(athleteId);
    if (stat) stat.games = seen.size;
  }
  return [...rows.values()];
}

export function rankBy(stats: PlayerStat[], key: PlayerStatKey) {
  return stats
    .filter((stat) => stat[key] > 0)
    .sort((a, b) => b[key] - a[key] || a.games - b.games || a.athlete.fullName.localeCompare(b.athlete.fullName, "es"));
}
