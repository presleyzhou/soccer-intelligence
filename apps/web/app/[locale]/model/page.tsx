import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Model({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "模型状态" : "Model status"}</h1></header><div className="grid two"><section className="card"><div className="eyebrow">NOT PUBLISHED</div><h2>Soccer Intelligence Ensemble</h2><p className="muted">{locale === "zh" ? "代码框架已实现，但生产模型尚未获得可发布的真实数据版本和样本外评估。" : "The framework is implemented, but no production model has a publishable real-data version and out-of-time evaluation yet."}</p></section><section className="card"><h2>{locale === "zh" ? "发布门槛" : "Publication gates"}</h2><p>○ Point-in-time production features</p><p>○ Rolling out-of-time evaluation</p><p>○ Multiclass probability calibration</p><p>○ Immutable source snapshot</p><p>○ Monitoring and drift alerts</p></section></div></main>;
}
