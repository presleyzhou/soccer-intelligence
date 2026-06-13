export type OutcomeProbabilities = {
  home: number;
  draw: number;
  away: number;
};

export type Scoreline = {
  home: number;
  away: number;
  probability: number;
};

export type MatchPrediction = {
  elo: OutcomeProbabilities;
  poisson: OutcomeProbabilities;
  dixonColes: OutcomeProbabilities;
  ensemble: OutcomeProbabilities;
  expectedGoals: { home: number; away: number };
  scoreline: Scoreline;
  disagreement: number;
};

const MAX_GOALS = 8;
const DRAW_BASE = 0.26;
const DRAW_DECAY = 0.0012;
const DIXON_COLES_RHO = -0.08;
const TOURNAMENT_GOAL_BASELINE = 2.55;

function normalize(values: number[]): number[] {
  const sanitized = values.map((value) => (Number.isFinite(value) ? Math.max(0, value) : 0));
  const total = sanitized.reduce((sum, value) => sum + value, 0);
  if (total === 0) return values.map(() => 1 / values.length);
  return sanitized.map((value) => value / total);
}

function asOutcome(values: number[]): OutcomeProbabilities {
  const [home = 1 / 3, draw = 1 / 3, away = 1 / 3] = normalize(values);
  return { home, draw, away };
}

export function eloProbabilities(homeElo: number, awayElo: number): OutcomeProbabilities {
  const difference = homeElo - awayElo;
  const decisiveHome = 1 / (1 + 10 ** (-difference / 400));
  const draw = Math.max(0.15, DRAW_BASE * Math.exp(-DRAW_DECAY * Math.abs(difference)));
  return asOutcome([(1 - draw) * decisiveHome, draw, (1 - draw) * (1 - decisiveHome)]);
}

function factorial(value: number): number {
  let result = 1;
  for (let index = 2; index <= value; index += 1) result *= index;
  return result;
}

function poissonProbability(goals: number, expected: number): number {
  return (Math.exp(-expected) * expected ** goals) / factorial(goals);
}

function dixonColesAdjustment(
  homeGoals: number,
  awayGoals: number,
  homeExpected: number,
  awayExpected: number
): number {
  if (homeGoals === 0 && awayGoals === 0) return 1 - homeExpected * awayExpected * DIXON_COLES_RHO;
  if (homeGoals === 0 && awayGoals === 1) return 1 + homeExpected * DIXON_COLES_RHO;
  if (homeGoals === 1 && awayGoals === 0) return 1 + awayExpected * DIXON_COLES_RHO;
  if (homeGoals === 1 && awayGoals === 1) return 1 - DIXON_COLES_RHO;
  return 1;
}

function scoreModel(
  homeExpected: number,
  awayExpected: number,
  useDixonColes: boolean
): { outcome: OutcomeProbabilities; scoreline: Scoreline } {
  const scores: Scoreline[] = [];
  let total = 0;

  for (let home = 0; home <= MAX_GOALS; home += 1) {
    for (let away = 0; away <= MAX_GOALS; away += 1) {
      const adjustment = useDixonColes ? dixonColesAdjustment(home, away, homeExpected, awayExpected) : 1;
      const probability = Math.max(
        0,
        poissonProbability(home, homeExpected) * poissonProbability(away, awayExpected) * adjustment
      );
      scores.push({ home, away, probability });
      total += probability;
    }
  }

  const normalizedScores = scores.map((score) => ({
    ...score,
    probability: score.probability / total
  }));
  const outcome = normalizedScores.reduce(
    (result, score) => {
      if (score.home > score.away) result.home += score.probability;
      else if (score.home === score.away) result.draw += score.probability;
      else result.away += score.probability;
      return result;
    },
    { home: 0, draw: 0, away: 0 }
  );
  const scoreline = normalizedScores.reduce((best, score) => (score.probability > best.probability ? score : best));

  return { outcome: asOutcome([outcome.home, outcome.draw, outcome.away]), scoreline };
}

export function predictMatch(homeElo: number, awayElo: number): MatchPrediction {
  const difference = homeElo - awayElo;
  const homeShare = 1 / (1 + Math.exp(-difference / 350));
  const homeExpected = Math.max(0.35, Math.min(2.8, TOURNAMENT_GOAL_BASELINE * homeShare));
  const awayExpected = Math.max(0.35, Math.min(2.8, TOURNAMENT_GOAL_BASELINE - homeExpected));
  const elo = eloProbabilities(homeElo, awayElo);
  const poissonResult = scoreModel(homeExpected, awayExpected, false);
  const dixonColesResult = scoreModel(homeExpected, awayExpected, true);
  const ensemble = asOutcome([
    (elo.home + poissonResult.outcome.home + dixonColesResult.outcome.home) / 3,
    (elo.draw + poissonResult.outcome.draw + dixonColesResult.outcome.draw) / 3,
    (elo.away + poissonResult.outcome.away + dixonColesResult.outcome.away) / 3
  ]);
  const modelValues = [elo, poissonResult.outcome, dixonColesResult.outcome];
  const disagreement = Math.max(
    ...(["home", "draw", "away"] as const).map((outcome) => {
      const values = modelValues.map((model) => model[outcome]);
      return Math.max(...values) - Math.min(...values);
    })
  );

  return {
    elo,
    poisson: poissonResult.outcome,
    dixonColes: dixonColesResult.outcome,
    ensemble,
    expectedGoals: { home: homeExpected, away: awayExpected },
    scoreline: dixonColesResult.scoreline,
    disagreement
  };
}
