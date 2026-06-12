import { json, rateLimit } from "@/lib/api";
export async function POST(request: Request) {
  const limited = rateLimit(request, 10);
  if (limited) return limited;
  return json(
    {
      title: "Simulation not published",
      status: 503,
      detail: "A calibrated production model and verified tournament inputs are required."
    },
    { status: 503, headers: { "cache-control": "no-store" } }
  );
}
