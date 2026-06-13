import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
export default async function Methodology({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <h1>{locale === "zh" ? "方法论" : "Methodology"}</h1>
        <p className="lead">
          {locale === "zh"
            ? "先预测比分分布，再聚合为胜平负、出线和冠军概率；市场价格作为独立基准展示。"
            : "We forecast score distributions first, then derive match, qualification, and title probabilities while displaying market prices as an independent benchmark."}
        </p>
      </header>
      <div className="grid two">
        {[
          ["1", "Timestamped Elo strength"],
          ["2", "Poisson + Dixon-Coles"],
          ["3", "Market midpoint + normalization"],
          ["4", "Rolling out-of-time evaluation"],
          ["5", "Multiclass calibration (pending)"],
          ["6", "50,000-run tournament Monte Carlo"]
        ].map(([n, title]) => (
          <section className="card" key={n}>
            <div className="eyebrow">STEP {n}</div>
            <h2>{title}</h2>
            <p className="muted">
              {locale === "zh"
                ? "输入、截止时间、版本与来源均需可追踪；只有严格滚动样本外结果才能作为历史表现发布。"
                : "Inputs, cutoffs, versions, and provenance must be traceable; only strict rolling out-of-time results are published as historical performance."}
            </p>
          </section>
        ))}
      </div>
    </main>
  );
}
