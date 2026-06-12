import type { DataProvider, FetchContext, ProviderHealth, ProviderResult } from "./index";

export type NewsQuery = { teamNames: string[]; since: string };
export type RawNewsItem = { id: string; title: string; url: string; publishedAt: string; source: string };
export type TrustedNewsItem = RawNewsItem & {
  credibility: number;
  verification: "official" | "corroborated" | "unverified";
};

export class NewsPlaceholderProvider implements DataProvider<NewsQuery, RawNewsItem, TrustedNewsItem> {
  readonly key = "news-placeholder";
  readonly category = "news" as const;

  async healthCheck(): Promise<ProviderHealth> {
    return {
      status: "degraded",
      checkedAt: new Date().toISOString(),
      message: "Configure an authorized news provider"
    };
  }

  async fetch(_query: NewsQuery, _context: FetchContext): Promise<ProviderResult<RawNewsItem>> {
    void _query;
    void _context;
    return {
      records: [],
      source: this.key,
      fetchedAt: new Date().toISOString(),
      cacheStatus: "stale",
      error: "No authorized news API configured"
    };
  }

  normalize(record: RawNewsItem): TrustedNewsItem[] {
    return [{ ...record, credibility: 0.25, verification: "unverified" }];
  }
}
