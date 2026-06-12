import type { DataProvider, FetchContext, ProviderHealth, ProviderResult } from "./types.js";
import { fetchJson } from "./utils.js";
type Query = { competition: string; dateFrom?: string; dateTo?: string };
type RawMatch = { id: number; utcDate: string; status: string; homeTeam: { id: number; name: string }; awayTeam: { id: number; name: string } };
type Response = { matches: RawMatch[] };
export class FootballDataProvider implements DataProvider<Query, RawMatch, RawMatch> {
  readonly key = "football-data";
  readonly category = "football" as const;
  constructor(private readonly apiKey?: string) {}
  async healthCheck(): Promise<ProviderHealth> { return { status: this.apiKey ? "live" : "unavailable", checkedAt: new Date().toISOString(), message: this.apiKey ? undefined : "FOOTBALL_DATA_API_KEY not configured" }; }
  async fetch(query: Query, context: FetchContext): Promise<ProviderResult<RawMatch>> {
    if (!this.apiKey) return { status: "unavailable", source: this.key, fetchedAt: context.requestedAt, data: [], stale: false, error: "API key not configured" };
    const params = new URLSearchParams(); if (query.dateFrom) params.set("dateFrom", query.dateFrom); if (query.dateTo) params.set("dateTo", query.dateTo);
    try {
      const response = await fetchJson<Response>(`https://api.football-data.org/v4/competitions/${query.competition}/matches?${params}`, { headers: { "X-Auth-Token": this.apiKey }, signal: context.signal });
      return { status: "live", source: this.key, fetchedAt: new Date().toISOString(), data: response.matches, stale: false };
    } catch (error) { return { status: "unavailable", source: this.key, fetchedAt: new Date().toISOString(), data: [], stale: false, error: error instanceof Error ? error.message : "Unknown error" }; }
  }
  normalize(record: RawMatch): RawMatch[] { return [record]; }
}
