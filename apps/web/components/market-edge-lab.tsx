"use client";

import type { Locale } from "@wci/contracts";
import { ExternalLink, RefreshCw, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPercent } from "@/lib/i18n";

type RawEvent = {
  id?: string;
  title?: string;
  slug?: string;
};

type RawMarket = {
  id?: string;
  conditionId?: string;
  question?: string;
  slug?: string;
  groupItemTitle?: string;
  outcomes?: string | string[];
  outcomePrices?: string | Array<string | number>;
  bestBid?: number | string;
  bestAsk?: number | string;
  lastTradePrice?: number | string;
  volumeNum?: number;
  volume?: number | string;
  volume24hr?: number | string;
  liquidityNum?: number;
  liquidity?: number | string;
  endDate?: string;
  active?: boolean;
  closed?: boolean;
  events?: RawEvent[];
};

type ParsedMarket = {
  id: string;
  question: string;
  label: string;
  eventTitle: string;
  eventSlug: string;
  probability: number;
  bestBid?: number;
  bestAsk?: number;
  volume: number;
  volume24hr: number;
  liquidity: number;
  endDate?: string;
};

type MatchMarket = {
  id: string;
  title: string;
  slug: string;
  endDate?: string;
  overround: number;
  volume24hr: number;
  outcomes: Array<ParsedMarket & { normalizedProbability: number }>;
};

const WORLD_CUP_TAG_ID = "102232";
const MARKET_URL =
  `https://gamma-api.polymarket.com/markets?tag_id=${WORLD_CUP_TAG_ID}` +
  "&active=true&closed=false&limit=500&order=volume24hr&ascending=false";

