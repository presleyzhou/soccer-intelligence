import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { MarketEdgeLab } from "@/components/market-edge-lab";
import { isLocale } from "@/lib/i18n";

export default async function MarketsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <main className="page">
      <p className="eyebrow">{locale === "zh" ? "预测市场研究" : "Prediction market research"}</p>
      <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>Market Edge Lab</h1>
      <p className="lead" style={{ color: "var(--muted)" }}>
        {locale === "zh"
          ? "连接官方市场数据，比较模型公平概率和订单簿价格，并在成本、不确定性和仓位限制后筛选候选。"
          : "Connect official market data, compare model fair probabilities with order-book prices, and filter candidates after costs, uncertainty, and exposure limits."}
      </p>
      <MarketEdgeLab locale={locale} />
    </main>
  );
}
