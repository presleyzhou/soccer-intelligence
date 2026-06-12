export type MarketOpportunity = {
  id: string;
  question: string;
  outcome: string;
  modelProbability: number;
  bestAsk: number;
  bestBid: number;
  volume: number;
  liquidity: number;
  source: "polymarket" | "mock";
  updatedAt: string;
};

export const fallbackMarkets: MarketOpportunity[] = [
  {
    id: "mock-spain-champion",
    question: "Will Spain win the 2026 World Cup?",
    outcome: "Yes",
    modelProbability: 0.149,
    bestAsk: 0.137,
    bestBid: 0.128,
    volume: 384000,
    liquidity: 92000,
    source: "mock",
    updatedAt: "2026-06-12T16:00:00Z"
  },
  {
    id: "mock-france-champion",
    question: "Will France win the 2026 World Cup?",
    outcome: "Yes",
    modelProbability: 0.141,
    bestAsk: 0.151,
    bestBid: 0.142,
    volume: 417000,
    liquidity: 104000,
    source: "mock",
    updatedAt: "2026-06-12T16:00:00Z"
  },
  {
    id: "mock-argentina-champion",
    question: "Will Argentina win the 2026 World Cup?",
    outcome: "Yes",
    modelProbability: 0.132,
    bestAsk: 0.126,
    bestBid: 0.117,
    volume: 512000,
    liquidity: 126000,
    source: "mock",
    updatedAt: "2026-06-12T16:00:00Z"
  }
];

export function marketEdge(market: MarketOpportunity): number {
  return market.modelProbability - market.bestAsk;
}

export function conservativeEdge(market: MarketOpportunity, feeRate = 0.01, uncertaintyBuffer = 0.015): number {
  return market.modelProbability - market.bestAsk - feeRate - uncertaintyBuffer;
}

export function suggestedFraction(market: MarketOpportunity): number {
  const edge = conservativeEdge(market);
  if (edge <= 0 || market.bestAsk <= 0 || market.bestAsk >= 1) return 0;
  const fullKelly = edge / (1 - market.bestAsk);
  return Math.min(0.02, Math.max(0, fullKelly * 0.25));
}
