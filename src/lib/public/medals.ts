import { computeStandings } from "@/lib/public/standings";
import type {
  MatchCard,
  MedalTally,
  TeamCard,
  UniversityCard,
} from "@/lib/public/types";

export function computeMedalTally(
  matches: MatchCard[],
  teams: TeamCard[],
  universities: UniversityCard[],
): MedalTally[] {
  const tallies = new Map<string, MedalTally>();
  for (const university of universities) {
    tallies.set(university.id, {
      universityId: university.id,
      universityShort: university.shortName,
      universityName: university.name,
      logoUrl: university.logoUrl,
      colors: university.colors,
      gold: 0,
      silver: 0,
      bronze: 0,
      total: 0,
    });
  }

  const groups = new Map<string, TeamCard[]>();
  for (const team of teams) {
    const key = `${team.sportId}:${team.gender}`;
    const list = groups.get(key) ?? [];
    list.push(team);
    groups.set(key, list);
  }

  for (const groupTeams of groups.values()) {
    const ids = new Set(groupTeams.map((team) => team.id));
    const groupMatches = matches.filter(
      (match) => ids.has(match.homeTeamId) && ids.has(match.awayTeamId),
    );
    const ranked = computeStandings(groupMatches, groupTeams).filter(
      (row) => row.played > 0,
    );
    ranked.slice(0, 3).forEach((row, index) => {
      const tally = tallies.get(row.universityId);
      if (!tally) return;
      if (index === 0) tally.gold += 1;
      if (index === 1) tally.silver += 1;
      if (index === 2) tally.bronze += 1;
      tally.total = tally.gold + tally.silver + tally.bronze;
    });
  }

  return [...tallies.values()].sort(
    (a, b) =>
      b.gold - a.gold ||
      b.silver - a.silver ||
      b.bronze - a.bronze ||
      a.universityShort.localeCompare(b.universityShort),
  );
}
