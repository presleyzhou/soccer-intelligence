import { NextRequest, NextResponse } from "next/server";
import { advancement } from "@/lib/data";
import { allowRequest } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "local";
  if (!allowRequest(`simulation:${forwarded}`, 10, 60_000))
    return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const iterations = Math.max(50_000, Math.min(500_000, Number(body.iterations) || 50_000));
  return NextResponse.json({
    id: crypto.randomUUID(),
    status: "completed",
    iterations,
    seed: Number(body.seed) || 20260612,
    results: advancement,
    disclaimer:
      "Preview endpoint uses the current versioned baseline. Production model service runs score-by-score simulation."
  });
}
