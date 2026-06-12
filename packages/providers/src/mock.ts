import type { DataProvider, FetchContext, ProviderHealth, ProviderResult } from "./types.js";
export class MockProvider<T> implements DataProvider<Record<string, never>, T, T> {
  readonly key = "mock";
  readonly category = "football" as const;
  constructor(private readonly records: T[]) {}
  async healthCheck(): Promise<ProviderHealth> { return { status: "mock", checkedAt: new Date().toISOString() }; }
  async fetch(_query: Record<string, never>, context: FetchContext): Promise<ProviderResult<T>> {
    return { status: "mock", source: this.key, fetchedAt: context.requestedAt, data: this.records, stale: false };
  }
  normalize(record: T): T[] { return [record]; }
}
