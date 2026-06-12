import { json, rateLimit } from "@/lib/api";
import { fetchWorldCupEvent } from "@/lib/live-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const limited = rateLimit(request);
  if (limited) return limited;
  const { matchId } = await params;
  try {
    const event = await fetchWorldCupEvent(matchId);
    return event
      ? json({ data: event, source: "TheSportsDB", fetchedAt: new Date().toISOString() })
      : json({ title: "Match not found", status: 404 }, { status: 404 });
  } catch {
    return json({ title: "Live provider unavailable", status: 503 }, { status: 503 });
  }
}
