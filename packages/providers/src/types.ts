export type ProviderCategory = "football" | "odds" | "market" | "news" | "social" | "weather";
export type ProviderStatus = "live" | "stale" | "degraded" | "unavailable" | "mock";
export type FetchContext = { requestedAt: string; signal?: AbortSignal };
export type ProviderHealth = { status: ProviderStatus; checkedAt: string; message?: string };
export type ProviderResult<T> = {
  status: ProviderStatus;
  source: string;
  fetchedAt: string;
  observedAt?: string;
  data: T[];
  stale: boolean;
  error?: string;
};
export interface DataProvider<Q, R, N> {
  readonly key: string;
  readonly category: ProviderCategory;
  healthCheck(): Promise<ProviderHealth>;
  fetch(query: Q, context: FetchContext): Promise<ProviderResult<R>>;
  normalize(record: R): N[];
}
