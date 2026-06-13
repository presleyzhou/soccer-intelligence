import { json, rateLimit } from "@/lib/api";
import { createTournamentSimulation } from "@/lib/server-tournament";

export async function POST(request: Request) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      iterations?: number;
      teamAdjustments?: Record<string, number>;
    };
    const payload = await createTournamentSimulation(
      Number.isFinite(body.iterations) ? Number(body.iterations) : 10_000,
      body.teamAdjustments
    );
    return json(payload, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return json(
      {
        title: "Simulation unavailable",
        status: 503,
        detail: error instanceof Error ? error.message : "Tournament inputs unavailable"
      },
      { status: 503, headers: { "cache-control": "no-store" } }
    );
  }
}
