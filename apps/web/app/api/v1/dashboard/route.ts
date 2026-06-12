import { json, rateLimit } from "@/lib/api";
import { fetchWorldCupEvents, liveSources } from "@/lib/live-data";

export async function GET(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;
  try {
    const events = await fetchWorldCupEvents();
    return json({
      matches: events.data,
      fetchedAt: events.fetchedAt,
      source: events.source,
      predictions: null,
      predictionStatus: "not-published",
      sources: liveSources
    });
  } catch {
    return json(
      { matches: [], predictions: null, predictionStatus: "not-published", status: "unavailable" },
      { status: 503 }
    );
  }
}
