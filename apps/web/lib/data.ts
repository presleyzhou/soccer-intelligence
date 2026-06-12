import type { Advancement, Match, SourceDescriptor, Team } from "@wci/contracts";

export const teams: Team[] = [
  {
    id: "arg",
    code: "ARG",
    name: { en: "Argentina", zh: "阿根廷" },
    flag: "🇦🇷",
    fifaRank: 1,
    elo: 2144,
    form: "WWDWW",
    group: "J"
  },
  {
    id: "esp",
    code: "ESP",
    name: { en: "Spain", zh: "西班牙" },
    flag: "🇪🇸",
    fifaRank: 2,
    elo: 2110,
    form: "WWWWW",
    group: "H"
  },
  {
    id: "fra",
    code: "FRA",
    name: { en: "France", zh: "法国" },
    flag: "🇫🇷",
    fifaRank: 3,
    elo: 2097,
    form: "WDWWW",
    group: "I"
  },
  {
    id: "bra",
    code: "BRA",
    name: { en: "Brazil", zh: "巴西" },
    flag: "🇧🇷",
    fifaRank: 5,
    elo: 2028,
    form: "DWWLW",
    group: "C"
  },
  {
    id: "eng",
    code: "ENG",
    name: { en: "England", zh: "英格兰" },
    flag: "🏴",
    fifaRank: 4,
    elo: 2039,
    form: "WWDWW",
    group: "L"
  },
  {
    id: "ger",
    code: "GER",
    name: { en: "Germany", zh: "德国" },
    flag: "🇩🇪",
    fifaRank: 9,
    elo: 1996,
    form: "WWWDW",
    group: "E"
  },
  {
    id: "ned",
    code: "NED",
    name: { en: "Netherlands", zh: "荷兰" },
    flag: "🇳🇱",
    fifaRank: 7,
    elo: 1991,
    form: "WDWWW",
    group: "F"
  },
  {
    id: "por",
    code: "POR",
    name: { en: "Portugal", zh: "葡萄牙" },
    flag: "🇵🇹",
    fifaRank: 6,
    elo: 1988,
    form: "WWWDL",
    group: "K"
  },
  {
    id: "usa",
    code: "USA",
    name: { en: "United States", zh: "美国" },
    flag: "🇺🇸",
    fifaRank: 15,
    elo: 1841,
    form: "WLWDW",
    group: "D"
  },
  {
    id: "mex",
    code: "MEX",
    name: { en: "Mexico", zh: "墨西哥" },
    flag: "🇲🇽",
    fifaRank: 14,
    elo: 1812,
    form: "DWWDL",
    group: "A"
  },
  {
    id: "can",
    code: "CAN",
    name: { en: "Canada", zh: "加拿大" },
    flag: "🇨🇦",
    fifaRank: 28,
    elo: 1776,
    form: "WWDWL",
    group: "B"
  },
  {
    id: "jpn",
    code: "JPN",
    name: { en: "Japan", zh: "日本" },
    flag: "🇯🇵",
    fifaRank: 17,
    elo: 1875,
    form: "WWWWW",
    group: "F"
  }
];

const modelTimestamp = "2026-06-12T16:00:00Z";

