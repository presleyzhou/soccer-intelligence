export type ProviderCategory = "football" | "odds" | "market" | "news" | "social" | "weather";
export type ProviderStatus = "healthy" | "degraded" | "unavailable";

export type FetchContext = {
  requestedAt: string;
  predictionCutoff: string;
  signal?: AbortSignal;
};

export type ProviderHealth = {
  status: ProviderStatus;
  checkedAt: string;
  message?: string;
};

export type ProviderResult<TRecord> = {
  records: TRecord[];
  source: string;
  fetchedAt: string;
  observedAt?: string;
  cacheStatus: "hit" | "miss" | "stale";
  licenseUrl?: string;
  error?: string;
};

export interface DataProvider<TQuery, TRecord, TNormalized> {
  readonly key: string;
  readonly category: ProviderCategory;
  healthCheck(): Promise<ProviderHealth>;
  fetch(query: TQuery, context: FetchContext): Promise<ProviderResult<TRecord>>;
  normalize(record: TRecord): TNormalized[];
}

export async function withRetry<T>(operation: () => Promise<T>, attempts = 3, baseDelayMs = 150): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) {
        await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt + Math.random() * 50));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Provider operation failed");
}

export function impliedProbability(decimalOdds: number): number {
  if (!Number.isFinite(decimalOdds) || decimalOdds <= 1) throw new Error("Decimal odds must be greater than 1");
  return 1 / decimalOdds;
}

export function removeOverround(decimalOdds: readonly number[]): number[] {
  const raw = decimalOdds.map(impliedProbability);
  const total = raw.reduce((sum, value) => sum + value, 0);
  return raw.map((value) => value / total);
}