function numberValue(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

function arrayValue(value: string | unknown[] | undefined): unknown[] {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeMarket(record: RawMarket): ParsedMarket | undefined {
  const question = record.question;
  const event = record.events?.[0];
  if (!question || !event?.slug || record.closed || record.active === false) return undefined;
  const outcomes = arrayValue(record.outcomes);
  const prices = arrayValue(record.outcomePrices);
  const yesIndex = outcomes.findIndex((outcome) => String(outcome).toLowerCase() === "yes");
  if (yesIndex < 0) return undefined;
  const bestBid = numberValue(record.bestBid);
  const bestAsk = numberValue(record.bestAsk);
  const midpoint =
    bestBid !== undefined && bestAsk !== undefined && bestAsk >= bestBid ? (bestBid + bestAsk) / 2 : undefined;
  const probability = midpoint ?? numberValue(prices[yesIndex]) ?? numberValue(record.lastTradePrice);
  if (probability === undefined || probability < 0 || probability > 1) return undefined;

  return {
    id: record.id ?? record.conditionId ?? question,
    question,
    label: record.groupItemTitle ?? question,
    eventTitle: event.title?.trim() || question,
    eventSlug: event.slug,
    probability,
    bestBid,
    bestAsk,
    volume: numberValue(record.volumeNum ?? record.volume) ?? 0,
    volume24hr: numberValue(record.volume24hr) ?? 0,
    liquidity: numberValue(record.liquidityNum ?? record.liquidity) ?? 0,
    endDate: record.endDate
  };
}

function matchEventSlug(slug: string): boolean {
  return /^fifwc-[a-z0-9]+-[a-z0-9]+-2026-\d{2}-\d{2}$/.test(slug);
}

function money(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatDate(value: string | undefined, locale: Locale): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(value));
}

export function MarketEdgeLab({ locale }: { locale: Locale }) {
  const [markets, setMarkets] = useState<ParsedMarket[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "unavailable">("loading");
  const [updatedAt, setUpdatedAt] = useState<string>();

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch(MARKET_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(`Polymarket returned ${response.status}`);
      const payload = (await response.json()) as RawMarket[];
      setMarkets(payload.map(normalizeMarket).filter((market): market is ParsedMarket => Boolean(market)));
      setUpdatedAt(new Date().toISOString());
      setStatus("live");
    } catch {
      setMarkets([]);
      setStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const championMarkets = useMemo(() => {
    const rows = markets.filter((market) => market.eventSlug === "world-cup-winner");
    const total = rows.reduce((sum, market) => sum + market.probability, 0);
    return rows
      .map((market) => ({
        ...market,
        normalizedProbability: total > 0 ? market.probability / total : 0
      }))
      .sort((left, right) => right.normalizedProbability - left.normalizedProbability);
  }, [markets]);

  const championOverround = useMemo(
    () => championMarkets.reduce((sum, market) => sum + market.probability, 0),
    [championMarkets]
  );

  const matchMarkets = useMemo(() => {
    const grouped = new Map<string, ParsedMarket[]>();
    for (const market of markets) {
      if (!matchEventSlug(market.eventSlug)) continue;
      const eventMarkets = grouped.get(market.eventSlug) ?? [];
      eventMarkets.push(market);
      grouped.set(market.eventSlug, eventMarkets);
    }
    return [...grouped.entries()]
      .flatMap(([slug, outcomes]): MatchMarket[] => {
        if (outcomes.length !== 3) return [];
        const total = outcomes.reduce((sum, market) => sum + market.probability, 0);
        if (total <= 0) return [];
        return [
          {
            id: outcomes[0]?.id ?? slug,
            title: outcomes[0]?.eventTitle ?? slug,
            slug,
            endDate: outcomes[0]?.endDate,
            overround: total,
            volume24hr: outcomes.reduce((sum, market) => sum + market.volume24hr, 0),
            outcomes: outcomes
              .map((market) => ({ ...market, normalizedProbability: market.probability / total }))
              .sort((left, right) => right.normalizedProbability - left.normalizedProbability)
          }
        ];
      })
      .sort(
        (left, right) => (left.endDate ?? "").localeCompare(right.endDate ?? "") || right.volume24hr - left.volume24hr
      )
      .slice(0, 12);
  }, [markets]);

  return (
    <>
      <section className="card card-pad">
        <div className="section-header">
          <div>
            <p className="eyebrow">POLYMARKET · FIFA WORLD CUP TAG {WORLD_CUP_TAG_ID}</p>
            <h2>{locale === "zh" ? "实时预测市场概率" : "Live prediction-market probabilities"}</h2>
          </div>
          <button className="pill" type="button" onClick={() => void refresh()}>
            <RefreshCw size={16} /> {status}
          </button>
        </div>
        <div className="notice live-notice">
          <ShieldAlert size={15} />
          {locale === "zh"
            ? "仅查询 Polymarket 的 2026 男足世界杯官方标签。概率使用最佳买卖价中点；互斥结果再去除市场总和偏差。市场价格不是 Soccer Intelligence 模型概率。"
            : "Only Polymarket's dedicated 2026 men's World Cup tag is queried. Probabilities use the best bid/ask midpoint, then normalize mutually exclusive outcomes. Market prices are not Soccer Intelligence forecasts."}
        </div>
      </section>

      {status === "unavailable" ? (
        <section className="section card empty-state">
          <h2>{locale === "zh" ? "市场数据暂不可用" : "Market data temporarily unavailable"}</h2>
          <p className="muted">{locale === "zh" ? "不使用模拟市场替代。" : "No simulated markets are substituted."}</p>
        </section>
      ) : null}

      {status === "live" ? (
        <>
          <section className="section card card-pad">
            <div className="section-header">
              <div>
                <p className="eyebrow">1X2 · OVERROUND REMOVED</p>
                <h2>{locale === "zh" ? "近期比赛市场" : "Upcoming match markets"}</h2>
              </div>
            </div>
            {matchMarkets.length ? (
              <div className="market-match-grid">
                {matchMarkets.map((match) => (
                  <a
                    className="market-match-card"
                    href={`https://polymarket.com/event/${match.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    key={match.id}
                  >
                    <div className="market-card-head">
                      <div>
                        <strong>{match.title}</strong>
                        <span>{formatDate(match.endDate, locale)}</span>
                      </div>
                      <ExternalLink size={15} />
                    </div>
                    <div className="market-outcomes">
                      {match.outcomes.map((outcome) => (
                        <div key={outcome.id}>
                          <span>{outcome.label.replace(/^Draw \(.+\)$/, locale === "zh" ? "平局" : "Draw")}</span>
                          <strong>{formatPercent(outcome.normalizedProbability, locale)}</strong>
                          <small>
                            {locale === "zh" ? "原始" : "raw"} {formatPercent(outcome.probability, locale)}
                          </small>
                        </div>
                      ))}
                    </div>
                    <p className="tiny muted">
                      {locale === "zh" ? "市场总和" : "Raw sum"} {formatPercent(match.overround, locale)}
                      {" · 24h "}
                      {money(match.volume24hr, locale)}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h2>{locale === "zh" ? "当前没有完整的胜平负市场" : "No complete 1X2 markets currently available"}</h2>
              </div>
            )}
          </section>

          <section className="section card card-pad">
            <div className="section-header">
              <div>
                <p className="eyebrow">CHAMPION MARKET · NORMALIZED</p>
                <h2>{locale === "zh" ? "冠军市场共识" : "Title market consensus"}</h2>
              </div>
              <span className="pill">
                {locale === "zh" ? "原始总和" : "Raw sum"} {formatPercent(championOverround, locale)}
              </span>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{locale === "zh" ? "球队" : "Team"}</th>
                    <th>{locale === "zh" ? "归一化概率" : "Normalized"}</th>
                    <th>{locale === "zh" ? "市场中点" : "Market midpoint"}</th>
                    <th>Bid / Ask</th>
                    <th>{locale === "zh" ? "流动性" : "Liquidity"}</th>
                  </tr>
                </thead>
                <tbody>
                  {championMarkets.slice(0, 20).map((market) => (
                    <tr key={market.id}>
                      <td>
                        <a href={`https://polymarket.com/event/${market.eventSlug}`} target="_blank" rel="noreferrer">
                          <strong>{market.label}</strong>
                        </a>
                      </td>
                      <td>{formatPercent(market.normalizedProbability, locale)}</td>
                      <td>{formatPercent(market.probability, locale)}</td>
                      <td>
                        {market.bestBid === undefined ? "—" : formatPercent(market.bestBid, locale)}
                        {" / "}
                        {market.bestAsk === undefined ? "—" : formatPercent(market.bestAsk, locale)}
                      </td>
                      <td>{money(market.liquidity, locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      {updatedAt ? (
        <p className="tiny muted">
          {locale === "zh" ? "获取时间" : "Fetched"}:{" "}
          {new Date(updatedAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}
          {" · "}
          <a href="https://docs.polymarket.com/market-data/fetching-markets" target="_blank" rel="noreferrer">
            Polymarket Gamma API
          </a>
        </p>
      ) : null}
    </>
  );
}
