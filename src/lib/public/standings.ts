import type { MatchCard, StandingRow, TeamCard } from "@/lib/public/types";

export function computeStandings(matches: MatchCard[], teams: TeamCard[]): StandingRow[] {
  const byTeam = new Map<string, StandingRow>();

  for (const team of teams) {
    byTeam.set(team.id, {
      teamId: team.id,
      universityId: team.universityId,
      universityShort: team.university.shortName,
      universityName: team.university.name,
      logoUrl: team.university.logoUrl,
      gender: team.gender,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
    });
  }

  for (const match of matches) {
    if (match.status !== "finished") continue;
    if (match.homeScore === null || match.awayScore === null) continue;
    const home = byTeam.get(match.homeTeamId);
    const away = byTeam.get(match.awayTeamId);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (match.awayScore > match.homeScore) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  return [...byTeam.values()]
    .map((row) => ({ ...row, goalDiff: row.goalsFor - row.goalsAgainst }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor ||
        a.universityShort.localeCompare(b.universityShort),
    );
}
