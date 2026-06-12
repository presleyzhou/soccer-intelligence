"use client";

import type { Locale } from "@wci/contracts";
import { RefreshCw, ShieldAlert, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MarketOpportunity } from "@/lib/markets";
import { conservativeEdge, fallbackMarkets, marketEdge, suggestedFraction } from "@/lib/markets";
import { formatPercent } from "@/lib/i18n";

export function MarketEdgeLab({ locale }: { locale: Locale }) {
  const [markets, setMarkets] = useState<MarketOpportunity[]>(fallbackMarkets);
  const [status, setStatus] = useState<"loading" | "live" | "fallback">("loading");
  const [onlyPositive, setOnlyPositive] = useState(false);

  async function refresh(): Promise<void> {
    setStatus("loading");
    try {
      const response = await fetch("/api/v1/markets/polymarket", { cache: "no-store" });
      if (!response.ok) throw new Error("market request failed");
      const payload = (await response.json()) as { markets: MarketOpportunity[]; fallback: boolean };
      setMarkets(payload.markets.length ? payload.markets : fallbackMarkets);
      setStatus(payload.fallback ? "fallback" : "live");
    } catch {
      setMarkets(fallbackMarkets);
      setStatus("fallback");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const rows = useMemo(
    () =>
      [...markets]
        .filter((market) => !onlyPositive || conservativeEdge(market) > 0)
        .sort((a, b) => conservativeEdge(b) - conservativeEdge(a)),
    [markets, onlyPositive]
  );

  return (
    <>
      <section className="card card-pad">
        <div className="section-head">
          <div>
            <p className="eyebrow">Polymarket · read-only</p>
            <h2>{locale === "zh" ? "模型与可成交价格分歧" : "Model vs executable market prices"}</h2>
          </div>
          <div className="toolbar">
            <span className={`status-chip ${status === "live" ? "live" : ""}`}>{status}</span>
            <button className="icon-button" type="button" onClick={() => void refresh()} aria-label="Refresh markets">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        <div className="notice">
          <ShieldAlert size={15} />{" "}
          {locale === "zh"
            ? "优势值不是盈利保证。保守优势扣除了 1% 成本和 1.5% 模型不确定性缓冲；默认仅做研究和纸面交易。"
            : "Edge is not a profit guarantee. Conservative edge subtracts 1% costs and a 1.5% model uncertainty buffer; this is research and paper trading by default."}
        </div>
        <label
          className="field"
          style={{ marginTop: 16, display: "flex", gridTemplateColumns: "auto 1fr", alignItems: "center" }}
        >
          <input
            style={{ width: "auto" }}
            type="checkbox"
            checked={onlyPositive}
            onChange={(event) => setOnlyPositive(event.target.checked)}
          />
          {locale === "zh" ? "只显示扣除成本后仍为正的候选" : "Show only candidates positive after costs"}
        </label>
      </section>

      <section className="section card card-pad">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{locale === "zh" ? "市场" : "Market"}</th>
                <th>{locale === "zh" ? "模型概率" : "Model"}</th>
                <th>Bid / Ask</th>
                <th>{locale === "zh" ? "原始优势" : "Raw edge"}</th>
                <th>{locale === "zh" ? "保守优势" : "Conservative"}</th>
                <th>{locale === "zh" ? "风险仓位上限" : "Risk cap"}</th>
                <th>{locale === "zh" ? "流动性" : "Liquidity"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((market) => (
                <tr key={market.id}>
                  <td>
                    <strong>{market.question}</strong>
                    <div className="muted">
                      {market.source} · {market.outcome}
                    </div>
                  </td>
                  <td>{formatPercent(market.modelProbability, locale)}</td>
                  <td>
                    {formatPercent(market.bestBid, locale)} / {formatPercent(market.bestAsk, locale)}
                  </td>
                  <td style={{ color: marketEdge(market) > 0 ? "var(--accent)" : "var(--danger)" }}>
                    {formatPercent(marketEdge(market), locale)}
                  </td>
                  <td style={{ color: conservativeEdge(market) > 0 ? "var(--accent)" : "var(--muted)" }}>
                    {formatPercent(conservativeEdge(market), locale)}
                  </td>
                  <td>{formatPercent(suggestedFraction(market), locale)}</td>
                  <td>${market.liquidity.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="muted">
            {locale === "zh"
              ? "当前没有通过成本与不确定性缓冲的候选。这是正常且健康的结果。"
              : "No candidate currently clears costs and uncertainty buffers. That is a normal, healthy result."}
          </p>
        ) : null}
      </section>

      <section className="section grid grid-3">
        <div className="card card-pad">
          <TrendingUp color="var(--accent)" />
          <h3>{locale === "zh" ? "只比较可成交 Ask" : "Executable asks only"}</h3>
          <p className="muted">
            {locale === "zh" ? "不把中间价当作可以买到的价格。" : "Mid-prices are not treated as executable entries."}
          </p>
        </div>
        <div className="card card-pad">
          <ShieldAlert color="var(--warning)" />
          <h3>{locale === "zh" ? "四分之一 Kelly 且封顶" : "Quarter Kelly with cap"}</h3>
          <p className="muted">
            {locale === "zh"
              ? "候选仓位最高为资金的 2%，并可进一步按相关性缩减。"
              : "Candidate exposure is capped at 2% of bankroll and can be reduced for correlation."}
          </p>
        </div>
        <div className="card card-pad">
          <RefreshCw color="var(--accent-2)" />
          <h3>{locale === "zh" ? "持续重新校准" : "Continuous recalibration"}</h3>
          <p className="muted">
            {locale === "zh"
              ? "只有滚动样本外表现稳定时才发布新模型。"
              : "New models publish only after stable rolling out-of-sample performance."}
          </p>
        </div>
      </section>
    </>
  );
}
