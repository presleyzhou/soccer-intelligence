import { NextResponse } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: Request, limit = 30, windowMs = 60_000): NextResponse | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const key = forwarded?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (bucket.count >= limit) {
    return NextResponse.json({ title: "Too Many Requests", status: 429 }, { status: 429 });
  }
  bucket.count += 1;
  return null;
}

export function json(data: unknown, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, {
    ...init,
    headers: {
      "cache-control": "public, max-age=30, stale-while-revalidate=300",
      ...init?.headers
    }
  });
}
