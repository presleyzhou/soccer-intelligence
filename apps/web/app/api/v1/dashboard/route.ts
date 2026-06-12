import { advancement, matches, modelMetrics, sources, teams } from "@/lib/data";
import { json, rateLimit } from "@/lib/api";
export async function GET(request: Request) {
  const limited = rateLimit(request); if (limited) return limited;
  return json({ featuredMatch: matches[0], matches, teams, advancement, modelMetrics, sources });
}
