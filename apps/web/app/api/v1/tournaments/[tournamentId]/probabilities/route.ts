import { json, rateLimit } from "@/lib/api";
import { createTournamentSimulation } from "@/lib/server-tournament";

export async function GET(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;
  try {
    const payload = await createTournamentSimulation(10_000);
    return json(payload, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return json(
      {
        title: "Tournament probabilities unavailable",
        status: 503,
        detail: error instanceof Error ? error.message : "Tournament inputs unavailable"
      },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
