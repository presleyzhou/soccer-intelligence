import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function Groups({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <main className="container"><header className="page-head"><h1>{locale === "zh" ? "小组与出线概率" : "Groups and qualification"}</h1></header><section className="card empty-state"><h2>{locale === "zh" ? "概率尚未发布" : "Probabilities not published"}</h2><p className="muted">{locale === "zh" ? "真实积分和赛果通过比赛中心实时更新；出线概率将在校准模型上线后提供。" : "Real results update in the match centre. Qualification probabilities will appear after a calibrated model is released."}</p></section></main>;
}
