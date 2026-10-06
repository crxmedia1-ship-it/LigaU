import { describe, expect, it } from "vitest";
import { computeStandings } from "@/lib/public/standings";
import type { MatchCard, TeamCard } from "@/lib/public/types";

function team(id: string, shortName = id.toUpperCase()): TeamCard {
  return {
    id,
    sportId: "futbol",
    universityId: `uni-${id}`,
    gender: "male",
    coachName: null,
    label: shortName,
    university: { shortName, name: `Universidad ${shortName}`, logoUrl: null } as TeamCard["university"],
  };
}

function match(
  home: string,
  away: string,
  homeScore: number | null,
  awayScore: number | null,
  status: MatchCard["status"] = "finished",
): MatchCard {
  return {
    id: `${home}-${away}-${Math.random()}`,
    sportId: "futbol",
    sportName: "Fútbol",
    sportSlug: "futbol-campo",
    gender: "male",
    homeTeamId: home,
    awayTeamId: away,
    homeLabel: home,
    awayLabel: away,
    homeUniversityId: `uni-${home}`,
    awayUniversityId: `uni-${away}`,
    homeShort: home,
    awayShort: away,
    homeLogoUrl: null,
    awayLogoUrl: null,
    matchDate: "2026-10-01T18:00:00Z",
    location: null,
    roundName: null,
    status,
    homeScore,
    awayScore,
    mvpAthleteId: null,
  };
}

describe("computeStandings", () => {
  it("gives 3 points for a win, 1 for a draw and none for a loss", () => {
    const rows = computeStandings(
      [match("a", "b", 2, 0), match("b", "c", 1, 1), match("c", "a", 0, 3)],
      [team("a"), team("b"), team("c")],
    );
    const byId = Object.fromEntries(rows.map((row) => [row.teamId, row]));

    expect(byId.a).toMatchObject({ played: 2, won: 2, points: 6, goalsFor: 5, goalsAgainst: 0, goalDiff: 5 });
    expect(byId.b).toMatchObject({ played: 2, won: 0, drawn: 1, lost: 1, points: 1, goalDiff: -2 });
    expect(byId.c).toMatchObject({ played: 2, drawn: 1, lost: 1, points: 1, goalDiff: -3 });
  });

  it("ignores matches that are not finished or have no score", () => {
    const rows = computeStandings(
      [match("a", "b", 1, 0, "scheduled"), match("a", "b", 2, 2, "live"), match("a", "b", null, null)],
      [team("a"), team("b")],
    );
    expect(rows.every((row) => row.played === 0 && row.points === 0)).toBe(true);
  });

  it("ignores matches against teams outside the table", () => {
    const [row] = computeStandings([match("a", "x", 5, 0)], [team("a")]);
    expect(row.played).toBe(0);
  });

  it("breaks ties by goal difference, then goals scored, then name", () => {
    const rows = computeStandings(
      [match("a", "z", 1, 0), match("b", "z", 3, 2), match("c", "z", 3, 0), match("d", "z", 3, 0)],
      [team("a"), team("b"), team("d", "DDD"), team("c", "CCC"), team("z")],
    );
    expect(rows.map((row) => row.teamId)).toEqual(["c", "d", "b", "a", "z"]);
  });
});
