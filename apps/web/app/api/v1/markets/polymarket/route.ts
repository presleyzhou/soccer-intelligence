import { NextResponse } from "next/server";

type RawMarket = { question?: string; title?: string };

export async function GET() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(
      "https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=500",
      {
        signal: controller.signal,
        headers: { accept: "application/json", "user-agent": "soccer-intelligence/0.2" },
        cache: "no-store"
      }
    );
    if (!response.ok) throw new Error(`Polymarket ${response.status}`);
    const payload = (await response.json()) as RawMarket[];
    const markets = payload.filter((market) =>
      /world cup|fifa/i.test(market.question ?? market.title ?? "")
    );
    return NextResponse.json({
      markets,
      source: "Polymarket Gamma API",
      fetchedAt: new Date().toISOString(),
      fallback: false
    });
  } catch {
    return NextResponse.json(
      {
        markets: [],
        source: "Polymarket Gamma API",
        status: "unavailable",
        fallback: false
      },
      { status: 503 }
    );
  } finally {
    clearTimeout(timer);
  }
}
