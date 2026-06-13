import { describe, expect, it } from "vitest";
import type { SportsDbEvent } from "../lib/client-football-data";
import { runTournamentSimulation, type TournamentTeam } from "../lib/tournament-simulation";

function tournamentFixture(): { teams: TournamentTeam[]; matches: SportsDbEvent[] } {
  const teams: TournamentTeam[] = [];
  const matches: SportsDbEvent[] = [];
  let eventId = 1;

  for (const group of "ABCDEFGHIJKL") {
    const groupTeams = Array.from({ length: 4 }, (_, index) => ({
      name: `${group} Team ${index + 1}`,
      group,
      rating: 1800 - index * 80
    }));
    teams.push(...groupTeams);
    for (let homeIndex = 0; homeIndex < groupTeams.length; homeIndex += 1) {
      for (let awayIndex = homeIndex + 1; awayIndex < groupTeams.length; awayIndex += 1) {
        const home = groupTeams[homeIndex];
        const away = groupTeams[awayIndex];
        if (!home || !away) throw new Error("Invalid test fixture");
        const fixedWinner = group === "A" && homeIndex === 0;
        matches.push({
          idEvent: String(eventId),
          strTimestamp: "2026-06-20T12:00:00",
          strEvent: `${home.name} vs ${away.name}`,
          strHomeTeam: home.name,
          strAwayTeam: away.name,
          intHomeScore: fixedWinner ? "2" : null,
          intAwayScore: fixedWinner ? "0" : null,
          strStatus: fixedWinner ? "FT" : null,
          strGroup: group,
          strVenue: null,
          strCity: null,
          strCountry: null,
          strHomeTeamBadge: null,
          strAwayTeamBadge: null
        });
        eventId += 1;
      }
    }
  }
  return { teams, matches };
}

describe("World Cup Monte Carlo simulation", () => {
  it("produces normalized tournament-stage totals and fixes completed results", () => {
    const fixture = tournamentFixture();
    const result = runTournamentSimulation(fixture.teams, fixture.matches, 500, 42);
    const total = (field: keyof (typeof result.teams)[number]) =>
      result.teams.reduce((sum, team) => sum + (typeof team[field] === "number" ? team[field] : 0), 0);

    expect(result.teams).toHaveLength(48);
    expect(total("qualify")).toBeCloseTo(32, 8);
    expect(total("round16")).toBeCloseTo(16, 8);
    expect(total("quarterfinal")).toBeCloseTo(8, 8);
    expect(total("semifinal")).toBeCloseTo(4, 8);
    expect(total("final")).toBeCloseTo(2, 8);
    expect(total("champion")).toBeCloseTo(1, 8);
    expect(result.teams.find((team) => team.team === "A Team 1")?.qualify).toBe(1);
  });

  it("is reproducible with a fixed seed", () => {
    const fixture = tournamentFixture();
    const first = runTournamentSimulation(fixture.teams, fixture.matches, 100, 7);
    const second = runTournamentSimulation(fixture.teams, fixture.matches, 100, 7);
    expect(second).toEqual(first);
  });
});
