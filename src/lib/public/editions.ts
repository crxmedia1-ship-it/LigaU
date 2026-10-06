import type { MatchCard, TeamCard, TeamGender } from "@/lib/public/types";
import { computeStandings } from "@/lib/public/standings";

const ZONE = "America/Caracas";

type EditionStatus = "pasada" | "curso" | "proxima";

export const EDITION_STATUS_LABEL: Record<EditionStatus, string> = {
  pasada: "Pasada",
  curso: "En curso",
  proxima: "Próxima",
};

type YearEdition = {
  year: number;
  status: EditionStatus;
};

type ValidaEdition = {
  year: number;
  round: string;
  status: EditionStatus;
};

export type TitleWin = {
  universityId: string;
  teamId: string;
  sportName: string;
  gender: TeamGender;
  year: number;
};

function matchYear(iso: string): number {
  const year = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, year: "numeric" }).format(new Date(iso));
  return Number(year);
}

function roundLabel(match: MatchCard): string {
  const name = match.roundName?.trim();
  return name ? name : "Válida única";
}

function scored(match: MatchCard): boolean {
  return match.status === "finished" && match.homeScore !== null && match.awayScore !== null;
}

function statusOf(matches: MatchCard[]): EditionStatus {
  if (matches.length === 0) return "proxima";
  if (matches.every(scored)) return "pasada";
  if (matches.some(scored) || matches.some((match) => match.status === "live" || match.status === "finished")) return "curso";
  return "proxima";
}

/** A championship final, not a semifinal or quarterfinal. */
function isChampionshipFinal(roundName: string | null): boolean {
  const name = (roundName ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
  if (!/(^|[^a-z])final([^a-z]|$)/.test(name)) return false;
  return !/(semi|cuarto|octavo|dieciseis|repechaje)/.test(name);
}

export function listYears(matches: MatchCard[]): YearEdition[] {
  const byYear = new Map<number, MatchCard[]>();
  for (const match of matches) {
    const year = matchYear(match.matchDate);
    if (!Number.isFinite(year)) continue;
    byYear.set(year, [...(byYear.get(year) ?? []), match]);
  }
  return [...byYear.entries()]
    .map(([year, list]) => ({ year, status: statusOf(list) }))
    .sort((a, b) => a.year - b.year);
}

export function listValidas(matches: MatchCard[]): ValidaEdition[] {
  const byKey = new Map<string, { year: number; round: string; start: string; matches: MatchCard[] }>();
  for (const match of matches) {
    const year = matchYear(match.matchDate);
    if (!Number.isFinite(year)) continue;
    const round = roundLabel(match);
    const key = `${year}::${round}`;
    const bucket = byKey.get(key) ?? { year, round, start: match.matchDate, matches: [] };
    if (match.matchDate < bucket.start) bucket.start = match.matchDate;
    bucket.matches.push(match);
    byKey.set(key, bucket);
  }
  return [...byKey.values()]
    .map((bucket) => ({ year: bucket.year, round: bucket.round, status: statusOf(bucket.matches) }))
    .sort((a, b) => a.year - b.year || byKey.get(`${a.year}::${a.round}`)!.start.localeCompare(byKey.get(`${b.year}::${b.round}`)!.start));
}

export function defaultRound(validas: ValidaEdition[], year: number | null): string | null {
  const inYear = validas.filter((edition) => year === null || edition.year === year);
  return (
    inYear.find((edition) => edition.status === "curso")?.round ??
    inYear.find((edition) => edition.status === "proxima")?.round ??
    inYear[0]?.round ??
    null
  );
}

export function defaultYear(editions: YearEdition[]): number | null {
  return (
    editions.find((edition) => edition.status === "curso")?.year ??
    editions.find((edition) => edition.status === "proxima")?.year ??
    editions.at(-1)?.year ??
    null
  );
}

export function scopeMatches(
  matches: MatchCard[],
  slice: "ano" | "valida",
  year: number | null,
  round: string | null,
): MatchCard[] {
  return matches.filter((match) => {
    if (year !== null && matchYear(match.matchDate) !== year) return false;
    if (slice === "valida" && round && roundLabel(match) !== round) return false;
    return true;
  });
}

/**
 * A title is a closed edition: the winner of a scored final, or the unique
 * leader once every match of that sport, branch and year has a result.
 */
export function listTitles(matches: MatchCard[], teams: TeamCard[]): TitleWin[] {
  const teamById = new Map(teams.map((team) => [team.id, team]));
  const titles: TitleWin[] = [];
  const seen = new Set<string>();

  const push = (teamId: string, sportName: string, year: number) => {
    const team = teamById.get(teamId);
    if (!team) return;
    const key = `${teamId}:${sportName}:${year}`;
    if (seen.has(key)) return;
    seen.add(key);
    titles.push({
      universityId: team.universityId,
      teamId,
      sportName,
      gender: team.gender,
      year,
    });
  };

  for (const match of matches) {
    if (!isChampionshipFinal(match.roundName) || !scored(match)) continue;
    if (match.homeScore === null || match.awayScore === null || match.homeScore === match.awayScore) continue;
    const winnerId = match.homeScore > match.awayScore ? match.homeTeamId : match.awayTeamId;
    const team = teamById.get(winnerId);
    if (!team) continue;
    push(team.id, match.sportName, matchYear(match.matchDate));
  }

  const groups = new Map<string, MatchCard[]>();
  for (const match of matches) {
    const home = teamById.get(match.homeTeamId);
    if (!home) continue;
    const key = `${home.sportId}:${home.gender}:${matchYear(match.matchDate)}`;
    groups.set(key, [...(groups.get(key) ?? []), match]);
  }

  for (const list of groups.values()) {
    if (list.length < 2 || !list.every(scored)) continue;
    if (list.some((match) => isChampionshipFinal(match.roundName))) continue;
    const involved = new Map<string, TeamCard>();
    for (const match of list) {
      const home = teamById.get(match.homeTeamId);
      const away = teamById.get(match.awayTeamId);
      if (home) involved.set(home.id, home);
      if (away) involved.set(away.id, away);
    }
    const rows = computeStandings(list, [...involved.values()]).filter((row) => row.played > 0);
    const top = rows[0];
    if (!top) continue;
    const tied = rows.filter(
      (row) => row.points === top.points && row.goalDiff === top.goalDiff && row.goalsFor === top.goalsFor,
    );
    if (tied.length !== 1) continue;
    push(top.teamId, list[0].sportName, matchYear(list[0].matchDate));
  }

  return titles.sort((a, b) => b.year - a.year || a.sportName.localeCompare(b.sportName, "es"));
}
