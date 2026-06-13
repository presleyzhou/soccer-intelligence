import { notFound } from "next/navigation";
import { BacktestDashboard } from "@/components/backtest-dashboard";
import { isLocale } from "@/lib/i18n";
export default async function Backtest({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="container">
      <header className="page-head">
        <h1>{locale === "zh" ? "滚动样本外回测" : "Rolling out-of-time backtest"}</h1>
        <p className="lead">
          {locale === "zh"
            ? "用真实国家队赛果检验概率质量，并把时间顺序和数据截止点作为硬约束。"
            : "Measure probability quality on real international results with chronology and data cutoffs enforced."}
        </p>
      </header>
      <BacktestDashboard locale={locale} />
    </main>
  );
}
