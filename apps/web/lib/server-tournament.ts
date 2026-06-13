import { readFile } from "node:fs/promises";
import path from "node:path";
import { fetchWorldCupDates } from "./client-football-data";
import {
  resolveTournamentTeams,
  runTournamentSimulation,
  type EloSnapshotInput,
  type TournamentSimulationResult
} from "./tournament-simulation";

type EloSnapshot = EloSnapshotInput & {
  source: string;
  sourceUrl: string;
  fetchedAt: string;
};

export async function createTournamentSimulation(
  iterations: number,
  teamAdjustments: Record<string, number> = {}
): Promise<{
  generatedAt: string;
  source: Pick<EloSnapshot, "source" | "sourceUrl" | "fetchedAt">;
  methodology: string;
  result: TournamentSimulationResult;
}> {
  const safeIterations = Math.max(1_000, Math.min(100_000, Math.round(iterations)));
  const [snapshotText, events] = await Promise.all([
    readFile(path.join(process.cwd(), "public/data/world-elo.json"), "utf8"),
    fetchWorldCupDates(["2026-06-11", "2026-07-19"])
  ]);
  const snapshot = JSON.parse(snapshotText) as EloSnapshot;
  const groupEvents = events.filter((event) => Boolean(event.strGroup));
  const teams = resolveTournamentTeams(groupEvents, snapshot).map((team) => ({
    ...team,
    rating: team.rating + Math.max(-150, Math.min(150, teamAdjustments[team.name] ?? 0))
  }));
  if (teams.length !== 48 || groupEvents.length !== 72) {
    throw new Error(`Incomplete tournament feed: ${teams.length} teams, ${groupEvents.length} matches`);
  }

  return {
    generatedAt: new Date().toISOString(),
    source: {
      source: snapshot.source,
      sourceUrl: snapshot.sourceUrl,
      fetchedAt: snapshot.fetchedAt
    },
    methodology: "Completed results fixed; future matches use Elo-driven Poisson scores and a fixed simulation seed.",
    result: runTournamentSimulation(teams, groupEvents, safeIterations)
  };
}
