import { json, rateLimit } from "@/lib/api";
import { fetchWorldCupEvents } from "@/lib/live-data";

export async function GET(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;
  try {
    const payload = await fetchWorldCupEvents();
    return json(payload, { headers: { "cache-control": "public, max-age=30" } });
  } catch {
    return json(
      { data: [], source: "TheSportsDB", status: "unavailable", error: "Live provider unavailable" },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
