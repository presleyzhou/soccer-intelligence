export type LiveFootballEvent = {
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
  strLeague: string;
  idLeague: string;
};

type EventsResponse = { events: LiveFootballEvent[] | null };

const SPORTS_DB_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const WORLD_CUP_LEAGUE_ID = "4429";

function dateString(offset: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export async function fetchWorldCupEvents(): Promise<{
  data: LiveFootballEvent[];
  fetchedAt: string;
  source: string;
}> {
  const responses = await Promise.all(
    [-1, 0, 1, 2, 3].map(async (offset) => {
      const response = await fetch(
        `${SPORTS_DB_BASE}/eventsday.php?d=${dateString(offset)}&l=${WORLD_CUP_LEAGUE_ID}`,
        { cache: "no-store", signal: AbortSignal.timeout(6000) }
      );
      if (!response.ok) throw new Error(`TheSportsDB returned ${response.status}`);
      return (await response.json()) as EventsResponse;
    })
  );
  const unique = new Map<string, LiveFootballEvent>();
  responses.flatMap((response) => response.events ?? []).forEach((event) => unique.set(event.idEvent, event));
  return {
    data: [...unique.values()].sort((left, right) =>
      (left.strTimestamp ?? "").localeCompare(right.strTimestamp ?? "")
    ),
    fetchedAt: new Date().toISOString(),
    source: "TheSportsDB"
  };
}

export async function fetchWorldCupEvent(id: string): Promise<LiveFootballEvent | undefined> {
  const response = await fetch(`${SPORTS_DB_BASE}/lookupevent.php?id=${encodeURIComponent(id)}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(6000)
  });
  if (!response.ok) throw new Error(`TheSportsDB returned ${response.status}`);
  const payload = (await response.json()) as EventsResponse;
  const event = payload.events?.[0];
  return event?.idLeague === WORLD_CUP_LEAGUE_ID ? event : undefined;
}

export const liveSources = [
  {
    id: "thesportsdb",
    name: "TheSportsDB",
    category: "football",
    status: "live",
    url: "https://www.thesportsdb.com/documentation"
  },
  {
    id: "polymarket",
    name: "Polymarket Gamma API",
    category: "market",
    status: "live",
    url: "https://docs.polymarket.com/developers/gamma-markets-api/overview"
  }
] as const;
