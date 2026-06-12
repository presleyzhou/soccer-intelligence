import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { InfoPage } from "@/components/info-page";
import { isLocale } from "@/lib/i18n";

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <InfoPage
      locale={locale}
      eyebrow="Point-in-time methodology"
      title={locale === "zh" ? "方法与可复现性" : "Methodology and reproducibility"}
      description={
        locale === "zh"
          ? "每条预测绑定模型版本、特征快照、数据来源快照和预测截止时间。"
          : "Every forecast binds a model version, feature snapshot, source snapshot, and prediction cutoff."
      }
      sections={[
        {
          title: locale === "zh" ? "防止泄漏" : "Leakage prevention",
          body:
            locale === "zh"
              ? "所有特征查询强制 available_at 小于预测截止时间，校准和 stacking 也在每个时间折内重新训练。"
              : "Every feature requires available_at before cutoff; calibration and stacking refit inside each time fold."
        },
        {
          title: locale === "zh" ? "概率质量" : "Probability quality",
          body: "Log Loss, Brier Score, Ranked Probability Score, ECE, calibration curves, and confidence-bin hit rates."
        },
        {
          title: locale === "zh" ? "模型解释" : "Explanations",
          body:
            locale === "zh"
              ? "展示基础模型分歧、规则贡献和数据质量；树模型启用后增加 SHAP。"
              : "Show base-model disagreement, bounded rule contributions, and data quality; add SHAP when tree models are enabled."
        },
        {
          title: locale === "zh" ? "文献基础" : "Research basis",
          body: "Dixon-Coles, regularized Poisson, Elo-Poisson, bookmaker consensus, historical-plus-market Bayesian fusion, and tournament Monte Carlo."
        }
      ]}
    />
  );
}
