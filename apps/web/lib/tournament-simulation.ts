import type { SportsDbEvent } from "./client-football-data";

export type TournamentTeam = {
  name: string;
  group: string;
  rating: number;
};

export type EloSnapshotInput = {
  teams: Array<{ code: string; rating: number; names: string[] }>;
};

export type TeamStanding = {
  team: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type TeamSimulationResult = {
  team: string;
  group: string;
  rating: number;
  qualify: number;
  round16: number;
  quarterfinal: number;
  semifinal: number;
  final: number;
  champion: number;
};

export type TournamentSimulationResult = {
  iterations: number;
  teams: TeamSimulationResult[];
};

type MutableStanding = TeamStanding & { tie: number; rating: number };
type Counts = Omit<TeamSimulationResult, "team" | "group" | "rating">;

const ROUND_OF_16_PAIRINGS = [
  [0, 2],
  [1, 4],
  [3, 5],
  [6, 7],
  [10, 11],
  [8, 9],
  [13, 15],
  [12, 14]
] as const;
const QUARTERFINAL_PAIRINGS = [
  [0, 1],
  [4, 5],
  [2, 3],
  [6, 7]
] as const;
const SEMIFINAL_PAIRINGS = [
  [0, 1],
  [2, 3]
] as const;

const THIRD_PLACE_SLOTS = [
  ["A", "B", "C", "D", "F"],
  ["C", "D", "F", "G", "H"],
  ["C", "E", "F", "H", "I"],
  ["E", "H", "I", "J", "K"],
  ["A", "E", "H", "I", "J"],
  ["B", "E", "F", "I", "J"],
  ["E", "F", "G", "I", "J"],
  ["D", "E", "I", "J", "L"]
] as const;
const thirdAssignmentCache = new Map<string, string[]>();
const TEAM_CODE_OVERRIDES: Record<string, string> = {
  "bosnia-herzegovina": "BA",
  "cape-verde": "CV",
  "congo-dr": "CD",
  "czech-republic": "CZ",
  "ivory-coast": "CI",
  "south-korea": "KR",
  turkiye: "TR",
  usa: "US"
};

function normalizeTeamName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveTournamentTeams(events: SportsDbEvent[], snapshot: EloSnapshotInput): TournamentTeam[] {
  const ratingsByCode = new Map(snapshot.teams.map((team) => [team.code, team]));
  const ratingsByName = new Map(
    snapshot.teams.flatMap((team) => team.names.map((name) => [normalizeTeamName(name), team] as const))
  );
  const groupByTeam = new Map<string, string>();
  for (const event of events) {
    if (!event.strGroup) continue;
    groupByTeam.set(event.strHomeTeam, event.strGroup);
    groupByTeam.set(event.strAwayTeam, event.strGroup);
  }

  return [...groupByTeam.entries()]
    .map(([name, group]) => {
      const normalized = normalizeTeamName(name);
      const override = TEAM_CODE_OVERRIDES[normalized];
      const rating = override ? ratingsByCode.get(override) : ratingsByName.get(normalized);
      if (!rating) throw new Error(`No Elo rating found for ${name}`);
      return { name, group, rating: rating.rating };
    })
    .sort((left, right) => left.group.localeCompare(right.group) || left.name.localeCompare(right.name));
}

function seededRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function poisson(lambda: number, random: () => number): number {
  const threshold = Math.exp(-lambda);
  let product = 1;
  let goals = 0;
  do {
    goals += 1;
    product *= random();
  } while (product > threshold);
  return goals - 1;
}

function expectedGoals(homeRating: number, awayRating: number): [number, number] {
  const homeShare = 1 / (1 + Math.exp(-(homeRating - awayRating) / 350));
  const home = Math.max(0.35, Math.min(2.8, 2.55 * homeShare));
  return [home, Math.max(0.35, Math.min(2.8, 2.55 - home))];
}

function sampleScore(homeRating: number, awayRating: number, random: () => number): [number, number] {
  const [homeExpected, awayExpected] = expectedGoals(homeRating, awayRating);
  return [poisson(homeExpected, random), poisson(awayExpected, random)];
}

function emptyStanding(team: TournamentTeam, random: () => number): MutableStanding {
  return {
    team: team.name,
    group: team.group,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    tie: random(),
    rating: team.rating
  };
}

function applyResult(standing: MutableStanding, goalsFor: number, goalsAgainst: number): void {
  standing.played += 1;
  standing.goalsFor += goalsFor;
  standing.goalsAgainst += goalsAgainst;
  standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
  if (goalsFor > goalsAgainst) {
    standing.won += 1;
    standing.points += 3;
  } else if (goalsFor === goalsAgainst) {
    standing.drawn += 1;
    standing.points += 1;
  } else {
    standing.lost += 1;
  }
}

function standingOrder(left: MutableStanding, right: MutableStanding): number {
  return (
    right.points - left.points ||
    right.goalDifference - left.goalDifference ||
    right.goalsFor - left.goalsFor ||
    right.rating - left.rating ||
    right.tie - left.tie
  );
}

function teamWinner(home: TournamentTeam, away: TournamentTeam, random: () => number): TournamentTeam {
  const [homeGoals, awayGoals] = sampleScore(home.rating, away.rating, random);
  if (homeGoals > awayGoals) return home;
  if (awayGoals > homeGoals) return away;
  const homeChance = 1 / (1 + 10 ** (-(home.rating - away.rating) / 400));
  return random() < homeChance ? home : away;
}

function playRound(
  teams: TournamentTeam[],
  pairings: ReadonlyArray<readonly [number, number]>,
  random: () => number
): TournamentTeam[] {
  return pairings.map(([homeIndex, awayIndex]) => {
    const home = teams[homeIndex];
    const away = teams[awayIndex];
    if (!home || !away) throw new Error("Incomplete tournament bracket");
    return teamWinner(home, away, random);
  });
}

function fixedPairings(
  first: Map<string, TournamentTeam>,
  second: Map<string, TournamentTeam>,
  thirds: TournamentTeam[]
): TournamentTeam[][] {
  const cacheKey = thirds
    .map((team) => team.group)
    .sort()
    .join("");
  const cachedGroups = thirdAssignmentCache.get(cacheKey);
  const allocateThirds = (
    slotIndex: number,
    available: TournamentTeam[],
    assigned: TournamentTeam[]
  ): TournamentTeam[] | undefined => {
    if (slotIndex === THIRD_PLACE_SLOTS.length) return assigned;
    const eligibleGroups: readonly string[] = THIRD_PLACE_SLOTS[slotIndex] ?? [];
    for (let index = 0; index < available.length; index += 1) {
      const candidate = available[index];
      if (!candidate || !eligibleGroups.includes(candidate.group)) continue;
      const remaining = available.filter((_, availableIndex) => availableIndex !== index);
      const solution = allocateThirds(slotIndex + 1, remaining, [...assigned, candidate]);
      if (solution) return solution;
    }
    return undefined;
  };
  const cachedAssignments = cachedGroups
    ? cachedGroups.map((group) => thirds.find((team) => team.group === group))
    : undefined;
  const thirdAssignments = cachedAssignments?.every((team): team is TournamentTeam => Boolean(team))
    ? cachedAssignments
    : allocateThirds(0, thirds, []);
  if (thirdAssignments && !cachedGroups) {
    thirdAssignmentCache.set(
      cacheKey,
      thirdAssignments.map((team) => team.group)
    );
  }
  if (!thirdAssignments) throw new Error("Unable to allocate best third-place teams");
  const get = (map: Map<string, TournamentTeam>, group: string): TournamentTeam => {
    const team = map.get(group);
    if (!team) throw new Error(`Missing Group ${group} qualifier`);
    return team;
  };
  const third = (index: number): TournamentTeam => {
    const team = thirdAssignments[index];
    if (!team) throw new Error(`Missing third-place allocation ${index + 1}`);
    return team;
  };

  return [
    [get(second, "A"), get(second, "B")],
    [get(first, "C"), get(second, "F")],
    [get(first, "E"), third(0)],
    [get(first, "F"), get(second, "C")],
    [get(second, "E"), get(second, "I")],
    [get(first, "I"), third(1)],
    [get(first, "A"), third(2)],
    [get(first, "L"), third(3)],
    [get(first, "G"), third(4)],
    [get(first, "D"), third(5)],
    [get(first, "H"), get(second, "J")],
    [get(second, "K"), get(second, "L")],
    [get(first, "B"), third(6)],
    [get(second, "D"), get(second, "G")],
    [get(first, "J"), get(second, "H")],
    [get(first, "K"), third(7)]
  ];
}

function increment(counts: Map<string, Counts>, teams: TournamentTeam[], field: keyof Counts): void {
  for (const team of teams) {
    const teamCounts = counts.get(team.name);
    if (teamCounts) teamCounts[field] += 1;
  }
}

export function currentGroupStandings(teams: TournamentTeam[], matches: SportsDbEvent[]): TeamStanding[] {
  const random = seededRandom(1);
  const standings = new Map(teams.map((team) => [team.name, emptyStanding(team, random)]));
  for (const match of matches) {
    if (match.intHomeScore === null || match.intAwayScore === null) continue;
    const home = standings.get(match.strHomeTeam);
    const away = standings.get(match.strAwayTeam);
    if (!home || !away) continue;
    applyResult(home, Number(match.intHomeScore), Number(match.intAwayScore));
    applyResult(away, Number(match.intAwayScore), Number(match.intHomeScore));
  }
  return [...standings.values()]
    .sort((left, right) => left.group.localeCompare(right.group) || standingOrder(left, right))
    .map((standing) => ({
      team: standing.team,
      group: standing.group,
      played: standing.played,
      won: standing.won,
      drawn: standing.drawn,
      lost: standing.lost,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      goalDifference: standing.goalDifference,
      points: standing.points
    }));
}

export function runTournamentSimulation(
  teams: TournamentTeam[],
  groupMatches: SportsDbEvent[],
  iterations: number,
  seed = 20260611
): TournamentSimulationResult {
  if (teams.length !== 48) throw new Error(`Expected 48 teams, received ${teams.length}`);
  if (iterations < 1) throw new Error("Simulation iterations must be positive");

  const teamsByName = new Map(teams.map((team) => [team.name, team]));
  const teamsByGroup = new Map<string, TournamentTeam[]>();
  for (const team of teams) {
    const groupTeams = teamsByGroup.get(team.group) ?? [];
    groupTeams.push(team);
    teamsByGroup.set(team.group, groupTeams);
  }
  const matchesByGroup = new Map<string, SportsDbEvent[]>();
  for (const match of groupMatches) {
    if (!match.strGroup) continue;
    const groupMatchesForTeam = matchesByGroup.get(match.strGroup) ?? [];
    groupMatchesForTeam.push(match);
    matchesByGroup.set(match.strGroup, groupMatchesForTeam);
  }
  const counts = new Map<string, Counts>(
    teams.map((team) => [team.name, { qualify: 0, round16: 0, quarterfinal: 0, semifinal: 0, final: 0, champion: 0 }])
  );
  const random = seededRandom(seed);

  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const first = new Map<string, TournamentTeam>();
    const second = new Map<string, TournamentTeam>();
    const thirdStandings: MutableStanding[] = [];

    for (const group of "ABCDEFGHIJKL") {
      const groupTeams = teamsByGroup.get(group) ?? [];
      const standings = new Map(groupTeams.map((team) => [team.name, emptyStanding(team, random)]));
      for (const match of matchesByGroup.get(group) ?? []) {
        const homeStanding = standings.get(match.strHomeTeam);
        const awayStanding = standings.get(match.strAwayTeam);
        const homeTeam = teamsByName.get(match.strHomeTeam);
        const awayTeam = teamsByName.get(match.strAwayTeam);
        if (!homeStanding || !awayStanding || !homeTeam || !awayTeam) continue;
        const [homeGoals, awayGoals] =
          match.intHomeScore !== null && match.intAwayScore !== null
            ? [Number(match.intHomeScore), Number(match.intAwayScore)]
            : sampleScore(homeTeam.rating, awayTeam.rating, random);
        applyResult(homeStanding, homeGoals, awayGoals);
        applyResult(awayStanding, awayGoals, homeGoals);
      }
      const ordered = [...standings.values()].sort(standingOrder);
      const firstTeam = teamsByName.get(ordered[0]?.team ?? "");
      const secondTeam = teamsByName.get(ordered[1]?.team ?? "");
      if (!firstTeam || !secondTeam || !ordered[2]) throw new Error(`Incomplete Group ${group}`);
      first.set(group, firstTeam);
      second.set(group, secondTeam);
      thirdStandings.push(ordered[2]);
    }

    const bestThirds = thirdStandings
      .sort(standingOrder)
      .slice(0, 8)
      .map((standing) => teamsByName.get(standing.team))
      .filter((team): team is TournamentTeam => Boolean(team));
    const roundOf32Pairs = fixedPairings(first, second, bestThirds);
    const qualified = [...first.values(), ...second.values(), ...bestThirds];
    increment(counts, qualified, "qualify");

    const roundOf16 = roundOf32Pairs.map((pair) => {
      const home = pair[0];
      const away = pair[1];
      if (!home || !away) throw new Error("Incomplete Round of 32 pairing");
      return teamWinner(home, away, random);
    });
    increment(counts, roundOf16, "round16");
    const quarterfinals = playRound(roundOf16, ROUND_OF_16_PAIRINGS, random);
    increment(counts, quarterfinals, "quarterfinal");
    const semifinals = playRound(quarterfinals, QUARTERFINAL_PAIRINGS, random);
    increment(counts, semifinals, "semifinal");
    const finalists = playRound(semifinals, SEMIFINAL_PAIRINGS, random);
    increment(counts, finalists, "final");
    const firstFinalist = finalists[0];
    const secondFinalist = finalists[1];
    if (!firstFinalist || !secondFinalist) throw new Error("Incomplete final");
    const champion = teamWinner(firstFinalist, secondFinalist, random);
    increment(counts, [champion], "champion");
  }

  return {
    iterations,
    teams: teams
      .map((team) => {
        const teamCounts = counts.get(team.name);
        if (!teamCounts) throw new Error(`Missing counts for ${team.name}`);
        return {
          team: team.name,
          group: team.group,
          rating: team.rating,
          qualify: teamCounts.qualify / iterations,
          round16: teamCounts.round16 / iterations,
          quarterfinal: teamCounts.quarterfinal / iterations,
          semifinal: teamCounts.semifinal / iterations,
          final: teamCounts.final / iterations,
          champion: teamCounts.champion / iterations
        };
      })
      .sort((left, right) => right.champion - left.champion)
  };
}
