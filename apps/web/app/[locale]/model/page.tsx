import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Model({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <h1>{locale === "zh" ? "模型状态" : "Model status"}</h1>
      </header>
      <div className="grid two">
        <section className="card">
          <div className="eyebrow">RESEARCH BASELINE LIVE</div>
          <h2>Soccer Intelligence Ensemble</h2>
          <p className="muted">
            {locale === "zh"
              ? "Elo、Poisson 与 Dixon-Coles 研究预测已上线；Elo 三分类基线已有真实滚动样本外回测。集成模型尚未经过独立概率校准，因此不会被标为生产级或可盈利模型。"
              : "Elo, Poisson, and Dixon-Coles research forecasts are live, with a real rolling out-of-time backtest for the three-way Elo baseline. The ensemble is not yet independently calibrated and is not labeled production-grade or profitable."}
          </p>
        </section>
        <section className="card">
          <h2>{locale === "zh" ? "发布门槛" : "Publication gates"}</h2>
          <p>● Timestamped Elo input</p>
          <p>● Rolling out-of-time baseline evaluation</p>
          <p>○ Point-in-time lineup and injury features</p>
          <p>○ Multiclass ensemble calibration</p>
          <p>○ Drift monitoring and immutable model registry</p>
        </section>
      </div>
    </main>
  );
}
