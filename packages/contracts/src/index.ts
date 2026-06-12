export type Locale = "en" | "zh";
export type MatchStage = "GROUP" | "ROUND_OF_32" | "ROUND_OF_16" | "QUARTER_FINAL" | "SEMI_FINAL" | "FINAL";
export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";

export type Team = {
  id: string;
  code: string;
  name: Record<Locale, string>;
  flag: string;
  fifaRank: number;
  elo: number;
  form: string;
  group: string;
};

export type Scoreline = {
  home: number;
  away: number;
  probability: number;
};

export type ModelProbability = {
  model: string;
  home: number;
  draw: number;
  away: number;
};

export type MatchPrediction = {
  home: number;
  draw: number;
  away: number;
  homeXg: number;
  awayXg: number;
  confidence: number;
  scorelines: Scoreline[];
  bothTeamsScore: number;
  over25: number;
  extraTime: number;
  penalties: number;
  updatedAt: string;
  models: ModelProbability[];
};

export type Match = {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: string;
  venue: Record<Locale, string>;
  city: Record<Locale, string>;
  stage: MatchStage;
  group?: string;
  status: MatchStatus;
  attention: number;
  prediction: MatchPrediction;
  weather: {
    temperatureC: number;
    condition: Record<Locale, string>;
    windKph: number;
  };
  context: {
    restDaysHome: number;
    restDaysAway: number;
    travelKmHome: number;
    travelKmAway: number;
    referee: string;
  };
};

export type Advancement = {
  teamId: string;
  roundOf32: number;
  roundOf16: number;
  quarterFinal: number;
  semiFinal: number;
  final: number;
  champion: number;
};

export type SourceDescriptor = {
  id: string;
  name: string;
  category: "football" | "rating" | "market" | "weather" | "news" | "model";
  status: "live" | "mock" | "stale" | "unavailable";
  updatedAt: string;
  url?: string;
};

export type ChatRequest = {
  language: Locale;
  message: string;
  matchId?: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
};

export type ChatResponse = {
  answer: string;
  relatedMatches: Array<{
    id: string;
    homeTeam: string;
    awayTeam: string;
    kickoffAt: string;
  }>;
  sources: Array<{
    id: string;
    title: string;
    url?: string;
    sourceType: "fact" | "model" | "market" | "news";
    observedAt: string;
  }>;
  modelTimestamp: string;
  disclaimer: string;
};

export function normalizeProbabilities(values: readonly number[]): number[] {
  const sanitized = values.map((value) => Math.max(0, Number.isFinite(value) ? value : 0));
  const total = sanitized.reduce((sum, value) => sum + value, 0);
  if (total === 0) {
    return sanitized.map(() => 1 / sanitized.length);
  }
  return sanitized.map((value) => value / total);
}
