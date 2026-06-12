"use client";

import type { Locale } from "@wci/contracts";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPercent } from "@/lib/i18n";

type RawMarket = {
  id?: string;
  conditionId?: string;
  question?: string;
  title?: string;
  outcomes?: string | string[];
  outcomePrices?: string | Array<string | number>;
  bestBid?: number | string;
  bestAsk?: number | string;
  lastTradePrice?: number | string;
  volumeNum?: number;
  volume?: number | string;
  liquidityNum?: number;
  liquidity?: number | string;
};

type LiveMarket = {
  id: string;
  question: string;
  probability: number;
  bestBid?: number;
  bestAsk?: number;
  volume: number;
  liquidity: number;
};

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

function normalizeMarket(record: RawMarket): LiveMarket | undefined {
  const question = record.question ?? record.title;
  if (!question || !/world cup|fifa/i.test(question)) return undefined;
  const outcomes = arrayValue(record.outcomes);
  const prices = arrayValue(record.outcomePrices);
  const yesIndex = outcomes.findIndex((outcome) => String(outcome).toLowerCase() === "yes");
  const probability =
    numberValue(prices[yesIndex >= 0 ? yesIndex : 0]) ?? numberValue(record.lastTradePrice);
  if (probability === undefined || probability < 0 || probability > 1) return undefined;
  return {
    id: record.id ?? record.conditionId ?? question,
    question,
    probability,
    bestBid: numberValue(record.bestBid),
    bestAsk: numberValue(record.bestAsk),
    volume: numberValue(record.volumeNum ?? record.volume) ?? 0,
    liquidity: numberValue(record.liquidityNum ?? record.liquidity) ?? 0
  };
}

export function MarketEdgeLab({ locale }: { locale: Locale }) {
  const [markets, setMarkets] = useState<LiveMarket[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "unavailable">("loading");
  const [updatedAt, setUpdatedAt] = useState<string>();

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch(
        "https://gamma-api.polymarket.com/markets?active=true&closed=false&limit=500",
        { cache: "no-store" }
      );
      if (!response.ok) throw new Error(`Polymarket returned ${response.status}`);
      const payload = (await response.json()) as RawMarket[];
      const parsed = payload
        .map(normalizeMarket)
        .filter((market): market is LiveMarket => Boolean(market))
        .sort((left, right) => right.liquidity - left.liquidity)
        .slice(0, 30);
      setMarkets(parsed);
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

  const rows = useMemo(() => markets, [markets]);

  return (
    <>
      <section className="card card-pad">
        <div className="section-header">
          <div>
            <p className="eyebrow">POLYMARKET · PUBLIC READ-ONLY API</p>
            <h2>{locale === "zh" ? "实时预测市场概率" : "Live prediction-market probabilities"}</h2>
          </div>
          <button className="pill" type="button" onClick={() => void refresh()}>
            <RefreshCw size={16} /> {status}
          </button>
        </div>
        <div className="notice live-notice">
          <ShieldAlert size={15} />
          {locale === "zh"
            ? "这些是市场价格，不是 Soccer Intelligence 模型概率，也不代表真实结果概率或盈利保证。"
            : "These are market prices, not Soccer Intelligence model probabilities, true outcome probabilities, or profit guarantees."}
        </div>
      </section>

      <section className="section card card-pad">
        {status === "unavailable" ? (
          <div className="empty-state">
            <h2>{locale === "zh" ? "市场数据暂不可用" : "Market data temporarily unavailable"}</h2>
            <p className="muted">
              {locale === "zh" ? "不使用模拟市场替代。" : "No simulated markets are substituted."}
            </p>
          </div>
        ) : null}
        {status === "live" && rows.length === 0 ? (
          <div className="empty-state">
            <h2>{locale === "zh" ? "没有匹配的世界杯市场" : "No matching World Cup markets"}</h2>
          </div>
        ) : null}
        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{locale === "zh" ? "市场" : "Market"}</th>
                  <th>{locale === "zh" ? "最新概率" : "Latest probability"}</th>
                  <th>Bid / Ask</th>
                  <th>{locale === "zh" ? "成交量" : "Volume"}</th>
                  <th>{locale === "zh" ? "流动性" : "Liquidity"}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((market) => (
                  <tr key={market.id}>
                    <td><strong>{market.question}</strong></td>
                    <td>{formatPercent(market.probability, locale)}</td>
                    <td>
                      {market.bestBid === undefined ? "—" : formatPercent(market.bestBid, locale)}
                      {" / "}
                      {market.bestAsk === undefined ? "—" : formatPercent(market.bestAsk, locale)}
                    </td>
                    <td>${Math.round(market.volume).toLocaleString()}</td>
                    <td>${Math.round(market.liquidity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {updatedAt ? <p className="tiny muted">{locale === "zh" ? "获取时间" : "Fetched"}: {updatedAt}</p> : null}
      </section>
    </>
  );
}
