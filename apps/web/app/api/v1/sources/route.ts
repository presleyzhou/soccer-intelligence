import { json, rateLimit } from "@/lib/api";
import { liveSources } from "@/lib/live-data";
export async function GET(request: Request) {
  const limited = rateLimit(request);
  if (limited) return limited;
  return json({ data: liveSources, generatedAt: new Date().toISOString() });
}