export const matches: Match[] = [
  {
    id: "match-arg-esp",
    tournamentId: "wc-2026",
    homeTeamId: "arg",
    awayTeamId: "esp",
    kickoffAt: "2026-06-13T19:00:00Z",
    venue: { en: "Liberty Field", zh: "自由球场" },
    city: { en: "New York / New Jersey", zh: "纽约 / 新泽西" },
    stage: "GROUP",
    group: "J",
    status: "SCHEDULED",
    attention: 98,
    prediction: {
      home: 0.346,
      draw: 0.292,
      away: 0.362,
      homeXg: 1.31,
      awayXg: 1.36,
      confidence: 0.74,
      scorelines: [
        { home: 1, away: 1, probability: 0.126 },
        { home: 0, away: 1, probability: 0.096 },
        { home: 1, away: 0, probability: 0.092 },
        { home: 1, away: 2, probability: 0.086 },
        { home: 2, away: 1, probability: 0.083 }
      ],
      bothTeamsScore: 0.546,
      over25: 0.493,
      extraTime: 0,
      penalties: 0,
      updatedAt: modelTimestamp,
      models: [
        { model: "Elo", home: 0.35, draw: 0.29, away: 0.36 },
        { model: "Dixon-Coles", home: 0.34, draw: 0.3, away: 0.36 },
        { model: "Gradient Boosting", home: 0.37, draw: 0.27, away: 0.36 },
        { model: "Market consensus", home: 0.33, draw: 0.29, away: 0.38 },
        { model: "Ensemble", home: 0.346, draw: 0.292, away: 0.362 }
      ]
    },
    weather: { temperatureC: 24, condition: { en: "Partly cloudy", zh: "局部多云" }, windKph: 12 },
    context: { restDaysHome: 6, restDaysAway: 6, travelKmHome: 6800, travelKmAway: 5800, referee: "To be confirmed" }
  },
  {
    id: "match-usa-ger",
    tournamentId: "wc-2026",
    homeTeamId: "usa",
    awayTeamId: "ger",
    kickoffAt: "2026-06-14T01:00:00Z",
    venue: { en: "Pacific Arena", zh: "太平洋竞技场" },
    city: { en: "Seattle", zh: "西雅图" },
    stage: "GROUP",
    group: "D",
    status: "SCHEDULED",
    attention: 92,
    prediction: {
      home: 0.274,
      draw: 0.267,
      away: 0.459,
      homeXg: 1.16,
      awayXg: 1.55,
      confidence: 0.71,
      scorelines: [
        { home: 1, away: 1, probability: 0.119 },
        { home: 0, away: 1, probability: 0.103 },
        { home: 1, away: 2, probability: 0.092 },
        { home: 0, away: 2, probability: 0.08 },
        { home: 1, away: 0, probability: 0.077 }
      ],
      bothTeamsScore: 0.535,
      over25: 0.511,
      extraTime: 0,
      penalties: 0,
      updatedAt: modelTimestamp,
      models: [
        { model: "Elo", home: 0.27, draw: 0.27, away: 0.46 },
        { model: "Dixon-Coles", home: 0.28, draw: 0.28, away: 0.44 },
        { model: "Market consensus", home: 0.25, draw: 0.26, away: 0.49 },
        { model: "Ensemble", home: 0.274, draw: 0.267, away: 0.459 }
      ]
    },
    weather: { temperatureC: 18, condition: { en: "Light rain", zh: "小雨" }, windKph: 9 },
    context: { restDaysHome: 7, restDaysAway: 6, travelKmHome: 0, travelKmAway: 8100, referee: "To be confirmed" }
  },
  {
    id: "match-bra-fra",
    tournamentId: "wc-2026",
    homeTeamId: "bra",
    awayTeamId: "fra",
    kickoffAt: "2026-06-15T22:00:00Z",
    venue: { en: "Lone Star Stadium", zh: "孤星球场" },
    city: { en: "Dallas", zh: "达拉斯" },
    stage: "GROUP",
    group: "C",
    status: "SCHEDULED",
    attention: 96,
    prediction: {
      home: 0.355,
      draw: 0.279,
      away: 0.366,
      homeXg: 1.38,
      awayXg: 1.42,
      confidence: 0.69,
      scorelines: [
        { home: 1, away: 1, probability: 0.122 },
        { home: 1, away: 2, probability: 0.087 },
        { home: 2, away: 1, probability: 0.084 },
        { home: 0, away: 1, probability: 0.083 },
        { home: 1, away: 0, probability: 0.081 }
      ],
      bothTeamsScore: 0.568,
      over25: 0.531,
      extraTime: 0,
      penalties: 0,
      updatedAt: modelTimestamp,
      models: [
        { model: "Elo", home: 0.34, draw: 0.28, away: 0.38 },
        { model: "Dixon-Coles", home: 0.36, draw: 0.29, away: 0.35 },
        { model: "Gradient Boosting", home: 0.37, draw: 0.26, away: 0.37 },
        { model: "Ensemble", home: 0.355, draw: 0.279, away: 0.366 }
      ]
    },
    weather: { temperatureC: 29, condition: { en: "Warm and clear", zh: "晴朗温暖" }, windKph: 15 },
    context: { restDaysHome: 5, restDaysAway: 5, travelKmHome: 7800, travelKmAway: 7900, referee: "To be confirmed" }
  },
  {
    id: "match-jpn-ned",
    tournamentId: "wc-2026",
    homeTeamId: "jpn",
    awayTeamId: "ned",
    kickoffAt: "2026-06-16T19:00:00Z",
    venue: { en: "Maple Stadium", zh: "枫叶球场" },
    city: { en: "Toronto", zh: "多伦多" },
    stage: "GROUP",
    group: "F",
    status: "SCHEDULED",
    attention: 81,
    prediction: {
      home: 0.291,
      draw: 0.276,
      away: 0.433,
      homeXg: 1.19,
      awayXg: 1.48,
      confidence: 0.66,
      scorelines: [
        { home: 1, away: 1, probability: 0.123 },
        { home: 0, away: 1, probability: 0.102 },
        { home: 1, away: 2, probability: 0.091 },
        { home: 1, away: 0, probability: 0.083 },
        { home: 0, away: 2, probability: 0.075 }
      ],
      bothTeamsScore: 0.528,
      over25: 0.495,
      extraTime: 0,
      penalties: 0,
      updatedAt: modelTimestamp,
      models: [
        { model: "Elo", home: 0.29, draw: 0.27, away: 0.44 },
        { model: "Dixon-Coles", home: 0.3, draw: 0.29, away: 0.41 },
        { model: "Ensemble", home: 0.291, draw: 0.276, away: 0.433 }
      ]
    },
    weather: { temperatureC: 21, condition: { en: "Clear", zh: "晴" }, windKph: 8 },
    context: { restDaysHome: 6, restDaysAway: 7, travelKmHome: 10300, travelKmAway: 6000, referee: "To be confirmed" }
  }
];

