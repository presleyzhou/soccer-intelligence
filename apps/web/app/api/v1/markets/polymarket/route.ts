import { NextResponse } from "next/server";
import { advancement, getTeam } from "@/lib/data";
import { fallbackMarkets, type MarketOpportunity } from "@/lib/markets";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | undefined {
  return value && typeof value === "object" ? (value as UnknownRecord) : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseArrayString(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function teamModelProbability(question: string): number | undefined {
  const normalized = question.toLowerCase();
  for (const row of advancement) {
    const team = getTeam(row.teamId);
    if (normalized.includes(team.name.en.toLowerCase())) return row.champion;
  }
  return undefined;
}

function parseMarkets(payload: unknown): MarketOpportunity[] {
  if (!Array.isArray(payload)) return [];
  const output: MarketOpportunity[] = [];
  for (const item of payload) {
    const record = asRecord(item);
    if (!record) continue;
    const question = asString(record.question) ?? asString(record.title);
    if (!question || !/world cup|fifa/i.test(question)) continue;
    const modelProbability = teamModelProbability(question);
    if (modelProbability === undefined) continue;
    const outcomes = parseArrayString(record.outcomes);
    const prices = parseArrayString(record.outcomePrices);
    const yesIndex = outcomes.findIndex((outcome) => String(outcome).toLowerCase() === "yes");
    const last = asNumber(prices[yesIndex >= 0 ? yesIndex : 0]) ?? asNumber(record.lastTradePrice);
    if (last === undefined) continue;
    const bestBid = asNumber(record.bestBid) ?? Math.max(0.001, last - 0.01);
    const bestAsk = asNumber(record.bestAsk) ?? Math.min(0.999, last + 0.01);
    output.push({
      id: asString(record.id) ?? asString(record.conditionId) ?? question,
      question,
      outcome: "Yes",
      modelProbability,
      bestAsk,
      bestBid,
      volume: asNumber(record.volumeNum) ?? asNumber(record.volume) ?? 0,
      liquidity: asNumber(record.liquidityNum) ?? asNumber(record.liquidity) ?? 0,
      source: "polymarket",
      updatedAt: new Date().toISOString()
    });
  }
  return output.slice(0, 20);
}

export async function GET() {
  const baseUrl = process.env.POLYMARKET_API_BASE_URL ?? "https://gamma-api.polymarket.com";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(`${baseUrl}/markets?active=true&closed=false&limit=100`, {
      signal: controller.signal,
      headers: { accept: "application/json", "user-agent": "world-cup-intelligence/0.1" },
      next: { revalidate: 60 }
    });
    if (!response.ok) throw new Error(`Polymarket ${response.status}`);
    const parsed = parseMarkets(await response.json());
    if (!parsed.length)
      return NextResponse.json({ markets: fallbackMarkets, fallback: true, reason: "no_matching_markets" });
    return NextResponse.json({ markets: parsed, fallback: false });
  } catch {
    return NextResponse.json({ markets: fallbackMarkets, fallback: true, reason: "provider_unavailable" });
  } finally {
    clearTimeout(timer);
  }
}
