import type { DataProvider, FetchContext, ProviderHealth, ProviderResult } from "./index";
import { withRetry } from "./index";

type PolymarketQuery = { limit?: number; active?: boolean };
type RawMarket = Record<string, unknown>;
export type NormalizedMarket = {
  externalId: string;
  question: string;
  bestBid?: number;
  bestAsk?: number;
  volume: number;
  liquidity: number;
  observedAt: string;
};

function numberValue(value: unknown): number | undefined {
  const result = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(result) ? result : undefined;
}

export class PolymarketProvider implements DataProvider<PolymarketQuery, RawMarket, NormalizedMarket> {
  readonly key = "polymarket";
  readonly category = "market" as const;

  constructor(private readonly baseUrl = process.env.POLYMARKET_API_BASE_URL ?? "https://gamma-api.polymarket.com") {}

  async healthCheck(): Promise<ProviderHealth> {
    try {
      const response = await fetch(`${this.baseUrl}/markets?limit=1`, { signal: AbortSignal.timeout(3000) });
      return {
        status: response.ok ? "healthy" : "degraded",
        checkedAt: new Date().toISOString(),
        message: `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        status: "unavailable",
        checkedAt: new Date().toISOString(),
        message: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  async fetch(query: PolymarketQuery, context: FetchContext): Promise<ProviderResult<RawMarket>> {
    const params = new URLSearchParams({
      limit: String(query.limit ?? 100),
      active: String(query.active ?? true),
      closed: "false"
    });
    const response = await withRetry(() =>
      fetch(`${this.baseUrl}/markets?${params}`, {
        signal: context.signal ?? AbortSignal.timeout(5000),
        headers: { accept: "application/json", "user-agent": "world-cup-intelligence/0.1" }
      })
    );
    if (!response.ok) throw new Error(`Polymarket request failed: ${response.status}`);
    const payload: unknown = await response.json();
    return {
      records: Array.isArray(payload)
        ? payload.filter((item): item is RawMarket => Boolean(item && typeof item === "object"))
        : [],
      source: this.key,
      fetchedAt: new Date().toISOString(),
      cacheStatus: "miss"
    };
  }

  normalize(record: RawMarket): NormalizedMarket[] {
    const question = typeof record.question === "string" ? record.question : undefined;
    const id =
      typeof record.id === "string"
        ? record.id
        : typeof record.conditionId === "string"
          ? record.conditionId
          : undefined;
    if (!question || !id) return [];
    return [
      {
        externalId: id,
        question,
        bestBid: numberValue(record.bestBid),
        bestAsk: numberValue(record.bestAsk),
        volume: numberValue(record.volumeNum) ?? numberValue(record.volume) ?? 0,
        liquidity: numberValue(record.liquidityNum) ?? numberValue(record.liquidity) ?? 0,
        observedAt: new Date().toISOString()
      }
    ];
  }
}
