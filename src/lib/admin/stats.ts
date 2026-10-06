import type { AthleteOption, MatchRow, TeamOption } from "@/app/admin/(panel)/partidos/types";

export type GenderFilter = "all" | TeamOption["gender"];

type AdminStandingRow = {
  team: TeamOption;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scored: number;
  conceded: number;
  diff: number;
  points: number;
  form: Array<"W" | "D" | "L">;
};

export type PlayerStatRow = {
  athlete: AthleteOption;
  team: TeamOption | undefined;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
  points: number;
  games: number;
  mvps: number;
  cleanSheets: number;
};

function teamMatches(team: TeamOption, gender: GenderFilter, sportId: string) {
  return team.sportId === sportId && (gender === "all" || team.gender === gender);
}

export function isResultPending(match: MatchRow, now = Date.now()) {
  return (
    (match.status === "scheduled" || match.status === "live") &&
    +new Date(match.matchDate) < now
  );
}

export function computeAdminStandings(
  matches: MatchRow[],
  teams: TeamOption[],
  sportId: string,
  gender: GenderFilter,
): AdminStandingRow[] {
  const rows = new Map<string, AdminStandingRow>();
  for (const team of teams) {
    if (!teamMatches(team, gender, sportId)) continue;
    rows.set(team.id, {
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      scored: 0,
      conceded: 0,
      diff: 0,
      points: 0,
      form: [],
    });
  }

  const finished = matches
    .filter((match) => match.status === "finished" && match.homeScore !== null && match.awayScore !== null)
    .sort((a, b) => +new Date(a.matchDate) - +new Date(b.matchDate));

  for (const match of finished) {
    const home = rows.get(match.homeTeamId);
    const away = rows.get(match.awayTeamId);
    if (!home || !away) continue;
    const hs = match.homeScore ?? 0;
    const as = match.awayScore ?? 0;
    home.played += 1;
    away.played += 1;
    home.scored += hs;
    home.conceded += as;
    away.scored += as;
    away.conceded += hs;
    if (hs > as) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
      home.form.push("W");
      away.form.push("L");
    } else if (as > hs) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
      home.form.push("L");
      away.form.push("W");
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
      home.form.push("D");
      away.form.push("D");
    }
  }

  return [...rows.values()]
    .map((row) => ({ ...row, diff: row.scored - row.conceded, form: row.form.slice(-5) }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.diff - a.diff ||
        b.scored - a.scored ||
        a.team.universityShort.localeCompare(b.team.universityShort),
    );
}

function isGoalkeeper(position: string | null) {
  const key = (position ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  return key.includes("porter") || key.includes("arquer") || key.includes("goalkeeper");
}

export function computePlayerStats(
  matches: MatchRow[],
  athletes: AthleteOption[],
  teams: TeamOption[],
  sportId: string,
  gender: GenderFilter,
): PlayerStatRow[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const rows = new Map<string, PlayerStatRow>();
  const appearances = new Map<string, Set<string>>();

  function row(athleteId: string) {
    const existing = rows.get(athleteId);
    if (existing) return existing;
    const athlete = athletes.find((item) => item.id === athleteId);
    if (!athlete) return null;
    const team = teamById.get(athlete.teamId);
    if (!team || !teamMatches(team, gender, sportId)) return null;
    const created: PlayerStatRow = {
      athlete,
      team,
      goals: 0,
      assists: 0,
      yellow: 0,
      red: 0,
      points: 0,
      games: 0,
      mvps: 0,
      cleanSheets: 0,
    };
    rows.set(athleteId, created);
    return created;
  }

  function appear(athleteId: string, matchId: string) {
    const set = appearances.get(athleteId) ?? new Set<string>();
    set.add(matchId);
    appearances.set(athleteId, set);
  }

  const keepersByTeam = new Map<string, AthleteOption[]>();
  for (const athlete of athletes) {
    if (!athlete.isActive || !isGoalkeeper(athlete.position)) continue;
    keepersByTeam.set(athlete.teamId, [...(keepersByTeam.get(athlete.teamId) ?? []), athlete]);
  }

  for (const match of matches) {
    if (match.sportId !== sportId || match.status !== "finished") continue;
    if (match.homeScore !== null && match.awayScore !== null) {
      for (const [teamId, conceded] of [
        [match.homeTeamId, match.awayScore],
        [match.awayTeamId, match.homeScore],
      ] as const) {
        for (const keeper of keepersByTeam.get(teamId) ?? []) {
          const stat = row(keeper.id);
          if (!stat) continue;
          appear(keeper.id, match.id);
          if (conceded === 0) stat.cleanSheets += 1;
        }
      }
    }
    if (match.mvpAthleteId) {
      const mvp = row(match.mvpAthleteId);
      if (mvp) {
        mvp.mvps += 1;
        appear(match.mvpAthleteId, match.id);
      }
    }
    for (const event of match.events) {
      const scorer = row(event.athleteId);
      if (scorer) {
        appear(event.athleteId, match.id);
        if (event.eventType === "goal") scorer.goals += event.value || 1;
        if (event.eventType === "yellow_card") scorer.yellow += 1;
        if (event.eventType === "red_card") scorer.red += 1;
        if (event.eventType === "points") scorer.points += event.value;
      }
      if (event.eventType === "goal" && event.assistAthleteId) {
        const assist = row(event.assistAthleteId);
        if (assist) {
          assist.assists += 1;
          appear(event.assistAthleteId, match.id);
        }
      }
    }
  }

  for (const [athleteId, set] of appearances) {
    const stat = rows.get(athleteId);
    if (stat) stat.games = set.size;
  }

  return [...rows.values()];
}
