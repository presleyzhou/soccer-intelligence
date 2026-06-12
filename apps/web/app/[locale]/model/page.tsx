import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { InfoPage } from "@/components/info-page";
import { isLocale } from "@/lib/i18n";

export default async function ModelPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <InfoPage
      locale={locale}
      eyebrow="Ensemble v0.1.0"
      title={locale === "zh" ? "模型架构" : "Model architecture"}
      description={
        locale === "zh"
          ? "先预测比分分布，再聚合赛果和赛事路径。"
          : "Forecast score distributions first, then aggregate results and tournament paths."
      }
      sections={[
        {
          title: "Elo",
          body:
            locale === "zh"
              ? "滚动更新球队实力，显式保存每场比赛前后的评级。"
              : "Rolling team strength with pre- and post-match ratings retained."
        },
        {
          title: "Dixon-Coles",
          body:
            locale === "zh"
              ? "时间衰减的 Poisson 比分模型，并修正低比分相关性。"
              : "Time-decayed Poisson score model with low-score dependence correction."
        },
        {
          title: locale === "zh" ? "市场共识" : "Market consensus",
          body:
            locale === "zh"
              ? "赔率去水位，预测市场使用可成交买卖价和流动性。"
              : "De-vigged odds and executable prediction-market bids/asks with liquidity."
        },
        {
          title: locale === "zh" ? "集成与校准" : "Ensemble and calibration",
          body:
            locale === "zh"
              ? "权重只从滚动样本外预测学习，多分类校准保持概率和为 1。"
              : "Weights learn only from rolling out-of-fold forecasts; multiclass calibration preserves the probability simplex."
        }
      ]}
    />
  );
}
