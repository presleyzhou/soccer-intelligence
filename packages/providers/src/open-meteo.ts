import type { DataProvider, FetchContext, ProviderHealth, ProviderResult } from "./index";

type WeatherQuery = { latitude: number; longitude: number; timezone?: string };
type RawWeather = Record<string, unknown>;
export type NormalizedWeather = {
  observedAt: string;
  temperatureC?: number;
  humidity?: number;
  precipitationMm?: number;
  windKph?: number;
};

function recordValue(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;
}

function firstNumber(record: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = record?.[key];
  if (!Array.isArray(value)) return undefined;
  const first = value[0];
  return typeof first === "number" ? first : undefined;
}

export class OpenMeteoProvider implements DataProvider<WeatherQuery, RawWeather, NormalizedWeather> {
  readonly key = "open-meteo";
  readonly category = "weather" as const;

  constructor(private readonly baseUrl = process.env.OPEN_METEO_BASE_URL ?? "https://api.open-meteo.com/v1") {}

  async healthCheck(): Promise<ProviderHealth> {
    return { status: "healthy", checkedAt: new Date().toISOString() };
  }

  async fetch(query: WeatherQuery, context: FetchContext): Promise<ProviderResult<RawWeather>> {
    const params = new URLSearchParams({
      latitude: String(query.latitude),
      longitude: String(query.longitude),
      hourly: "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m",
      forecast_days: "1",
      timezone: query.timezone ?? "UTC"
    });
    const response = await fetch(`${this.baseUrl}/forecast?${params}`, {
      signal: context.signal ?? AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error(`Open-Meteo request failed: ${response.status}`);
    const record = (await response.json()) as RawWeather;
    return {
      records: [record],
      source: this.key,
      fetchedAt: new Date().toISOString(),
      cacheStatus: "miss",
      licenseUrl: "https://open-meteo.com/"
    };
  }

  normalize(record: RawWeather): NormalizedWeather[] {
    const hourly = recordValue(record.hourly);
    const times = hourly?.time;
    return [
      {
        observedAt: Array.isArray(times) && typeof times[0] === "string" ? times[0] : new Date().toISOString(),
        temperatureC: firstNumber(hourly, "temperature_2m"),
        humidity: firstNumber(hourly, "relative_humidity_2m"),
        precipitationMm: firstNumber(hourly, "precipitation"),
        windKph: firstNumber(hourly, "wind_speed_10m")
      }
    ];
  }
}
