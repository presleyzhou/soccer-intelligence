import type { Locale } from "@wci/contracts";
import { notFound } from "next/navigation";
import { PerformanceChart } from "@/components/performance-chart";
import { modelMetrics } from "@/lib/data";
import { formatPercent, isLocale } from "@/lib/i18n";

export default async function BacktestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  return (
    <main className="page">
      <p className="eyebrow">Rolling out-of-sample</p>
      <h1 style={{ fontSize: "clamp(38px, 6vw, 68px)" }}>{locale === "zh" ? "模型回测" : "Model backtest"}</h1>
      <div className="notice">
        {locale === "zh"
          ? "当前数值为标注清楚的示例数据，不声称来自尚未导入的真实历史预测。生产环境只展示不可变的赛前预测版本。"
          : "Current values are clearly labelled demonstration data and are not claimed as real historical predictions that have not yet been imported. Production shows only immutable pre-match forecast versions."}
      </div>
      <section className="section card card-pad">
        <div className="kpi-grid">
          <div className="kpi">
            Log Loss<strong>{modelMetrics.logLoss}</strong>
          </div>
          <div className="kpi">
            Brier<strong>{modelMetrics.brier}</strong>
          </div>
          <div className="kpi">
            RPS<strong>{modelMetrics.rps}</strong>
          </div>
          <div className="kpi">
            ECE<strong>{modelMetrics.ece}</strong>
          </div>
          <div className="kpi">
            Accuracy<strong>{formatPercent(modelMetrics.accuracy, locale)}</strong>
          </div>
        </div>
        <PerformanceChart locale={locale} />
      </section>
    </main>
  );
}
