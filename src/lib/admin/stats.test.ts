import { describe, expect, it } from "vitest";
import type { AthleteOption, MatchRow, TeamOption } from "@/app/admin/(panel)/partidos/types";
import { computeAdminStandings, computePlayerStats, isResultPending } from "@/lib/admin/stats";

function team(id: string, gender: TeamOption["gender"] = "male", sportId = "futbol"): TeamOption {
  return { id, sportId, universityId: `uni-${id}`, gender, label: id, universityShort: id.toUpperCase(), logoUrl: null };
}

function athlete(id: string, teamId: string, position: string | null = null): AthleteOption {
  return { id, teamId, fullName: id, jerseyNumber: null, isActive: true, photoUrl: null, position };
}

function match(
  home: string,
  away: string,
  homeScore: number | null,
  awayScore: number | null,
  overrides: Partial<MatchRow> = {},
): MatchRow {
  return {
    id: `${home}-${away}-${overrides.matchDate ?? "x"}`,
    sportId: "futbol",
    sportName: "Fútbol",
    sportSlug: "futbol-campo",
    homeTeamId: home,
    awayTeamId: away,
    homeLabel: home,
    awayLabel: away,
    matchDate: "2026-10-01T18:00:00Z",
    location: null,
    roundName: null,
    status: "finished",
    homeScore,
    awayScore,
    mvpAthleteId: null,
    matchDetails: null,
    events: [],
    ...overrides,
  };
}

describe("computeAdminStandings", () => {
  it("only includes teams of the selected sport and branch", () => {
    const rows = computeAdminStandings(
      [],
      [team("a"), team("b", "female"), team("c", "male", "basket")],
      "futbol",
      "male",
    );
    expect(rows.map((row) => row.team.id)).toEqual(["a"]);
  });

  it("builds the recent form in date order and keeps the last five", () => {
    const dates = ["01", "02", "03", "04", "05", "06"].map((day) => `2026-10-${day}T18:00:00Z`);
    const scores: Array<[number, number]> = [[1, 0], [0, 0], [0, 1], [2, 0], [3, 0], [0, 2]];
    const matches = dates
      .map((matchDate, i) => match("a", "b", scores[i][0], scores[i][1], { matchDate }))
      .reverse();

    const [first, second] = computeAdminStandings(matches, [team("a"), team("b")], "futbol", "all");

    expect(first.team.id).toBe("a");
    expect(first).toMatchObject({ played: 6, won: 3, drawn: 1, lost: 2, points: 10, diff: 3 });
    expect(first.form).toEqual(["D", "L", "W", "W", "L"]);
    expect(second.form).toEqual(["D", "W", "L", "L", "W"]);
  });
});

describe("computePlayerStats", () => {
  it("counts goals, assists, cards, MVPs, clean sheets and games", () => {
    const teams = [team("a"), team("b")];
    const athletes = [athlete("p1", "a"), athlete("p2", "a"), athlete("gk", "a", "Portero"), athlete("q1", "b")];
    const matches = [
      match("a", "b", 2, 0, {
        id: "m1",
        mvpAthleteId: "p1",
        events: [
          { teamId: "a", athleteId: "p1", assistAthleteId: "p2", eventType: "goal", value: 1, detail: null },
          { teamId: "a", athleteId: "p1", assistAthleteId: null, eventType: "goal", value: 1, detail: null },
          { teamId: "b", athleteId: "q1", assistAthleteId: null, eventType: "yellow_card", value: 1, detail: null },
        ],
      }),
      match("b", "a", 1, 1, {
        id: "m2",
        events: [{ teamId: "a", athleteId: "p2", assistAthleteId: null, eventType: "red_card", value: 1, detail: null }],
      }),
    ];

    const stats = Object.fromEntries(
      computePlayerStats(matches, athletes, teams, "futbol", "all").map((row) => [row.athlete.id, row]),
    );

    expect(stats.p1).toMatchObject({ goals: 2, assists: 0, mvps: 1, games: 1 });
    expect(stats.p2).toMatchObject({ goals: 0, assists: 1, red: 1, games: 2 });
    expect(stats.q1).toMatchObject({ yellow: 1, games: 1 });
    expect(stats.gk).toMatchObject({ cleanSheets: 1, games: 2 });
  });
});

describe("isResultPending", () => {
  const now = Date.parse("2026-10-06T12:00:00Z");

  it("flags scheduled or live matches whose date already passed", () => {
    expect(isResultPending(match("a", "b", null, null, { status: "scheduled", matchDate: "2026-10-05T18:00:00Z" }), now)).toBe(true);
    expect(isResultPending(match("a", "b", null, null, { status: "live", matchDate: "2026-10-06T11:00:00Z" }), now)).toBe(true);
  });

  it("does not flag future or finished matches", () => {
    expect(isResultPending(match("a", "b", null, null, { status: "scheduled", matchDate: "2026-10-07T18:00:00Z" }), now)).toBe(false);
    expect(isResultPending(match("a", "b", 1, 0, { matchDate: "2026-10-01T18:00:00Z" }), now)).toBe(false);
  });
});
