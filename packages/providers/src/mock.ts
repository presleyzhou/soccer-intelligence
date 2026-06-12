import type { DataProvider, FetchContext, ProviderHealth, ProviderResult } from "./index";

export class MockProvider<T> implements DataProvider<void, T, T> {
  readonly key = "mock";
  readonly category = "football" as const;

  constructor(private readonly records: T[]) {}

  async healthCheck(): Promise<ProviderHealth> {
    return { status: "healthy", checkedAt: new Date().toISOString() };
  }

  async fetch(_query: void, _context: FetchContext): Promise<ProviderResult<T>> {
    void _query;
    void _context;
    return { records: this.records, source: this.key, fetchedAt: new Date().toISOString(), cacheStatus: "hit" };
  }

  normalize(record: T): T[] {
    return [record];
  }
}
