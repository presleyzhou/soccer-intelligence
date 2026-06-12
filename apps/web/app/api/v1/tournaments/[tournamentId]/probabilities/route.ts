import { json, rateLimit } from "@/lib/api";
export async function GET(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;
  return json(
    {
      title: "Tournament probabilities not published",
      status: 503,
      detail: "No verified and calibrated production model is currently available."
    },
    { status: 503, headers: { "cache-control": "no-store" } }
  );
}
