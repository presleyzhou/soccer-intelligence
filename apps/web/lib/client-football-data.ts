export type SportsDbEvent = {
  idEvent: string;
  strTimestamp: string | null;
  strEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  strStatus: string | null;
  strGroup: string | null;
  strVenue: string | null;
  strCity: string | null;
  strCountry: string | null;
  strHomeTeamBadge: string | null;
  strAwayTeamBadge: string | null;
};

type EspnTeam = {
  homeAway: "home" | "away";
  score?: string;
  team: {
    displayName: string;
    logo?: string;
  };
};

type EspnEvent = {
  id: string;
  date: string;
  status: {
    type: {
      state: "pre" | "in" | "post";
      completed: boolean;
      shortDetail?: string;
    };
  };
  competitions: Array<{
    altGameNote?: string;
    competitors: EspnTeam[];
    venue?: {
      fullName?: string;
      address?: { city?: string; country?: string };
    };
  }>;
};

type EspnResponse = { events?: EspnEvent[] };
type CacheEntry = {
  expiresAt: number;
  request: Promise<SportsDbEvent[]>;
};

const ESPN_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
const CACHE_DURATION_MS = 45_000;
const requestCache = new Map<string, CacheEntry>();

export function utcDateWithOffset(offset: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function compactDate(value: string): string {
  return value.replaceAll("-", "");
}

function mapStatus(event: EspnEvent): string | null {
  if (event.status.type.completed || event.status.type.state === "post") return "FT";
  if (event.status.type.state === "in") return event.status.type.shortDetail ?? "LIVE";
  return null;
}

function mapEvent(event: EspnEvent): SportsDbEvent | undefined {
  const competition = event.competitions[0];
  if (!competition) return undefined;
  const home = competition.competitors.find((competitor) => competitor.homeAway === "home");
  const away = competition.competitors.find((competitor) => competitor.homeAway === "away");
  if (!home || !away) return undefined;
  const group = competition.altGameNote?.match(/Group\s+([A-Z])/i)?.[1] ?? null;

  return {
    idEvent: event.id,
    strTimestamp: event.date.replace(/Z$/, ""),
    strEvent: `${home.team.displayName} vs ${away.team.displayName}`,
    strHomeTeam: home.team.displayName,
    strAwayTeam: away.team.displayName,
    intHomeScore: event.status.type.state === "pre" ? null : (home.score ?? null),
    intAwayScore: event.status.type.state === "pre" ? null : (away.score ?? null),
    strStatus: mapStatus(event),
    strGroup: group,
    strVenue: competition.venue?.fullName ?? null,
    strCity: competition.venue?.address?.city ?? null,
    strCountry: competition.venue?.address?.country ?? null,
    strHomeTeamBadge: home.team.logo ?? null,
    strAwayTeamBadge: away.team.logo ?? null
  };
}

export async function fetchWorldCupDates(dates: string[]): Promise<SportsDbEvent[]> {
  const sortedDates = [...dates].sort();
  const start = sortedDates[0];
  const end = sortedDates.at(-1);
  if (!start || !end) return [];
  const cacheKey = `${start}:${end}`;
  const cached = requestCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.request;

  const request = fetch(`${ESPN_SCOREBOARD}?dates=${compactDate(start)}-${compactDate(end)}&limit=100`, {
    cache: "no-store"
  })
    .then(async (response) => {
      if (!response.ok) throw new Error(`ESPN returned ${response.status}`);
      const payload = (await response.json()) as EspnResponse;
      return (payload.events ?? []).flatMap((event) => {
        const mapped = mapEvent(event);
        return mapped ? [mapped] : [];
      });
    })
    .catch((error: unknown) => {
      requestCache.delete(cacheKey);
      throw error;
    });

  requestCache.set(cacheKey, {
    expiresAt: Date.now() + CACHE_DURATION_MS,
    request
  });
  return request;
}