export const advancement: Advancement[] = [
  {
    teamId: "arg",
    roundOf32: 0.91,
    roundOf16: 0.72,
    quarterFinal: 0.52,
    semiFinal: 0.35,
    final: 0.22,
    champion: 0.132
  },
  {
    teamId: "esp",
    roundOf32: 0.92,
    roundOf16: 0.74,
    quarterFinal: 0.55,
    semiFinal: 0.38,
    final: 0.24,
    champion: 0.149
  },
  { teamId: "fra", roundOf32: 0.9, roundOf16: 0.72, quarterFinal: 0.53, semiFinal: 0.36, final: 0.23, champion: 0.141 },
  {
    teamId: "bra",
    roundOf32: 0.88,
    roundOf16: 0.68,
    quarterFinal: 0.48,
    semiFinal: 0.31,
    final: 0.19,
    champion: 0.112
  },
  {
    teamId: "eng",
    roundOf32: 0.89,
    roundOf16: 0.69,
    quarterFinal: 0.49,
    semiFinal: 0.32,
    final: 0.19,
    champion: 0.108
  },
  {
    teamId: "ger",
    roundOf32: 0.86,
    roundOf16: 0.64,
    quarterFinal: 0.43,
    semiFinal: 0.27,
    final: 0.15,
    champion: 0.082
  },
  {
    teamId: "ned",
    roundOf32: 0.84,
    roundOf16: 0.61,
    quarterFinal: 0.39,
    semiFinal: 0.23,
    final: 0.12,
    champion: 0.061
  },
  { teamId: "por", roundOf32: 0.85, roundOf16: 0.62, quarterFinal: 0.4, semiFinal: 0.24, final: 0.13, champion: 0.067 },
  { teamId: "usa", roundOf32: 0.68, roundOf16: 0.39, quarterFinal: 0.2, semiFinal: 0.09, final: 0.04, champion: 0.017 },
  { teamId: "jpn", roundOf32: 0.7, roundOf16: 0.42, quarterFinal: 0.22, semiFinal: 0.1, final: 0.04, champion: 0.016 }
];

export const sources: SourceDescriptor[] = [
  {
    id: "mock-fixtures",
    name: "WCI versioned mock fixtures",
    category: "football",
    status: "mock",
    updatedAt: modelTimestamp
  },
  { id: "elo", name: "International Elo baseline", category: "rating", status: "mock", updatedAt: modelTimestamp },
  { id: "market", name: "Market consensus adapter", category: "market", status: "mock", updatedAt: modelTimestamp },
  {
    id: "weather",
    name: "Open-Meteo adapter",
    category: "weather",
    status: "mock",
    updatedAt: modelTimestamp,
    url: "https://open-meteo.com/"
  },
  { id: "model", name: "WCI ensemble v0.1.0", category: "model", status: "live", updatedAt: modelTimestamp }
];

export const modelMetrics = {
  logLoss: 0.946,
  brier: 0.592,
  rps: 0.184,
  accuracy: 0.534,
  ece: 0.031,
  sampleSize: 1248,
  windows: [
    { window: "2023 H2", ensemble: 0.194, market: 0.192 },
    { window: "2024 H1", ensemble: 0.188, market: 0.19 },
    { window: "2024 H2", ensemble: 0.185, market: 0.187 },
    { window: "2025 H1", ensemble: 0.181, market: 0.184 },
    { window: "2025 H2", ensemble: 0.179, market: 0.182 }
  ]
};

export function getTeam(id: string): Team {
  const team = teams.find((item) => item.id === id);
  if (!team) throw new Error(`Unknown team: ${id}`);
  return team;
}

export function getMatch(id: string): Match | undefined {
  return matches.find((match) => match.id === id);
}
