import { computeStandings } from "@/lib/public/standings";
import type {
  MatchCard,
  MedalTally,
  SportCard,
  TeamCard,
  UniversityCard,
} from "@/lib/public/types";

export type PodiumBoardKey = "institucional" | "futbol" | "baloncesto" | "voleibol";

export type PodiumBoards = Record<PodiumBoardKey, MedalTally[]>;

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

function tallyForSport(
  matches: MatchCard[],
  teams: TeamCard[],
  universities: UniversityCard[],
  sportIds: Set<string>,
) {
  const sportTeams = teams.filter((team) => sportIds.has(team.sportId));
  const sportMatches = matches.filter((match) => sportIds.has(match.sportId));
  const uniIds = new Set(sportTeams.map((team) => team.universityId));
  const sportUnis = universities.filter((university) => uniIds.has(university.id));
  const medals = computeMedalTally(sportMatches, sportTeams, sportUnis);

  const points = new Map<string, number>();
  for (const row of computeStandings(sportMatches, sportTeams)) {
    points.set(row.universityId, (points.get(row.universityId) ?? 0) + row.points);
  }

  return medals
    .map((row) => ({ ...row, points: points.get(row.universityId) ?? 0 }))
    .sort(
      (a, b) =>
        b.gold - a.gold ||
        b.silver - a.silver ||
        b.bronze - a.bronze ||
        (b.points ?? 0) - (a.points ?? 0) ||
        a.universityShort.localeCompare(b.universityShort),
    );
}

export function computePodiumBoards(
  matches: MatchCard[],
  teams: TeamCard[],
  universities: UniversityCard[],
  sports: SportCard[],
): PodiumBoards {
  const idsFor = (...needles: string[]) =>
    new Set(
      sports
        .filter((sport) =>
          needles.some((needle) => sport.name.toLowerCase().includes(needle)),
        )
        .map((sport) => sport.id),
    );

  return {
    institucional: computeMedalTally(matches, teams, universities),
    futbol: tallyForSport(matches, teams, universities, idsFor("fútbol", "futbol")),
    baloncesto: tallyForSport(matches, teams, universities, idsFor("baloncesto")),
    voleibol: tallyForSport(matches, teams, universities, idsFor("voleibol", "voley")),
  };
}
