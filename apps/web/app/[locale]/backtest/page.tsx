import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Backtest({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "滚动样本外回测" : "Rolling out-of-time backtest"}</h1></header><section className="card empty-state"><h2>{locale === "zh" ? "没有可发布的历史业绩" : "No publishable performance history"}</h2><p className="muted">{locale === "zh" ? "此前界面中的模拟指标已移除。只有基于赛前可用数据、保存预测时间戳并严格滚动验证的结果才会展示。" : "Previous mock metrics have been removed. Only results built from pre-match available data, timestamped forecasts, and strict rolling validation will be shown."}</p></section></main>;
}
