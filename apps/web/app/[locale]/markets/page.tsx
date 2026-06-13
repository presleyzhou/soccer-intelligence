import { notFound } from "next/navigation";
import { MarketEdgeLab } from "@/components/market-edge-lab";
import { isLocale } from "@/lib/i18n";

export default async function Markets({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <h1>{locale === "zh" ? "实时预测市场" : "Live prediction markets"}</h1>
        <p className="lead">
          {locale === "zh"
            ? "使用 2026 男足世界杯专用标签、买卖价中点和去除总和偏差后的互斥概率，区分市场观点与本站模型。"
            : "Use the dedicated 2026 men's World Cup tag, bid/ask midpoints, and normalized mutually exclusive probabilities while keeping market views separate from site forecasts."}
        </p>
      </header>
      <MarketEdgeLab locale={locale} />
    </main>
  );
}
