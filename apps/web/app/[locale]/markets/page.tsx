import { notFound } from "next/navigation";
import { MarketEdgeLab } from "@/components/market-edge-lab";
import { isLocale } from "@/lib/i18n";

export default async function Markets({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "实时预测市场" : "Live prediction markets"}</h1><p className="lead">{locale === "zh" ? "直接展示 Polymarket 公共只读 API 的实时价格、价差、成交量和流动性，不与未发布的模型进行虚假比较。" : "Live prices, spreads, volume, and liquidity from Polymarket's public read-only API, without fabricated comparisons to an unpublished model."}</p></header><MarketEdgeLab locale={locale} /></main>;
}
