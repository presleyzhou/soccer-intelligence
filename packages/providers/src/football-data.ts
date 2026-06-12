import type { DataProvider, FetchContext, ProviderHealth, ProviderResult } from "./index";
import { withRetry } from "./index";

type FootballQuery = { dateFrom?: string; dateTo?: string; competition?: string };
type RawMatch = Record<string, unknown>;
export type NormalizedFixture = {
  externalId: string;
  kickoffAt: string;
  status: string;
  homeName: string;
  awayName: string;
};

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

export class FootballDataProvider implements DataProvider<FootballQuery, RawMatch, NormalizedFixture> {
  readonly key = "football-data";
  readonly category = "football" as const;

  constructor(
    private readonly apiKey = process.env.FOOTBALL_DATA_API_KEY,
    private readonly baseUrl = "https://api.football-data.org/v4"
  ) {}

  async healthCheck(): Promise<ProviderHealth> {
    if (!this.apiKey)
      return {
        status: "unavailable",
        checkedAt: new Date().toISOString(),
        message: "FOOTBALL_DATA_API_KEY is not configured"
      };
    return { status: "healthy", checkedAt: new Date().toISOString() };
  }

  async fetch(query: FootballQuery, context: FetchContext): Promise<ProviderResult<RawMatch>> {
    if (!this.apiKey) throw new Error("FOOTBALL_DATA_API_KEY is not configured");
    const params = new URLSearchParams();
    if (query.dateFrom) params.set("dateFrom", query.dateFrom);
    if (query.dateTo) params.set("dateTo", query.dateTo);
    if (query.competition) params.set("competitions", query.competition);
    const response = await withRetry(() =>
      fetch(`${this.baseUrl}/matches?${params}`, {
        signal: context.signal ?? AbortSignal.timeout(5000),
        headers: { "X-Auth-Token": this.apiKey ?? "" }
      })
    );
    if (!response.ok) throw new Error(`football-data request failed: ${response.status}`);
    const payload = objectValue(await response.json());
    const matches = payload?.matches;
    return {
      records: Array.isArray(matches)
        ? matches.filter((item): item is RawMatch => Boolean(item && typeof item === "object"))
        : [],
      source: this.key,
      fetchedAt: new Date().toISOString(),
      cacheStatus: "miss",
      licenseUrl: "https://www.football-data.org/"
    };
  }

  normalize(record: RawMatch): NormalizedFixture[] {
    const home = objectValue(record.homeTeam);
    const away = objectValue(record.awayTeam);
    const id = record.id;
    const kickoffAt = record.utcDate;
    if (
      (typeof id !== "number" && typeof id !== "string") ||
      typeof kickoffAt !== "string" ||
      typeof home?.name !== "string" ||
      typeof away?.name !== "string"
    )
      return [];
    return [
      {
        externalId: String(id),
        kickoffAt,
        status: typeof record.status === "string" ? record.status : "UNKNOWN",
        homeName: home.name,
        awayName: away.name
      }
    ];
  }
}
